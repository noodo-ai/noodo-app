// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { request } from '../../../shared/api'
import { listResources } from '../api'
import { useResources } from './useResources'
import type { ResourceItem, ResourcePage } from '../types'
vi.mock('../../../shared/api', () => ({ request: vi.fn() }))
vi.mock('../api', () => ({ listResources: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
const item = (id: string): ResourceItem => ({ id, ownerId: 'user', author: 'User', title: id, summary: '', visibility: 'private', categoryId: null, topic: 'Other', bytes: 4, createdAt: 1, updatedAt: 1, hasBody: 1, views: 0, files: [] })
function storage(): void { vi.mocked(request).mockResolvedValue({ categories: [], usedBytes: 0, limitBytes: 104857600 }) }
it('does not replace community results with a stale personal response after switching tabs', async () => {
  storage()
  let finishPersonal!: (value: ResourcePage) => void
  const personal = new Promise<ResourcePage>(resolve => { finishPersonal = resolve })
  vi.mocked(listResources).mockImplementation(async filters => filters.scope === 'personal' ? personal : { resources: [item('community')], nextOffset: null })
  const { result } = renderHook(() => useResources(true))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.setFilters(old => ({ ...old, scope: 'personal' })))
  await waitFor(() => expect(vi.mocked(listResources).mock.calls.some(([filters]) => filters.scope === 'personal')).toBe(true))
  act(() => result.current.setFilters(old => ({ ...old, scope: 'community' })))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => finishPersonal({ resources: [item('private')], nextOffset: 20 }))
  expect(result.current.items.map(r => r.id)).toEqual(['community'])
  expect(result.current.nextOffset).toBeNull()
})
it('aborts pagination on filter changes and permits pagination in the new results', async () => {
  storage()
  let finishPage!: (value: ResourcePage) => void
  const stale = new Promise<ResourcePage>(resolve => { finishPage = resolve })
  let pageSignal: AbortSignal | undefined
  vi.mocked(listResources).mockImplementation(async (filters, offset, signal) => {
    if (offset && filters.scope === 'community') { pageSignal = signal; return stale }
    return { resources: [item(filters.scope + offset)], nextOffset: offset ? null : 20 }
  })
  const { result } = renderHook(() => useResources(true))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => { void result.current.loadMore() })
  act(() => result.current.setFilters(old => ({ ...old, scope: 'personal' })))
  expect(pageSignal?.aborted).toBe(true)
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => finishPage({ resources: [item('stale')], nextOffset: null }))
  await act(async () => result.current.loadMore())
  expect(result.current.items.map(r => r.id)).toEqual(['personal0', 'personal20'])
})
it('restores cached visibility results immediately while refreshing without showing the other visibility', async () => {
  storage()
  let finishRefresh!: (value: ResourcePage) => void
  let holdPrivate = false
  vi.mocked(listResources).mockImplementation(async filters => {
    if (holdPrivate && filters.visibility === 'private') return new Promise<ResourcePage>(resolve => { finishRefresh = resolve })
    return { resources: [{ ...item(filters.visibility || 'community'), visibility: filters.visibility === 'public' ? 'public' : 'private' }], nextOffset: null }
  })
  const { result } = renderHook(() => useResources(true))
  await waitFor(() => expect(result.current.refreshing).toBe(false))
  act(() => result.current.setFilters(old => ({ ...old, scope: 'personal', visibility: 'private' })))
  await waitFor(() => expect(result.current.refreshing).toBe(false))
  expect(result.current.items[0].id).toBe('private')
  act(() => result.current.setFilters(old => ({ ...old, visibility: 'public' })))
  expect(result.current.items.some(resource => resource.id === 'private')).toBe(false)
  await waitFor(() => expect(result.current.refreshing).toBe(false))
  holdPrivate = true
  act(() => result.current.setFilters(old => ({ ...old, visibility: 'private' })))
  expect(result.current.loading).toBe(false)
  expect(result.current.items[0].id).toBe('private')
  await waitFor(() => expect(finishRefresh).toBeDefined())
  expect(result.current.refreshing).toBe(true)
  expect(result.current.items[0].id).toBe('private')
  await act(async () => finishRefresh({ resources: [item('updated-private')], nextOffset: null }))
  expect(result.current.items[0].id).toBe('updated-private')
})
