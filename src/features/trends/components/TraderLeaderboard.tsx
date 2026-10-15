import { ArrowUpRight } from 'lucide-react'
import { decimal } from '../../../shared/format'
import type { TrendTrader } from '../types'

export function TraderLeaderboard({ traders }: { traders: TrendTrader[] }) {
  return <section className="trend-leaderboard" aria-label="Top traders by seven-day PnL">
    <div className="trend-section-heading"><h3>Top traders</h3><span>7d PnL</span></div>
    <p className="trend-caption">Reported leaderboard sample · ranked by PnL</p>
    {traders.length ? <ol>{traders.map(trader => <li key={trader.address}>
      <span className="trend-rank">{trader.rank}</span>
      <a href={`https://app.hyperliquid.xyz/explorer/address/${trader.address}`} target="_blank" rel="noreferrer" title={trader.address}><span>{trader.address.slice(0, 6)}…{trader.address.slice(-4)}</span><ArrowUpRight size={12} /></a>
      <div className="trend-trader-values"><strong title={trader.pnl}>${decimal(trader.pnl, 0)}</strong><span>ROI {decimal(trader.roi, 2, true)}</span></div>
    </li>)}</ol> : <p className="trend-empty">Leaderboard data is not available yet.</p>}
    <p className="trend-caption">Source-reported returns may include other markets. Position tracking covers default perpetuals only.</p>
  </section>
}
