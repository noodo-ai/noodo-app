import { ChevronDown } from 'lucide-react'
import type { DataCard } from '../types'
import { queryTime } from '../format'
import { MarketCard } from './MarketCard'
import { AccountCard } from './AccountCard'
import { FillsCard } from './FillsCard'

export function DataCards({ cards }: { cards: DataCard[] }) {
  return (
    <div className="data-cards">
      {cards.map((card) => (
        <article className="data-card" key={card.id}>
          {card.kind === 'get_market_overview' ? (
            <MarketCard data={card.data} />
          ) : card.kind === 'get_account_overview' ? (
            <AccountCard data={card.data} />
          ) : (
            <FillsCard card={card} />
          )}
          <details className="source-details">
            <summary className="response-progress-toggle">
              <span>
                Sources & coverage · {card.sources.length} queries
                {card.coverage.complete ? '' : ' · Partial'}
              </span>
              <ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" />
            </summary>
            <p>
              Scope: default perpetuals only
              {card.coverage.observedAddress
                ? ` · ${card.coverage.observedAddress}`
                : ''}
            </p>
            {card.sources.map((s) => (
              <p key={s.sourceId}>
                {s.queryType} · Query time {queryTime(s.fetchedAt)}
                {s.timestamp !== null
                  ? ` · Provider snapshot ${queryTime(s.timestamp)}`
                  : ' · No provider snapshot time'}
                {s.cacheHit ? ' · Cached' : ''}
                <br />
                <small>Source {s.sourceId}</small>
              </p>
            ))}
            <p>
              Formula: {card.formulaVersion} · Source references:{' '}
              {card.sourceIds.join(', ')}
            </p>
            {card.coverage.reasonCodes.length > 0 && (
              <p>Coverage: {card.coverage.reasonCodes.join(' · ')}</p>
            )}
            {card.coverage.truncationReasons?.length ? (
              <p>Truncation: {card.coverage.truncationReasons.join(' · ')}</p>
            ) : null}
            {card.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </details>
        </article>
      ))}
    </div>
  )
}
