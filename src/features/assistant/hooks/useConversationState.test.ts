// @vitest-environment jsdom
import { useRef } from 'react'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useConversationState } from './useConversationState'
import { request } from '../api'
import type { History } from '../types'
vi.mock('../api', () => ({ request: vi.fn() }))
afterEach(cleanup)
const history: History = {
  id: 'c', title: 'Old history', observedAddress: 'old', addressVersion: 1, updatedAt: 1,
  messages: [], runs: [], nextCursor: 'older', activeRunId: 'old-run',
}

it.each([false, true])('rejects stale history, cursor and account data after execution starts (older=%s)', async (older) => {
  let finish!: (value: History) => void
  const old = new Promise<History>((resolve) => { finish = resolve })
  vi.mocked(request).mockReturnValue(old)
  const { result } = renderHook(() => useConversationState(useRef(true)))
  if (older) act(() => result.current.patch('c', { conversation: history, loaded: true, cursor: 'page' }))
  let loading!: Promise<History | null>
  act(() => { loading = result.current.loadHistory('c', older) })
  act(() => {
    result.current.patch('c', { conversation: { ...history, addressVersion: 3, observedAddress: 'new' }, loaded: true })
    result.current.invalidate('c')
    result.current.updateMessages('c', () => [{ id: 'new', runId: 'new-run', role: 'assistant', text: 'New final result', textStatus: 'final', observedAddress: 'new', addressVersion: 3, createdAt: 2 }])
  })
  await act(async () => { finish(history); expect(await loading).toBeNull() })
  expect(result.current.states.c.messages[0].text).toBe('New final result')
  expect(result.current.states.c.conversation?.addressVersion).toBe(3)
  expect(result.current.states.c.cursor).toBe(older ? 'page' : null)
  expect(result.current.states.c.loading).toBe(false)
})

it('keeps a newer account version when history is loaded and rejects older run addresses', async () => {
  vi.mocked(request).mockResolvedValue(history)
  const { result } = renderHook(() => useConversationState(useRef(true)))
  act(() => result.current.patch('c', { conversation: { ...history, observedAddress: 'new', addressVersion: 4 } }))
  await act(async () => { await result.current.loadHistory('c') })
  act(() => result.current.resolveAddress('c', 'old-run-address', 2))
  expect(result.current.states.c.conversation?.observedAddress).toBe('new')
  expect(result.current.states.c.conversation?.addressVersion).toBe(4)
})
