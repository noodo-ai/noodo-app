import type { ApiError, Pending, Run, StreamEvent } from './types'
export class ApiFailure extends Error {
  constructor(
    public error: ApiError,
    public status: number,
  ) {
    super(error.message)
  }
}
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/v1${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) {
    let error: ApiError = {
      code: 'requestFailed',
      message: `Request failed (${response.status})`,
      retryable: response.status >= 500,
    }
    try {
      error = ((await response.json()) as { error: ApiError }).error
    } catch {
      /* proxy/network error */
    }
    throw new ApiFailure(error, response.status)
  }
  return response.json() as Promise<T>
}
export class SseDecoder {
  private buffer = ''
  feed(chunk: string): StreamEvent[] {
    this.buffer += chunk
    const events: StreamEvent[] = []
    while (true) {
      const match = /\r?\n\r?\n/.exec(this.buffer)
      if (!match) break
      const block = this.buffer.slice(0, match.index)
      this.buffer = this.buffer.slice(match.index + match[0].length)
      let event = '',
        data = ''
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        if (line.startsWith('data:')) data += `${line.slice(5).trimStart()}\n`
      }
      if (event && data) {
        const parsed: unknown = JSON.parse(data)
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'runId' in parsed &&
          typeof parsed.runId === 'string'
        )
          events.push({ event, data: parsed as StreamEvent['data'] })
      }
    }
    return events
  }
}
export async function sendMessage(
  pending: Pending,
  signal: AbortSignal,
  onEvent: (e: StreamEvent) => void,
  onRun: (id: string) => void,
): Promise<Run> {
  const response = await fetch(
    `/v1/conversations/${pending.conversationId}/messages`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientRequestId: pending.clientRequestId,
        text: pending.text,
        expectedAddressVersion: pending.expectedAddressVersion,
      }),
      signal,
    },
  )
  if (!response.ok) {
    const body = (await response.json()) as { error: ApiError }
    throw new ApiFailure(body.error, response.status)
  }
  if (response.headers.get('Content-Type')?.includes('application/json')) {
    const body = (await response.json()) as { runId: string }
    onRun(body.runId)
    return pollRun(body.runId, signal)
  }
  if (
    !response.headers.get('Content-Type')?.includes('text/event-stream') ||
    !response.body
  )
    throw new Error('Expected an event stream')
  const header = response.headers.get('X-Run-Id')
  if (header) onRun(header)
  const reader = response.body.getReader(),
    decoder = new TextDecoder(),
    sse = new SseDecoder()
  let runId = header,
    terminal = false
  try {
    while (true) {
      const { value, done } = await reader.read()
      for (const event of sse.feed(
        done ? decoder.decode() : decoder.decode(value, { stream: true }),
      )) {
        runId = event.data.runId
        onRun(runId)
        onEvent(event)
        if (
          ['message.completed', 'run.failed', 'run.interrupted'].includes(
            event.event,
          )
        )
          terminal = true
      }
      if (done) break
    }
  } finally {
    reader.releaseLock()
  }
  if (!runId) throw new Error('Connection ended before a run ID was received')
  // Only persisted run state is authoritative; never promote displayed deltas to a final answer.
  return terminal
    ? request<Run>(`/runs/${runId}`, { signal })
    : pollRun(runId, signal)
}
export async function pollRun(
  id: string,
  signal: AbortSignal,
  onUpdate?: (run: Run) => void,
): Promise<Run> {
  for (let i = 0; i < 65; i++) {
    signal.throwIfAborted()
    const run = await request<Run>(`/runs/${id}`, { signal })
    onUpdate?.(run)
    if (run.status !== 'running') return run
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        signal.removeEventListener('abort', abort)
        resolve()
      }, 1000)
      const abort = () => {
        clearTimeout(timer)
        reject(signal.reason)
      }
      signal.addEventListener('abort', abort, { once: true })
    })
  }
  throw new Error(
    'Run status is still pending; recover the saved request to check again',
  )
}
