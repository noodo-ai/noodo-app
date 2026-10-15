export interface TrendMarket {
  coin: string
  markPx: string | null
  funding: string | null
  openInterest: string | null
  volume: string | null
  oiChange1h: string | null
}
export interface TrendTrader {
  address: string
  rank: number
  previousRank: number | null
  pnl: string
  roi: string | null
  volume: string | null
}
export interface TrendEvent {
  id: string
  kind: 'markets' | 'traders'
  coin: string | null
  title: string
  summary: string
  at: number
  sourceIds: string[]
  sourceUrl: string
  rule: string
}
export interface TrendsData {
  scope: string
  generatedAt: number | null
  marketSource: { sourceId: string; at: number } | null
  interestBaseline: { sourceId: string; at: number } | null
  stale: boolean
  marketError: boolean
  leaderboardError: boolean
  walletError: boolean
  leaderboardAt: number | null
  walletsAt: number | null
  leaderboardStale: boolean
  walletsStale: boolean
  highlights: { volume: TrendMarket[]; interest: TrendMarket[]; funding: TrendMarket[] }
  traders: TrendTrader[]
  events: TrendEvent[]
}
