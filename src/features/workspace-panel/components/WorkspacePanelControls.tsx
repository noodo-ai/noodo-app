import { PanelRight, PanelRightOpen } from 'lucide-react'

export interface WorkspacePanelControlsProps {
  open: boolean
  onOpen: () => void
  onStartResize: () => void
  onResizeByKeyboard: (direction: 'wider' | 'narrower') => void
}

export function WorkspacePanelControls({ open, onOpen, onStartResize, onResizeByKeyboard }: WorkspacePanelControlsProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="panel-resizer"
          aria-label="Resize right panel"
          title="Drag or use arrow keys to resize"
          onPointerDown={(event) => { event.preventDefault(); onStartResize() }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') onResizeByKeyboard('wider')
            if (event.key === 'ArrowRight') onResizeByKeyboard('narrower')
          }}
        ><span /></button>
      )}
      <button
        type="button"
        className={`right-panel-toggle frame-icon-button ${open ? '' : 'visible'}`}
        aria-label="Open right panel"
        aria-expanded={open}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={onOpen}
      >
        <span className="panel-icon panel-icon-default"><PanelRight size={18} strokeWidth={1.6} /></span>
        <span className="panel-icon panel-icon-action"><PanelRightOpen size={18} strokeWidth={1.6} /></span>
      </button>
    </>
  )
}
