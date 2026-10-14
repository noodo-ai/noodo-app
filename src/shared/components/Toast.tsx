import { useEffect, useState } from 'react'
import { CircleAlert, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  message: string
}

function Toast({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (dismissed || hovered || focused) return
    const timer = window.setTimeout(() => setDismissed(true), 6000)
    return () => window.clearTimeout(timer)
  }, [dismissed, hovered, focused])

  if (dismissed) return null
  return (
    <div
      className="toast"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <CircleAlert className="toast-icon" size={18} strokeWidth={1.7} aria-hidden="true" />
      <p role="alert">{message}</p>
      <button type="button" aria-label="Dismiss notification" onClick={() => setDismissed(true)}>
        <X size={16} strokeWidth={1.7} aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastRegion({ messages }: { messages: ToastMessage[] }) {
  return (
    <section className="toast-region" aria-label="Notifications">
      {messages.filter(({ message }) => message).map(({ id, message }) => (
        <Toast key={`${id}:${message}`} message={message} />
      ))}
    </section>
  )
}
