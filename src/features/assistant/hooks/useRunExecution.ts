import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from 'react'
import { ApiFailure, pollRun, sendMessage } from '../api'
import { updateProgress, updateTools } from '../progress'
import type { ChatMessage, Pending, Run, ToolStatus } from '../types'

interface RunExecutionOptions {
  observedAddress: string | null
  resolveAddress: (address: string | null, version: number) => void
  mounted: RefObject<boolean>
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
  setError: Dispatch<SetStateAction<string>>
  savePending: (value: Pending | null) => void
  refresh: () => Promise<void>
}

export function useRunExecution({
  observedAddress,
  resolveAddress,
  mounted,
  setMessages,
  setError,
  savePending,
  refresh,
}: RunExecutionOptions) {
  const [busy, setBusy] = useState(false)
  const [tools, setTools] = useState<ToolStatus[]>([])
  const busyRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    [],
  )
  const applyRun = useCallback(
    (run: Run) => {
      resolveAddress(run.observedAddress, run.addressVersion)
      setMessages((current) => {
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
      setTools(
        (run.result?.activity ?? [])
          .filter((a) => a.type === 'tool')
          .map((a) => ({
            id: a.id,
            name: a.name,
            status: a.status,
            warnings: [],
          })),
      )
      if (run.error) setError(run.error.message)
    },
    [setMessages, setError, resolveAddress],
  )
  const execute = useCallback(
    async (value: Pending, recoverOnly = false) => {
      if (busyRef.current || !mounted.current) return
      busyRef.current = true
      setBusy(true)
      setError('')
      setTools([])
      const abort = new AbortController()
      abortRef.current = abort
      let known = value
      savePending(value)
      const remember = (id: string) => {
        known = { ...known, runId: id }
        savePending(known)
      }
      try {
        const run =
          recoverOnly && value.runId
            ? await pollRun(value.runId, abort.signal, applyRun)
            : await sendMessage(
                value,
                abort.signal,
                (event) => {
                  if (event.event.startsWith('tool.'))
                    setTools((current) => updateTools(current, event))
                  if (
                    [
                      'message.delta',
                      'message.round.completed',
                      'tool.preparing',
                      'tool.started',
                      'tool.completed',
                    ].includes(event.event)
                  )
                    setMessages((current) => {
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
                          observedAddress: observedAddress,
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
        applyRun(run)
        savePending(null)
        await refresh()
      } catch (e) {
        if (!mounted.current) return
        setError(
          abort.signal.aborted
            ? 'Response stopped. Recover saved results before retrying.'
            : e instanceof Error
              ? e.message
              : 'Connection failed',
        )
        if (e instanceof ApiFailure && e.status < 500) savePending(null)
        else if (known.runId) {
          try {
            const recovery = new AbortController()
            abortRef.current = recovery
            const run = await pollRun(known.runId, recovery.signal, applyRun)
            if (!mounted.current) return
            applyRun(run)
            savePending(null)
            await refresh()
          } catch {
            /* keep durable ID for manual recovery */
          }
        }
      } finally {
        busyRef.current = false
        setBusy(false)
        abortRef.current = null
      }
    },
    [
      applyRun,
      observedAddress,
      refresh,
      savePending,
      mounted,
      setMessages,
      setError,
    ],
  )
  return { busy, setBusy, busyRef, abortRef, tools, setTools, execute }
}
