// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAssistant } from './useAssistant'
import { request, sendMessage, pollRun } from '../api'
import type { History, Run } from '../types'
vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  request: vi.fn(),
  sendMessage: vi.fn(),
  pollRun: vi.fn(),
}))
const conversation = {
  id: 'c',
  title: 'Test',
  observedAddress: null,
  addressVersion: 1,
  updatedAt: 1,
}
const saved = (id = 'r'): Run => ({
  id,
  status: 'completed',
  observedAddress: null,
  addressVersion: 1,
  marketScope: 'hyperliquid:mainnet:default-perpetuals',
  result: {
    text: 'saved',
    textStatus: 'final',
    dataCards: [],
    sources: [],
    coverage: [],
    warnings: [],
  },
  error: null,
})
beforeEach(() => {
  sessionStorage.clear()
  vi.clearAllMocks()
  vi.mocked(request).mockImplementation(async (path) =>
    path === '/conversations'
      ? { conversations: [] }
      : ({
          ...conversation,
          messages: [],
          runs: [],
          nextCursor: null,
          activeRunId: null,
        } as History),
  )
  vi.mocked(sendMessage).mockImplementation(
    async (p, _signal, onEvent, onRun) => {
      expect(
        JSON.parse(sessionStorage.getItem('noodo:pending:u')!).clientRequestId,
      ).toBe(p.clientRequestId)
      onRun('r')
      onEvent({ event: 'message.delta', data: { runId: 'r', text: 'partial' } })
      return saved()
    },
  )
})
afterEach(() => cleanup())
const history = (
  id = 'c',
  text = id,
  nextCursor: string | null = null,
): History => ({
  ...conversation,
  id,
  messages: [
    {
      id: `message-${text}`,
      runId: 'r',
      role: 'user',
      text,
      textStatus: 'final',
      observedAddress: null,
      addressVersion: 1,
      createdAt: 1,
    },
  ],
  runs: [],
  nextCursor,
  activeRunId: null,
})
it.each(['list', 'history'])(
  'retains the original request through a %s restoration outage and manual recovery',
  async (outage) => {
    const original = {
      conversationId: 'c',
      clientRequestId: 'original',
      text: 'first',
      expectedAddressVersion: 1,
      createdAt: Date.now(),
    }
    sessionStorage.setItem('noodo:pending:u', JSON.stringify(original))
    let unavailable = true
    vi.mocked(request).mockImplementation(async (path) => {
      if (
        unavailable &&
        path === (outage === 'list' ? '/conversations' : '/conversations/c')
      )
        throw new Error('temporary outage')
      return path === '/conversations' ? { conversations: [] } : history()
    })
    const { result } = renderHook(() => useAssistant('u'))
    expect(result.current.pending?.clientRequestId).toBe('original')
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('temporary outage')
    expect(result.current.pending).toEqual(original)
    await act(async () => {
      expect(await result.current.send('new request')).toBe(false)
      await result.current.open('another')
    })
    expect(sendMessage).not.toHaveBeenCalled()
    expect(JSON.parse(sessionStorage.getItem('noodo:pending:u')!)).toEqual(
      original,
    )
    unavailable = false
    await act(async () => {
      result.current.recover()
    })
    await waitFor(() => expect(result.current.pending).toBeNull())
    expect(vi.mocked(sendMessage).mock.calls[0][0]).toEqual(original)
    expect(result.current.conversation?.id).toBe('c')
    expect(sessionStorage.getItem('noodo:selected:u')).toBe('c')
    expect(result.current.messages.at(-1)?.text).toBe('saved')
  },
)
it.each(['open', 'reset', 'send'])(
  'ignores an old post-send history response after %s',
  async (action) => {
    let resolveOld!: (h: History) => void
    const old = new Promise<History>((resolve) => {
      resolveOld = resolve
    })
    let historyRequests = 0
    vi.mocked(request).mockImplementation(async (path, init) => {
      if (path === '/conversations')
        return init?.method === 'POST' ? conversation : { conversations: [] }
      if (path === '/conversations/c' && ++historyRequests === 1) return old
      return history(action === 'open' ? 'b' : 'c', 'new', 'new-cursor')
    })
    const { result } = renderHook(() => useAssistant('u'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.send('first')
    })
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith('/conversations/c'),
    )
    await act(async () => {
      if (action === 'open') await result.current.open('b')
      else if (action === 'reset') result.current.reset()
      else await result.current.send('second')
    })
    await waitFor(() => expect(result.current.busy).toBe(false))
    if (action !== 'reset')
      await waitFor(() => expect(result.current.messages[0].text).toBe('new'))
    await act(async () => {
      resolveOld(history('c', 'old', 'old-cursor'))
      await old
    })
    expect(result.current.conversation?.id ?? null).toBe(
      action === 'reset' ? null : action === 'open' ? 'b' : 'c',
    )
    expect(result.current.messages.map((m) => m.text)).toEqual(
      action === 'reset' ? [] : ['new'],
    )
    expect(result.current.cursor).toBe(action === 'reset' ? null : 'new-cursor')
  },
)
it('clears the durable request after completion and supports consecutive sends', async () => {
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => {
    expect(await result.current.send('first')).toBe(true)
  })
  await waitFor(() => {
    expect(result.current.busy).toBe(false)
    expect(result.current.pending).toBeNull()
  })
  expect(sessionStorage.getItem('noodo:pending:u')).toBeNull()
  await act(async () => {
    expect(await result.current.send('second')).toBe(true)
  })
  await waitFor(() => expect(result.current.busy).toBe(false))
  expect(sendMessage).toHaveBeenCalledTimes(2)
  const calls = vi.mocked(sendMessage).mock.calls
  expect(calls[0][0].clientRequestId).not.toBe(calls[1][0].clientRequestId)
})
it('recovers a saved run by GET without posting a new request', async () => {
  sessionStorage.setItem(
    'noodo:pending:u',
    JSON.stringify({
      conversationId: 'c',
      clientRequestId: 'original',
      text: 'first',
      expectedAddressVersion: 1,
      createdAt: Date.now(),
      runId: 'r',
    }),
  )
  vi.mocked(pollRun).mockResolvedValue(saved())
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(pollRun).toHaveBeenCalled())
  await waitFor(() => expect(result.current.pending).toBeNull())
  expect(sendMessage).not.toHaveBeenCalled()
  expect(result.current.messages.at(-1)?.textStatus).toBe('final')
})
it('does not automatically repost expired requests', async () => {
  sessionStorage.setItem(
    'noodo:pending:u',
    JSON.stringify({
      conversationId: 'c',
      clientRequestId: 'expired',
      text: 'first',
      expectedAddressVersion: 1,
      createdAt: Date.now() - 31 * 86400000,
    }),
  )
  renderHook(() => useAssistant('u'))
  await waitFor(() => expect(request).toHaveBeenCalled())
  expect(sendMessage).not.toHaveBeenCalled()
  expect(sessionStorage.getItem('noodo:pending:u')).toBeNull()
})
it('retains the original ID when connection commitment is unknown', async () => {
  vi.mocked(sendMessage).mockRejectedValue(new Error('connection lost'))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => {
    await result.current.send('first')
  })
  await waitFor(() => expect(result.current.busy).toBe(false))
  const id = result.current.pending?.clientRequestId
  expect(id).toBeTruthy()
  vi.mocked(sendMessage).mockResolvedValue(saved())
  await act(async () => {
    result.current.recover()
  })
  await waitFor(() => expect(result.current.pending).toBeNull())
  expect(vi.mocked(sendMessage).mock.calls[1][0].clientRequestId).toBe(id)
})
it('hydrates ordered progress and tool statuses after refresh without duplicating assistant text', async () => {
  sessionStorage.setItem('noodo:selected:u', 'c')
  const run = saved()
  run.status = 'failed'
  run.result!.text = 'Checking.\n\nNo complete answer.'
  run.result!.textStatus = 'partial'
  run.result!.activity = [
    {
      type: 'text',
      id: 't0',
      round: 0,
      phase: 'explanation',
      text: 'Checking.',
    },
    { type: 'tool', id: 'a', name: 'get_market_overview', status: 'failed' },
    {
      type: 'text',
      id: 't1',
      round: 1,
      phase: 'final',
      text: 'No complete answer.',
    },
  ]
  vi.mocked(request).mockImplementation(async (path) =>
    path === '/conversations'
      ? { conversations: [conversation] }
      : {
          ...conversation,
          nextCursor: null,
          activeRunId: null,
          runs: [run],
          messages: [
            {
              id: 'u0',
              runId: 'r',
              role: 'user',
              text: 'market?',
              textStatus: 'final',
              observedAddress: null,
              addressVersion: 1,
              createdAt: 1,
            },
            {
              id: 'a0',
              runId: 'r',
              role: 'assistant',
              text: run.result!.text,
              textStatus: 'partial',
              observedAddress: null,
              addressVersion: 1,
              createdAt: 2,
            },
          ],
        },
  )
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.messages.map((m) => m.role)).toEqual([
    'user',
    'assistant',
  ])
  expect(result.current.messages[1].result?.activity).toEqual(
    run.result!.activity,
  )
  expect(result.current.messages[1].text).toBe(run.result!.text)
  expect(result.current.messages[1].textStatus).toBe('partial')
  expect(sendMessage).not.toHaveBeenCalled()
})
it('replaces interrupted deltas with the saved run instead of appending during recovery', async () => {
  const run = saved()
  run.status = 'interrupted'
  run.result!.text = 'Checking.'
  run.result!.textStatus = 'partial'
  run.result!.activity = [
    { type: 'text', id: 't0', round: 0, phase: 'pending', text: 'Checking.' },
    { type: 'tool', id: 'a', name: 'get_market_overview', status: 'failed' },
  ]
  vi.mocked(sendMessage).mockImplementation(
    async (_p, _signal, emit, remember) => {
      remember('r')
      emit({
        event: 'message.delta',
        data: { runId: 'r', round: 0, blockId: 't0', text: 'Checking.' },
      })
      emit({
        event: 'tool.preparing',
        data: { runId: 'r', toolCallId: 'a', name: 'get_market_overview' },
      })
      throw new Error('Connection lost')
    },
  )
  vi.mocked(pollRun).mockResolvedValue(run)
  vi.mocked(request).mockImplementation(async (path, init) =>
    path === '/conversations'
      ? init?.method === 'POST'
        ? conversation
        : { conversations: [] }
      : {
          ...conversation,
          nextCursor: null,
          activeRunId: null,
          messages: [
            {
              id: 'a0',
              runId: 'r',
              role: 'assistant',
              text: 'Checking.',
              textStatus: 'partial',
              observedAddress: null,
              addressVersion: 1,
              createdAt: 2,
            },
          ],
          runs: [run],
        },
  )
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => {
    await result.current.send('market?')
  })
  await waitFor(() => expect(result.current.busy).toBe(false))
  expect(
    result.current.messages.filter((m) => m.role === 'assistant'),
  ).toHaveLength(1)
  expect(result.current.messages.at(-1)?.text).toBe('Checking.')
  expect(result.current.tools[0].status).toBe('failed')
  expect(result.current.messages.at(-1)?.textStatus).toBe('partial')
})

it('does not append an older page after switching conversations', async () => {
  let resolvePage!: (value: History) => void
  const page = new Promise<History>((resolve) => {
    resolvePage = resolve
  })
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/conversations') return { conversations: [] }
    if (path.includes('?cursor=')) return page
    return path === '/conversations/other'
      ? history('other')
      : history('c', 'latest', 'older')
  })
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => {
    await result.current.open('c')
  })
  let loadingPage!: Promise<void>
  act(() => {
    loadingPage = result.current.loadOlder()
  })
  await act(async () => {
    await result.current.open('other')
  })
  await act(async () => {
    resolvePage(history('c', 'old message'))
    await loadingPage
  })
  expect(result.current.conversation?.id).toBe('other')
  expect(result.current.messages.map((message) => message.text)).toEqual([
    'other',
  ])
})
