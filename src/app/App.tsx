import { useRef, type CSSProperties, type RefObject } from 'react'
import { HomeHero } from '../features/composer/components/HomeHero'
import { ConversationView } from '../features/conversation/components/ConversationView'
import { MobileHeader } from '../features/navigation/components/MobileHeader'
import { Sidebar, SidebarToggle } from '../features/navigation/components/Sidebar'
import { useWorkspaceController } from '../features/workspace/hooks/useWorkspaceController'
import { RightPanel } from '../features/workspace-panel/components/RightPanel'
import { WorkspacePanelControls } from '../features/workspace-panel/components/WorkspacePanelControls'

export default function App() {
  const shellRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const sidebarToggleRef = useRef<HTMLButtonElement>(null)
  const sidebarCollapseRef = useRef<HTMLButtonElement>(null)
  const mobileNavigationRef = useRef<HTMLButtonElement>(null)
  const panelToggleRef = useRef<HTMLButtonElement>(null)
  const panelCloseRef = useRef<HTMLButtonElement>(null)
  const { sidebar, panel, composer, conversation } = useWorkspaceController()
  const appShellWidth = () => shellRef.current?.clientWidth
  const focusAfterTransition = (target: RefObject<HTMLButtonElement | null>) => {
    window.requestAnimationFrame(() => target.current?.focus())
  }

  const toggleSidebar = () => {
    const willExpand = !sidebar.expanded
    sidebar.toggle()
    focusAfterTransition(willExpand ? sidebarCollapseRef : window.innerWidth <= 900 ? mobileNavigationRef : sidebarToggleRef)
  }

  const openPanel = () => {
    panel.openPanel(appShellWidth())
    focusAfterTransition(panelCloseRef)
  }

  const closePanel = () => {
    panel.close()
    focusAfterTransition(panelToggleRef)
  }

  const workspaceStyle = {
    '--right-panel-width': `${panel.width}px`,
  } as CSSProperties

  const appShellStyle = {
    '--sidebar-width': `${sidebar.width}px`,
    '--sidebar-gutter': `${sidebar.width + 6}px`,
  } as CSSProperties

  return (
    <div className={`app-shell ${sidebar.isResizing ? 'resizing-sidebar' : ''}`} ref={shellRef} style={appShellStyle}>
      <Sidebar
        expanded={sidebar.expanded}
        preview={sidebar.preview}
        onPreviewChange={sidebar.setPreview}
        onToggle={toggleSidebar}
        onReset={conversation.reset}
        onOpenRecentChat={conversation.openMock}
        activePanel={panel.open ? panel.view : null}
        onSelectPanel={(view) => panel.select(view, appShellWidth())}
        isResizing={sidebar.isResizing}
        width={sidebar.width}
        onStartResize={sidebar.startResizing}
        onResizeByKeyboard={sidebar.resizeByKeyboard}
        collapseButtonRef={sidebarCollapseRef}
      />
      <main
        ref={workspaceRef}
        className={`workspace ${sidebar.expanded || sidebar.preview ? 'sidebar-open' : ''} ${panel.open ? 'right-panel-open' : ''} ${panel.isResizing ? 'resizing-panel' : ''} ${conversation.hasMessages ? 'conversation' : ''}`}
        style={workspaceStyle}
      >
        <SidebarToggle buttonRef={sidebarToggleRef} visible={!sidebar.expanded && !sidebar.preview} onToggle={toggleSidebar} />
        <section className="content-surface">
          <MobileHeader
            navigationButtonRef={mobileNavigationRef}
            onOpenNavigation={() => {
              sidebar.setExpanded(true)
              focusAfterTransition(sidebarCollapseRef)
            }}
            onReset={conversation.reset}
          />
          {conversation.hasMessages ? (
            <ConversationView
              messages={conversation.messages}
              input={composer.input}
              mode={composer.mode}
              onInputChange={composer.setInput}
              onModeChange={composer.setMode}
              onSubmit={composer.submit}
              onReset={conversation.reset}
            />
          ) : (
            <HomeHero
              input={composer.input}
              mode={composer.mode}
              onInputChange={composer.setInput}
              onModeChange={composer.setMode}
              onSubmit={composer.submit}
              onOpenCapability={(capability) => panel.select(capability, appShellWidth())}
            />
          )}
        </section>

        <WorkspacePanelControls
          open={panel.open}
          width={panel.width}
          isResizing={panel.isResizing}
          onOpen={openPanel}
          onStartResize={panel.startResizing}
          onResizeByKeyboard={(direction) => panel.resizeByKeyboard(direction, workspaceRef.current?.getBoundingClientRect().width ?? 706)}
          toggleButtonRef={panelToggleRef}
        />
        <RightPanel closeButtonRef={panelCloseRef} open={panel.open} activeView={panel.view} onSelect={(view) => panel.select(view, appShellWidth())} onClose={closePanel} />
      </main>
    </div>
  )
}
