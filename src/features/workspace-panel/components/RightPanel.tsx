import { PanelRight, PanelRightClose } from 'lucide-react'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'
import { CookingPanel } from './CookingPanel'
import { FarmPanel } from './FarmPanel'
import { PanelOverview } from './PanelOverview'
import { ProcessPanel } from './ProcessPanel'
import { SlurpPanel } from './SlurpPanel'

export interface RightPanelProps {
  open: boolean
  activeView: RightPanelView | null
  onSelect: (panel: RightPanelView) => void
  onClose: () => void
  hasTask: boolean
}

export function RightPanel({ open, activeView, onSelect, onClose, hasTask }: RightPanelProps) {
  const title = activeView ? panelViews.find((item) => item.id === activeView)?.label : 'Workspace'

  return (
    <aside className={`right-panel ${open ? 'open' : ''}`} aria-hidden={!open} aria-label={`${title} panel`}>
      <div className="right-panel-head">
        <span>{title}</span>
        <button type="button" className="right-panel-close frame-icon-button" aria-label="Close right panel" onClick={onClose}>
          <span className="panel-icon panel-icon-default"><PanelRight size={18} strokeWidth={1.6} /></span>
          <span className="panel-icon panel-icon-action"><PanelRightClose size={18} strokeWidth={1.6} /></span>
        </button>
      </div>
      <div className="right-panel-scroll">
        {!activeView && <PanelOverview onSelect={onSelect} />}
        {activeView === 'farm' && <FarmPanel />}
        {activeView === 'process' && <ProcessPanel />}
        {activeView === 'cooking' && <CookingPanel hasTask={hasTask} />}
        {activeView === 'slurp' && <SlurpPanel />}
      </div>
    </aside>
  )
}
