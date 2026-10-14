import { useCallback, useRef, useState, type RefObject } from 'react'
import { request } from '../api'
import { hydrate } from '../history'
import type { ChatMessage, Conversation, History } from '../types'

interface ConversationState {
  conversation: Conversation | null
  messages: ChatMessage[]
  cursor: string | null
  loaded: boolean
  loading: boolean
  error: string
  revision: number
}
const empty = (): ConversationState => ({
  conversation: null, messages: [], cursor: null, loaded: false,
  loading: false, error: '', revision: 0,
})

// Data validity belongs to the conversation, independently of navigation.
export function useConversationState(mounted: RefObject<boolean>) {
  const cache = useRef<Record<string, ConversationState>>({})
  const [states, setStates] = useState<Record<string, ConversationState>>({})
  const requests = useRef(new Map<string, Promise<History | null>>())
  const get = useCallback((id: string) => cache.current[id] ?? empty(), [])
  const patch = useCallback((id: string, update: Partial<ConversationState>) => {
    if (!mounted.current) return
    cache.current = { ...cache.current, [id]: { ...get(id), ...update } }
    setStates(cache.current)
  }, [get, mounted])
  const updateMessages = useCallback((id: string, update: (messages: ChatMessage[]) => ChatMessage[]) => {
    const current = get(id)
    patch(id, { messages: update(current.messages), revision: current.revision + 1 })
  }, [get, patch])
  const updateError = useCallback((id: string, error: string) => patch(id, { error }), [patch])
  const resolveAddress = useCallback((id: string, address: string | null, version: number) => {
    const current = get(id)
    if (!current.conversation || version < current.conversation.addressVersion) return
    patch(id, { conversation: { ...current.conversation, observedAddress: address, addressVersion: version }, revision: current.revision + 1 })
  }, [get, patch])
  const invalidate = useCallback((id: string) => {
    patch(id, { revision: get(id).revision + 1 })
  }, [get, patch])
  const loadHistory = useCallback((id: string, older = false): Promise<History | null> => {
    const current = get(id)
    if (!older && current.loaded) return Promise.resolve(null)
    const key = `${id}:${older ? current.cursor : 'latest'}`
    const existing = requests.current.get(key)
    if (existing) return existing
    const revision = current.revision
    patch(id, { loading: true, error: '' })
    const task = request<History>(`/conversations/${id}${older ? `?cursor=${encodeURIComponent(current.cursor!)}` : ''}`)
      .then((history) => {
        if (!mounted.current || get(id).revision !== revision) return null
        const latest = get(id)
        const conversation = latest.conversation && latest.conversation.addressVersion > history.addressVersion
          ? latest.conversation : history
        const messages = hydrate(history)
        patch(id, {
          conversation, loaded: true, cursor: history.nextCursor,
          messages: older ? [...messages.filter((m) => !latest.messages.some((c) => c.id === m.id)), ...latest.messages] : messages,
          revision: revision + 1,
        })
        return history
      }).catch((error: unknown) => {
        if (get(id).revision === revision) updateError(id, error instanceof Error ? error.message : 'History unavailable')
        return null
      }).finally(() => {
        requests.current.delete(key)
        patch(id, { loading: false })
      })
    requests.current.set(key, task)
    return task
  }, [get, mounted, patch, updateError])
  return { states, get, patch, updateMessages, updateError, resolveAddress, invalidate, loadHistory }
}
