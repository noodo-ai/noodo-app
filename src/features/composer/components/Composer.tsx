import { ArrowUp, Check, ChevronDown, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { composerModes } from '../data'
import { useComposerShortcut } from '../hooks/useComposerShortcut'
import type { ComposerMode } from '../types'

export interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  compact?: boolean
  focusRequest?: number
}

export function Composer({ value, onChange, onSubmit, mode, onModeChange, compact = false, focusRequest = 0 }: ComposerProps) {
  const [modeOpen, setModeOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const menuId = useId()
  useComposerShortcut(inputRef)

  useEffect(() => {
    if (focusRequest > 0) inputRef.current?.focus()
  }, [focusRequest])

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (value.trim()) onSubmit()
  }

  return (
    <form className={`composer ${compact ? 'compact' : ''}`} onSubmit={submit} aria-label="Task composer">
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
          <div className="mode-wrap" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setModeOpen(false)
          }}>
            <button
              type="button"
              className="mode-button"
              onClick={() => setModeOpen((open) => !open)}
              aria-expanded={modeOpen}
              aria-haspopup="menu"
              aria-controls={menuId}
            >
              {mode}<ChevronDown size={14} />
            </button>
            {modeOpen && (
              <div className="mode-menu" id={menuId} role="menu" aria-label="Execution mode">
                {composerModes.map((item) => (
                  <button type="button" role="menuitemradio" aria-checked={item === mode} key={item} onClick={() => { onModeChange(item); setModeOpen(false) }}>
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
