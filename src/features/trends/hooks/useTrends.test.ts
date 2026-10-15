// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { request } from '../../../shared/api'
import { useTrends } from './useTrends'
import type { TrendsData } from '../types'
vi.mock('../../../shared/api', () => ({ request: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.useRealTimers() })
const data: TrendsData = { scope: 'test', generatedAt: null, marketSource: null, interestBaseline: null, stale: true, marketError: false, leaderboardError: false, walletError: false, leaderboardAt: null, walletsAt: null, leaderboardStale: true, walletsStale: true, highlights: { volume: [], interest: [], funding: [] }, traders: [], events: [] }
it('aborts hidden-panel requests and ignores late responses on return', async () => {
  const latest: TrendsData = { ...data, scope: 'new', marketSource: { sourceId: 'current', at: 3600000 }, interestBaseline: { sourceId: 'baseline', at: 0 } }
  let finish!: (data: TrendsData) => void
  let signal: AbortSignal | undefined
  vi.mocked(request).mockImplementationOnce((_url, init) => {
    signal = init?.signal as AbortSignal
    return new Promise(resolve => { finish = resolve as (data: TrendsData) => void })
  }).mockResolvedValue(latest)
  const { result, rerender } = renderHook(({ active }) => useTrends(active), { initialProps: { active: true } })
  rerender({ active: false })
  expect(signal?.aborted).toBe(true)
  rerender({ active: true })
  await waitFor(() => expect(result.current.data?.scope).toBe('new'))
  await act(async () => finish(data))
  expect(result.current.data?.scope).toBe('new')
  expect(result.current.data).toEqual(latest)
})
it('keeps the last successful data on refresh failure and recovers on retry', async () => {
  vi.mocked(request).mockResolvedValueOnce(data).mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(data)
  const { result } = renderHook(() => useTrends(true))
  await waitFor(() => expect(result.current.data).toEqual(data))
  act(() => result.current.refresh())
  await waitFor(() => expect(result.current.error).toBe('Offline'))
  expect(result.current.data).toEqual(data)
  act(() => result.current.refresh())
  await waitFor(() => expect(result.current.error).toBe(''))
})
it('polls only while active and clears its timer on unmount', async () => {
  vi.useFakeTimers()
  vi.mocked(request).mockResolvedValue(data)
  const { rerender, unmount } = renderHook(({ active }) => useTrends(active), { initialProps: { active: true } })
  await act(async () => {})
  expect(request).toHaveBeenCalledTimes(1)
  await act(async () => vi.advanceTimersByTimeAsync(60_000))
  expect(request).toHaveBeenCalledTimes(2)
  rerender({ active: false })
  await act(async () => vi.advanceTimersByTimeAsync(120_000))
  expect(request).toHaveBeenCalledTimes(2)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
