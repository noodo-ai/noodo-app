import { ArrowDownRight, ArrowUpRight, BarChart3, ChartNoAxesCombined, Percent } from 'lucide-react'
import { decimal } from '../../../shared/format'
import type { TrendsData, TrendMarket } from '../types'

const sections = [
  { key: 'volume', title: 'Trading activity', caption: '24h notional volume', Icon: BarChart3 },
  { key: 'interest', title: 'Open interest moves', caption: 'Change in underlying units', Icon: ChartNoAxesCombined },
  { key: 'funding', title: 'Funding watch', caption: 'Largest absolute hourly rates', Icon: Percent },
] as const
function value(key: typeof sections[number]['key'], row: TrendMarket): string {
  if (key === 'volume') return row.volume === null ? 'Unknown' : `$${decimal(row.volume, 0)}`
  if (key === 'interest') return row.oiChange1h === null ? 'Unknown' : `${row.oiChange1h.startsWith('-') ? '' : '+'}${decimal(row.oiChange1h)}%`
  return decimal(row.funding, 4, true)
}
export function MarketHighlights({ highlights }: { highlights: TrendsData['highlights'] }) {
  const currentInterest = highlights.volume.filter(row => row.openInterest !== null).slice(0, 3)
  const showingCurrent = highlights.interest.length === 0 && currentInterest.length > 0
  return <section className="trend-highlights" aria-label="Market highlights">
    {sections.map(({ key, title, caption, Icon }) => {
      const current = key === 'interest' && showingCurrent
      const rows = current ? currentInterest : highlights[key]
      return <article className={`trend-highlight trend-highlight-${key}`} key={key}>
        <div className="trend-highlight-heading">
          <h3><Icon size={15} strokeWidth={1.6} aria-hidden="true" />{current ? 'Open interest' : title}</h3>
          {key === 'interest' && <span className="trend-period" title={current ? 'Hourly changes appear after about an hour of observations.' : 'Approximately one-hour change in underlying open interest.'}>{current ? 'Current' : '~1h'}</span>}
        </div>
        {(rows.length > 0 || key !== 'interest') && <p className="trend-caption">{current ? 'Collecting 1h history' : caption}</p>}
        {rows.length ? <dl>{rows.map(row => <div key={row.coin}>
          <dt>{row.coin}</dt>
          <dd title={current ? row.openInterest ?? 'Unknown' : key === 'funding' ? row.funding ?? 'Unknown' : key === 'interest' ? row.oiChange1h ?? 'Unknown' : row.volume ?? 'Unknown'}>
            {current ? <span className="trend-interest-current">{decimal(row.openInterest)}<span>{row.coin}</span></span> : key === 'interest' ? <span className="trend-interest-value">
              {row.oiChange1h?.startsWith('-') ? <ArrowDownRight size={13} strokeWidth={1.6} aria-hidden="true" /> : <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden="true" />}
              {value(key, row)}
            </span> : value(key, row)}
          </dd>
        </div>)}</dl> : key === 'interest' ? <div className="trend-interest-empty" role="status">
          <span>Awaiting market observations</span>
          <p>Current open interest will appear when market data is available.</p>
        </div> : <p className="trend-empty">No market data available.</p>}
      </article>
    })}
  </section>
}
