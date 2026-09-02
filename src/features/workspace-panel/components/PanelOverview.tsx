import { useEffect } from 'react'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'

export interface PanelOverviewProps {
  onSelect: (panel: RightPanelView) => void
}

export function PanelOverview({ onSelect }: PanelOverviewProps) {
  const farm = panelViews.find(({ id }) => id === 'farm')

  useEffect(() => {
    const openFarm = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '1' && !event.altKey && !event.shiftKey) {
        event.preventDefault()
        onSelect('farm')
      }
    }
    window.addEventListener('keydown', openFarm)
    return () => window.removeEventListener('keydown', openFarm)
  }, [onSelect])

  if (!farm) return null
  const FarmIcon = farm.Icon

  return (
    <div className="panel-overview">
      <button type="button" className="panel-launch" onClick={() => onSelect(farm.id)} aria-keyshortcuts="Meta+1 Control+1">
        <span><FarmIcon size={18} strokeWidth={1.6} />{farm.label}</span>
        <kbd>⌘1</kbd>
      </button>
    </div>
  )
}
