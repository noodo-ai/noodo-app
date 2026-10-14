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
  vi.mocked(request).mockImplementation(async (path, init) =>
    path === '/conversations'
      ? init?.method === 'POST' ? conversation : { conversations: [] }
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
it('retains the original request through a history outage and manual recovery without navigating', async () => {
  const original = { conversationId: 'c', clientRequestId: 'original', text: 'first', expectedAddressVersion: 1, createdAt: Date.now() }
  sessionStorage.setItem('noodo:pending:u', JSON.stringify(original))
  let unavailable = true
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/conversations') return { conversations: [] }
    if (unavailable && path === '/conversations/c') throw new Error('temporary outage')
    return history(path.split('/').at(-1))
  })
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.error).toBe('temporary outage')
  expect(result.current.pending).toEqual(original)
  await act(async () => { expect(await result.current.send('new request')).toBe(false); await result.current.open('another') })
  expect(sendMessage).not.toHaveBeenCalled()
  unavailable = false
  await act(async () => { await result.current.open('c') })
  expect(sendMessage).not.toHaveBeenCalled()
  await act(async () => { result.current.recover(); result.current.recover(); result.current.newChat() })
  await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1))
  expect(vi.mocked(sendMessage).mock.calls[0][0]).toEqual(original)
  expect(result.current.conversation).toBeNull()
  expect(sessionStorage.getItem('noodo:selected:u')).toBeNull()
  await act(async () => { await result.current.open('c') })
  expect(result.current.messages.at(-1)?.text).toBe('saved')
})
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

it('updates paginated history in its own cache after switching conversations', async () => {
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
  await act(async () => { await result.current.open('c') })
  expect(result.current.messages.map((message) => message.text)).toEqual(['old message', 'latest'])
  expect(result.current.cursor).toBeNull()
})

it("uses the resolved run address version when sending a follow-up", async () => {
  const address = `0x${"a".repeat(40)}`;
  vi.mocked(sendMessage).mockImplementation(
    async (_p, _signal, _event, onRun) => {
      onRun("r");
      return { ...saved(), observedAddress: address, addressVersion: 2 };
    },
  );
  const { result } = renderHook(() => useAssistant("u"));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => {
    await result.current.open("c");
  });
  await act(async () => {
    await result.current.send(`Analyze ${address}`);
  });
  await waitFor(() => expect(result.current.busy).toBe(false));
  expect(result.current.conversation?.observedAddress).toBe(address);
  await act(async () => {
    await result.current.send("Recent fills?");
  });
  await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(2));
  expect(vi.mocked(sendMessage).mock.calls[1][0].expectedAddressVersion).toBe(
    2,
  );
});

it('runs conversations independently while switching and keeps live replies in their original chat', async () => {
  const a = { ...conversation, id: 'a', title: 'Chat A' }
  const b = { ...conversation, id: 'b', title: 'Chat B' }
  const streams = new Map<string, {
    emit: Parameters<typeof sendMessage>[2]
    finish: (run: Run) => void
    signal: AbortSignal
  }>()
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/conversations') return { conversations: [a, b] }
    return { ...history(path.endsWith('/a') ? 'a' : 'b'), observedAddress: path.endsWith('/a') ? 'address-a' : 'address-b' }
  })
  vi.mocked(sendMessage).mockImplementation((p, signal, emit, remember) => {
    remember(`run-${p.conversationId}`)
    emit({ event: 'message.delta', data: { runId: `run-${p.conversationId}`, text: `${p.conversationId}-first` } })
    return new Promise((finish) => { streams.set(p.conversationId, { emit, finish, signal }) })
  })
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.open('a'); await result.current.send('Ask A') })
  expect(result.current.busy).toBe(true)
  await act(async () => { await result.current.open('b') })
  expect(result.current.busy).toBe(false)
  expect(result.current.pending).toBeNull()
  expect(result.current.messages.map((m) => m.text)).toEqual(['b'])
  await act(async () => { expect(await result.current.send('Ask B')).toBe(true) })
  expect(result.current.busy).toBe(true)
  expect(sendMessage).toHaveBeenCalledTimes(2)
  expect(JSON.parse(sessionStorage.getItem('noodo:pending:u:all')!).map((p: { conversationId: string }) => p.conversationId)).toEqual(['a', 'b'])
  act(() => {
    streams.get('a')!.emit({ event: 'message.delta', data: { runId: 'run-a', text: '-background' } })
    streams.get('a')!.emit({ event: 'tool.started', data: { runId: 'run-a', toolCallId: 'tool-a', name: 'get_market_overview' } })
  })
  expect(result.current.messages.at(-1)?.text).toBe('b-first')
  expect(result.current.tools).toEqual([])
  await act(async () => { await result.current.open('a') })
  expect(result.current.messages.at(-1)?.text).toBe('a-first-background')
  expect(result.current.messages.at(-1)?.observedAddress).toBe('address-a')
  expect(result.current.tools[0].id).toBe('tool-a')
  expect(pollRun).not.toHaveBeenCalled()
  await act(async () => {
    const run = saved('run-b')
    run.result!.text = 'B completed'
    run.observedAddress = 'resolved-b'
    run.addressVersion = 2
    streams.get('b')!.finish(run)
  })
  expect(result.current.busy).toBe(true)
  expect(result.current.conversation?.observedAddress).toBe('address-a')
  expect(result.current.pending?.conversationId).toBe('a')
  expect(JSON.parse(sessionStorage.getItem('noodo:pending:u:all')!)).toHaveLength(1)
  await act(async () => { streams.get('a')!.finish(saved('run-a')) })
  await waitFor(() => expect(result.current.executionBusy).toBe(false))
  expect(sessionStorage.getItem('noodo:pending:u:all')).toBeNull()
})

it('stops only the selected conversation and leaves another response running', async () => {
  const streams = new Map<string, { signal: AbortSignal; finish: (run: Run) => void }>()
  vi.mocked(request).mockImplementation(async (path) => path === '/conversations'
    ? { conversations: [] } : history(path.split('/').at(-1)))
  vi.mocked(sendMessage).mockImplementation((p, signal) => new Promise((finish, reject) => {
    streams.set(p.conversationId, { signal, finish })
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
  }))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.open('a'); await result.current.send('Ask A') })
  await act(async () => { await result.current.open('b'); await result.current.send('Ask B') })
  await act(async () => { result.current.cancel() })
  expect(streams.get('b')!.signal.aborted).toBe(true)
  expect(streams.get('a')!.signal.aborted).toBe(false)
  expect(result.current.busy).toBe(false)
  expect(result.current.executionBusy).toBe(true)
  expect(result.current.error).toContain('Response stopped')
  await act(async () => { await result.current.open('a') })
  expect(result.current.error).toBe('')
  expect(result.current.busy).toBe(true)
  await act(async () => { streams.get('a')!.finish(saved('run-a')) })
  expect(result.current.executionBusy).toBe(false)
  expect(JSON.parse(sessionStorage.getItem('noodo:pending:u:all')!)[0].conversationId).toBe('b')
})

it('restores every saved conversation run without another POST', async () => {
  const pending = ['a', 'b'].map((id) => ({ conversationId: id, clientRequestId: `request-${id}`, text: id, expectedAddressVersion: 1, createdAt: Date.now(), runId: `run-${id}` }))
  sessionStorage.setItem('noodo:pending:u:all', JSON.stringify(pending))
  sessionStorage.setItem('noodo:selected:u', 'b')
  vi.mocked(request).mockImplementation(async (path) => path === '/conversations' ? { conversations: [] } : { ...history(path.split('/').at(-1)), messages: history(path.split('/').at(-1)).messages.map((m) => ({ ...m, runId: `run-${path.split('/').at(-1)}` })) })
  const completions = new Map<string, (run: Run) => void>()
  vi.mocked(pollRun).mockImplementation((id) => new Promise((finish) => { completions.set(id, finish) }))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(pollRun).toHaveBeenCalledTimes(2))
  expect(result.current.conversation?.id).toBe('b')
  expect(sendMessage).not.toHaveBeenCalled()
  await act(async () => { completions.get('run-a')!(saved('run-a')) })
  expect(result.current.busy).toBe(true)
  expect(result.current.messages.map((m) => m.text)).toEqual(['b'])
  await act(async () => { completions.get('run-b')!(saved('run-b')) })
  expect(result.current.busy).toBe(false)
  expect(result.current.messages.at(-1)?.text).toBe('saved')
  expect(sessionStorage.getItem('noodo:pending:u:all')).toBeNull()
})

it('creates a new chat while another chat responds and adds it to navigation immediately', async () => {
  const completions = new Map<string, (run: Run) => void>()
  vi.mocked(request).mockImplementation(async (path, init) => {
    if (path === '/conversations') return init?.method === 'POST'
      ? { ...conversation, id: 'new', title: 'New chat' } : { conversations: [conversation] }
    return history(path.split('/').at(-1))
  })
  vi.mocked(sendMessage).mockImplementation((p) => new Promise((finish) => { completions.set(p.conversationId, finish) }))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.open('c'); await result.current.send('First chat') })
  act(() => { result.current.newChat() })
  expect(result.current.conversation).toBeNull()
  expect(result.current.busy).toBe(false)
  expect(result.current.pending).toBeNull()
  await act(async () => { expect(await result.current.send('New chat question')).toBe(true) })
  expect(result.current.conversation?.id).toBe('new')
  expect(result.current.conversations.some((c) => c.id === 'new')).toBe(true)
  expect(completions.size).toBe(2)
  await act(async () => { completions.get('c')!(saved('run-c')); completions.get('new')!(saved('run-new')) })
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((finish) => { resolve = finish })
  return { promise, resolve }
}

it('keeps New chat and conversation drafts independently, including repeated New chat clicks', async () => {
  vi.mocked(request).mockImplementation(async (path) => path === '/conversations' ? { conversations: [] } : history(path.split('/').at(-1)))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => { result.current.setInput('new draft'); result.current.newChat(); result.current.newChat() })
  expect(result.current.input).toBe('new draft')
  await act(async () => { await result.current.open('a') })
  expect(result.current.input).toBe('')
  act(() => result.current.setInput('A draft'))
  await act(async () => { await result.current.open('b') })
  act(() => result.current.setInput('B draft'))
  act(() => result.current.newChat())
  expect(result.current.input).toBe('new draft')
  await act(async () => { await result.current.open('a') })
  expect(result.current.input).toBe('A draft')
  await act(async () => { await result.current.open('b') })
  expect(result.current.input).toBe('B draft')
})

it.each([false, true])('transfers a sent draft into its created chat without clearing another view (switch=%s)', async (switchView) => {
  const creation = deferred<typeof conversation>()
  vi.mocked(request).mockImplementation(async (path, init) => path === '/conversations'
    ? init?.method === 'POST' ? creation.promise : { conversations: [] } : history('other'))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.setInput('First question'))
  let sending!: Promise<boolean>
  act(() => { sending = result.current.send(result.current.input) })
  expect(result.current.creating).toBe(true)
  if (switchView) {
    await act(async () => { await result.current.open('other') })
    act(() => result.current.setInput('Other draft'))
  }
  await act(async () => { creation.resolve(conversation); expect(await sending).toBe(true) })
  expect(result.current.selectedId).toBe(switchView ? 'other' : 'c')
  expect(result.current.input).toBe(switchView ? 'Other draft' : '')
  expect(vi.mocked(sendMessage).mock.calls[0][0].text).toBe('First question')
  await act(async () => { await result.current.open('c') })
  expect(result.current.messages[0].text).toBe('First question')
  act(() => result.current.newChat())
  expect(result.current.input).toBe('')
})

it('does not let a slow startup list or background recovery take selection back from New chat', async () => {
  const list = deferred<{ conversations: typeof conversation[] }>()
  const oldHistory = deferred<History>()
  const completion = deferred<Run>()
  sessionStorage.setItem('noodo:pending:u', JSON.stringify({ conversationId: 'c', clientRequestId: 'original', text: 'question', expectedAddressVersion: 1, createdAt: Date.now(), runId: 'r' }))
  vi.mocked(request).mockImplementation(async (path) => path === '/conversations' ? list.promise : oldHistory.promise)
  vi.mocked(pollRun).mockReturnValue(completion.promise)
  const { result } = renderHook(() => useAssistant('u'))
  act(() => { result.current.newChat(); result.current.setInput('My new draft') })
  await act(async () => { list.resolve({ conversations: [conversation] }); oldHistory.resolve(history()) })
  await waitFor(() => expect(pollRun).toHaveBeenCalledTimes(1))
  expect(result.current.selectedId).toBeNull()
  expect(result.current.input).toBe('My new draft')
  await act(async () => { completion.resolve(saved()) })
  expect(result.current.selectedId).toBeNull()
  expect(result.current.input).toBe('My new draft')
  expect(sendMessage).not.toHaveBeenCalled()
})

it('reuses an uncertain request after refresh and gives explicit retry a new ID without clearing its draft', async () => {
  const original = { conversationId: 'c', clientRequestId: 'original', text: 'question', expectedAddressVersion: 1, createdAt: Date.now() }
  sessionStorage.setItem('noodo:pending:u', JSON.stringify(original))
  vi.mocked(sendMessage).mockResolvedValue({ ...saved(), status: 'failed', error: { code: 'failed', message: 'Failed', retryable: true } })
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.pending).toBeNull())
  expect(vi.mocked(sendMessage).mock.calls[0][0]).toEqual(original)
  act(() => result.current.setInput('Unsent follow-up'))
  act(() => result.current.retry())
  await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(2))
  expect(vi.mocked(sendMessage).mock.calls[1][0].clientRequestId).not.toBe('original')
  expect(vi.mocked(sendMessage).mock.calls[1][0].text).toBe('question')
  expect(result.current.input).toBe('Unsent follow-up')
})

it('deduplicates startup and manual recovery while history is outstanding, and ignores an old page after recovery', async () => {
  const startup = deferred<History>()
  const older = deferred<History>()
  const completion = deferred<Run>()
  const pending = { conversationId: 'c', clientRequestId: 'original', text: 'question', expectedAddressVersion: 1, createdAt: Date.now(), runId: 'r' }
  sessionStorage.setItem('noodo:pending:u', JSON.stringify(pending))
  vi.mocked(request).mockImplementation(async (path) => path === '/conversations' ? { conversations: [] }
    : path.includes('?cursor=') ? older.promise : startup.promise)
  vi.mocked(pollRun).mockRejectedValueOnce(new Error('offline')).mockRejectedValueOnce(new Error('still offline')).mockImplementation(() => completion.promise)
  const { result } = renderHook(() => useAssistant('u'))
  await act(async () => { result.current.recover(); await Promise.resolve() })
  let opening!: Promise<void>
  act(() => { opening = result.current.open('c'); result.current.recover() })
  await act(async () => { startup.resolve(history('c', 'question', 'older')); await opening })
  await waitFor(() => expect(result.current.busy).toBe(false))
  expect(pollRun).toHaveBeenCalledTimes(2)
  let loadingOlder!: Promise<void>
  act(() => { loadingOlder = result.current.loadOlder(); result.current.recover(); result.current.recover() })
  await waitFor(() => expect(pollRun).toHaveBeenCalledTimes(3))
  await act(async () => { completion.resolve({ ...saved(), addressVersion: 3, observedAddress: 'resolved-new' }) })
  await waitFor(() => expect(result.current.pending).toBeNull())
  await act(async () => { older.resolve(history('c', 'stale', 'stale-cursor')); await loadingOlder })
  expect(result.current.messages.at(-1)?.text).toBe('saved')
  expect(result.current.messages.some((m) => m.text === 'stale')).toBe(false)
  expect(result.current.conversation?.addressVersion).toBe(3)
  expect(result.current.cursor).toBe('older')
  act(() => result.current.newChat())
  await act(async () => { await result.current.open('c') })
  expect(pollRun).toHaveBeenCalledTimes(3)
  expect(sendMessage).not.toHaveBeenCalled()
})

it('settles execution even when navigation refresh is unavailable, and opening a failed Pending never recovers it', async () => {
  vi.mocked(sendMessage).mockRejectedValue(new Error('connection lost'))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.send('first') })
  await waitFor(() => expect(result.current.busy).toBe(false))
  const original = result.current.pending?.clientRequestId
  act(() => result.current.newChat())
  await act(async () => { await result.current.open('c') })
  expect(sendMessage).toHaveBeenCalledTimes(1)
  expect(pollRun).not.toHaveBeenCalled()
  expect(result.current.pending?.clientRequestId).toBe(original)
  vi.mocked(sendMessage).mockResolvedValue(saved())
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/conversations') throw new Error('list offline')
    return history()
  })
  await act(async () => { result.current.recover() })
  await waitFor(() => expect(result.current.busy).toBe(false))
  expect(result.current.pending).toBeNull()
  expect(result.current.messages.at(-1)?.text).toBe('saved')
  expect(result.current.error).toBe('')
  expect(pollRun).not.toHaveBeenCalled()
})

it('deletes the selected chat, clears its draft, and keeps stale lists from restoring it', async () => {
  let releaseList!: (value: unknown) => void
  let listCalls = 0
  vi.mocked(request).mockImplementation(async (path, init) => {
    if (path === '/conversations') {
      if (++listCalls === 1) return new Promise((resolve) => { releaseList = resolve })
      return { conversations: [conversation] }
    }
    if (init?.method === 'DELETE') return { deleted: true }
    return history()
  })
  const { result } = renderHook(() => useAssistant('u'))
  await act(async () => { await result.current.open('c'); result.current.setInput('draft') })
  await act(async () => { expect(await result.current.deleteConversation('c')).toBe(true) })
  expect(result.current.selectedId).toBeNull()
  expect(sessionStorage.getItem('noodo:selected:u')).toBeNull()
  await act(async () => { releaseList({ conversations: [conversation] }) })
  expect(result.current.conversations).toEqual([])
  await act(async () => { await result.current.open('c') })
  expect(result.current.selectedId).toBeNull()
})
it('preserves a later selection during deletion and retains chats on failure', async () => {
  let complete!: () => void
  vi.mocked(request).mockImplementation(async (path, init) => {
    if (path === '/conversations') return { conversations: [conversation, { ...conversation, id: 'b' }] }
    if (init?.method === 'DELETE') return new Promise((resolve) => { complete = () => resolve({ deleted: true }) })
    return history(path.split('/').at(-1))
  })
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.open('c') })
  let deletion!: Promise<boolean>
  act(() => { deletion = result.current.deleteConversation('c') })
  await act(async () => { await result.current.open('b'); result.current.setInput('keep') })
  await act(async () => { complete(); await deletion })
  expect(result.current.selectedId).toBe('b')
  expect(result.current.input).toBe('keep')
  vi.mocked(request).mockRejectedValueOnce(new Error('Delete unavailable'))
  await act(async () => { expect(await result.current.deleteConversation('b')).toBe(false) })
  expect(result.current.selectedId).toBe('b')
  expect(result.current.conversations.map((c) => c.id)).toEqual(['b'])
  expect(result.current.deleteError).toBe('Delete unavailable')
})
it('blocks deletion during execution and blocks sending or duplicate deletion while deleting', async () => {
  let finishRun!: (run: Run) => void
  vi.mocked(sendMessage).mockImplementation(() => new Promise((resolve) => { finishRun = resolve }))
  const { result } = renderHook(() => useAssistant('u'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.open('c'); await result.current.send('test') })
  await act(async () => { expect(await result.current.deleteConversation('c')).toBe(false) })
  expect(request).not.toHaveBeenCalledWith('/conversations/c', { method: 'DELETE', body: '{}' })
  await act(async () => { finishRun(saved()) })
  await waitFor(() => expect(result.current.busy).toBe(false))
  let finishDelete!: () => void
  vi.mocked(request).mockImplementationOnce(() => new Promise((resolve) => { finishDelete = () => resolve({ deleted: true }) }))
  let task!: Promise<boolean>
  act(() => { task = result.current.deleteConversation('c') })
  await act(async () => {
    expect(await result.current.deleteConversation('c')).toBe(false)
    expect(await result.current.send('blocked')).toBe(false)
  })
  expect(result.current.deletingIds).toEqual(['c'])
  await act(async () => { finishDelete(); await task })
  expect(result.current.deletingIds).toEqual([])
})
