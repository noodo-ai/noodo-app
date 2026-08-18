import { ChevronRight } from 'lucide-react'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'

export interface PanelOverviewProps {
  onSelect: (panel: RightPanelView) => void
}

export function PanelOverview({ onSelect }: PanelOverviewProps) {
  return (
    <div className="panel-overview">
      <p className="panel-eyebrow">Workspace flow</p>
      <h2>From agents to outcomes.</h2>
      <p className="panel-intro">Choose a layer to set up your workspace or follow work already in motion.</p>
      <div className="panel-step-list">
        {panelViews.map(({ id, label, Icon, description }, index) => (
          <button type="button" key={id} className="panel-step" onClick={() => onSelect(id)}>
            <span className="step-number">0{index + 1}</span>
            <span className="step-icon"><Icon size={18} strokeWidth={1.55} /></span>
            <span className="step-copy"><strong>{label}</strong><small>{description}</small></span>
            <ChevronRight className="step-arrow" size={16} strokeWidth={1.6} />
          </button>
        ))}
      </div>
    </div>
  )
}
