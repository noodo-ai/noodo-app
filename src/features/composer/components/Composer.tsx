import { ArrowUp, Square } from 'lucide-react'
import { useRef, type FormEvent } from 'react'
import { useComposerShortcut } from '../hooks/useComposerShortcut'
import type { ComposerMode } from '../types'
export interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  compact?: boolean
  disabled?: boolean
  busy?: boolean
  onCancel?: () => void
}
export function Composer({
  value,
  onChange,
  onSubmit,
  compact = false,
  disabled = false,
  busy = false,
  onCancel,
}: ComposerProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useComposerShortcut(inputRef)
  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (value.trim() && !disabled && !busy) onSubmit()
  }
  return (
    <form
      className={`composer ${compact ? 'compact' : ''}`}
      onSubmit={submit}
      aria-label="Hyperliquid composer"
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder="Ask about markets, positions or account risk…"
        rows={2}
        aria-label="Task input"
        maxLength={4000}
        disabled={disabled || busy}
      />
      <div className="composer-actions">
        <span className="scope-note">Read-only · {value.length}/4,000</span>
        <div className="composer-right">
          {busy ? (
            <button
              type="button"
              className="send-button"
              onClick={onCancel}
              aria-label="Stop response"
            >
              <Square size={13} />
            </button>
          ) : (
            <button
              className="send-button"
              disabled={!value.trim() || disabled}
              aria-label="Send task"
              type="submit"
            >
              <ArrowUp size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
