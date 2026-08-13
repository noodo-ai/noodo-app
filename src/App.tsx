import { CSSProperties, FormEvent, PointerEvent, WheelEvent, useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  Clock3,
  CodeXml,
  FileText,
  FolderKanban,
  Globe2,
  Lightbulb,
  LineSquiggle,
  MonitorUp,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Presentation,
  Search,
  Settings,
  Sheet,
  Sparkles,
  WandSparkles,
  Workflow,
  X,
} from 'lucide-react'

type IconType = typeof Sparkles
type Mode = 'Quick Run' | 'Deep Think' | 'Create'

const mainNav: Array<[string, IconType]> = [
  ['My Space', BriefcaseBusiness],
  ['Automations', Clock3],
  ['Knowledge', BookOpen],
  ['Workflows', Workflow],
]

const tools: Array<[string, IconType]> = [
  ['Slides', Presentation],
  ['Data Analysis', BarChart3],
  ['Deep Research', Search],
  ['Documents', FileText],
  ['Web Extract', Globe2],
  ['Sheets', Sheet],
  ['UI Design', MonitorUp],
]

const capabilities: Array<[string, IconType, string]> = [
  ['Slides', Presentation, 'Create an eight-slide outline for next week’s product review'],
  ['Analyze', BarChart3, 'Analyze this dataset and identify key trends and anomalies'],
  ['Research', Search, 'Research the 2026 AI productivity market and deliver a structured brief'],
  ['Document', FileText, 'Turn this long document into clear summaries and action items'],
  ['Web', Globe2, 'Extract the key information from this webpage into a readable list'],
  ['Sheet', Sheet, 'Create an actionable project tracker based on my requirements'],
  ['Design', WandSparkles, 'Design a calm and focused mobile product homepage'],
]

const inspirations: Array<[string, string, IconType]> = [
  ['Plan a product launch', 'Build a complete plan from positioning to channels and timeline', Sparkles],
  ['Turn meeting notes into actions', 'Identify owners, priorities, and due dates', Check],
  ['Research competitor pricing', 'Compare plans, prices, and key differentiators', BarChart3],
  ['Create a weekly update', 'Summarize this week’s progress in a concise report', FileText],
  ['Extract insights from a webpage', 'Capture key facts and organize them by topic', Globe2],
  ['Design a mobile homepage', 'Define the information hierarchy and key interactions', MonitorUp],
]

function NoodoMark() {
  return <LineSquiggle className="noodo-mark" strokeWidth={1.65} aria-hidden="true" />
}

function NavItem({ label, Icon }: { label: string; Icon: IconType }) {
  return (
    <button className="nav-item" aria-label={label} data-tooltip={label}>
      <Icon size={18} strokeWidth={1.65} />
      <span>{label}</span>
    </button>
  )
}

function Sidebar({ expanded, preview, onPreviewChange, onToggle, onReset }: {
  expanded: boolean
  preview: boolean
  onPreviewChange: (value: boolean) => void
  onToggle: () => void
  onReset: () => void
}) {
  const visible = expanded || preview

  return (
    <aside
      className={`sidebar ${visible ? 'expanded' : ''} ${preview && !expanded ? 'peek' : ''}`}
      onMouseEnter={() => !expanded && onPreviewChange(true)}
      onMouseLeave={() => onPreviewChange(false)}
    >
      <div className="sidebar-head">
        <div className="brand-button" aria-label="Noodo">
          <NoodoMark />
          <span>NOODO</span>
        </div>
        {visible && (
          <button
            className="icon-button collapse"
            aria-label={expanded ? 'Collapse sidebar' : 'Pin sidebar open'}
            onClick={onToggle}
          >
            <span className="panel-icon panel-icon-default"><PanelLeft size={18} strokeWidth={1.6} /></span>
            <span className="panel-icon panel-icon-action">
              {expanded ? <PanelLeftClose size={18} strokeWidth={1.6} /> : <PanelLeftOpen size={18} strokeWidth={1.6} />}
            </span>
          </button>
        )}
      </div>

      <div className="sidebar-scroll">
        <button className="new-chat" aria-label="New chat" onClick={onReset} data-tooltip="New chat">
          <Plus size={18} strokeWidth={1.7} />
          <span>New chat</span><kbd>⌘ K</kbd>
        </button>

        <nav className="nav-group" aria-label="Primary navigation">
          {mainNav.map(([label, Icon]) => <NavItem key={label} label={label} Icon={Icon} />)}
        </nav>

        <nav className="nav-group tools" aria-label="Tools">
          {tools.map(([label, Icon]) => <NavItem key={label} label={label} Icon={Icon} />)}
        </nav>
      </div>

      <div className="sidebar-foot">
        <button className="profile" aria-label="User Lin Ke" data-tooltip="Lin Ke">
          <span className="avatar">LK</span>
          <span className="profile-name">Lin Ke</span>
        </button>
        {visible && (
          <button className="icon-button settings" aria-label="Settings">
            <Settings size={18} strokeWidth={1.6} />
          </button>
        )}
      </div>
    </aside>
  )
}

function Composer({ value, onChange, onSubmit, mode, setMode, compact = false }: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  mode: Mode
  setMode: (mode: Mode) => void
  compact?: boolean
}) {
  const [modeOpen, setModeOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (value.trim()) onSubmit()
  }

  return (
    <form className={`composer ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
        placeholder="Ask anything, or create a task…"
        rows={2}
        aria-label="Task input"
      />
      <div className="composer-actions">
        <button type="button" className="composer-tool" aria-label="Add attachment"><Plus size={20} strokeWidth={1.6} /></button>
        <div className="composer-right">
          <div
            className="mode-wrap"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setModeOpen(false)
            }}
          >
            <button type="button" className="mode-button" onClick={() => setModeOpen((open) => !open)} aria-expanded={modeOpen}>
              {mode}<ChevronDown size={14} />
            </button>
            {modeOpen && (
              <div className="mode-menu">
                {(['Quick Run', 'Deep Think', 'Create'] as Mode[]).map((item) => (
                  <button type="button" key={item} onClick={() => { setMode(item); setModeOpen(false) }}>
                    <span>{item}</span>{item === mode && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="send-button" disabled={!value.trim()} aria-label="Send task" type="submit"><ArrowUp size={19} strokeWidth={2} /></button>
        </div>
      </div>
    </form>
  )
}

const EXPLORE_STAGE_ONE = 130
const EXPLORE_MAX = 780

function InspirationDrawer({ progress, setProgress, onPick }: { progress: number; setProgress: (value: number) => void; onPick: (text: string) => void }) {
  const dragStart = useRef<number | null>(null)
  const onPointerDown = (event: PointerEvent) => { dragStart.current = event.clientY }
  const onPointerUp = (event: PointerEvent) => {
    if (dragStart.current === null) return
    const delta = event.clientY - dragStart.current
    if (delta < -24) setProgress(EXPLORE_STAGE_ONE)
    if (delta > 24) setProgress(0)
    dragStart.current = null
  }

  const expanded = progress > 80

  return (
    <section className={`inspiration-drawer ${expanded ? 'open' : ''}`} aria-label="Explore ideas">
      <button className="drawer-handle" onClick={() => setProgress(expanded ? 0 : EXPLORE_STAGE_ONE)} onPointerDown={onPointerDown} onPointerUp={onPointerUp} aria-expanded={expanded}>
        <span><Lightbulb size={17} strokeWidth={1.65} />Explore ideas</span>
        <span className="drawer-hint">{expanded ? 'Collapse' : 'Scroll to explore'}{expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</span>
      </button>
      <div className="inspiration-grid">
        {inspirations.map(([title, description, Icon]) => (
          <button key={title} onClick={() => onPick(title)}>
            <span className="inspiration-preview">
              <Icon size={28} strokeWidth={1.35} />
              <span className="preview-lines"><i /><i /><i /></span>
            </span>
            <span className="inspiration-copy"><strong>{title}</strong><small>{description}</small></span>
          </button>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarPreview, setSidebarPreview] = useState(false)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('Quick Run')
  const [exploreProgress, setExploreProgress] = useState(0)
  const [messages, setMessages] = useState<string[]>([])

  const stageTwoProgress = Math.max(0, exploreProgress - EXPLORE_STAGE_ONE)
  const workspaceStyle = {
    '--drawer-shift': `-${Math.min(exploreProgress, EXPLORE_STAGE_ONE) + stageTwoProgress}px`,
    '--hero-shift': `${stageTwoProgress}px`,
  } as CSSProperties

  const handleExploreWheel = (event: WheelEvent<HTMLElement>) => {
    if (messages.length || !event.deltaY) return
    setExploreProgress((current) => Math.max(0, Math.min(EXPLORE_MAX, current + event.deltaY)))
  }

  const submit = () => {
    const message = input.trim()
    if (!message) return
    setMessages((current) => [...current, message])
    setInput('')
    setExploreProgress(0)
  }

  const reset = () => {
    setMessages([])
    setInput('')
    setExploreProgress(0)
  }

  const pickPrompt = (prompt: string) => {
    setInput(prompt)
    setExploreProgress(0)
    window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(), 0)
  }

  return (
    <div className="app-shell">
      <Sidebar
        expanded={sidebarExpanded}
        preview={sidebarPreview}
        onPreviewChange={setSidebarPreview}
        onToggle={() => {
          setSidebarExpanded(!sidebarExpanded)
          setSidebarPreview(false)
        }}
        onReset={reset}
      />
      <main
        className={`workspace ${sidebarExpanded || sidebarPreview ? 'sidebar-open' : ''} ${messages.length ? 'conversation' : ''}`}
        style={workspaceStyle}
        onWheel={handleExploreWheel}
        onScroll={(event) => {
          if (event.currentTarget.scrollTop) event.currentTarget.scrollTop = 0
        }}
      >
        <div className="mobile-head">
          <button className="brand-button" onClick={() => setSidebarExpanded(true)} aria-label="Open navigation"><NoodoMark /></button>
          <span>NOODO</span>
          <button className="icon-button" onClick={reset} aria-label="New chat"><Plus size={18} /></button>
        </div>

        {messages.length === 0 ? (
          <section className="hero">
            <div className="wordmark">NOODO</div>
            <Composer value={input} onChange={setInput} onSubmit={submit} mode={mode} setMode={setMode} />
            <div className="capabilities" aria-label="Quick actions">
              {capabilities.map(([label, Icon, prompt]) => (
                <button key={label} onClick={() => pickPrompt(prompt)}>
                  <Icon size={16} strokeWidth={1.55} />{label}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="chat-view">
            <header className="chat-header">
              <div><span className="status-dot" />Workspace session</div>
              <button onClick={reset}><X size={15} />End</button>
            </header>
            <div className="messages">
              {messages.map((message, index) => (
                <div className="message-pair" key={`${message}-${index}`}>
                  <div className="user-message"><span>{message}</span><CircleUserRound size={20} /></div>
                  <div className="assistant-message">
                    <span className="assistant-mark"><NoodoMark /></span>
                    <div>
                      <strong>Task received</strong>
                      <p>I’ll break this down in {mode} mode and present the result here.</p>
                      <div className="mock-progress"><span /><span /><span /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-composer"><Composer compact value={input} onChange={setInput} onSubmit={submit} mode={mode} setMode={setMode} /></div>
          </section>
        )}

        {!messages.length && (
          <>
            <footer
              className={exploreProgress > 0 ? 'hidden' : ''}
            >© 2026 Noodo Labs <span>·</span> Privacy <span>·</span> Terms</footer>
            <InspirationDrawer progress={exploreProgress} setProgress={setExploreProgress} onPick={pickPrompt} />
            <button
              className={`back-to-top ${exploreProgress > EXPLORE_STAGE_ONE + 50 ? 'visible' : ''}`}
              onClick={() => setExploreProgress(0)}
              aria-label="Back to top"
            >
              <ArrowUp size={17} strokeWidth={1.8} />Back to top
            </button>
          </>
        )}

      </main>
    </div>
  )
}

export default App
