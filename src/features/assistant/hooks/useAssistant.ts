import { hydrate, readPending } from '../history'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRunExecution } from './useRunExecution'
import { ApiFailure, request } from '../api'
import type { ChatMessage, Conversation, History, Pending } from '../types'
export function useAssistant(userId: string) {
  const pendingKey = `noodo:pending:${userId}`,
    selectedKey = `noodo:selected:${userId}`
  const [conversations, setConversations] = useState<Conversation[]>([]),
    [conversation, setConversation] = useState<Conversation | null>(null),
    [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [cursor, setCursor] = useState<string | null>(null),
    [pending, setPending] = useState<Pending | null>(() =>
      readPending(pendingKey),
    )
  const epoch = useRef(0),
    mounted = useRef(true),
    pendingRef = useRef(pending)
  const savePending = useCallback(
    (value: Pending | null) => {
      pendingRef.current = value
      setPending(value)
      if (value) sessionStorage.setItem(pendingKey, JSON.stringify(value))
      else sessionStorage.removeItem(pendingKey)
    },
    [pendingKey],
  )
  const refresh = useCallback(async () => {
    const r = await request<{ conversations: Conversation[] }>('/conversations')
    if (mounted.current) setConversations(r.conversations)
  }, [])
  const { busy, setBusy, busyRef, abortRef, tools, setTools, execute } =
    useRunExecution({
      observedAddress: conversation?.observedAddress ?? null,
      mounted,
      setMessages,
      setError,
      savePending,
      refresh,
    })
  const recoverPending = useCallback(
    async (value: Pending) => {
      if (busyRef.current || !mounted.current) return
      const ticket = ++epoch.current
      setLoading(true)
      setError('')
      try {
        const h = await request<History>(
          `/conversations/${value.conversationId}`,
        )
        if (ticket !== epoch.current || !mounted.current) return
        setConversation(h)
        setMessages(hydrate(h))
        setCursor(h.nextCursor)
        sessionStorage.setItem(selectedKey, h.id)
        await execute(value, !!value.runId)
      } catch (e) {
        if (ticket === epoch.current && mounted.current)
          setError(e instanceof Error ? e.message : 'History unavailable')
      } finally {
        if (ticket === epoch.current && mounted.current) setLoading(false)
      }
    },
    [busyRef, execute, selectedKey],
  )
  const open = useCallback(
    async (id: string) => {
      if (busyRef.current || pendingRef.current) return
      const ticket = ++epoch.current
      setLoading(true)
      setError('')
      setTools([])
      try {
        const h = await request<History>(`/conversations/${id}`)
        if (ticket !== epoch.current || !mounted.current) return
        setConversation(h)
        setMessages(hydrate(h))
        setCursor(h.nextCursor)
        sessionStorage.setItem(selectedKey, id)
        if (h.activeRunId) {
          const p: Pending = {
            conversationId: id,
            clientRequestId: crypto.randomUUID(),
            text: '',
            expectedAddressVersion: h.addressVersion,
            createdAt: Date.now(),
            runId: h.activeRunId,
          }
          void execute(p, true)
        }
      } catch (e) {
        if (ticket === epoch.current && mounted.current)
          setError(e instanceof Error ? e.message : 'History unavailable')
      } finally {
        if (ticket === epoch.current && mounted.current) setLoading(false)
      }
    },
    [busyRef, execute, selectedKey, setTools],
  )
  // Restore once per signed-in user, including the durable request ID saved before POST.
  const initial = useRef(false)
  useEffect(() => {
    if (initial.current) return
    initial.current = true
    // Restore the request before any network work so an outage cannot unlock a new POST.
    const restored = pendingRef.current
    if (!restored) sessionStorage.removeItem(pendingKey)
    void refresh()
      .then(async () => {
        if (!mounted.current) return
        const selected = sessionStorage.getItem(selectedKey)
        if (restored) await recoverPending(restored)
        else if (selected) await open(selected)
      })
      .catch((e) => {
        if (mounted.current)
          setError(e instanceof Error ? e.message : 'History unavailable')
      })
      .finally(() => {
        if (mounted.current) setLoading(false)
      })
  }, [open, pendingKey, recoverPending, refresh, selectedKey])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const send = async (text: string): Promise<boolean> => {
    if (
      loading ||
      busyRef.current ||
      pendingRef.current ||
      !text.trim() ||
      text.trim().length > 4000
    )
      return false
    const ticket = ++epoch.current
    busyRef.current = true
    setBusy(true)
    let c = conversation
    try {
      if (!c) {
        c = await request<Conversation>('/conversations', {
          method: 'POST',
          body: '{}',
        })
        setConversation(c)
        sessionStorage.setItem(selectedKey, c.id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create conversation')
      busyRef.current = false
      setBusy(false)
      return false
    }
    busyRef.current = false
    const p: Pending = {
      conversationId: c.id,
      clientRequestId: crypto.randomUUID(),
      text: text.trim(),
      expectedAddressVersion: c.addressVersion,
      createdAt: Date.now(),
    }
    savePending(p)
    setMessages((current) => [
      ...current,
      {
        id: p.clientRequestId,
        runId: 'pending',
        role: 'user',
        text: p.text,
        textStatus: 'final',
        observedAddress: c.observedAddress,
        addressVersion: c.addressVersion,
        createdAt: p.createdAt,
      },
    ])
    void execute(p).then(() => {
      void request<History>(`/conversations/${c.id}`)
        .then((h) => {
          if (ticket !== epoch.current || !mounted.current) return
          setMessages(hydrate(h))
          setCursor(h.nextCursor)
        })
        .catch(() => {})
    })
    return true
  }
  const changeAddress = async (address: string | null): Promise<boolean> => {
    if (loading || busyRef.current || pending) return false
    setLoading(true)
    setError('')
    try {
      if (!conversation) {
        const c = await request<Conversation>('/conversations', {
          method: 'POST',
          body: JSON.stringify({ observedAddress: address }),
        })
        setConversation(c)
        sessionStorage.setItem(selectedKey, c.id)
      } else
        setConversation(
          await request<Conversation>(`/conversations/${conversation.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              observedAddress: address,
              expectedAddressVersion: conversation.addressVersion,
            }),
          }),
        )
      await refresh()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Account update failed')
      if (
        e instanceof ApiFailure &&
        e.error.code === 'addressVersionConflict' &&
        conversation
      )
        await open(conversation.id)
      return false
    } finally {
      setLoading(false)
    }
  }
  const reset = () => {
    if (loading || busyRef.current || pending) return
    epoch.current++
    setConversation(null)
    setMessages([])
    setCursor(null)
    setTools([])
    setError('')
    sessionStorage.removeItem(selectedKey)
  }
  const loadOlder = async () => {
    if (!cursor || !conversation || loading) return
    const ticket = epoch.current
    setLoading(true)
    try {
      const h = await request<History>(
        `/conversations/${conversation.id}?cursor=${encodeURIComponent(cursor)}`,
      )
      if (ticket !== epoch.current || !mounted.current) return
      setMessages((current) => [
        ...hydrate(h).filter((m) => !current.some((c) => c.id === m.id)),
        ...current,
      ])
      setCursor(h.nextCursor)
    } catch (e) {
      if (ticket === epoch.current && mounted.current)
        setError(e instanceof Error ? e.message : 'History unavailable')
    } finally {
      if (ticket === epoch.current && mounted.current) setLoading(false)
    }
  }
  const retry = () => {
    if (busyRef.current || pending) return
    const last = [...messages].reverse().find((m) => m.role === 'user')
    if (last) void send(last.text)
  }
  return {
    conversations,
    conversation,
    messages,
    busy,
    loading,
    error,
    tools,
    cursor,
    pending,
    send,
    open,
    changeAddress,
    reset,
    loadOlder,
    retry,
    recover: () => {
      if (pendingRef.current && !loading)
        void recoverPending(pendingRef.current)
    },
    cancel: () => abortRef.current?.abort(),
  }
}
