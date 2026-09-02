import type { Ref } from 'react'
import { PanelRight, PanelRightClose } from 'lucide-react'
import { PanelToggleButton } from '../../../shared/components/PanelToggleButton'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'
import { PanelOverview } from './PanelOverview'

export interface RightPanelProps {
  open: boolean
  activeView: RightPanelView | null
  onSelect: (panel: RightPanelView) => void
  onClose: () => void
  closeButtonRef?: Ref<HTMLButtonElement>
}

export function RightPanel({ open, activeView, onSelect, onClose, closeButtonRef }: RightPanelProps) {
  const title = activeView ? panelViews.find((item) => item.id === activeView)?.label : 'Workspace'

  return (
    <aside className={`right-panel ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open} aria-label={`${title} panel`}>
      <div className={`right-panel-head ${activeView ? '' : 'overview'}`}>
        {activeView && <span>{title}</span>}
        <PanelToggleButton
          buttonRef={closeButtonRef}
          className="right-panel-close frame-icon-button"
          aria-label="Close right panel"
          aria-expanded={open}
          tooltip="Toggle side panel"
          onClick={onClose}
          defaultIcon={<PanelRight size={18} strokeWidth={1.6} />}
          actionIcon={<PanelRightClose size={18} strokeWidth={1.6} />}
        />
      </div>
      <div className={`right-panel-scroll ${activeView ? '' : 'overview'}`}>
        {!activeView && <PanelOverview enabled={open} onSelect={onSelect} />}
      </div>
    </aside>
  )
}
