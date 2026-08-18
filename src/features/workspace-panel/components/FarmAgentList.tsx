import { Plus } from 'lucide-react'
import { farmAgents } from '../data'

export interface FarmAgentListProps {
  onSelectAgent: (agentName: string) => void
  onConnectAgent: () => void
}

export function FarmAgentList({ onSelectAgent, onConnectAgent }: FarmAgentListProps) {
  return (
    <div className="panel-content">
      <h2>Agents, ready when you are.</h2>
      <p className="panel-intro">Connect specialist agents and decide who joins each task.</p>
      <div className="agent-list">
        {farmAgents.map(({ name, Icon, status }) => (
          <button type="button" className="agent-row" key={name} aria-label={`View ${name}, ${status}`} onClick={() => onSelectAgent(name)}>
            <span className="agent-row-content">
              <span className="agent-avatar"><Icon size={16} /></span>
              <strong>{name}</strong><i className={`online-dot ${status}`} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="panel-secondary farm-connect" onClick={onConnectAgent}><Plus size={16} />Connect agent</button>
    </div>
  )
}
