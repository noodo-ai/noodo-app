import { ArrowLeft, Check, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { connectionOptions } from '../data'

export interface ConnectAgentPageProps {
  onBack: () => void
}

export function ConnectAgentPage({ onBack }: ConnectAgentPageProps) {
  const [connectionType, setConnectionType] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (connectionType && agentName.trim()) setSubmitted(true) }

  return (
    <div className="panel-content connect-agent-page">
      <button type="button" className="panel-back" onClick={onBack}><ArrowLeft size={16} />All agents</button>
      <h2>Connect an agent.</h2>
      <p className="panel-intro">Choose what you want to add. Nothing is connected until you complete setup.</p>
      <form className="connect-agent-form" onSubmit={submit}>
        <fieldset><legend>Connection type</legend><div className="connection-option-list">
          {connectionOptions.map(({ id, label, description, Icon }) => (
            <label className={`connection-option ${connectionType === id ? 'selected' : ''}`} key={id}>
              <input type="radio" name="connection-type" value={id} checked={connectionType === id} onChange={() => { setConnectionType(id); setSubmitted(false) }} />
              <span className="connection-option-icon"><Icon size={17} /></span><span><strong>{label}</strong><small>{description}</small></span>{connectionType === id && <Check size={16} aria-hidden="true" />}
            </label>
          ))}
        </div></fieldset>
        <label className="connect-agent-name">Agent name<input value={agentName} onChange={(event) => { setAgentName(event.target.value); setSubmitted(false) }} placeholder="e.g. Market scout" required /></label>
        <button type="submit" className="panel-secondary connect-submit" disabled={!connectionType || !agentName.trim()}><Plus size={16} />Continue setup</button>
      </form>
      {submitted && <p className="connect-agent-status" role="status"><Check size={16} />Setup details are ready for {agentName.trim()}.</p>}
    </div>
  )
}
