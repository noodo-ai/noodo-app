import { RefreshCw } from 'lucide-react'
import { useTrends } from '../hooks/useTrends'
import { MarketHighlights } from './MarketHighlights'
import { TraderLeaderboard } from './TraderLeaderboard'
import { TrendFeed } from './TrendFeed'

function updated(at: number | null): string {
  return at === null ? 'Waiting for first observation' : new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
export function TrendsPanel({ active }: { active: boolean }) {
  const { data, error, loading, refresh } = useTrends(active)
  return <div className="trends">
    <p className="trend-intro">Market trends and trading activity, tracked on a schedule by <span>Noodo Agent.</span></p>
    {error && <p className="trend-notice" role="alert">{error} <button type="button" onClick={refresh}>Retry</button></p>}
    {loading && !data && <p className="trend-empty" role="status">Loading trends…</p>}
    {data && <>
      <div className="trend-status" role="status"><span>Markets: {data.scope}</span><div className="trend-observed"><span>Observed: {updated(data.generatedAt)}</span><button type="button" className="trend-refresh" aria-label="Refresh trends" title="Refresh trends" onClick={refresh}><RefreshCw size={12} strokeWidth={1.6} /></button></div></div>
      {(data.stale || data.marketError) && <p className="trend-notice" role="status">{data.generatedAt ? 'Market updates are delayed. Last observed values are shown.' : 'Waiting for the first market snapshot. Collection runs while the service is online.'}</p>}
      <MarketHighlights highlights={data.highlights} />
      <p className="trend-caption">Markets every 5 min. Positive funding: longs pay shorts; negative: shorts pay longs. Current rates may change.</p>
      <TraderLeaderboard traders={data.traders} />
      <p className="trend-caption">Leaderboard: {updated(data.leaderboardAt)} · hourly refresh.</p>
      {(data.leaderboardError || data.leaderboardStale) && <p className="trend-notice">Leaderboard updates are unavailable or delayed. The public stats endpoint may change.</p>}
      <p className="trend-caption">Positions: {updated(data.walletsAt)} · checked every 15 min for eligible top-five addresses.</p>
      {(data.walletError || data.walletsStale) && <p className="trend-caption">Some tracked positions are unavailable or awaiting observation. This is not a market-wide feed.</p>}
      <TrendFeed events={data.events} />
    </>}
  </div>
}
