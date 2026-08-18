import { describe, expect, it } from 'vitest'
import type { AgentOutcome } from './data'
import { filterAgentOutcomes, paginateAgentOutcomes, sortAgentOutcomes } from './slurpTableUtils'

const outcomes: AgentOutcome[] = [
  { id: 'a', name: 'Alpha scout', specialty: 'Research', completed: 12, score: 75, status: 'ready' },
  { id: 'b', name: 'Beta maker', specialty: 'Engineering', completed: 30, score: 92, status: 'working' },
  { id: 'c', name: 'Gamma guide', specialty: 'Guidance', completed: 20, score: 84, status: 'paused' },
]

describe('slurp table utilities', () => {
  it('filters by a searchable field and status', () => {
    expect(filterAgentOutcomes(outcomes, 'engineering', 'working').map(({ id }) => id)).toEqual(['b'])
  })

  it('sorts without mutating source outcomes', () => {
    expect(sortAgentOutcomes(outcomes, 'score-desc').map(({ id }) => id)).toEqual(['b', 'c', 'a'])
    expect(outcomes.map(({ id }) => id)).toEqual(['a', 'b', 'c'])
  })

  it('returns a single page of results', () => {
    expect(paginateAgentOutcomes(outcomes, 2, 2).map(({ id }) => id)).toEqual(['c'])
  })
})
