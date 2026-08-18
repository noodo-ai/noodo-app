import { agentOutcomes } from '../data'
import { useState } from 'react'
import { useSlurpTable } from '../hooks/useSlurpTable'
import { AgentOutcomeTable } from './AgentOutcomeTable'
import { SlurpAgentDetailPage } from './SlurpAgentDetailPage'
import { SlurpTableControls } from './SlurpTableControls'

export function SlurpPanel() {
  const table = useSlurpTable()
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null)
  const totalRuns = agentOutcomes.reduce((total, item) => total + item.completed, 0)
  const averageScore = Math.round(agentOutcomes.reduce((total, item) => total + item.score, 0) / agentOutcomes.length)
  const selectedOutcome = agentOutcomes.find(({ id }) => id === selectedOutcomeId)

  if (selectedOutcome) return <SlurpAgentDetailPage outcome={selectedOutcome} onBack={() => setSelectedOutcomeId(null)} />

  return (
    <div className="panel-content">
      <h2>Capability, proven in output.</h2>
      <p className="panel-intro">Consume quality signals from completed work to see where each agent is strongest.</p>
      <div className="slurp-summary" aria-label="Completed agent work summary">
        <span><strong>{totalRuns}</strong><small>completed runs</small></span>
        <span><strong>{averageScore}</strong><small>team capability</small></span>
      </div>
      <SlurpTableControls query={table.query} statusFilter={table.statusFilter} sort={table.sort} onQueryChange={table.setQuery} onStatusFilterChange={table.setStatusFilter} onSortChange={table.setSort} />
      <AgentOutcomeTable key={`${table.page}-${table.query}-${table.statusFilter}-${table.sort}`} items={table.pageItems} page={table.page} pageCount={table.pageCount} total={table.total} onSelectOutcome={setSelectedOutcomeId} onPreviousPage={table.previousPage} onNextPage={table.nextPage} />
    </div>
  )
}
