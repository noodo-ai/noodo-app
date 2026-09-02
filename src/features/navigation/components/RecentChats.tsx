import { useState, type FocusEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
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

interface TooltipState {
  text: string
  top: number
  left: number
  maxWidth: number
  visible: boolean
}

type TooltipTriggerEvent = FocusEvent<HTMLButtonElement> | ReactPointerEvent<HTMLButtonElement>

export function RecentChats({ onOpenChat }: RecentChatsProps) {
  const [chats, setChats] = useState(initialRecentChats)
  const [tooltip, setTooltip] = useState<TooltipState>({ text: '', top: 0, left: 0, maxWidth: 320, visible: false })

  const showTooltip = (event: TooltipTriggerEvent, text: string) => {
    const row = event.currentTarget.closest('.recent-chat-row')
    const bounds = (row ?? event.currentTarget).getBoundingClientRect()
    const left = bounds.right + 10
    setTooltip({
      text,
      top: bounds.top + bounds.height / 2,
      left,
      maxWidth: Math.max(72, window.innerWidth - left - 12),
      visible: true,
    })
  }

  const hideTooltip = () => setTooltip((current) => ({ ...current, visible: false }))

  return (
    <>
      <section className="recent-chats" aria-labelledby="recent-chats-heading">
        <h2 id="recent-chats-heading">Recent</h2>
        {chats.map((chat) => (
          <div className="recent-chat-row" key={chat.id}>
            <button
              className="recent-chat-open"
              type="button"
              onPointerEnter={(event) => showTooltip(event, chat.title)}
              onPointerLeave={hideTooltip}
              onFocus={(event) => showTooltip(event, chat.title)}
              onBlur={hideTooltip}
              onClick={() => {
                hideTooltip()
                onOpenChat(chat.title)
              }}
            >
              <span className="recent-chat-label">{chat.title}</span>
            </button>
            <button
              className="recent-chat-delete"
              type="button"
              aria-label={`Delete chat: ${chat.title}`}
              onPointerEnter={(event) => showTooltip(event, 'Delete chat')}
              onPointerLeave={hideTooltip}
              onFocus={(event) => showTooltip(event, 'Delete chat')}
              onBlur={hideTooltip}
              onClick={() => {
                hideTooltip()
                setChats((current) => current.filter(({ id }) => id !== chat.id))
              }}
            >
              <Shovel size={14} strokeWidth={1.65} />
            </button>
          </div>
        ))}
      </section>
      {createPortal(
        <span
          className={`recent-chat-tooltip ${tooltip.visible ? 'visible' : ''}`}
          style={{ top: tooltip.top, left: tooltip.left, maxWidth: tooltip.maxWidth }}
          aria-hidden="true"
        >
          {tooltip.text}
        </span>,
        document.body,
      )}
    </>
  )
}
