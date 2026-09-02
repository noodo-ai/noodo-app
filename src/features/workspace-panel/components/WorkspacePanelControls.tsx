import type { Ref } from 'react'
import { PanelRight, PanelRightOpen } from 'lucide-react'
import { PanelToggleButton } from '../../../shared/components/PanelToggleButton'
import { ResizeHandle } from '../../../shared/components/ResizeHandle'
import { MIN_PANEL_WIDTH } from '../resize'

export interface WorkspacePanelControlsProps {
  open: boolean
  width: number
  isResizing: boolean
  onOpen: () => void
  onStartResize: () => void
  onResizeByKeyboard: (direction: 'wider' | 'narrower') => void
  toggleButtonRef?: Ref<HTMLButtonElement>
}

export function WorkspacePanelControls({ open, width, isResizing, onOpen, onStartResize, onResizeByKeyboard, toggleButtonRef }: WorkspacePanelControlsProps) {
  return (
    <>
      {open && (
        <ResizeHandle
          className="panel-resizer"
          label="Resize right panel"
          value={width}
          min={MIN_PANEL_WIDTH}
          active={isResizing}
          widerKey="ArrowLeft"
          narrowerKey="ArrowRight"
          onStart={onStartResize}
          onResizeByKeyboard={onResizeByKeyboard}
        />
      )}
      <PanelToggleButton
        buttonRef={toggleButtonRef}
        className={`right-panel-toggle frame-icon-button ${open ? '' : 'visible'}`}
        aria-label="Open right panel"
        aria-expanded={open}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={onOpen}
        tooltip="Toggle side panel"
        defaultIcon={<PanelRight size={18} strokeWidth={1.6} />}
        actionIcon={<PanelRightOpen size={18} strokeWidth={1.6} />}
      />
    </>
  )
}
