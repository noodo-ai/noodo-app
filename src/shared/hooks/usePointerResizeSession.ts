import { useCallback, useEffect, useState } from 'react'

export function usePointerResizeSession(onPointerMove: (event: PointerEvent, stop: () => void) => void) {
  const [active, setActive] = useState(false)
  const stop = useCallback(() => setActive(false), [])

  useEffect(() => {
    if (!active) return

    const move = (event: PointerEvent) => onPointerMove(event, stop)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    window.addEventListener('blur', stop)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
      window.removeEventListener('blur', stop)
    }
  }, [active, onPointerMove, stop])

  return { active, start: () => setActive(true), stop }
}
