// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { readPending } from './history'

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
