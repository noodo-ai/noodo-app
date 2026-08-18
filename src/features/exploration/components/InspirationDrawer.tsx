import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { EXPLORE_STAGE_ONE } from '../constants'
import { inspirations } from '../data'

export interface InspirationDrawerProps {
  progress: number
  setProgress: (value: number) => void
  onPick: (text: string) => void
}

export function InspirationDrawer({ progress, setProgress, onPick }: InspirationDrawerProps) {
  const dragStart = useRef<number | null>(null)
  const expanded = progress > 80

  const onPointerUp = (event: PointerEvent) => {
    if (dragStart.current === null) return
    const delta = event.clientY - dragStart.current
    if (delta < -24) setProgress(EXPLORE_STAGE_ONE)
    if (delta > 24) setProgress(0)
    dragStart.current = null
  }

  return (
    <section className={`inspiration-drawer ${expanded ? 'open' : ''}`} aria-label="Explore ideas">
      <button
        type="button"
        className="drawer-handle"
        onClick={() => setProgress(expanded ? 0 : EXPLORE_STAGE_ONE)}
        onPointerDown={(event) => { dragStart.current = event.clientY }}
        onPointerUp={onPointerUp}
        aria-expanded={expanded}
      >
        <span><Lightbulb size={17} strokeWidth={1.65} />Explore ideas</span>
        <span className="drawer-hint">{expanded ? 'Collapse' : 'Scroll to explore'}{expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</span>
      </button>
      <div className="inspiration-grid">
        {inspirations.map(({ title, description, Icon }) => (
          <button type="button" key={title} onClick={() => onPick(title)}>
            <span className="inspiration-preview"><Icon size={28} strokeWidth={1.35} /><span className="preview-lines"><i /><i /><i /></span></span>
            <span className="inspiration-copy"><strong>{title}</strong><small>{description}</small></span>
          </button>
        ))}
      </div>
    </section>
  )
}
