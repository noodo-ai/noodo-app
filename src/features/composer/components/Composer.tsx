import { ArrowUp, Plus, Square } from 'lucide-react'
import { useRef, type FormEvent } from 'react'
import { useComposerShortcut } from '../hooks/useComposerShortcut'
import { useAutosizeTextarea } from '../hooks/useAutosizeTextarea'
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
  useAutosizeTextarea(inputRef, value, compact)
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
        placeholder="Ask about markets, or paste an address with your question…"
        rows={2}
        aria-label="Task input"
        disabled={disabled || busy}
      />
      <div className="composer-actions">
        <div className="composer-attachments">
          <button
            type="button"
            className="composer-tool"
            aria-label="Add attachment"
            title="Attachments coming soon"
            disabled
          >
            <Plus size={15} strokeWidth={1.7} />
          </button>
        </div>
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
