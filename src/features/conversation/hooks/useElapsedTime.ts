import { useEffect, useState } from 'react'

export function formatElapsedTime(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`
}

export function useElapsedTime(startedAt: number | undefined, completedAt: number | null | undefined, running: boolean): string {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running || startedAt === undefined || completedAt != null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt, completedAt, running])
  return formatElapsedTime(startedAt === undefined ? 0 : (completedAt ?? now) - startedAt)
}
