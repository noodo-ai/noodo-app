import type { ChatMessage, History, Pending } from './types'

export function hydrate(history: History): ChatMessage[] {
  const runs = new Map(history.runs.map((run) => [run.id, run]))
  return history.messages.map((message) => {
    const run = runs.get(message.runId)
    return {
      ...message,
      startedAt: run?.createdAt,
      completedAt: run?.settledAt,
      result: message.role === 'assistant' ? run?.result : null,
    }
  })
}

export function readPending(key: string): Pending | null {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return null
    const value = saved as Record<string, unknown>
    if (
      typeof value.conversationId !== 'string' ||
      !value.conversationId ||
      typeof value.clientRequestId !== 'string' ||
      !value.clientRequestId ||
      typeof value.text !== 'string' ||
      typeof value.expectedAddressVersion !== 'number' ||
      !Number.isSafeInteger(value.expectedAddressVersion) ||
      value.expectedAddressVersion < 1 ||
      typeof value.createdAt !== 'number' ||
      !Number.isSafeInteger(value.createdAt) ||
      (value.runId !== undefined &&
        (typeof value.runId !== 'string' || !value.runId))
    )
      return null
    const age = Date.now() - value.createdAt
    if (age < 0 || age >= 30 * 86400000) return null
    if (!value.text.trim() && !value.runId) return null
    return {
      conversationId: value.conversationId,
      clientRequestId: value.clientRequestId,
      text: value.text,
      expectedAddressVersion: value.expectedAddressVersion,
      createdAt: value.createdAt,
      ...(typeof value.runId === 'string' ? { runId: value.runId } : {}),
    }
  } catch {
    return null
  }
}
