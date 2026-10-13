import { ArrowUp, Paperclip, Square } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
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
  const fileRef = useRef<HTMLInputElement>(null)
  const [readingFile, setReadingFile] = useState(false)
  const [fileError, setFileError] = useState('')
  useComposerShortcut(inputRef)
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || disabled || busy || readingFile) return
    setFileError('')
    if (!/\.(txt|md|markdown|csv|tsv|json|log)$/i.test(file.name)) {
      setFileError('Choose a text, Markdown, CSV, or JSON file.')
      return
    }
    setReadingFile(true)
    try {
      const text = await file.text()
      if (!text.trim()) {
        setFileError('This file is empty.')
        return
      }
      onChange(`${value}${value ? '\n\n' : ''}File: ${file.name}\n${text}`)
    } catch {
      setFileError('Could not read this file. Try again.')
    } finally {
      setReadingFile(false)
      inputRef.current?.focus()
    }
  }
  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (value.trim() && !disabled && !busy && !readingFile) onSubmit()
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
        disabled={disabled || busy || readingFile}
      />
      <div className="composer-actions">
        <div className="composer-attachments">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,.csv,.tsv,.json,.log"
            hidden
            onChange={(event) => {
              void importFile(event)
            }}
            disabled={disabled || busy || readingFile}
          />
          <button
            type="button"
            className="composer-tool"
            aria-label="Upload file"
            title="Upload text, Markdown, CSV, or JSON"
            disabled={disabled || busy || readingFile}
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip size={15} strokeWidth={1.7} />
          </button>
          {readingFile && (
            <span className="composer-file-status" role="status">Reading file…</span>
          )}
          {fileError && (
            <span className="composer-file-status" role="alert">{fileError}</span>
          )}
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
              disabled={!value.trim() || disabled || readingFile}
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
