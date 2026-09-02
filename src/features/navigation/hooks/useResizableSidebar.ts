import { useEffect, useState } from 'react'

export const MIN_SIDEBAR_WIDTH = 168
const DEFAULT_SIDEBAR_WIDTH = 216
const MAX_SIDEBAR_WIDTH = 336
const SIDEBAR_LEFT_INSET = 6
const MIN_WORKSPACE_WIDTH = 620

export function useResizableSidebar(onCollapse: () => void) {
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!isResizing) return

    const onPointerMove = (event: PointerEvent) => {
      const nextWidth = event.clientX - SIDEBAR_LEFT_INSET
      if (nextWidth < MIN_SIDEBAR_WIDTH) {
        setWidth(MIN_SIDEBAR_WIDTH)
        setIsResizing(false)
        onCollapse()
        return
      }

      const responsiveMaximum = Math.max(MIN_SIDEBAR_WIDTH, window.innerWidth - MIN_WORKSPACE_WIDTH)
      setWidth(Math.min(MAX_SIDEBAR_WIDTH, responsiveMaximum, nextWidth))
    }

    const onPointerUp = () => setIsResizing(false)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isResizing, onCollapse])

  const resizeByKeyboard = (direction: 'wider' | 'narrower') => {
    if (direction === 'narrower' && width <= MIN_SIDEBAR_WIDTH) {
      onCollapse()
      return
    }

    setWidth((current) => {
      const responsiveMaximum = Math.max(MIN_SIDEBAR_WIDTH, window.innerWidth - MIN_WORKSPACE_WIDTH)
      return direction === 'wider'
        ? Math.min(MAX_SIDEBAR_WIDTH, responsiveMaximum, current + 12)
        : Math.max(MIN_SIDEBAR_WIDTH, current - 12)
    })
  }

  return {
    width,
    isResizing,
    startResizing: () => setIsResizing(true),
    resizeByKeyboard,
  }
}
