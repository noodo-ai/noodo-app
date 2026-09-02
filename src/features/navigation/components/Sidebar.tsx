import type { Ref } from 'react'
import { PanelLeft, PanelLeftClose, PanelLeftOpen, Sprout, Settings } from 'lucide-react'
import { NoodoMark } from '../../../shared/components/NoodoMark'
import { PanelToggleButton } from '../../../shared/components/PanelToggleButton'
import { ResizeHandle } from '../../../shared/components/ResizeHandle'
import { panelViews } from '../../workspace-panel/data'
import type { RightPanelView } from '../../workspace-panel/types'
import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH } from '../resize'
import { RecentChats } from './RecentChats'

export interface SidebarProps {
  expanded: boolean
  preview: boolean
  onPreviewChange: (value: boolean) => void
  onToggle: () => void
  onReset: () => void
  onOpenRecentChat: (title: string) => void
  activePanel: RightPanelView | null
  onSelectPanel: (panel: RightPanelView) => void
  isResizing: boolean
  width: number
  onStartResize: () => void
  onResizeByKeyboard: (direction: 'wider' | 'narrower') => void
  collapseButtonRef?: Ref<HTMLButtonElement>
}

export function Sidebar({ expanded, preview, onPreviewChange, onToggle, onReset, onOpenRecentChat, activePanel, onSelectPanel, isResizing, width, onStartResize, onResizeByKeyboard, collapseButtonRef }: SidebarProps) {
  const visible = expanded || preview

  return (
    <div
      className={`sidebar-region ${visible ? 'expanded' : ''}`}
      onPointerLeave={() => onPreviewChange(false)}
    >
      <div
        className="sidebar-activation-rail"
        onPointerEnter={() => !expanded && onPreviewChange(true)}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${visible ? 'expanded' : ''} ${preview && !expanded ? 'peek' : ''}`}
        aria-label="Workspace navigation"
        aria-hidden={!visible}
        inert={!visible}
      >
        <div className="sidebar-head">
          <button className="brand-button" type="button" aria-label="Start a new chat" onClick={onReset}>
            <NoodoMark label="NOODO" />
          </button>
        </div>

        <div className="sidebar-scroll">
          <nav className="nav-group" aria-label="Primary navigation">
            <button type="button" className="nav-item nav-item-new-chat" aria-label="New chat" onClick={onReset}>
              <Sprout size={17} strokeWidth={1.65} /><span>New chat</span>
            </button>
            {panelViews.map(({ id, label, Icon }) => (
              <button
                type="button"
                key={id}
                className={`nav-item nav-item-${id} ${activePanel === id ? 'active' : ''}`}
                aria-label={label}
                data-tooltip={label}
                aria-pressed={activePanel === id}
                onClick={() => onSelectPanel(id)}
              >
                <Icon size={17} strokeWidth={1.65} /><span>{label}</span>
              </button>
            ))}
          </nav>
          <RecentChats onOpenChat={onOpenRecentChat} />
        </div>

        <div className="sidebar-foot">
          <button type="button" className="profile" aria-label="User Lin Ke" data-tooltip="Lin Ke">
            <span className="avatar">LK</span><span className="profile-name">Lin Ke</span>
          </button>
          {visible && <button type="button" className="icon-button settings" aria-label="Settings"><Settings size={17} strokeWidth={1.6} /></button>}
        </div>
      </aside>
      {visible && (
        <PanelToggleButton
          buttonRef={collapseButtonRef}
          className="icon-button collapse"
          aria-label={expanded ? 'Collapse sidebar' : 'Pin sidebar open'}
          aria-expanded={expanded}
          tooltip="Toggle sidebar"
          onClick={onToggle}
          defaultIcon={<PanelLeft size={17} strokeWidth={1.6} />}
          actionIcon={expanded ? <PanelLeftClose size={17} strokeWidth={1.6} /> : <PanelLeftOpen size={17} strokeWidth={1.6} />}
        />
      )}
      {visible && (
        <ResizeHandle
          className="sidebar-resizer"
          label="Resize sidebar"
          value={width}
          min={MIN_SIDEBAR_WIDTH}
          max={MAX_SIDEBAR_WIDTH}
          active={isResizing}
          widerKey="ArrowRight"
          narrowerKey="ArrowLeft"
          onStart={onStartResize}
          onResizeByKeyboard={onResizeByKeyboard}
        />
      )}
    </div>
  )
}

export interface SidebarToggleProps {
  visible: boolean
  onToggle: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

export function SidebarToggle({ visible, onToggle, buttonRef }: SidebarToggleProps) {
  return (
    <>
      <span className={`left-frame-notch line ${visible ? 'visible' : ''}`} aria-hidden="true" />
      <span className={`left-frame-notch fill ${visible ? 'visible' : ''}`} aria-hidden="true" />
      <PanelToggleButton
        buttonRef={buttonRef}
        className={`left-sidebar-toggle frame-icon-button ${visible ? 'visible' : ''}`}
        aria-label="Open sidebar"
        aria-expanded={false}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        onClick={onToggle}
        tooltip="Toggle sidebar"
        defaultIcon={<NoodoMark glint={false} />}
        actionIcon={<PanelLeftOpen size={18} strokeWidth={1.6} />}
      />
    </>
  )
}
