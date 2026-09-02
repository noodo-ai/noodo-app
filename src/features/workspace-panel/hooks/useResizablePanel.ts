import { useCallback, useState } from 'react'
import { usePointerResizeSession } from '../../../shared/hooks/usePointerResizeSession'
import { MIN_PANEL_WIDTH, resolvePanelKeyboardResize, resolvePanelPointerResize } from '../resize'

function initialPanelWidth(): number {
  return window.innerWidth > 900 ? Math.max(MIN_PANEL_WIDTH, (window.innerWidth - 76) / 2) : 340
}

export function useResizablePanel() {
  const [width, setWidth] = useState(initialPanelWidth)
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const workspace = document.querySelector<HTMLElement>('.workspace')
    if (!workspace) return
    const bounds = workspace.getBoundingClientRect()
    setWidth(resolvePanelPointerResize(event.clientX, bounds.left, bounds.width))
  }, [])
  const resizeSession = usePointerResizeSession(handlePointerMove)

  const resizeByKeyboard = (direction: 'wider' | 'narrower', workspaceWidth: number) => {
    setWidth((current) => resolvePanelKeyboardResize(current, direction, workspaceWidth))
  }

  return { width, setWidth, isResizing: resizeSession.active, startResizing: resizeSession.start, resizeByKeyboard }
}
