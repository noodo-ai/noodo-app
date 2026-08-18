import type { AgentOutcome } from './data'
import type { SlurpSort, SlurpStatusFilter } from './slurpTableTypes'

export function filterAgentOutcomes(items: AgentOutcome[], query: string, statusFilter: SlurpStatusFilter): AgentOutcome[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return items.filter((item) => (!normalizedQuery || `${item.name} ${item.specialty}`.toLocaleLowerCase().includes(normalizedQuery)) && (statusFilter === 'all' || item.status === statusFilter))
}

export function sortAgentOutcomes(items: AgentOutcome[], sort: SlurpSort): AgentOutcome[] {
  return [...items].sort((first, second) => {
    if (sort === 'score-desc') return second.score - first.score
    if (sort === 'score-asc') return first.score - second.score
    if (sort === 'runs-desc') return second.completed - first.completed
    return first.name.localeCompare(second.name)
  })
}

export function paginateAgentOutcomes(items: AgentOutcome[], page: number, pageSize: number): AgentOutcome[] {
  return items.slice((page - 1) * pageSize, page * pageSize)
}
