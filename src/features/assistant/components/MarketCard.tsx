import { decimal, list, object, queryTime, text } from '../format'
import { Metric } from './Metric'

export function MarketCard({ data }: { data: Record<string, unknown> }) {
  const precision =
    typeof data.szDecimals === 'number' ? Math.max(0, 6 - data.szDecimals) : 2
  return (
    <>
      <h3>{text(data.coin)} perpetual</h3>
      <dl className="metrics-grid">
        <Metric
          label="Mark price · USD"
          value={data.markPx}
          places={precision}
        />
        <Metric
          label="Hourly funding"
          value={data.funding}
          places={4}
          percent
        />
        <Metric
          label="Open interest · units"
          value={data.openInterest}
          places={4}
        />
        <Metric label="24h volume · USD" value={data.dayNtlVlm} />
        <Metric
          label="OI · estimated USD"
          value={data.openInterestUsdEstimate}
        />
      </dl>
      <p className="scope-note">
        Positive funding: longs pay shorts. Current rate may change before
        settlement.
      </p>
      {list(data.candles).length > 0 && (
        <details>
          <summary>Recent candles ({list(data.candles).length})</summary>
          <div className="data-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Open time</th>
                  <th>Open</th>
                  <th>High</th>
                  <th>Low</th>
                  <th>Close</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {list(data.candles).map((v, i) => {
                  const c = object(v)
                  return (
                    <tr key={i}>
                      <td>{queryTime(Number(c.t))}</td>
                      {['o', 'h', 'l', 'c', 'v'].map((k) => (
                        <td key={k}>{decimal(c[k], precision)}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </>
  )
}
