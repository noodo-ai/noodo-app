import { useEffect } from 'react'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'

export interface PanelOverviewProps {
  onSelect: (panel: RightPanelView) => void
  enabled: boolean
}

export function PanelOverview({ onSelect, enabled }: PanelOverviewProps) {
  useEffect(() => {
    if (!enabled) return

    const openPanel = (event: KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return
      const view = panelViews.find((_, index) => event.key === String(index + 1))
      if (!view) return
      event.preventDefault()
      onSelect(view.id)
    }
    window.addEventListener('keydown', openPanel)
    return () => window.removeEventListener('keydown', openPanel)
  }, [enabled, onSelect])

  return (
    <nav className="panel-overview" aria-label="Workspace pages">
      {panelViews.map(({ id, label, Icon }, index) => (
        <button type="button" key={id} className={`panel-launch panel-launch-${id}`} onClick={() => onSelect(id)} aria-keyshortcuts={`Alt+${index + 1}`}>
          <span><Icon size={18} strokeWidth={1.6} />{label}</span>
          <kbd>⌥{index + 1}</kbd>
        </button>
      ))}
    </nav>
  )
}
