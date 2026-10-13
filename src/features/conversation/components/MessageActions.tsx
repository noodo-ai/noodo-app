import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

export interface MessageActionsProps {
  text: string
  createdAt: number
}

export function MessageActions({ text, createdAt }: MessageActionsProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
  }, [])

  const copy = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    resetTimer.current = setTimeout(() => setStatus('idle'), 2000)
  }
  const date = new Date(createdAt)
  const label = status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed. Try again' : 'Copy message'

  return (
    <div className="message-actions">
      <time dateTime={date.toISOString()} title={date.toLocaleString()}>
        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </time>
      <button type="button" aria-label={label} title={label} disabled={!text} onClick={() => void copy()}>
        {status === 'copied' ? <Check size={14} strokeWidth={1.7} /> : <Copy size={14} strokeWidth={1.7} />}
      </button>
      <div className="message-copy-status" role="status">
        {status === 'copied' ? 'Message copied' : status === 'error' ? 'Could not copy message. Try again.' : ''}
      </div>
    </div>
  )
}
