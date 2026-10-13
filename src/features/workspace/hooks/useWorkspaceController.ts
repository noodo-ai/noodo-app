import { useCallback, useState } from 'react'
import type { ComposerMode } from '../../composer/types'
import { useResizableSidebar } from '../../navigation/hooks/useResizableSidebar'
import { useResizablePanel } from '../../workspace-panel/hooks/useResizablePanel'
import type { RightPanelView } from '../../workspace-panel/types'

export function useWorkspaceController() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarPreview, setSidebarPreview] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightPanelView, setRightPanelView] = useState<RightPanelView | null>(
    null,
  )
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ComposerMode>('Hyperliquid')
  const collapseSidebar = useCallback(() => {
    setSidebarExpanded(false)
    setSidebarPreview(false)
  }, [])
  const sidebarResize = useResizableSidebar(collapseSidebar)
  const panel = useResizablePanel()

  const openRightPanel = (appShellWidth?: number) => {
    if (!rightPanelOpen && window.innerWidth > 900 && appShellWidth) {
      const sidebarMargin =
        sidebarExpanded || sidebarPreview ? sidebarResize.width + 6 : 0
      const workspaceWidth = appShellWidth - 12 - sidebarMargin
      panel.setWidth(Math.max(280, (workspaceWidth - 6) / 2))
    }
    setRightPanelOpen(true)
  }

  const selectRightPanel = (view: RightPanelView, appShellWidth?: number) => {
    setRightPanelView(view)
    openRightPanel(appShellWidth)
  }

  const toggleSidebar = () => {
    setSidebarExpanded((expanded) => !expanded)
    setSidebarPreview(false)
  }

  const startSidebarResize = () => {
    setSidebarExpanded(true)
    setSidebarPreview(false)
    sidebarResize.startResizing()
  }

  return {
    sidebar: {
      ...sidebarResize,
      expanded: sidebarExpanded,
      preview: sidebarPreview,
      setExpanded: setSidebarExpanded,
      setPreview: setSidebarPreview,
      toggle: toggleSidebar,
      startResizing: startSidebarResize,
    },
    panel: {
      ...panel,
      open: rightPanelOpen,
      view: rightPanelView,
      openPanel: openRightPanel,
      select: selectRightPanel,
      close: () => setRightPanelOpen(false),
    },
    composer: { input, mode, setInput, setMode },
  }
}
