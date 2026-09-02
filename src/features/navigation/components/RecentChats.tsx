import { useState } from 'react'
import { Shovel } from 'lucide-react'

interface RecentChat {
  id: string
  title: string
}

const initialRecentChats: RecentChat[] = [
  { id: 'product-launch', title: 'Plan a focused product launch' },
  { id: 'agent-workflow', title: 'Review the agent workflow' },
]

export interface RecentChatsProps {
  onOpenChat: (title: string) => void
}

export function RecentChats({ onOpenChat }: RecentChatsProps) {
  const [chats, setChats] = useState(initialRecentChats)

  return (
    <section className="recent-chats" aria-labelledby="recent-chats-heading">
      <h2 id="recent-chats-heading">Recent</h2>
      {chats.map((chat) => (
        <div className="recent-chat-row" key={chat.id}>
          <button className="recent-chat-open" type="button" title={chat.title} onClick={() => onOpenChat(chat.title)}>
            <span>{chat.title}</span>
          </button>
          <button
            className="recent-chat-delete"
            type="button"
            aria-label={`Delete chat: ${chat.title}`}
            title="Delete chat"
            onClick={() => setChats((current) => current.filter(({ id }) => id !== chat.id))}
          >
            <Shovel size={14} strokeWidth={1.65} />
          </button>
        </div>
      ))}
    </section>
  )
}
