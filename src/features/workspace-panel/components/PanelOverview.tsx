import { useEffect } from 'react'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'

export interface PanelOverviewProps {
  onSelect: (panel: RightPanelView) => void
  enabled: boolean
}

export function PanelOverview({ onSelect, enabled }: PanelOverviewProps) {
  const farm = panelViews.find(({ id }) => id === 'farm')

  useEffect(() => {
    if (!enabled) return

    const openFarm = (event: KeyboardEvent) => {
      if (event.altKey && event.key === '1' && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault()
        onSelect('farm')
      }
    }
    window.addEventListener('keydown', openFarm)
    return () => window.removeEventListener('keydown', openFarm)
  }, [enabled, onSelect])

  if (!farm) return null
  const FarmIcon = farm.Icon

  return (
    <div className="panel-overview">
      <button type="button" className="panel-launch" onClick={() => onSelect(farm.id)} aria-keyshortcuts="Alt+1">
        <span><FarmIcon size={18} strokeWidth={1.6} />{farm.label}</span>
        <kbd>⌥1</kbd>
      </button>
    </div>
  )
}
