// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { request, pollRun, sendMessage } from '../features/assistant/api'
import type { History, Run } from '../features/assistant/types'

vi.mock('../features/assistant/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u', username: 'User' }, logout: vi.fn(), error: '' }),
}))
vi.mock('../features/assistant/api', async (original) => ({
  ...await original<typeof import('../features/assistant/api')>(),
  request: vi.fn(), pollRun: vi.fn(), sendMessage: vi.fn(),
}))
const history: History = {
  id: 'c', title: 'Test', observedAddress: null, addressVersion: 1, updatedAt: 1,
  messages: [], runs: [], nextCursor: null, activeRunId: null,
}
const completed: Run = {
  id: 'r', status: 'completed', observedAddress: null, addressVersion: 1, marketScope: 'test',
  result: { text: 'Saved answer', textStatus: 'final', dataCards: [], sources: [], coverage: [], warnings: [] },
  error: null,
}
beforeEach(() => {
  sessionStorage.clear()
  vi.resetAllMocks()
  HTMLElement.prototype.scrollIntoView = vi.fn()
  sessionStorage.setItem('noodo:pending:u', JSON.stringify({
    conversationId: 'c', clientRequestId: 'original', text: 'Question',
    expectedAddressVersion: 1, createdAt: Date.now(), runId: 'r',
  }))
  vi.mocked(request).mockImplementation(async path => path === '/conversations' ? { conversations: [history] } : history)
  vi.mocked(pollRun).mockResolvedValue(completed)
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

it.each([false, true])('notifies background failures and keeps actions in the original chat (pending=%s)', async pending => {
  const other = { ...history, id: 'b', title: 'Chat B' }
  vi.mocked(request).mockImplementation(async path => path === '/conversations'
    ? { conversations: [history, other] }
    : path === '/conversations/b' ? other : history)
  let fail!: () => void
  vi.mocked(pollRun).mockImplementationOnce(() => new Promise<Run>((resolve, reject) => {
    fail = () => pending
      ? reject(new Error('Background connection lost'))
      : resolve({ ...completed, status: 'failed', result: null, error: { code: 'modelFailed', message: 'Background model failed', retryable: true } })
  })).mockRejectedValue(new Error('Recovery unavailable'))
  render(<App />)
  await waitFor(() => expect(pollRun).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByTitle('Chat B'))
  await waitFor(() => expect(sessionStorage.getItem('noodo:selected:u')).toBe('b'))
  await act(async () => { fail() })
  const message = pending ? 'Background connection lost' : 'Background model failed'
  expect((await screen.findByRole('alert')).textContent).toBe(message)
  expect(screen.queryByRole('button', { name: 'Recover saved request' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Retry as new request' })).toBeNull()
  expect(sessionStorage.getItem('noodo:selected:u')).toBe('b')

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
  fireEvent.click(screen.getByTitle('Test'))
  const action = await screen.findByRole('button', { name: pending ? 'Recover saved request' : 'Retry as new request' })
  expect((action as HTMLButtonElement).disabled).toBe(false)
  expect(screen.queryByRole('alert')).toBeNull()
  fireEvent.click(screen.getByTitle('Chat B'))
  expect(screen.queryByRole('alert')).toBeNull()
  expect(sendMessage).not.toHaveBeenCalled()
  expect(pollRun).toHaveBeenCalledTimes(pending ? 2 : 1)
})

it('keeps recovery accessible after reopening history clears the outage error', async () => {
  let offline = true
  vi.mocked(request).mockImplementation(async path => {
    if (path === '/conversations') return { conversations: [history] }
    if (offline) throw new Error('History offline')
    return history
  })
  render(<App />)
  await screen.findByText('History offline')
  offline = false
  fireEvent.click(screen.getByTitle('Test'))
  await waitFor(() => expect(screen.queryByText('History offline')).toBeNull())
  const recover = screen.getByRole('button', { name: 'Recover saved request' })
  expect((recover as HTMLButtonElement).disabled).toBe(false)
  expect(pollRun).not.toHaveBeenCalled()
  fireEvent.click(recover)
  await screen.findByText('Saved answer')
  expect(screen.queryByRole('button', { name: 'Recover saved request' })).toBeNull()
  expect(sendMessage).not.toHaveBeenCalled()
})

it('keeps recovery accessible when a running update clears the error before polling fails again', async () => {
  vi.mocked(pollRun).mockRejectedValueOnce(new Error('Connection lost'))
    .mockImplementationOnce(async (_id, _signal, update) => {
      update?.({ ...completed, status: 'running', result: null })
      throw new Error('Still offline')
    }).mockResolvedValue(completed)
  render(<App />)
  await waitFor(() => expect(pollRun).toHaveBeenCalledTimes(2))
  const recover = await screen.findByRole('button', { name: 'Recover saved request' })
  await waitFor(() => expect((recover as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(recover)
  await screen.findByText('Saved answer')
  expect(pollRun).toHaveBeenCalledTimes(3)
  expect(sendMessage).not.toHaveBeenCalled()
})

it.each([false, true])('does not replace settled execution with a late startup list error (failed=%s)', async failed => {
  let rejectList!: (error: Error) => void
  const list = new Promise((_resolve, reject) => { rejectList = reject })
  let listCalls = 0
  vi.mocked(request).mockImplementation(async path => path === '/conversations'
    ? ++listCalls === 1 ? list : { conversations: [history] }
    : history)
  vi.mocked(pollRun).mockResolvedValue(failed
    ? { ...completed, status: 'failed', error: { code: 'modelFailed', message: 'Model failed', retryable: true } }
    : completed)
  render(<App />)
  await screen.findByText('Saved answer')
  await waitFor(() => expect(sessionStorage.getItem('noodo:pending:u')).toBeNull())
  await act(async () => { rejectList(new Error('List offline')) })
  expect(screen.queryByText('List offline')).toBeNull()
  expect(screen.queryByText('Model failed') !== null).toBe(failed)
  expect(screen.queryByRole('button', { name: 'Retry as new request' }) !== null).toBe(failed)
})

it('shows current list failures separately without offering to retry a successful reply', async () => {
  let rejectList!: (error: Error) => void
  const list = new Promise((_resolve, reject) => { rejectList = reject })
  vi.mocked(request).mockImplementation(async path => path === '/conversations' ? list : history)
  render(<App />)
  await screen.findByText('Saved answer')
  await waitFor(() => expect(sessionStorage.getItem('noodo:pending:u')).toBeNull())
  await act(async () => { rejectList(new Error('List offline')) })
  expect(screen.getByText('Recent chats unavailable: List offline')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Retry as new request' })).toBeNull()
  expect(screen.getByText('Saved answer')).toBeTruthy()
})
