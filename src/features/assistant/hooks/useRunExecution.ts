import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { ApiFailure, pollRun, sendMessage } from '../api'
import { updateProgress, updateTools } from '../progress'
import type { ChatMessage, Pending, Run, ToolStatus } from '../types'

interface RunExecutionOptions {
  getObservedAddress: (conversationId: string) => string | null
  resolveAddress: (conversationId: string, address: string | null, version: number) => void
  mounted: RefObject<boolean>
  updateMessages: (conversationId: string, update: (current: ChatMessage[]) => ChatMessage[]) => void
  updateError: (conversationId: string, error: string) => void
  savePending: (conversationId: string, value: Pending | null) => void
  invalidate: (conversationId: string) => void
  refresh: () => Promise<void>
}

export function useRunExecution({
  getObservedAddress,
  resolveAddress,
  mounted,
  updateMessages,
  updateError,
  savePending,
  refresh,
  invalidate,
}: RunExecutionOptions) {
  const [states, setStates] = useState<Record<string, { busy: boolean; tools: ToolStatus[] }>>({})
  const controllers = useRef(new Map<string, AbortController>())
  const isRunning = useCallback((id: string) => controllers.current.has(id), [])
  const cancel = useCallback((id: string) => controllers.current.get(id)?.abort(), [])
  const updateToolsFor = useCallback((id: string, update: (current: ToolStatus[]) => ToolStatus[]) => {
    setStates((current) => ({ ...current, [id]: { busy: current[id]?.busy ?? false, tools: update(current[id]?.tools ?? []) } }))
  }, [])
  useEffect(() => {
    const active = controllers.current
    return () => { for (const controller of active.values()) controller.abort() }
  }, [])
  const applyRun = useCallback(
    (conversationId: string, run: Run) => {
      if (!mounted.current) return
      resolveAddress(conversationId, run.observedAddress, run.addressVersion)
      updateMessages(conversationId, (current) => {
        const final: ChatMessage = {
          id: `assistant:${run.id}`,
          runId: run.id,
          role: 'assistant',
          text: run.result?.text ?? '',
          textStatus: run.result?.textStatus ?? 'unavailable',
          observedAddress: run.observedAddress,
          addressVersion: run.addressVersion,
          createdAt: Date.now(),
          result: run.result,
          startedAt:
            run.createdAt ??
            current.find((m) => m.runId === run.id && m.role === 'assistant')
              ?.startedAt,
          completedAt:
            run.settledAt ?? (run.status === 'running' ? null : Date.now()),
        }
        const existing = current.findIndex(
          (m) => m.runId === run.id && m.role === 'assistant',
        )
        return existing < 0
          ? [...current, final]
          : current.map((m, i) => (i === existing ? final : m))
      })
      updateToolsFor(conversationId, () =>
        (run.result?.activity ?? [])
          .filter((a) => a.type === 'tool')
          .map((a) => ({
            id: a.id,
            name: a.name,
            status: a.status,
            warnings: [],
          })),
      )
      updateError(conversationId, run.error?.message ?? '')
    },
    [mounted, updateMessages, updateError, resolveAddress, updateToolsFor],
  )
  const execute = useCallback(
    async (value: Pending, recoverOnly = false) => {
      const id = value.conversationId
      if (controllers.current.has(id) || !mounted.current) return
      invalidate(id)
      const abort = new AbortController()
      controllers.current.set(id, abort)
      setStates((current) => ({ ...current, [id]: { busy: true, tools: [] } }))
      updateError(id, '')
      let known = value
      savePending(id, value)
      if (value.text) updateMessages(id, (current) => {
        const exists = current.some((m) => m.role === 'user' && (
          m.id === value.clientRequestId || (value.runId && m.runId === value.runId)
        ))
        return exists ? current : [...current, {
          id: value.clientRequestId, runId: value.runId ?? 'pending', role: 'user',
          text: value.text, textStatus: 'final', observedAddress: getObservedAddress(id),
          addressVersion: value.expectedAddressVersion, createdAt: value.createdAt,
        }]
      })
      const remember = (runId: string) => {
        if (known.runId === runId) return
        known = { ...known, runId }
        updateMessages(id, (current) => {
          const persistedUser = current.some((message) => message.role === 'user' && message.runId === runId && message.id !== value.clientRequestId)
          return current.flatMap((message) => message.id === value.clientRequestId
            ? persistedUser ? [] : [{ ...message, runId }]
            : [message])
        })
        savePending(id, known)
      }
      try {
        const run =
          recoverOnly && value.runId
            ? await pollRun(value.runId, abort.signal, (run) => applyRun(value.conversationId, run))
            : await sendMessage(
                value,
                abort.signal,
                (event) => {
                  if (!mounted.current) return
                  if (event.event.startsWith('tool.'))
                    updateToolsFor(id, (current) => updateTools(current, event))
                  if (
                    [
                      'message.delta',
                      'message.round.completed',
                      'tool.preparing',
                      'tool.started',
                      'tool.completed',
                    ].includes(event.event)
                  )
                    updateMessages(value.conversationId, (current) => {
                      const existing = current.find(
                        (m) =>
                          m.role === 'assistant' &&
                          m.runId === event.data.runId,
                      )
                      const progress = updateProgress(existing?.result, event)
                      const next: ChatMessage = {
                        ...(existing ?? {
                          id: `assistant:${event.data.runId}`,
                          runId: event.data.runId,
                          role: 'assistant',
                          observedAddress: getObservedAddress(id),
                          addressVersion: value.expectedAddressVersion,
                          createdAt: Date.now(),
                          startedAt: value.createdAt,
                        }),
                        text: progress.text,
                        textStatus: 'partial',
                        result: progress,
                      }
                      return existing
                        ? current.map((m) => (m === existing ? next : m))
                        : [...current, next]
                    })
                },
                remember,
              )
        if (!mounted.current) return
        applyRun(value.conversationId, run)
        savePending(id, null)
        void refresh().catch(() => { /* Navigation refresh does not change a settled run. */ })
      } catch (e) {
        if (!mounted.current) return
        updateError(
          value.conversationId,
          abort.signal.aborted
            ? 'Response stopped. Recover saved results before retrying.'
            : e instanceof Error
              ? e.message
              : 'Connection failed',
        )
        if (e instanceof ApiFailure && e.status < 500) savePending(id, null)
        else if (known.runId) {
          try {
            const recovery = new AbortController()
            controllers.current.set(id, recovery)
            const run = await pollRun(known.runId, recovery.signal, (run) => applyRun(value.conversationId, run))
            if (!mounted.current) return
            applyRun(value.conversationId, run)
            savePending(id, null)
            void refresh().catch(() => { /* Navigation refresh does not change a settled run. */ })
          } catch {
            /* keep durable ID for manual recovery */
          }
        }
      } finally {
        controllers.current.delete(id)
        if (mounted.current) setStates((current) => ({ ...current, [id]: { busy: false, tools: current[id]?.tools ?? [] } }))
      }
    },
    [
      applyRun,
      invalidate,
      getObservedAddress,
      refresh,
      savePending,
      mounted,
      updateMessages,
      updateError,
      updateToolsFor,
    ],
  )
  return { states, isRunning, cancel, execute }
}
