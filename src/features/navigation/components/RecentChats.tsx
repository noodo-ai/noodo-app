import { useState } from 'react'
import { DeleteChatDialog } from './DeleteChatDialog'
import { LoaderCircle, X } from 'lucide-react'
import type { Conversation } from '../../assistant/types'
export interface RecentChatsProps {
  chats: Conversation[]
  activeConversationId: string | null
  onDeleteChat: (id: string) => Promise<boolean>
  deletingIds?: string[]
  blockedDeleteIds?: string[]
  respondingIds?: string[]
  deleteError?: string
  onOpenChat: (id: string) => void
}
export function RecentChats({ chats, activeConversationId, onOpenChat, onDeleteChat, deletingIds = [], blockedDeleteIds = [], respondingIds = [], deleteError = '' }: RecentChatsProps) {
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null)
  return (
    <section className="recent-chats" aria-labelledby="recent-chats-heading">
      <h2 id="recent-chats-heading">Recent</h2>
      {chats.length === 0 && (
        <p className="scope-note">Your chats will appear here.</p>
      )}
      {chats.map((chat) => (
        <div aria-busy={deletingIds.includes(chat.id) || respondingIds.includes(chat.id)} className={`recent-chat-row ${chat.id === activeConversationId ? 'active' : ''} ${respondingIds.includes(chat.id) ? 'responding' : ''}`} key={chat.id}>
          <button
            className="recent-chat-open"
            type="button"
            aria-current={chat.id === activeConversationId ? 'page' : undefined}
            title={chat.title}
            onClick={() => onOpenChat(chat.id)}
          >
            <span className="recent-chat-label">{chat.title}</span>
          </button>
          {respondingIds.includes(chat.id) && (
            <span className="recent-chat-loading" role="status" aria-label={`Responding: ${chat.title}`}>
              <LoaderCircle size={14} strokeWidth={1.65} aria-hidden="true" />
            </span>
          )}
          <button
            className="recent-chat-delete"
            type="button"
            aria-label={`Delete chat: ${chat.title}`}
            title={blockedDeleteIds.includes(chat.id) ? 'Wait for the response to finish' : 'Delete chat'}
            disabled={deletingIds.includes(chat.id) || blockedDeleteIds.includes(chat.id)}
            onClick={() => setDeleteTarget(chat)}
          >
            <X size={14} strokeWidth={1.65} />
          </button>
        </div>
      ))}
      {deleteTarget && (
        <DeleteChatDialog
          chat={deleteTarget}
          error={deleteError}
          blocked={blockedDeleteIds.includes(deleteTarget.id)}
          onConfirm={onDeleteChat}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </section>
  )
}
