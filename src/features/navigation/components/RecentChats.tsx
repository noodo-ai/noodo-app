import type { Conversation } from '../../assistant/types'
export interface RecentChatsProps {
  chats: Conversation[]
  disabled?: boolean
  onOpenChat: (id: string) => void
}
export function RecentChats({ chats, disabled, onOpenChat }: RecentChatsProps) {
  return (
    <section className="recent-chats" aria-labelledby="recent-chats-heading">
      <h2 id="recent-chats-heading">Recent</h2>
      {chats.length === 0 && (
        <p className="scope-note">Your chats will appear here.</p>
      )}
      {chats.map((chat) => (
        <div className="recent-chat-row" key={chat.id}>
          <button
            className="recent-chat-open"
            type="button"
            disabled={disabled}
            title={chat.title}
            onClick={() => onOpenChat(chat.id)}
          >
            <span className="recent-chat-label">{chat.title}</span>
          </button>
        </div>
      ))}
    </section>
  )
}
