import { ArrowLeft, Check, Clock3, FolderCheck } from 'lucide-react'
import type { FarmAgent } from '../data'

export interface AgentDetailPageProps {
  agent: FarmAgent
  onBack: () => void
}

export function AgentDetailPage({ agent, onBack }: AgentDetailPageProps) {
  const { Icon } = agent

  return (
    <div className="panel-content agent-detail-page">
      <button type="button" className="panel-back" onClick={onBack}><ArrowLeft size={16} />All agents</button>
      <header className="agent-detail-header">
        <span className="agent-detail-icon"><Icon size={22} strokeWidth={1.55} /></span>
        <div><span className={`agent-status ${agent.status}`}><i />{agent.status === 'working' ? 'Working now' : 'Ready to help'}</span><h2>{agent.name}</h2></div>
      </header>
      <p className="panel-intro">{agent.description}</p>
      <dl className="agent-detail-stats" aria-label={`${agent.name} activity`}>
        <div><dt><FolderCheck size={15} />Completed</dt><dd>{agent.completedRuns} runs</dd></div>
        <div><dt><Clock3 size={15} />Typical run</dt><dd>{agent.averageDuration}</dd></div>
      </dl>
      <section className="agent-detail-section" aria-labelledby="specialty-heading"><p className="panel-eyebrow" id="specialty-heading">Specialty</p><div className="agent-specialty"><Check size={15} />{agent.specialty}</div></section>
      <section className="agent-detail-section" aria-labelledby="availability-heading"><p className="panel-eyebrow" id="availability-heading">Availability</p><p className="agent-detail-copy">This agent can be included when you start a task. Assignment remains under your control.</p></section>
    </div>
  )
}
