import { ArrowLeft, CheckCircle2, FolderCheck, Gauge, Sparkles } from 'lucide-react'
import type { AgentOutcome } from '../data'

export interface SlurpAgentDetailPageProps {
  outcome: AgentOutcome
  onBack: () => void
}

export function SlurpAgentDetailPage({ outcome, onBack }: SlurpAgentDetailPageProps) {
  const statusCopy = outcome.status === 'working' ? 'Working now' : outcome.status === 'ready' ? 'Ready for work' : 'Paused'

  return (
    <div className="panel-content slurp-agent-detail-page">
      <button type="button" className="panel-back" onClick={onBack}><ArrowLeft size={16} />All outcomes</button>
      <header className="agent-detail-header">
        <span className="agent-detail-icon"><Sparkles size={22} strokeWidth={1.55} /></span>
        <div><span className={`agent-status ${outcome.status}`}><i />{statusCopy}</span><h2>{outcome.name}</h2></div>
      </header>
      <p className="panel-intro">A focused view of this agent’s completed work and capability signal.</p>
      <dl className="agent-detail-stats" aria-label={`${outcome.name} outcome statistics`}>
        <div><dt><FolderCheck size={15} />Completed</dt><dd>{outcome.completed} runs</dd></div>
        <div><dt><Gauge size={15} />Capability</dt><dd>{outcome.score} / 100</dd></div>
      </dl>
      <section className="agent-detail-section" aria-labelledby="slurp-specialty-heading"><p className="panel-eyebrow" id="slurp-specialty-heading">Focus</p><div className="agent-specialty"><CheckCircle2 size={15} />{outcome.specialty}</div></section>
      <section className="agent-detail-section" aria-labelledby="slurp-signal-heading"><p className="panel-eyebrow" id="slurp-signal-heading">Capability signal</p><p className="agent-detail-copy">This score reflects the quality signals collected across the agent’s completed runs. Use it as a guide when choosing the right capability for your next task.</p></section>
    </div>
  )
}
