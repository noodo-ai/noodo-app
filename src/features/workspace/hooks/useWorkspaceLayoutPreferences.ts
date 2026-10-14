import { useEffect, useState } from 'react'
import { DEFAULT_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, getSidebarMaximum } from '../../navigation/resize'
import { MIN_PANEL_WIDTH, getPanelMaximum } from '../../workspace-panel/resize'

const STORAGE_KEY = 'noodo:workspace-layout'

interface LayoutPreferences {
  sidebarExpanded: boolean
  rightPanelOpen: boolean
  sidebarWidth: number
  rightPanelWidth: number | null
}

function readPreferences(): LayoutPreferences {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved && typeof saved === 'object') {
      const sidebarExpanded = 'sidebarExpanded' in saved && saved.sidebarExpanded === true
      const sidebarMaximum = window.innerWidth > 900 ? getSidebarMaximum(window.innerWidth) : MAX_SIDEBAR_WIDTH
      const sidebarWidth = 'sidebarWidth' in saved && typeof saved.sidebarWidth === 'number'
        && Number.isFinite(saved.sidebarWidth) && saved.sidebarWidth > 0
        ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(sidebarMaximum, saved.sidebarWidth))
        : DEFAULT_SIDEBAR_WIDTH
      const workspaceWidth = window.innerWidth - 12 - (sidebarExpanded ? sidebarWidth + 6 : 0)
      const rightPanelWidth = 'rightPanelWidth' in saved && typeof saved.rightPanelWidth === 'number'
        && Number.isFinite(saved.rightPanelWidth) && saved.rightPanelWidth > 0
        ? Math.max(MIN_PANEL_WIDTH, window.innerWidth > 900
          ? Math.min(getPanelMaximum(workspaceWidth), saved.rightPanelWidth) : saved.rightPanelWidth)
        : null
      return {
        sidebarExpanded,
        rightPanelOpen: 'rightPanelOpen' in saved && saved.rightPanelOpen === true,
        sidebarWidth,
        rightPanelWidth,
      }
    }
  } catch {
    // Storage may be unavailable or contain invalid data.
  }
  return { sidebarExpanded: false, rightPanelOpen: false, sidebarWidth: DEFAULT_SIDEBAR_WIDTH, rightPanelWidth: null }
}

export function useWorkspaceLayoutPreferences() {
  const [initial] = useState(readPreferences)
  const [sidebarExpanded, setSidebarExpanded] = useState(initial.sidebarExpanded)
  const [rightPanelOpen, setRightPanelOpen] = useState(initial.rightPanelOpen)
  const [sidebarWidth, setSidebarWidth] = useState(initial.sidebarWidth)
  const [rightPanelWidth, setRightPanelWidth] = useState(initial.rightPanelWidth)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sidebarExpanded, rightPanelOpen, sidebarWidth, rightPanelWidth }))
    } catch {
      // Layout controls must still work when browser storage is unavailable.
    }
  }, [sidebarExpanded, rightPanelOpen, sidebarWidth, rightPanelWidth])

  return { sidebarExpanded, setSidebarExpanded, rightPanelOpen, setRightPanelOpen,
    sidebarWidth, setSidebarWidth, rightPanelWidth, setRightPanelWidth }
}
