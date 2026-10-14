import { useRef, type CSSProperties, type RefObject } from 'react'
import { HomeHero } from '../features/composer/components/HomeHero'
import { Composer } from '../features/composer/components/Composer'
import { ConversationView } from '../features/conversation/components/ConversationView'
import { MobileHeader } from '../features/navigation/components/MobileHeader'
import {
  Sidebar,
  SidebarToggle,
} from '../features/navigation/components/Sidebar'
import { useWorkspaceController } from '../features/workspace/hooks/useWorkspaceController'
import { RightPanel } from '../features/workspace-panel/components/RightPanel'
import { WorkspacePanelControls } from '../features/workspace-panel/components/WorkspacePanelControls'
import { useAssistant } from '../features/assistant/hooks/useAssistant'
import { useAuth } from '../features/assistant/hooks/useAuth'
import { Login } from '../features/assistant/components/Login'
import type { User } from '../features/assistant/types'
import { ToastRegion } from '../shared/components/Toast'
function Workspace({ user, onLogout, authError }: { user: User; onLogout: () => void; authError: string }) {
  const shellRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const sidebarToggleRef = useRef<HTMLButtonElement>(null),
    sidebarCollapseRef = useRef<HTMLButtonElement>(null),
    mobileNavigationRef = useRef<HTMLButtonElement>(null),
    panelToggleRef = useRef<HTMLButtonElement>(null),
    panelCloseRef = useRef<HTMLButtonElement>(null)
  const { sidebar, panel, composer } = useWorkspaceController(),
    chat = useAssistant(user.id)
  const showConversationLoading = chat.loading && !chat.messages.length
  const appShellWidth = () => shellRef.current?.clientWidth
  const focus = (target: RefObject<HTMLButtonElement | null>) =>
    window.requestAnimationFrame(() => target.current?.focus())
  const toggleSidebar = () => {
    const expanding = !sidebar.expanded
    sidebar.toggle()
    focus(
      expanding
        ? sidebarCollapseRef
        : window.innerWidth <= 900
          ? mobileNavigationRef
          : sidebarToggleRef,
    )
  }
  const openPanel = () => {
    panel.openPanel(appShellWidth())
    focus(panelCloseRef)
  }
  const closePanel = () => {
    panel.close()
    focus(panelToggleRef)
  }
  const workspaceStyle = {
    '--right-panel-width': `${panel.width}px`,
  } as CSSProperties
  const style = {
    '--sidebar-width': `${sidebar.width}px`,
    '--sidebar-gutter': `${sidebar.width + 6}px`,
  } as CSSProperties
  const composerProps = {
    value: chat.input,
    onChange: chat.setInput,
    onSubmit: () => {
      void chat.send(chat.input)
    },
    mode: composer.mode,
    onModeChange: composer.setMode,
    disabled: !!chat.pending || chat.loading || chat.creating,
    busy: chat.busy,
    onCancel: chat.cancel,
  }
  return (
    <div
      className={`app-shell ${sidebar.isResizing ? 'resizing-sidebar' : ''}`}
      ref={shellRef}
      style={style}
    >
      <Sidebar
        expanded={sidebar.expanded}
        preview={sidebar.preview}
        onPreviewChange={sidebar.setPreview}
        onToggle={toggleSidebar}
        onNewChat={chat.newChat}
        onOpenRecentChat={(id) => {
          void chat.open(id)
        }}
        onDeleteChat={chat.deleteConversation}
        deletingIds={chat.deletingIds}
        blockedDeleteIds={chat.blockedDeleteIds}
        deleteError={chat.deleteError}
        chats={chat.conversations}
        activeConversationId={chat.selectedId}
        user={user}
        busy={chat.executionBusy || !!chat.pending || chat.loading}
        onLogout={onLogout}
        isResizing={sidebar.isResizing}
        width={sidebar.width}
        onStartResize={sidebar.startResizing}
        onResizeByKeyboard={sidebar.resizeByKeyboard}
        collapseButtonRef={sidebarCollapseRef}
      />
      {sidebar.expanded && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={toggleSidebar}
        />
      )}
      <main
        ref={workspaceRef}
        className={`workspace ${sidebar.expanded || sidebar.preview ? 'sidebar-open' : ''} ${panel.open ? 'right-panel-open' : ''} ${panel.isResizing ? 'resizing-panel' : ''} ${chat.messages.length ? 'conversation' : ''}`}
        style={workspaceStyle}
      >
        <SidebarToggle
          buttonRef={sidebarToggleRef}
          visible={!sidebar.expanded && !sidebar.preview}
          onToggle={toggleSidebar}
        />
        <section className="content-surface assistant-surface">
          <MobileHeader
            navigationButtonRef={mobileNavigationRef}
            onOpenNavigation={() => {
              sidebar.setExpanded(true)
              focus(sidebarCollapseRef)
            }}
          />
          {(chat.error || (chat.pending && !chat.busy)) && (
            <div className="assistant-error" role="status">
              <span>{chat.pending ? 'A saved request needs recovery before you can send another message.' : 'The request could not be completed. Try again.'}</span>
              {chat.pending ? (
                <button
                  className="text-action"
                  disabled={chat.busy || chat.loading}
                  onClick={chat.recover}
                >
                  Recover saved request
                </button>
              ) : chat.messages.length > 0 ? (
                <button
                  className="text-action"
                  disabled={chat.busy || chat.loading}
                  onClick={chat.retry}
                >
                  Retry as new request
                </button>
              ) : null}
            </div>
          )}
          {chat.creating && (
            <p className="scope-note" role="status">Creating conversation…</p>
          )}
          {showConversationLoading && (
            <p className="conversation-loading" role="status">
              Loading conversation…
            </p>
          )}
          {chat.messages.length ? (
            <section className="chat-view assistant-chat">
              <ConversationView
                messages={chat.messages}
                tools={chat.tools}
                busy={chat.busy}
                hasOlder={!!chat.cursor}
                loading={chat.loading}
                onLoadOlder={() => {
                  void chat.loadOlder()
                }}
              />
              <div className="chat-composer">
                <Composer compact {...composerProps} />
              </div>
            </section>
          ) : !chat.loading && (
            <HomeHero {...composerProps} />
          )}
        </section>
        <WorkspacePanelControls
          open={panel.open}
          width={panel.width}
          isResizing={panel.isResizing}
          onOpen={openPanel}
          onStartResize={panel.startResizing}
          onResizeByKeyboard={(direction) =>
            panel.resizeByKeyboard(
              direction,
              workspaceRef.current?.getBoundingClientRect().width ?? 706,
            )
          }
          toggleButtonRef={panelToggleRef}
        />
        <RightPanel
          closeButtonRef={panelCloseRef}
          open={panel.open}
          activeView={panel.view}
          onBack={panel.showOverview}
          onSelect={(view) => panel.select(view, appShellWidth())}
          onClose={closePanel}
        />
      </main>
      <ToastRegion messages={[
        { id: 'auth', message: authError },
        { id: 'list', message: chat.listError ? `Recent chats unavailable: ${chat.listError}` : '' },
        { id: 'delete', message: chat.deleteError },
        ...chat.errorNotifications,
      ]} />
    </div>
  )
}
export default function App() {
  const auth = useAuth()
  if (auth.initializing) return null
  return auth.user ? (
    <>
      <Workspace
        key={auth.user.id}
        user={auth.user}
        authError={auth.error}
        onLogout={() => {
          void auth.logout()
        }}
      />
    </>
  ) : (
    <>
      <Login loading={auth.loading} onLogin={auth.login} />
      <ToastRegion messages={[{ id: 'auth', message: auth.error }]} />
    </>
  )
}
