import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Conversation } from '../../assistant/types'

export interface DeleteChatDialogProps {
  chat: Conversation
  error: string
  blocked: boolean
  onConfirm: (id: string) => Promise<boolean>
  onClose: () => void
}

export function DeleteChatDialog({ chat, error, blocked, onConfirm, onClose }: DeleteChatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current!
    const trigger = document.activeElement as HTMLElement | null
    dialog.showModal()
    cancelRef.current?.focus()
    return () => {
      dialog.close()
      if (trigger?.isConnected && !trigger.closest('[inert]')) trigger.focus()
      else {
        const next = [...document.querySelectorAll<HTMLButtonElement>('.recent-chat-open, .nav-item-new-chat, .left-sidebar-toggle, .mobile-head .brand-button')]
          .find((button) => !button.closest('[inert]') && button.getClientRects().length > 0 && button.getAttribute('aria-hidden') !== 'true')
        next?.focus()
      }
    }
  }, [])

  const confirm = async () => {
    if (submitting.current || blocked) return
    submitting.current = true
    setBusy(true)
    setAttempted(true)
    try {
      if (await onConfirm(chat.id)) onClose()
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className="delete-chat-dialog"
      aria-labelledby="delete-chat-title"
      aria-describedby="delete-chat-description"
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        if (!submitting.current) onClose()
      }}
    >
      <h2 id="delete-chat-title">Delete chat?</h2>
      <p id="delete-chat-description">This will permanently delete <strong>{chat.title}</strong> and its messages. This cannot be undone.</p>
      {blocked && <p className="scope-note" role="status">Wait for the response to finish before deleting this chat.</p>}
      {attempted && error && <p className="scope-note" role="alert">{error}</p>}
      <div className="delete-chat-actions">
        <button ref={cancelRef} type="button" disabled={busy} onClick={onClose}>Cancel</button>
        <button className="delete-chat-confirm" type="button" disabled={busy || blocked} onClick={() => { void confirm() }}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
