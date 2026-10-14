import { useEffect, useState } from 'react'
import { ApiFailure, request } from '../api'
import type { User } from '../types'
export function useAuth() {
  const [user, setUser] = useState<User | null>(null),
    [initializing, setInitializing] = useState(true),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  useEffect(() => {
    const abort = new AbortController()
    request<{ user: User }>('/auth/me', { signal: abort.signal })
      .then((r) => {
        if (!abort.signal.aborted) setUser(r.user)
      })
      .catch(() => {})
      .finally(() => {
        if (!abort.signal.aborted) {
          setInitializing(false)
          setLoading(false)
        }
      })
    return () => abort.abort()
  }, [])
  const login = async (username: string, password: string) => {
    setError('')
    setLoading(true)
    try {
      setUser(
        (
          await request<{ user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          })
        ).user,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }
  const logout = async () => {
    setError('')
    try {
      await request('/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (e) {
      if (e instanceof ApiFailure && e.status === 401) setUser(null)
      else setError(e instanceof Error ? e.message : 'Sign out failed')
    }
  }
  return { user, initializing, loading, error, login, logout }
}
