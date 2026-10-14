import { useCallback, useEffect, useRef, useState, type Ref } from 'react'
import {
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkle,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { NoodoMark } from '../../../shared/components/NoodoMark'
import { PanelToggleButton } from '../../../shared/components/PanelToggleButton'
import { ResizeHandle } from '../../../shared/components/ResizeHandle'
import type { Conversation, User } from '../../assistant/types'
import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH } from '../resize'
import { RecentChats } from './RecentChats'

const SIDEBAR_PREVIEW_DELAY = 90

export interface SidebarProps {
  expanded: boolean
  preview: boolean
  onPreviewChange: (value: boolean) => void
  onToggle: () => void
  onNewChat: () => void
  onOpenRecentChat: (title: string) => void
  onDeleteChat: (id: string) => Promise<boolean>
  deletingIds: string[]
  blockedDeleteIds: string[]
  deleteError?: string
  chats: Conversation[]
  activeConversationId: string | null
  user: User
  busy: boolean
  onLogout: () => void
  isResizing: boolean
  width: number
  onStartResize: () => void
  onResizeByKeyboard: (direction: 'wider' | 'narrower') => void
  collapseButtonRef?: Ref<HTMLButtonElement>
}

export function Sidebar({
  expanded,
  preview,
  onPreviewChange,
  onToggle,
  onNewChat,
  onOpenRecentChat,
  onDeleteChat,
  deletingIds,
  blockedDeleteIds,
  deleteError,
  chats,
  activeConversationId,
  user,
  busy,
  onLogout,
  isResizing,
  width,
  onStartResize,
  onResizeByKeyboard,
  collapseButtonRef,
}: SidebarProps) {
  const visible = expanded || preview
  const [skipEntrance, setSkipEntrance] = useState(visible)
  // A restored sidebar starts at rest. Later openings retain their entrance motion.
  if (skipEntrance && !visible) setSkipEntrance(false)
  const previewTimer = useRef<number | null>(null)
  const clearPreviewTimer = useCallback(() => {
    if (previewTimer.current === null) return
    window.clearTimeout(previewTimer.current)
    previewTimer.current = null
  }, [])
  const startPreview = useCallback(() => {
    if (expanded) return
    clearPreviewTimer()
    previewTimer.current = window.setTimeout(() => {
      previewTimer.current = null
      onPreviewChange(true)
    }, SIDEBAR_PREVIEW_DELAY)
  }, [clearPreviewTimer, expanded, onPreviewChange])
  const stopPreview = useCallback(() => {
    clearPreviewTimer()
    onPreviewChange(false)
  }, [clearPreviewTimer, onPreviewChange])

  useEffect(() => clearPreviewTimer, [clearPreviewTimer])

  return (
    <div
      className={`sidebar-region ${visible ? 'expanded' : ''} ${skipEntrance ? 'skip-entrance' : ''}`}
      onPointerLeave={stopPreview}
    >
      <div
        className="sidebar-activation-rail"
        onPointerEnter={startPreview}
        onPointerLeave={clearPreviewTimer}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${visible ? 'expanded' : ''} ${preview && !expanded ? 'peek' : ''}`}
        aria-label="Workspace navigation"
        aria-hidden={!visible}
        inert={!visible}
      >
        <div className="sidebar-head">
          <button
            className="brand-button"
            type="button"
            aria-label="Start a new chat"
            onClick={onNewChat}
          >
            <NoodoMark label="NOODO" />
          </button>
        </div>

        <div className="sidebar-scroll">
          <nav className="nav-group" aria-label="Primary navigation">
            <button
              type="button"
              className={`nav-item nav-item-new-chat ${activeConversationId === null ? 'active' : ''}`}
              aria-label="New chat"
              aria-current={activeConversationId === null ? 'page' : undefined}
              onClick={onNewChat}
            >
              <span className="new-chat-icon" aria-hidden="true">
                <Sparkle className="new-chat-icon-default" size={17} strokeWidth={1.65} />
                <Sparkles className="new-chat-icon-hover" size={17} strokeWidth={1.65} />
              </span>
              <span>New chat</span>
            </button>
          </nav>
          <RecentChats
            onDeleteChat={onDeleteChat}
            deletingIds={deletingIds}
            blockedDeleteIds={blockedDeleteIds}
            deleteError={deleteError}
            chats={chats}
            activeConversationId={activeConversationId}
            onOpenChat={onOpenRecentChat}
          />
        </div>

        <div className="sidebar-foot">
          <div className="profile">
            <span className="avatar">
              {user.username.slice(0, 2).toUpperCase()}
            </span>
            <span className="profile-name">{user.username}</span>
          </div>
          {visible && (
            <button
              type="button"
              className="icon-button settings"
              disabled={busy}
              aria-label="Sign out"
              onClick={onLogout}
            >
              <LogOut size={17} strokeWidth={1.6} />
            </button>
          )}
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
          defaultIcon={<PanelLeft size={18} strokeWidth={1.6} />}
          actionIcon={
            expanded ? (
              <PanelLeftClose size={18} strokeWidth={1.6} />
            ) : (
              <PanelLeftOpen size={18} strokeWidth={1.6} />
            )
          }
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

export function SidebarToggle({
  visible,
  onToggle,
  buttonRef,
}: SidebarToggleProps) {
  return (
    <>
      <span
        className={`left-frame-notch line ${visible ? 'visible' : ''}`}
        aria-hidden="true"
      />
      <span
        className={`left-frame-notch fill ${visible ? 'visible' : ''}`}
        aria-hidden="true"
      />
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
