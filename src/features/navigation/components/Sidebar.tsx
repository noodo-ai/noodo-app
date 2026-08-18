import { PanelLeft, PanelLeftClose, PanelLeftOpen, Plus, Settings } from 'lucide-react'
import { NoodoMark } from '../../../shared/components/NoodoMark'
import { panelViews } from '../../workspace-panel/data'
import type { RightPanelView } from '../../workspace-panel/types'

export interface SidebarProps {
  expanded: boolean
  preview: boolean
  onPreviewChange: (value: boolean) => void
  onToggle: () => void
  onReset: () => void
  activePanel: RightPanelView | null
  onSelectPanel: (panel: RightPanelView) => void
}

export function Sidebar({ expanded, preview, onPreviewChange, onToggle, onReset, activePanel, onSelectPanel }: SidebarProps) {
  const visible = expanded || preview

  return (
    <aside
      className={`sidebar ${visible ? 'expanded' : ''} ${preview && !expanded ? 'peek' : ''}`}
      onMouseEnter={() => !expanded && onPreviewChange(true)}
      onMouseLeave={() => onPreviewChange(false)}
      aria-label="Workspace navigation"
    >
      <div className="sidebar-head">
        <button className="brand-button" type="button" aria-label="Start a new chat" onClick={onReset}>
          <NoodoMark label="NOODO" />
        </button>
        {visible && (
          <button className="icon-button collapse" type="button" aria-label={expanded ? 'Collapse sidebar' : 'Pin sidebar open'} onClick={onToggle}>
            <span className="panel-icon panel-icon-default"><PanelLeft size={18} strokeWidth={1.6} /></span>
            <span className="panel-icon panel-icon-action">
              {expanded ? <PanelLeftClose size={18} strokeWidth={1.6} /> : <PanelLeftOpen size={18} strokeWidth={1.6} />}
            </span>
          </button>
        )}
      </div>

      <div className="sidebar-scroll">
        <button type="button" className="new-chat" aria-label="New chat" onClick={onReset} data-tooltip="New chat">
          <Plus size={18} strokeWidth={1.7} /><span>New chat</span><kbd>⌘ K</kbd>
        </button>
        <nav className="nav-group" aria-label="Primary navigation">
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
              <Icon size={18} strokeWidth={1.65} /><span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-foot">
        <button type="button" className="profile" aria-label="User Lin Ke" data-tooltip="Lin Ke">
          <span className="avatar">LK</span><span className="profile-name">Lin Ke</span>
        </button>
        {visible && <button type="button" className="icon-button settings" aria-label="Settings"><Settings size={18} strokeWidth={1.6} /></button>}
      </div>
    </aside>
  )
}
