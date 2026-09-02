import { useRef, type CSSProperties } from 'react'
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
  const { sidebar, panel, composer, conversation } = useWorkspaceController()
  const appShellWidth = () => shellRef.current?.clientWidth

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
        onToggle={sidebar.toggle}
        onReset={conversation.reset}
        activePanel={panel.open ? panel.view : null}
        onSelectPanel={(view) => panel.select(view, appShellWidth())}
        isResizing={sidebar.isResizing}
        onStartResize={sidebar.startResizing}
        onResizeByKeyboard={sidebar.resizeByKeyboard}
      />
      <main
        ref={workspaceRef}
        className={`workspace ${sidebar.expanded || sidebar.preview ? 'sidebar-open' : ''} ${panel.open ? 'right-panel-open' : ''} ${panel.isResizing ? 'resizing-panel' : ''} ${conversation.hasMessages ? 'conversation' : ''}`}
        style={workspaceStyle}
      >
        <SidebarToggle visible={!sidebar.expanded && !sidebar.preview} onToggle={sidebar.toggle} />
        <section className="content-surface">
          <MobileHeader onOpenNavigation={() => sidebar.setExpanded(true)} onReset={conversation.reset} />
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
              onOpenFarm={() => panel.select('farm', appShellWidth())}
            />
          )}
        </section>

        <WorkspacePanelControls
          open={panel.open}
          onOpen={() => panel.openPanel(appShellWidth())}
          onStartResize={panel.startResizing}
          onResizeByKeyboard={(direction) => panel.resizeByKeyboard(direction, workspaceRef.current?.getBoundingClientRect().width ?? 706)}
        />
        <RightPanel open={panel.open} activeView={panel.view} onSelect={(view) => panel.select(view, appShellWidth())} onClose={panel.close} hasTask={conversation.hasMessages} />
      </main>
    </div>
  )
}
