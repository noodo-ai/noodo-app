import { decimal, list, object, text } from '../format'
import { Metric } from './Metric'

export function AccountCard({ data }: { data: Record<string, unknown> }) {
  const summary = object(data.summary),
    positions = list(data.positions)
  return (
    <>
      <h3>Account & positions</h3>
      <p className="scope-note">
        Role: {text(data.role)} · Mode: {text(data.mode)}
        {data.modeSupported !== true ? ' · Derived risk unavailable' : ''}
      </p>
      {data.summary !== null && 'accountValue' in summary ? (
        <dl className="metrics-grid">
          <Metric label="Account value · USD" value={summary.accountValue} />
          <Metric label="Margin used · USD" value={summary.totalMarginUsed} />
          <Metric label="Withdrawable · USD" value={summary.withdrawable} />
          <Metric label="Margin usage" value={data.marginUsage} percent />
        </dl>
      ) : (
        <p className="scope-note">
          Balance summary unavailable:{' '}
          {text(data.summaryReason, text(data.role))}.
        </p>
      )}
      {positions.length === 0 ? (
        <p>
          No covered positions were returned. Check coverage and account role
          below.
        </p>
      ) : (
        positions.map((v, i) => {
          const p = object(v),
            leverage = object(p.leverage)
          return (
            <section className="position-row" key={`${text(p.coin)}-${i}`}>
              <h4>
                {text(p.coin)} · {text(p.direction, 'Direction unknown')} ·{' '}
                {text(leverage.type, 'Margin mode unknown')}{' '}
                {typeof leverage.value === 'number'
                  ? `${leverage.value}× configured`
                  : ''}
              </h4>
              <dl className="metrics-grid">
                <Metric label="Size · units" value={p.szi} places={5} />
                <Metric label="Notional · USD" value={p.positionValue} />
                <Metric label="Unrealized PnL · USD" value={p.unrealizedPnl} />
                <Metric
                  label="Liquidation price · USD"
                  value={p.liquidationPx}
                  places={4}
                />
                <Metric
                  label="Liquidation distance"
                  value={p.liquidationDistance}
                  percent
                />
                <Metric label="Concentration" value={p.concentration} percent />
              </dl>
              <p>
                Stop orders:{' '}
                {p.stopStatus === 'matched'
                  ? 'Matching orders found; coverage is not guaranteed'
                  : p.stopStatus === 'notFoundInThisQuery'
                    ? 'No matching stop found in this query'
                    : 'Unknown'}
              </p>
              {list(p.reasonCodes).length > 0 && (
                <p className="scope-note">
                  {list(p.reasonCodes)
                    .map((v) => text(v))
                    .join(' · ')}
                </p>
              )}
              {list(p.relatedOrders).length > 0 && (
                <details>
                  <summary>
                    Related orders ({list(p.relatedOrders).length})
                  </summary>
                  {list(p.relatedOrders).map((o, i) => {
                    const order = object(o)
                    return (
                      <p key={i}>
                        {text(order.orderType)} · {text(order.side)} ·
                        reduceOnly {String(order.reduceOnly)} · trigger{' '}
                        {decimal(order.triggerPx, 4)} ·{' '}
                        {text(order.triggerCondition)}
                      </p>
                    )
                  })}
                </details>
              )}
            </section>
          )
        })
      )}
      <p className="scope-note">
        Attention order:{' '}
        {list(data.attention)
          .map((v) => text(object(v).coin))
          .join(' → ') || 'Not applicable'}
        . Missing data comes first. Margin use is not liquidation distance.
      </p>
    </>
  )
}
