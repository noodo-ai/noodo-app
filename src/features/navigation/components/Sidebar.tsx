import { useState } from 'react'
import { PanelLeft, PanelLeftClose, PanelLeftOpen, Shovel, Sprout, Settings } from 'lucide-react'
import { NoodoMark } from '../../../shared/components/NoodoMark'
import { panelViews } from '../../workspace-panel/data'
import type { RightPanelView } from '../../workspace-panel/types'

const initialRecentChats = [
  'Plan a focused product launch',
  'Review the agent workflow',
]

export interface SidebarProps {
  expanded: boolean
  preview: boolean
  onPreviewChange: (value: boolean) => void
  onToggle: () => void
  onReset: () => void
  activePanel: RightPanelView | null
  onSelectPanel: (panel: RightPanelView) => void
  isResizing: boolean
  onStartResize: () => void
  onResizeByKeyboard: (direction: 'wider' | 'narrower') => void
}

export function Sidebar({ expanded, preview, onPreviewChange, onToggle, onReset, activePanel, onSelectPanel, isResizing, onStartResize, onResizeByKeyboard }: SidebarProps) {
  const visible = expanded || preview
  const [recentChats, setRecentChats] = useState(initialRecentChats)

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
          <section className="recent-chats" aria-labelledby="recent-chats-heading">
            <h2 id="recent-chats-heading">Recent</h2>
            {recentChats.map((chat) => (
              <div className="recent-chat-row" key={chat}>
                <button className="recent-chat-open" type="button" title={chat} onClick={onReset}>
                  <span>{chat}</span>
                </button>
                <button
                  className="recent-chat-delete"
                  type="button"
                  aria-label={`Delete chat: ${chat}`}
                  title="Delete chat"
                  onClick={() => setRecentChats((chats) => chats.filter((item) => item !== chat))}
                >
                  <Shovel size={14} strokeWidth={1.65} />
                </button>
              </div>
            ))}
          </section>
        </div>

        <div className="sidebar-foot">
          <button type="button" className="profile" aria-label="User Lin Ke" data-tooltip="Lin Ke">
            <span className="avatar">LK</span><span className="profile-name">Lin Ke</span>
          </button>
          {visible && <button type="button" className="icon-button settings" aria-label="Settings"><Settings size={17} strokeWidth={1.6} /></button>}
        </div>
      </aside>
      {visible && (
        <button className="icon-button collapse panel-control-tooltip" type="button" aria-label={expanded ? 'Collapse sidebar' : 'Pin sidebar open'} data-tooltip="Toggle sidebar" onClick={onToggle}>
          <span className="panel-icon panel-icon-default"><PanelLeft size={17} strokeWidth={1.6} /></span>
          <span className="panel-icon panel-icon-action">
            {expanded ? <PanelLeftClose size={17} strokeWidth={1.6} /> : <PanelLeftOpen size={17} strokeWidth={1.6} />}
          </span>
        </button>
      )}
      {visible && (
        <button
          type="button"
          className={`sidebar-resizer ${isResizing ? 'active' : ''}`}
          aria-label="Resize sidebar"
          title="Drag or use arrow keys to resize"
          onPointerDown={(event) => { event.preventDefault(); onStartResize() }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') onResizeByKeyboard('wider')
            if (event.key === 'ArrowLeft') onResizeByKeyboard('narrower')
          }}
        >
          <span />
        </button>
      )}
    </div>
  )
}

export interface SidebarToggleProps {
  visible: boolean
  onToggle: () => void
}

export function SidebarToggle({ visible, onToggle }: SidebarToggleProps) {
  return (
    <>
      <span className={`left-frame-notch line ${visible ? 'visible' : ''}`} aria-hidden="true" />
      <span className={`left-frame-notch fill ${visible ? 'visible' : ''}`} aria-hidden="true" />
      <button
        type="button"
        className={`left-sidebar-toggle frame-icon-button panel-control-tooltip ${visible ? 'visible' : ''}`}
        aria-label="Open sidebar"
        data-tooltip="Toggle sidebar"
        aria-expanded={false}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        onClick={onToggle}
      >
        <span className="panel-icon panel-icon-default"><NoodoMark glint={false} /></span>
        <span className="panel-icon panel-icon-action"><PanelLeftOpen size={18} strokeWidth={1.6} /></span>
      </button>
    </>
  )
}
