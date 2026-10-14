// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { readPending, readPendingRequests } from './history'

const valid = () => ({
  conversationId: 'conversation',
  clientRequestId: 'request',
  text: 'Show BTC',
  expectedAddressVersion: 1,
  createdAt: Date.now(),
})
afterEach(() => sessionStorage.clear())
it.each([
  null,
  [],
  {},
  { text: 'Missing request identity' },
  { ...valid(), expectedAddressVersion: 0 },
  { ...valid(), createdAt: Date.now() + 86400000 },
  { ...valid(), createdAt: Date.now() - 30 * 86400000 },
  { ...valid(), runId: 123 },
  { ...valid(), text: '' },
])('ignores invalid or expired pending requests: %j', (value) => {
  sessionStorage.setItem('pending', JSON.stringify(value))
  expect(readPending('pending')).toBeNull()
})
it('retains the original request and accepts a known run without message text', () => {
  const request = valid()
  sessionStorage.setItem('pending', JSON.stringify(request))
  expect(readPending('pending')).toEqual(request)
  const recovery = { ...request, text: '', runId: 'run' }
  sessionStorage.setItem('pending', JSON.stringify(recovery))
  expect(readPending('pending')).toEqual(recovery)
})
it('ignores malformed storage data', () => {
  sessionStorage.setItem('pending', '{')
  expect(readPending('pending')).toBeNull()
})

it('restores pending messages beyond 4000 characters without truncation', () => {
  const request = { ...valid(), text: 'x'.repeat(8000) }
  sessionStorage.setItem('pending', JSON.stringify(request))
  expect(readPending('pending')).toEqual(request)
})

it('filters malformed and expired entries in user-scoped multi-request storage', () => {
  const a = { ...valid(), conversationId: 'a' }
  const b = { ...valid(), conversationId: 'b', runId: 'saved-b' }
  sessionStorage.setItem('noodo:pending:user-a:all', JSON.stringify([a, b, {}, { ...valid(), conversationId: 'expired', createdAt: 1 }]))
  expect(readPendingRequests('noodo:pending:user-a')).toEqual({ a, b })
  expect(readPendingRequests('noodo:pending:user-b')).toEqual({})
})

it('keeps an authoritative empty multi-request list from replaying the legacy key', () => {
  sessionStorage.setItem('noodo:pending:user:all', '[]')
  sessionStorage.setItem('noodo:pending:user', JSON.stringify(valid()))
  expect(readPendingRequests('noodo:pending:user')).toEqual({})
})
