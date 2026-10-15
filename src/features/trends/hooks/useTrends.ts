import { useEffect, useState } from 'react'
import { request } from '../../../shared/api'
import type { TrendsData } from '../types'

export function useTrends(active: boolean) {
  const [data, setData] = useState<TrendsData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    let pending = false
    async function load(): Promise<void> {
      if (pending) return
      pending = true
      try {
        const next = await request<TrendsData>('/trends', { signal: controller.signal })
        if (!controller.signal.aborted) { setData(next); setError('') }
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Trends could not be loaded')
      } finally {
        pending = false
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    const timer = window.setInterval(() => { void load() }, 60_000)
    return () => { controller.abort(); window.clearInterval(timer) }
  }, [active, revision])
  return { data, error, loading, refresh: () => setRevision(value => value + 1) }
}
