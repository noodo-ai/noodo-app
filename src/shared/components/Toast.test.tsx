// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ToastRegion } from './Toast'

beforeEach(() => vi.useFakeTimers())
afterEach(() => { cleanup(); vi.useRealTimers() })

it('dismisses errors without removing other notifications and shows a later recurrence', () => {
  const { rerender } = render(<ToastRegion messages={[{ id: 'login', message: 'Sign in failed' }, { id: 'list', message: 'List offline' }]} />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss notification' })[0])
  expect(screen.queryByText('Sign in failed')).toBeNull()
  expect(screen.getByRole('alert').textContent).toBe('List offline')
  rerender(<ToastRegion messages={[]} />)
  rerender(<ToastRegion messages={[{ id: 'login', message: 'Sign in failed' }]} />)
  expect(screen.getByRole('alert').textContent).toBe('Sign in failed')
})

it('pauses dismissal during hover and keyboard focus, then cleans up on removal', () => {
  const { container, rerender, unmount } = render(<ToastRegion messages={[{ id: 'request', message: 'Connection lost' }]} />)
  fireEvent.mouseEnter(container.querySelector('.toast')!)
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.getByRole('alert')).toBeTruthy()
  fireEvent.focus(screen.getByRole('button'))
  fireEvent.mouseLeave(container.querySelector('.toast')!)
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.getByRole('alert')).toBeTruthy()
  fireEvent.blur(screen.getByRole('button'))
  act(() => vi.advanceTimersByTime(6000))
  expect(screen.queryByRole('alert')).toBeNull()
  rerender(<ToastRegion messages={[{ id: 'request', message: 'Still offline' }]} />)
  expect(screen.getByRole('alert').textContent).toBe('Still offline')
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
