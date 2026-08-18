export interface CookingPanelProps {
  hasTask: boolean
}

export function CookingPanel({ hasTask }: CookingPanelProps) {
  return (
    <div className="panel-content">
      <h2>{hasTask ? 'Work in motion.' : 'Nothing cooking yet.'}</h2>
      <p className="panel-intro">Track execution stages and concise reasoning summaries as agents work.</p>
      <div className="task-timeline" aria-live="polite">
        <div className={hasTask ? 'complete' : ''}><i /><span><strong>Understand the task</strong><small>{hasTask ? 'Request parsed and scoped' : 'Waiting for a task'}</small></span></div>
        <div className={hasTask ? 'active' : ''}><i /><span><strong>Plan the approach</strong><small>{hasTask ? 'Choosing tools and next actions' : 'Starts after a request'}</small></span></div>
        <div><i /><span><strong>Deliver the result</strong><small>Review and final response</small></span></div>
      </div>
    </div>
  )
}
