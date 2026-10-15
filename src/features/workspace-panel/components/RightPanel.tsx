import { TrendsPanel } from '../../trends/components/TrendsPanel'
import { useLayoutEffect, useRef, type Ref } from 'react'
import { ArrowLeft, PanelRight, PanelRightClose } from 'lucide-react'
import { PanelToggleButton } from '../../../shared/components/PanelToggleButton'
import { panelViews } from '../data'
import type { RightPanelView } from '../types'
import { PanelOverview } from './PanelOverview'
import { ResourcesPanel } from '../../resources/components/ResourcesPanel'

export interface RightPanelProps {
  open: boolean
  userId: string
  activeView: RightPanelView | null
  onSelect: (panel: RightPanelView) => void
  onBack: () => void
  onClose: () => void
  closeButtonRef?: Ref<HTMLButtonElement>
}

export function RightPanel({ userId, open, activeView, onSelect, onBack, onClose, closeButtonRef }: RightPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const previousView = useRef(activeView)
  useLayoutEffect(() => {
    if (open && previousView.current !== activeView) {
      const selector = activeView ? '.right-panel-back' : `.panel-launch-${previousView.current}`
      panelRef.current?.querySelector<HTMLButtonElement>(selector)?.focus()
    }
    previousView.current = activeView
  }, [activeView, open])
  const view = panelViews.find((item) => item.id === activeView)
  const title = view?.label ?? 'Workspace'

  return (
    <aside ref={panelRef} className={`right-panel ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open} aria-label={`${title} panel`}>
      <div className={`right-panel-head ${activeView ? '' : 'overview'}`}>
        {activeView && (
          <div className="right-panel-title">
            <button type="button" className="right-panel-back frame-icon-button" aria-label="Back to workspace" onClick={onBack}>
              <ArrowLeft size={18} strokeWidth={1.6} />
            </button>
            <span className="right-panel-label">
              {view && <view.Icon size={15} strokeWidth={1.6} aria-hidden="true" />}
              {title}
            </span>
          </div>
        )}
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
        {activeView === 'trends' && <TrendsPanel key={userId} active={open} />}
        {activeView === 'resources' && <ResourcesPanel userId={userId} active={open} />}
      </div>
    </aside>
  )
}
