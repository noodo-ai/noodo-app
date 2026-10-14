// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { request } from '../features/assistant/api'

vi.mock('../features/assistant/api', async original => ({
  ...await original<typeof import('../features/assistant/api')>(),
  request: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})
afterEach(cleanup)

it('renders no content until the session check finishes, then opens the workspace', async () => {
  let resolveSession!: (value: { user: { id: string; username: string } }) => void
  const session = new Promise<{ user: { id: string; username: string } }>(resolve => {
    resolveSession = resolve
  })
  vi.mocked(request).mockImplementation(async path => path === '/auth/me'
    ? session : { conversations: [] })
  const { container } = render(<App />)
  expect(container.innerHTML).toBe('')
  expect(screen.queryByLabelText('Username')).toBeNull()
  await act(async () => resolveSession({ user: { id: 'u', username: 'User' } }))
  expect(screen.getByRole('button', { name: 'Open right panel' })).toBeTruthy()
  expect(screen.queryByLabelText('Username')).toBeNull()
})

it('shows the login form only after the session check fails and keeps it during sign-in', async () => {
  let rejectSession!: (error: Error) => void
  const session = new Promise<never>((_resolve, reject) => { rejectSession = reject })
  vi.mocked(request).mockReturnValue(session)
  const { container } = render(<App />)
  expect(container.innerHTML).toBe('')
  await act(async () => rejectSession(new Error('Unauthorized')))
  expect(screen.getByLabelText('Username')).toBeTruthy()

  let rejectLogin!: (error: Error) => void
  vi.mocked(request).mockReturnValue(new Promise<never>((_resolve, reject) => { rejectLogin = reject }))
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'User' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(screen.getByLabelText('Username')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Signing in…' })).toBeTruthy()
  await act(async () => rejectLogin(new Error('Sign in failed')))
  expect(screen.getByRole('alert').textContent).toBe('Sign in failed')
  expect(screen.getByLabelText('Username')).toBeTruthy()
})
