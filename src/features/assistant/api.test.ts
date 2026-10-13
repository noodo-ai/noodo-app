import { describe, expect, it, vi } from 'vitest'
import { SseDecoder, sendMessage } from './api'
import { decimal } from './format'
import type { Pending } from './types'
describe('SSE decoding', () => {
  it('handles every possible split, CRLF, heartbeats and multiple data lines', () => {
    const frame =
      ': heartbeat\r\n\r\nevent: message.delta\r\ndata: {"runId":"run-1",\r\ndata: "text":"Hello 🌍\\nnext"}\r\n\r\nevent: message.completed\r\ndata: {"runId":"run-1"}\r\n\r\n'
    for (let i = 0; i <= frame.length; i++) {
      const decoder = new SseDecoder()
      const parsed = [
        ...decoder.feed(frame.slice(0, i)),
        ...decoder.feed(frame.slice(i)),
      ]
      expect(parsed).toHaveLength(2)
      expect(parsed[0].data.text).toBe('Hello 🌍\nnext')
    }
  })
  it('preserves Unicode across byte chunks and confirms persisted results', async () => {
    const pending: Pending = {
      conversationId: 'c',
      clientRequestId: 'client',
      text: 'question',
      expectedAddressVersion: 1,
      createdAt: Date.now(),
    }
    const bytes = new TextEncoder().encode(
      'event: message.delta\ndata: {"runId":"r","text":"Hello 🌍"}\n\nevent: message.completed\ndata: {"runId":"r"}\n\n',
    )
    const stream = new ReadableStream({
      start(c) {
        for (const byte of bytes) c.enqueue(new Uint8Array([byte]))
        c.close()
      },
    })
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(stream, {
          headers: { 'Content-Type': 'text/event-stream', 'X-Run-Id': 'r' },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          id: 'r',
          status: 'completed',
          result: { text: 'saved result' },
        }),
      )
    vi.stubGlobal('fetch', fetcher)
    try {
      const events: string[] = []
      const run = await sendMessage(
        pending,
        new AbortController().signal,
        (e) => events.push(e.data.text ?? ''),
        () => {},
      )
      expect(events[0]).toBe('Hello 🌍')
      expect(run.result?.text).toBe('saved result')
      expect(fetcher).toHaveBeenCalledTimes(2)
    } finally {
      vi.unstubAllGlobals()
    }
  })
  it('branches duplicate JSON responses to run lookup without opening another stream', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ runId: 'existing' }))
      .mockResolvedValueOnce(
        Response.json({
          id: 'existing',
          status: 'failed',
          result: null,
          error: { code: 'timeout' },
        }),
      )
    vi.stubGlobal('fetch', fetcher)
    try {
      const run = await sendMessage(
        {
          conversationId: 'c',
          clientRequestId: 'x',
          text: 'text',
          expectedAddressVersion: 1,
          createdAt: 0,
        },
        new AbortController().signal,
        () => {
          throw new Error('No stream should open')
        },
        () => {},
      )
      expect(run.status).toBe('failed')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
describe('exact decimal display', () => {
  it('formats large amounts without binary rounding or integer precision loss', () => {
    expect(decimal('9007199254740993.125')).toBe('9,007,199,254,740,993.13')
    expect(decimal(null)).toBe('Unknown')
    expect(decimal('0')).toBe('0.00')
  })
  it('converts ratios, displays tiny nonzero amounts and keeps negatives', () => {
    expect(decimal('0.0000125', 4, true)).toBe('0.0013%')
    expect(decimal('0.000000001', 4, true)).toBe('<0.0001%')
    expect(decimal('-0.2', 2, true)).toBe('-20.00%')
  })
  it('formats scientific notation from backend calculations without losing precision', () => {
    expect(decimal('1e-7', 2, true)).toBe('<0.01%')
    expect(decimal('-1e-7', 2, true)).toBe('-<0.01%')
    expect(decimal('1.25E-5', 4, true)).toBe('0.0013%')
    expect(decimal('9.007199254740993125e+15')).toBe('9,007,199,254,740,993.13')
    expect(decimal('0e+21')).toBe('0.00')
  })
  it('rejects malformed and unbounded exponents', () => {
    for (const value of [
      '1e',
      '1e1.5',
      'NaN',
      'Infinity',
      '1e1000000',
      '1e-1000000',
    ])
      expect(decimal(value)).toBe('Unknown')
  })
})
