import { useCallback, useEffect, useRef, useState } from 'react'
import { readPendingRequests } from '../history'
import { useRunExecution } from './useRunExecution'
import { useConversationState } from './useConversationState'
import { request } from '../api'
import type { Conversation, Pending } from '../types'

export function useAssistant(userId: string) {
  const pendingKey = `noodo:pending:${userId}`
  const selectedKey = `noodo:selected:${userId}`
  const [pendingRequests, setPendingRequests] = useState(() => readPendingRequests(pendingKey))
  const pendingRef = useRef(pendingRequests)
  const [selected, setSelected] = useState<string | null>(() => sessionStorage.getItem(selectedKey) ?? Object.keys(pendingRequests)[0] ?? null)
  const selectedId = useRef(selected)
  const navigation = useRef(0)
  const mounted = useRef(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [listError, setListError] = useState('')
  const listRequest = useRef(0)
  const [starting, setStarting] = useState(true)
  const [navigated, setNavigated] = useState(false)
  const [creating, setCreating] = useState(false)
  const creatingRef = useRef(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const draftRef = useRef(drafts)
  const [draftError, setDraftError] = useState('')
  const { states: chats, get, patch, updateMessages, updateError, resolveAddress, invalidate, loadHistory } = useConversationState(mounted)
  const writeDraft = useCallback((id: string | null, text: string) => {
    draftRef.current = { ...draftRef.current, [id ?? 'new-chat']: text }
    setDrafts(draftRef.current)
  }, [])
  const select = useCallback((id: string | null) => {
    navigation.current++
    setNavigated(true)
    selectedId.current = id
    setSelected(id)
    if (id) sessionStorage.setItem(selectedKey, id)
    else sessionStorage.removeItem(selectedKey)
  }, [selectedKey])
  const savePending = useCallback((id: string, value: Pending | null) => {
    const next = { ...pendingRef.current }
    if (value) next[id] = value
    else delete next[id]
    pendingRef.current = next
    setPendingRequests(next)
    const values = Object.values(next)
    if (values.length) {
      sessionStorage.setItem(`${pendingKey}:all`, JSON.stringify(values))
      sessionStorage.setItem(pendingKey, JSON.stringify(values[0]))
    } else {
      sessionStorage.removeItem(`${pendingKey}:all`)
      sessionStorage.removeItem(pendingKey)
    }
  }, [pendingKey])
  const refresh = useCallback(async () => {
    const ticket = ++listRequest.current
    let result: { conversations: Conversation[] }
    try {
      result = await request<{ conversations: Conversation[] }>('/conversations')
      if (mounted.current && ticket === listRequest.current) setListError('')
    } catch (error) {
      if (mounted.current && ticket === listRequest.current) {
        setListError(error instanceof Error ? error.message : 'Recent chats unavailable')
      }
      throw error
    }
    if (mounted.current) setConversations((current) => {
      const byId = new Map(current.map((c) => [c.id, c]))
      for (const c of result.conversations) {
        const candidates = [c, byId.get(c.id), get(c.id).conversation].filter((item): item is Conversation => !!item)
        const latest = candidates.reduce((a, b) => b.addressVersion > a.addressVersion || (b.addressVersion === a.addressVersion && b.updatedAt > a.updatedAt) ? b : a)
        byId.set(c.id, latest)
      }
      return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
    })
  }, [get])
  const getObservedAddress = useCallback((id: string) => get(id).conversation?.observedAddress ?? null, [get])
  const { states, isRunning, cancel, execute } = useRunExecution({
    getObservedAddress, resolveAddress, mounted, updateMessages, updateError, savePending, refresh, invalidate,
  })
  const recovering = useRef(new Set<string>())
  const recoverPending = useCallback(async (value: Pending) => {
    const id = value.conversationId
    if (!mounted.current || isRunning(id) || recovering.current.has(id)) return
    recovering.current.add(id)
    try {
      await loadHistory(id)
      // A request captured before history loaded must not replay after newer work.
      if (!mounted.current || !get(id).loaded || isRunning(id) || pendingRef.current[id] !== value) return
      await execute(value, !!value.runId)
    } finally {
      recovering.current.delete(id)
    }
  }, [execute, get, isRunning, loadHistory])
  const open = useCallback(async (id: string) => {
    select(id)
    await loadHistory(id)
  }, [loadHistory, select])
  const initial = useRef(false)
  useEffect(() => {
    if (initial.current) return
    initial.current = true
    const restored = Object.values(pendingRef.current)
    if (!restored.length) {
      sessionStorage.removeItem(pendingKey)
      sessionStorage.removeItem(`${pendingKey}:all`)
    }
    const initialId = selectedId.current
    // Selection is established before any await; startup never navigates later.
    void refresh().catch(() => { /* List errors are independent of conversation execution. */ })
      .finally(() => { if (mounted.current) setStarting(false) })
    if (initialId) {
      const revision = get(initialId).revision
      const hadPending = !!pendingRef.current[initialId]
      void loadHistory(initialId).then((history) => {
        if (!history?.activeRunId || hadPending || !mounted.current || get(initialId).revision !== revision + 1 || pendingRef.current[initialId] || isRunning(initialId)) return
        // Only startup discovers an unsaved active run. Viewing history never recovers it.
        const value: Pending = {
          conversationId: initialId, clientRequestId: crypto.randomUUID(), text: '',
          expectedAddressVersion: history.addressVersion, createdAt: Date.now(), runId: history.activeRunId,
        }
        savePending(initialId, value)
        void recoverPending(value)
      })
    }
    for (const value of restored) void recoverPending(value)
  }, [get, isRunning, loadHistory, pendingKey, recoverPending, refresh, savePending])
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const send = async (text: string, consumeDraft = true): Promise<boolean> => {
    const id = selectedId.current
    if (!text.trim() || (id ? get(id).loading || isRunning(id) || !!pendingRef.current[id] : creatingRef.current)) return false
    const ticket = navigation.current
    const originalDraft = draftRef.current[id ?? 'new-chat'] ?? ''
    let c = id ? get(id).conversation : null
    if (id && !c) return false
    if (!c) {
      creatingRef.current = true
      setCreating(true)
      setDraftError('')
      try {
        c = await request<Conversation>('/conversations', { method: 'POST', body: '{}' })
        if (!mounted.current) return false
        patch(c.id, { conversation: c, loaded: true })
        const created = c
        setConversations((current) => [created, ...current.filter((item) => item.id !== created.id)])
        if (ticket === navigation.current) select(c.id)
      } catch (error) {
        if (mounted.current) setDraftError(error instanceof Error ? error.message : 'Could not create conversation')
        return false
      } finally {
        creatingRef.current = false
        if (mounted.current) setCreating(false)
      }
    }
    const value: Pending = {
      conversationId: c.id, clientRequestId: crypto.randomUUID(), text: text.trim(),
      expectedAddressVersion: c.addressVersion, createdAt: Date.now(),
    }
    if (consumeDraft && (draftRef.current[id ?? 'new-chat'] ?? '') === originalDraft) writeDraft(id, '')
    savePending(c.id, value)
    void execute(value)
    return true
  }
  const current = selected ? chats[selected] : null
  const pending = selected ? pendingRequests[selected] ?? null : null
  const retry = () => {
    if (!selected || isRunning(selected) || pendingRef.current[selected]) return
    const last = [...get(selected).messages].reverse().find((m) => m.role === 'user')
    if (last) void send(last.text, false)
  }
  return {
    conversations, listError, selectedId: selected, conversation: current?.conversation ?? null,
    messages: current?.messages ?? [], loading: selected ? current?.loading ?? true : starting && !navigated,
    error: selected ? current?.error ?? '' : draftError, cursor: current?.cursor ?? null, pending,
    input: drafts[selected ?? 'new-chat'] ?? '', setInput: (text: string) => writeDraft(selectedId.current, text),
    creating: !selected && creating,
    busy: selected ? states[selected]?.busy ?? false : false,
    executionBusy: creating || Object.values(states).some((state) => state.busy),
    tools: selected ? states[selected]?.tools ?? [] : [],
    send, open, newChat: () => select(null), retry,
    loadOlder: async () => { if (selected && get(selected).cursor && !get(selected).loading) await loadHistory(selected, true) },
    recover: () => { if (pending) void recoverPending(pending) },
    cancel: () => { if (selected) cancel(selected) },
  }
}
