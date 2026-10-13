import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import type { DataCard, RunActivity } from '../../assistant/types'
import { ResponseSteps } from './ResponseSteps'

const card = (id: string, coin: string): DataCard => ({
  id,
  kind: 'get_market_overview',
  data: { coin },
  sources: [],
  sourceIds: [],
  coverage: { marketScope: 'default', observedAddress: null, complete: false, reasonCodes: [] },
  warnings: [],
  formulaVersion: '1',
})

it('places each card directly after its own query status and before the answer', () => {
  const activity: RunActivity[] = [
    { type: 'text', id: 'intro', round: 0, phase: 'explanation', text: 'Checking markets' },
    { type: 'tool', id: 'btc', name: 'get_market_overview', status: 'partial' },
    { type: 'tool', id: 'eth', name: 'get_market_overview', status: 'success' },
    { type: 'text', id: 'answer', round: 1, phase: 'final', text: 'Final answer' },
  ]
  const html = renderToStaticMarkup(<ResponseSteps activity={activity} cards={[card('eth', 'ETH'), card('btc', 'BTC')]} responding={false} />)
  expect(html).toContain('<div class="response-sections"')
  expect(html).not.toContain('response-step-marker')
  const limited = html.indexOf('Completed · Data limited')
  const btc = html.indexOf('BTC perpetual')
  const eth = html.indexOf('ETH perpetual')
  const answer = html.indexOf('Final answer')
  expect(limited).toBeGreaterThan(-1)
  expect(btc).toBeGreaterThan(limited)
  expect(eth).toBeGreaterThan(btc)
  expect(answer).toBeGreaterThan(eth)
  expect(html.match(/BTC perpetual/g)).toHaveLength(1)
  expect(html.match(/ETH perpetual/g)).toHaveLength(1)
  expect(html).toContain('<details class="response-progress">')
  expect(html).not.toContain('>Answer</span>')
  expect(html).toContain('Elapsed 0 min 0 sec')
  expect(html.lastIndexOf('</details>')).toBeGreaterThan(eth)
  expect(html.lastIndexOf('</details>')).toBeLessThan(answer)
})

it('preserves failed steps and cards without a matching activity', () => {
  const html = renderToStaticMarkup(<ResponseSteps activity={[{ type: 'tool', id: 'failed', name: 'get_account_overview', status: 'failed' }]} cards={[card('legacy', 'SOL')]} responding={false} />)
  expect(html).toContain('Failed · Data unavailable')
  expect(html).toContain('SOL perpetual')
  expect(html).toContain('<details class="response-progress" open="">')
})

it('keeps progress expanded until a nonempty final answer exists', () => {
  const activity: RunActivity[] = [
    { type: 'text', id: 'intro', round: 0, phase: 'pending', text: 'Checking account' },
    { type: 'tool', id: 'account', name: 'get_account_overview', status: 'partial' },
    { type: 'text', id: 'answer', round: 1, phase: 'final', text: '' },
  ]
  const html = renderToStaticMarkup(<ResponseSteps activity={activity} cards={[]} responding />)
  expect(html).toContain('<details class="response-progress" open="">')
  expect(html).toContain('Responding')
  expect(html.indexOf('Account overview')).toBeLessThan(html.lastIndexOf('</details>'))
})

it('shows an answer without an empty progress panel', () => {
  const html = renderToStaticMarkup(<ResponseSteps activity={[{ type: 'text', id: 'answer', round: 0, phase: 'final', text: 'Answer only' }]} cards={[]} responding={false} />)
  expect(html).not.toContain('<details')
  expect(html).toContain('Answer only')
})
