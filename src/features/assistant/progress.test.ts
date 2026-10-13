import { expect, it } from 'vitest'
import { updateProgress, updateTools } from './progress'
import type { RunResult, StreamEvent } from './types'
it('keeps streamed text and multiple tool identities ordered and uses terminal snapshots without duplication', () => {
  let result: RunResult | undefined
  const events: StreamEvent[] = [
    {
      event: 'message.delta',
      data: { runId: 'r', round: 0, blockId: 't0', text: 'Checking.' },
    },
    {
      event: 'tool.preparing',
      data: { runId: 'r', toolCallId: 'a', name: 'get_market_overview' },
    },
    {
      event: 'tool.preparing',
      data: { runId: 'r', toolCallId: 'b', name: 'get_account_overview' },
    },
    { event: 'tool.started', data: { runId: 'r', toolCallId: 'a' } },
    {
      event: 'tool.completed',
      data: { runId: 'r', toolCallId: 'b', status: 'failed' },
    },
    {
      event: 'tool.completed',
      data: { runId: 'r', toolCallId: 'a', status: 'partial' },
    },
    {
      event: 'message.round.completed',
      data: { runId: 'r', round: 0, phase: 'explanation' },
    },
    {
      event: 'message.delta',
      data: { runId: 'r', round: 1, blockId: 't1', text: '\n\nLimited data.' },
    },
    {
      event: 'message.round.completed',
      data: { runId: 'r', round: 1, phase: 'final' },
    },
  ]
  for (const event of events) result = updateProgress(result, event)
  expect(result?.activity).toEqual([
    {
      type: 'text',
      id: 't0',
      round: 0,
      phase: 'explanation',
      text: 'Checking.',
    },
    { type: 'tool', id: 'a', name: 'get_market_overview', status: 'partial' },
    { type: 'tool', id: 'b', name: 'get_account_overview', status: 'failed' },
    {
      type: 'text',
      id: 't1',
      round: 1,
      phase: 'final',
      text: '\n\nLimited data.',
    },
  ])
  expect(result?.text).toBe('Checking.\n\nLimited data.')
  expect(result?.textStatus).toBe('partial')
  expect(JSON.parse(JSON.stringify(result)).activity).toEqual(result?.activity)
})
it('upserts tool transitions instead of duplicating preparing and started rows', () => {
  const preparing: StreamEvent = {
    event: 'tool.preparing',
    data: { runId: 'r', toolCallId: 'a', name: 'get_recent_fills' },
  }
  const tools = updateTools(updateTools([], preparing), {
    event: 'tool.started',
    data: { runId: 'r', toolCallId: 'a' },
  })
  expect(tools).toEqual([
    { id: 'a', name: 'get_recent_fills', status: 'running', warnings: [] },
  ])
})
