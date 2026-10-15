import { useCallback, useEffect, useRef, useState } from 'react'
import { request } from '../../../shared/api'
import { listResources } from '../api'
import type { ResourceFilters, ResourceItem, ResourceStorage, ResourcePage } from '../types'

export const initialFilters: ResourceFilters = { scope: 'community', search: '', visibility: '', categoryId: '', topic: '', format: '', sort: 'latest' }
export function useResources(active: boolean) {
  const [filters, setFilters] = useState(initialFilters)
  const [pages, setPages] = useState<Record<string, ResourcePage>>({})
  const filterKey = JSON.stringify(filters)
  const page = pages[filterKey]
  function savePage(key: string, value: ResourcePage): void {
    setPages(old => Object.fromEntries([...Object.entries(old).filter(([entry]) => entry !== key).slice(-19), [key, value]]))
  }
  const [popular, setPopular] = useState<ResourceItem[]>([])
  const [storage, setStorage] = useState<ResourceStorage>({ categories: [], usedBytes: 0, limitBytes: 100 * 1024 * 1024 })
  const [loading, setLoading] = useState(false)
  const [loadedFilters, setLoadedFilters] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const generation = useRef(0)
  const moreController = useRef<AbortController | null>(null)
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    const current = ++generation.current
    moreController.current?.abort(); moreController.current = null
    if (!active) return
    const controller = new AbortController()
    // Search waits briefly so a keystroke does not produce a database query.
    const timer = window.setTimeout(() => {
      setLoading(true)
      setLoadingMore(false)
      setError('')
      void Promise.all([
        listResources(filters, 0, controller.signal),
        request<ResourceStorage>('/resource-categories', { signal: controller.signal }),
        listResources({ ...initialFilters, sort: 'popular' }, 0, controller.signal),
      ]).then(([page, usage, hot]) => {
        if (current !== generation.current || controller.signal.aborted) return
        setLoadedFilters(JSON.stringify(filters))
        savePage(JSON.stringify(filters), page)
        setStorage(usage)
        setPopular(hot.resources.filter(item => item.views > 0).slice(0, 3))
      }).catch((e: unknown) => {
        if (current === generation.current && !controller.signal.aborted) { setError(e instanceof Error ? e.message : 'Resources could not be loaded'); setLoadedFilters(JSON.stringify(filters)) }
      }).finally(() => {
        if (current === generation.current && !controller.signal.aborted) setLoading(false)
      })
    }, filters.search ? 250 : 0)
    return () => { controller.abort(); window.clearTimeout(timer); moreController.current?.abort(); moreController.current = null }
  }, [active, filters, revision])
  async function loadMore(): Promise<void> {
    if (!page || page.nextOffset === null || moreController.current || loading || loadedFilters !== JSON.stringify(filters)) return
    const current = generation.current
    const controller = new AbortController()
    moreController.current = controller
    setLoadingMore(true)
    setError('')
    try {
      const next = await listResources(filters, page.nextOffset, controller.signal)
      if (current !== generation.current || controller.signal.aborted) return
      setPages(old => {
        const previous = old[filterKey]
        if (!previous) return old
        return { ...old, [filterKey]: { resources: [...previous.resources, ...next.resources.filter(item => !previous.resources.some(existing => existing.id === item.id))], nextOffset: next.nextOffset } }
      })
    } catch (e) {
      if (current === generation.current && !controller.signal.aborted) setError(e instanceof Error ? e.message : 'More resources could not be loaded')
    } finally {
      if (moreController.current === controller) moreController.current = null
      if (current === generation.current) setLoadingMore(false)
    }
  }
  return { filters, setFilters, items: page?.resources ?? [], popular, storage, loading: (loading || loadedFilters !== filterKey) && !page, refreshing: loading || loadedFilters !== filterKey, loadingMore, error, nextOffset: page?.nextOffset ?? null, refresh, loadMore }
}
