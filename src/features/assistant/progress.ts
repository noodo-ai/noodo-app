import type { RunResult, StreamEvent, ToolStatus } from './types'

export function updateTools(
  current: ToolStatus[],
  event: StreamEvent,
): ToolStatus[] {
  const { toolCallId: id, name, status } = event.data
  if (!id) return current
  const existing = current.find((t) => t.id === id)
  const next = {
    id,
    name: name ?? existing?.name ?? 'unknown',
    status:
      event.event === 'tool.preparing'
        ? 'preparing'
        : event.event === 'tool.started'
          ? 'running'
          : (status ?? 'failed'),
    warnings: [],
  }
  return existing
    ? current.map((t) => (t.id === id ? next : t))
    : [...current, next]
}
export function updateProgress(
  previous: RunResult | null | undefined,
  event: StreamEvent,
): RunResult {
  const result: RunResult = previous ?? {
    text: '',
    textStatus: 'partial',
    dataCards: [],
    sources: [],
    coverage: [],
    warnings: [],
  }
  const activity = (result.activity ?? []).map((item) => ({ ...item }))
  const { round = 0, text = '', blockId = `text:${round}:0` } = event.data
  if (event.event === 'message.delta' && !event.data.separator) {
    const item = activity.find((a) => a.id === blockId)
    if (item?.type === 'text') item.text += text
    else
      activity.push({
        type: 'text',
        id: blockId,
        round,
        phase: 'pending',
        text,
      })
  } else if (event.event === 'message.round.completed') {
    for (const item of activity)
      if (item.type === 'text' && item.round === round)
        item.phase = event.data.phase ?? 'explanation'
  } else if (event.event.startsWith('tool.')) {
    const tools = updateTools(
      activity
        .filter((a) => a.type === 'tool')
        .map((a) => ({ ...a, warnings: [] })),
      event,
    )
    const next = tools.find((t) => t.id === event.data.toolCallId)
    if (next) {
      const index = activity.findIndex((a) => a.id === next.id)
      const item = {
        type: 'tool' as const,
        id: next.id,
        name: next.name,
        status: next.status,
      }
      if (index < 0) activity.push(item)
      else activity[index] = item
    }
  }
  return {
    ...result,
    activity,
    text: result.text + (event.event === 'message.delta' ? text : ''),
    textStatus: 'partial',
  }
}
export const toolLabels: Record<string, string> = {
  get_market_overview: 'Market overview',
  get_account_overview: 'Account overview',
  get_recent_fills: 'Recent fills',
}
export const statusLabels: Record<string, string> = {
  preparing: 'Preparing',
  running: 'Fetching',
  success: 'Completed',
  partial: 'Completed · Data limited',
  failed: 'Failed · Data unavailable',
}
