import { useCallback, useState } from 'react'
import type { ComposerMode } from '../../composer/types'
import { useResizableSidebar } from '../../navigation/hooks/useResizableSidebar'
import { useResizablePanel } from '../../workspace-panel/hooks/useResizablePanel'
import { MIN_PANEL_WIDTH, getPanelMaximum } from '../../workspace-panel/resize'
import type { RightPanelView } from '../../workspace-panel/types'
import { useWorkspaceLayoutPreferences } from './useWorkspaceLayoutPreferences'

export function useWorkspaceController() {
  const { sidebarExpanded, setSidebarExpanded, rightPanelOpen, setRightPanelOpen,
    sidebarWidth, setSidebarWidth, rightPanelWidth, setRightPanelWidth } =
    useWorkspaceLayoutPreferences()
  const [sidebarPreview, setSidebarPreview] = useState(false)
  const [rightPanelView, setRightPanelView] = useState<RightPanelView | null>(
    null,
  )
  const [mode, setMode] = useState<ComposerMode>('Hyperliquid')
  const collapseSidebar = useCallback(() => {
    setSidebarExpanded(false)
    setSidebarPreview(false)
  }, [setSidebarExpanded])
  const sidebarResize = useResizableSidebar(collapseSidebar, sidebarWidth, setSidebarWidth)
  const panel = useResizablePanel(rightPanelWidth, setRightPanelWidth)

  const openRightPanel = (appShellWidth?: number) => {
    if (!rightPanelOpen && window.innerWidth > 900) {
      const sidebarMargin =
        sidebarExpanded || sidebarPreview ? sidebarResize.width + 6 : 0
      const workspaceWidth = (appShellWidth ?? window.innerWidth) - 12 - sidebarMargin
      const preferredWidth = rightPanelWidth ?? (workspaceWidth - 6) / 2
      panel.setWidth(Math.max(MIN_PANEL_WIDTH, Math.min(getPanelMaximum(workspaceWidth - 6), preferredWidth)))
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
      showOverview: () => setRightPanelView(null),
      close: () => setRightPanelOpen(false),
    },
    composer: { mode, setMode },
  }
}
