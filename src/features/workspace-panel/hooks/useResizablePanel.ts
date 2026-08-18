import { useEffect, useState } from 'react'

const MIN_PANEL_WIDTH = 280
const MIN_CONTENT_WIDTH = 426

function initialPanelWidth(): number {
  return window.innerWidth > 900 ? Math.max(MIN_PANEL_WIDTH, (window.innerWidth - 76) / 2) : 340
}

export function useResizablePanel() {
  const [width, setWidth] = useState(initialPanelWidth)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!isResizing) return

    const onPointerMove = (event: PointerEvent) => {
      const workspace = document.querySelector<HTMLElement>('.workspace')
      if (!workspace) return
      const bounds = workspace.getBoundingClientRect()
      const maxWidth = Math.max(MIN_PANEL_WIDTH, bounds.width - MIN_CONTENT_WIDTH)
      setWidth(Math.max(MIN_PANEL_WIDTH, Math.min(maxWidth, bounds.right - event.clientX)))
    }
    const onPointerUp = () => setIsResizing(false)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isResizing])

  const resizeByKeyboard = (direction: 'wider' | 'narrower', workspaceWidth: number) => {
    setWidth((current) => direction === 'wider'
      ? Math.min(Math.max(MIN_PANEL_WIDTH, workspaceWidth - MIN_CONTENT_WIDTH), current + 12)
      : Math.max(MIN_PANEL_WIDTH, current - 12))
  }

  return { width, setWidth, isResizing, startResizing: () => setIsResizing(true), resizeByKeyboard }
}
