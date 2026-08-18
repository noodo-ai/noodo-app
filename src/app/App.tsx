import { useRef, type CSSProperties } from 'react'
import { HomeHero } from '../features/composer/components/HomeHero'
import { ConversationView } from '../features/conversation/components/ConversationView'
import { ExplorationSurface } from '../features/exploration/components/ExplorationSurface'
import { getExploreTransforms } from '../features/exploration/utils'
import { MobileHeader } from '../features/navigation/components/MobileHeader'
import { Sidebar } from '../features/navigation/components/Sidebar'
import { useWorkspaceController } from '../features/workspace/hooks/useWorkspaceController'
import { RightPanel } from '../features/workspace-panel/components/RightPanel'
import { WorkspacePanelControls } from '../features/workspace-panel/components/WorkspacePanelControls'

export default function App() {
  const shellRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const { sidebar, panel, composer, conversation, exploration } = useWorkspaceController()
  const transforms = getExploreTransforms(exploration.progress)
  const appShellWidth = () => shellRef.current?.clientWidth

  const workspaceStyle = {
    '--drawer-shift': `${transforms.drawerShift}px`,
    '--hero-shift': `${transforms.heroShift}px`,
    '--right-panel-width': `${panel.width}px`,
  } as CSSProperties

  return (
    <div className="app-shell" ref={shellRef}>
      <Sidebar
        expanded={sidebar.expanded}
        preview={sidebar.preview}
        onPreviewChange={sidebar.setPreview}
        onToggle={sidebar.toggle}
        onReset={conversation.reset}
        activePanel={panel.open ? panel.view : null}
        onSelectPanel={(view) => panel.select(view, appShellWidth())}
      />
      <main
        ref={workspaceRef}
        className={`workspace ${sidebar.expanded || sidebar.preview ? 'sidebar-open' : ''} ${panel.open ? 'right-panel-open' : ''} ${panel.isResizing ? 'resizing-panel' : ''} ${conversation.hasMessages ? 'conversation' : ''}`}
        style={workspaceStyle}
      >
        <section className="content-surface" onWheel={exploration.handleWheel} onScroll={(event) => {
          if (event.currentTarget.scrollTop) event.currentTarget.scrollTop = 0
        }}>
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
            <>
              <HomeHero
                input={composer.input}
                mode={composer.mode}
                focusRequest={composer.focusRequest}
                onInputChange={composer.setInput}
                onModeChange={composer.setMode}
                onSubmit={composer.submit}
                onPickPrompt={composer.pickPrompt}
              />
              <ExplorationSurface progress={exploration.progress} setProgress={exploration.setProgress} onPick={composer.pickPrompt} />
            </>
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
