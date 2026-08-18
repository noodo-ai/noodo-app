import { useState, type WheelEvent } from 'react'
import { clampExploreProgress } from '../utils'

export function useExploration(disabled: boolean) {
  const [progress, setProgress] = useState(0)

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (disabled || !event.deltaY) return
    setProgress((current) => clampExploreProgress(current + event.deltaY))
  }

  return { progress, setProgress, resetProgress: () => setProgress(0), handleWheel }
}
