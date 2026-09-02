import { useCallback, useState } from 'react'
import { usePointerResizeSession } from '../../../shared/hooks/usePointerResizeSession'
import {
  DEFAULT_SIDEBAR_WIDTH,
  resolveSidebarKeyboardResize,
  resolveSidebarPointerResize,
} from '../resize'

export function useResizableSidebar(onCollapse: () => void) {
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const handlePointerMove = useCallback((event: PointerEvent, stop: () => void) => {
    const next = resolveSidebarPointerResize(event.clientX, window.innerWidth)
    setWidth(next.width)
    if (next.collapse) {
      stop()
      onCollapse()
    }
  }, [onCollapse])
  const resizeSession = usePointerResizeSession(handlePointerMove)

  const resizeByKeyboard = (direction: 'wider' | 'narrower') => {
    const next = resolveSidebarKeyboardResize(width, direction, window.innerWidth)
    setWidth(next.width)
    if (next.collapse) onCollapse()
  }

  return {
    width,
    isResizing: resizeSession.active,
    startResizing: resizeSession.start,
    resizeByKeyboard,
  }
}
