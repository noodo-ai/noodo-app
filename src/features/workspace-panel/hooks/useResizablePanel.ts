import { useCallback } from 'react'
import { usePointerResizeSession } from '../../../shared/hooks/usePointerResizeSession'
import { MIN_PANEL_WIDTH, resolvePanelKeyboardResize, resolvePanelPointerResize } from '../resize'

export function useResizablePanel(savedWidth: number | null, setWidth: (width: number) => void) {
  const width = savedWidth ?? (window.innerWidth > 900 ? Math.max(MIN_PANEL_WIDTH, (window.innerWidth - 76) / 2) : 340)
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const workspace = document.querySelector<HTMLElement>('.workspace')
    if (!workspace) return
    const bounds = workspace.getBoundingClientRect()
    setWidth(resolvePanelPointerResize(event.clientX, bounds.left, bounds.width))
  }, [setWidth])
  const resizeSession = usePointerResizeSession(handlePointerMove)

  const resizeByKeyboard = (direction: 'wider' | 'narrower', workspaceWidth: number) => {
    setWidth(resolvePanelKeyboardResize(width, direction, workspaceWidth))
  }

  return { width, setWidth, isResizing: resizeSession.active, startResizing: resizeSession.start, resizeByKeyboard }
}
