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
function Workspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const shellRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const sidebarToggleRef = useRef<HTMLButtonElement>(null),
    sidebarCollapseRef = useRef<HTMLButtonElement>(null),
    mobileNavigationRef = useRef<HTMLButtonElement>(null),
    panelToggleRef = useRef<HTMLButtonElement>(null),
    panelCloseRef = useRef<HTMLButtonElement>(null)
  const { sidebar, panel, composer } = useWorkspaceController(),
    chat = useAssistant(user.id)
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
    value: composer.input,
    onChange: composer.setInput,
    onSubmit: () => {
      void chat.send(composer.input).then((sent) => {
        if (sent) composer.setInput('')
      })
    },
    mode: composer.mode,
    onModeChange: composer.setMode,
    disabled: !!chat.pending || chat.loading,
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
        onReset={() => {
          chat.reset()
          composer.setInput('')
        }}
        onOpenRecentChat={(id) => {
          void chat.open(id)
        }}
        chats={chat.conversations}
        user={user}
        busy={chat.busy || !!chat.pending || chat.loading}
        onLogout={onLogout}
        activePanel={panel.open ? panel.view : null}
        onSelectPanel={(view) => panel.select(view, appShellWidth())}
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
          <div className="assistant-toolbar">
            <button
              className="text-action mobile-signout"
              disabled={chat.busy}
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
          {chat.error && (
            <div className="assistant-error" role="alert">
              <span>{chat.error}</span>
              {chat.pending ? (
                <button
                  className="text-action"
                  disabled={chat.busy}
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
          {chat.loading && (
            <p className="scope-note" role="status">
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
          ) : (
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
          onSelect={(view) => panel.select(view, appShellWidth())}
          onClose={closePanel}
        />
      </main>
    </div>
  )
}
export default function App() {
  const auth = useAuth()
  return auth.user ? (
    <>
      <Workspace
        key={auth.user.id}
        user={auth.user}
        onLogout={() => {
          void auth.logout()
        }}
      />
      {auth.error && (
        <div className="logout-error" role="alert">
          {auth.error}
        </div>
      )}
    </>
  ) : (
    <Login loading={auth.loading} error={auth.error} onLogin={auth.login} />
  )
}
