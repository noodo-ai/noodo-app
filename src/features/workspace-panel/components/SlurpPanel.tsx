import { agentOutcomes } from '../data'

export function SlurpPanel() {
  return (
    <div className="panel-content">
      <h2>Capability, proven in output.</h2>
      <p className="panel-intro">Consume quality signals from completed work to see where each agent is strongest.</p>
      <div className="slurp-summary" aria-label="Completed agent work summary">
        <span><strong>105</strong><small>completed runs</small></span>
        <span><strong>86</strong><small>team capability</small></span>
      </div>
      <ul className="agent-outcome-list" aria-label="Agent capability comparison">
        {agentOutcomes.map(({ name, completed, score, metrics }) => (
          <li className="agent-outcome" key={name}>
            <div className="agent-outcome-head"><span><strong>{name}</strong><small>{completed} completed runs</small></span><b>{score}</b></div>
            <div className="outcome-meter" aria-label={`${name} overall capability: ${score} out of 100`}><i style={{ width: `${score}%` }} /></div>
            <div className="outcome-metrics">{metrics.map(([label, value]) => <span key={label}>{label}<b>{value}</b></span>)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
