import { useState } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import type { TrendEvent } from '../types'

export function TrendFeed({ events }: { events: TrendEvent[] }) {
  const [filter, setFilter] = useState<'all' | 'markets' | 'traders'>('all')
  const shown = events.filter(row => filter === 'all' || row.kind === filter)
  return <section className="trend-feed" aria-label="Trend updates">
    <div className="trend-section-heading"><h3>Latest signals</h3></div>
    <div className="trend-filters" aria-label="Filter signals">{(['all', 'markets', 'traders'] as const).map(value => <button type="button" key={value} aria-pressed={value === filter} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : value === 'markets' ? 'Markets' : 'Traders'}</button>)}</div>
    {shown.length ? <ol>{shown.map(row => <li key={row.id}><article>
      <div className="trend-event-meta"><span>{row.kind === 'markets' ? 'Market signal' : 'Trader activity'}{row.coin ? ` · ${row.coin}` : ''}</span><time dateTime={new Date(row.at).toISOString()}>{new Date(row.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>
      <h4>{row.title}</h4><p>{row.summary}</p>
      <a href={row.sourceUrl} target="_blank" rel="noreferrer">View source <ArrowUpRight size={12} /></a>
      <details><summary className="response-progress-toggle"><span>Detection details</span><ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" /></summary><p>Rule: {row.rule}</p><p>Sources: {row.sourceIds.join(', ')}</p><p>Scheduled observations; activity between snapshots may be missed.</p></details>
    </article></li>)}</ol> : <p className="trend-empty">No signals detected yet. Updates appear when a rule is triggered.</p>}
  </section>
}
