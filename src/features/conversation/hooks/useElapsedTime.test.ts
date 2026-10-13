// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { formatElapsedTime, useElapsedTime } from './useElapsedTime'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('formats minutes and seconds and clamps negative clock differences', () => {
  expect(formatElapsedTime(83000)).toBe('1 min 23 sec')
  expect(formatElapsedTime(-1000)).toBe('0 min 0 sec')
})

it('updates while running and preserves the persisted completion time', () => {
  vi.useFakeTimers()
  vi.setSystemTime(100000)
  const { result, rerender, unmount } = renderHook(
    ({ end, running }: { end: number | null; running: boolean }) => useElapsedTime(100000, end, running),
    { initialProps: { end: null as number | null, running: true } },
  )
  act(() => { vi.advanceTimersByTime(83000) })
  expect(result.current).toBe('1 min 23 sec')
  rerender({ end: 184000, running: false })
  act(() => { vi.advanceTimersByTime(60000) })
  expect(result.current).toBe('1 min 24 sec')
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('uses saved timestamps when reopening a completed response', () => {
  const { result } = renderHook(() => useElapsedTime(1000, 64000, false))
  expect(result.current).toBe('1 min 3 sec')
})
