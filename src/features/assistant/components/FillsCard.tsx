import type { DataCard } from '../types'
import { decimal, list, object, queryTime, text } from '../format'

export function FillsCard({ card }: { card: DataCard }) {
  const fills = list(card.data.fills),
    range = card.coverage.requestedRange
  return (
    <>
      <h3>
        {card.data.sampleKind === 'partialHistoricalInterval'
          ? 'Partial historical fills'
          : 'Recent available fills'}
      </h3>
      {range && (
        <p className="scope-note">
          Requested: {queryTime(range.startTime)} – {queryTime(range.endTime)} ·{' '}
          {fills.length} returned · Coverage incomplete
        </p>
      )}
      <div className="data-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Record time</th>
              <th>Coin / direction</th>
              <th>Price</th>
              <th>Size</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {fills.map((v, i) => {
              const f = object(v)
              return (
                <tr key={text(f.tid, String(i))}>
                  <td>{queryTime(Number(f.time))}</td>
                  <td>
                    {text(f.coin)} / {text(f.dir)}
                  </td>
                  <td>{decimal(f.px, 4)}</td>
                  <td>{decimal(f.sz, 5)}</td>
                  <td>
                    {decimal(f.fee, 4)} {text(f.feeToken)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!fills.length && (
        <p>
          No fills in this sample. This does not establish an empty trading
          history.
        </p>
      )}
      <p className="scope-note">
        Limited records cannot establish complete PnL. Fees in different tokens
        are not added together.
      </p>
    </>
  )
}
