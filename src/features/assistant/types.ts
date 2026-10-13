export interface User {
  id: string
  username: string
}
export interface ApiError {
  code: string
  message: string
  retryable: boolean
}
export interface Conversation {
  id: string
  title: string
  observedAddress: string | null
  addressVersion: number
  updatedAt: number
}
export interface Source {
  sourceId: string
  toolCallId: string
  provider: string
  queryType: string
  fetchedAt: number
  cacheHit: boolean
  timestamp: number | null
}
export interface Coverage {
  marketScope: string
  observedAddress: string | null
  complete: boolean
  reasonCodes: string[]
  requestedRange?: { startTime: number; endTime: number }
  returnedRange?: { startTime: number; endTime: number } | null
  scannedThrough?: number | null
  sortOrder?: string
  excludedCount?: number
  truncationReasons?: string[]
}
export interface DataCard {
  id: string
  kind: 'get_market_overview' | 'get_account_overview' | 'get_recent_fills'
  data: Record<string, unknown>
  sources: Source[]
  sourceIds: string[]
  coverage: Coverage
  warnings: string[]
  formulaVersion: string
}
export type RunActivity =
  | {
      type: 'text'
      id: string
      round: number
      phase: 'pending' | 'explanation' | 'final'
      text: string
    }
  | { type: 'tool'; id: string; name: string; status: string }
export interface RunResult {
  activity?: RunActivity[]
  text: string
  textStatus: 'final' | 'partial' | 'unavailable'
  dataCards: DataCard[]
  sources: Source[]
  coverage: Coverage[]
  warnings: string[]
}
export interface Run {
  id: string
  status: 'running' | 'completed' | 'failed' | 'interrupted'
  observedAddress: string | null
  addressVersion: number
  marketScope: string
  result: RunResult | null
  error: ApiError | null
  createdAt?: number
  settledAt?: number | null
}
export interface ChatMessage {
  id: string
  runId: string
  role: 'user' | 'assistant'
  text: string
  textStatus: 'final' | 'partial' | 'unavailable'
  observedAddress: string | null
  addressVersion: number
  createdAt: number
  result?: RunResult | null
  startedAt?: number
  completedAt?: number | null
}
export interface History extends Conversation {
  messages: ChatMessage[]
  runs: Run[]
  nextCursor: string | null
  activeRunId: string | null
}
export interface Pending {
  conversationId: string
  clientRequestId: string
  text: string
  expectedAddressVersion: number
  createdAt: number
  runId?: string
}
export interface StreamEvent {
  event: string
  data: {
    runId: string
    toolCallId?: string
    name?: string
    status?: string
    warnings?: string[]
    separator?: boolean
    round?: number
    blockId?: string
    phase?: 'explanation' | 'final'
    text?: string
    result?: RunResult
    error?: ApiError
  }
}
export interface ToolStatus {
  id: string
  name: string
  status: string
  warnings: string[]
}
