import { useState } from 'react'
import type { ComposerMode } from '../../composer/types'
import { useExploration } from '../../exploration/hooks/useExploration'
import { useResizablePanel } from '../../workspace-panel/hooks/useResizablePanel'
import type { RightPanelView } from '../../workspace-panel/types'

export function useWorkspaceController() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarPreview, setSidebarPreview] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightPanelView, setRightPanelView] = useState<RightPanelView | null>(null)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ComposerMode>('Quick Run')
  const [messages, setMessages] = useState<string[]>([])
  const [focusRequest, setFocusRequest] = useState(0)
  const exploration = useExploration(messages.length > 0)
  const panel = useResizablePanel()

  const submit = () => {
    const message = input.trim()
    if (!message) return
    setMessages((current) => [...current, message])
    setInput('')
    exploration.resetProgress()
  }

  const reset = () => {
    setMessages([])
    setInput('')
    exploration.resetProgress()
  }

  const pickPrompt = (prompt: string) => {
    setInput(prompt)
    exploration.resetProgress()
    setFocusRequest((request) => request + 1)
  }

  const openRightPanel = (appShellWidth?: number) => {
    if (!rightPanelOpen && window.innerWidth > 900 && appShellWidth) {
      const sidebarMargin = sidebarExpanded || sidebarPreview ? 246 : 58
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

  return {
    sidebar: { expanded: sidebarExpanded, preview: sidebarPreview, setExpanded: setSidebarExpanded, setPreview: setSidebarPreview, toggle: toggleSidebar },
    panel: { ...panel, open: rightPanelOpen, view: rightPanelView, openPanel: openRightPanel, select: selectRightPanel, close: () => setRightPanelOpen(false) },
    composer: { input, mode, focusRequest, setInput, setMode, submit, pickPrompt },
    conversation: { messages, hasMessages: messages.length > 0, reset },
    exploration,
  }
}
