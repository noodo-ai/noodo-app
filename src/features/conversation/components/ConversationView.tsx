import { useEffect, useRef } from 'react'
import { AssistantMarkdown } from './AssistantMarkdown'
import { ResponseSteps } from './ResponseSteps'
import { MessageActions } from './MessageActions'
import { DataCards } from '../../assistant/components/DataCards'
import { useConversationResizeScroll } from '../hooks/useConversationResizeScroll'
import { toolLabels, statusLabels } from '../../assistant/progress'
import type { ChatMessage, ToolStatus } from '../../assistant/types'
export interface ConversationViewProps {
  messages: ChatMessage[]
  tools: ToolStatus[]
  busy: boolean
  hasOlder: boolean
  loading: boolean
  onLoadOlder: () => void
}
export function ConversationView({
  messages,
  tools,
  busy,
  hasOlder,
  loading,
  onLoadOlder,
}: ConversationViewProps) {
  const bottom = useRef<HTMLDivElement>(null),
    last = messages.at(-1)
  const messagesRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useConversationResizeScroll(messagesRef, contentRef)
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest' })
  }, [last?.text, last?.result?.activity, messages.length])
  return (
    <div ref={messagesRef} className="messages" aria-label="Conversation messages">
      <div ref={contentRef} className="messages-content">
        {hasOlder && (
          <button
            className="text-action"
            onClick={onLoadOlder}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load older messages'}
          </button>
        )}
        {messages.map((message) => (
          <div className="message-pair" key={message.id}>
            {message.role === 'user' ? (
              <div className="user-message">
                <div className="message-content">
                  <span>{message.text}</span>
                  <MessageActions text={message.text} createdAt={message.createdAt} />
                </div>
              </div>
            ) : (
              <div className="assistant-message">
                <div className="assistant-body message-content">
                  {message.textStatus !== 'final' && (
                    <p className="scope-note">
                      {busy && message === last
                        ? 'Responding…'
                        : message.text
                          ? 'Answer incomplete'
                          : 'Explanation unavailable'}
                    </p>
                  )}
                  {message.result?.activity?.length ? (
                    <ResponseSteps
                      activity={message.result.activity}
                      cards={message.result.dataCards}
                      responding={busy && message === last}
                      startedAt={message.startedAt}
                      completedAt={message.completedAt}
                    />
                  ) : (
                    <>
                      {message.result && <DataCards cards={message.result.dataCards} />}
                      <AssistantMarkdown text={message.text} />
                    </>
                  )}
                  {!(busy && message === last) && (
                    <MessageActions text={message.text} createdAt={message.createdAt} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {tools.length > 0 &&
          !messages.some((m) => m.result?.activity?.length) && (
            <div className="tool-status" aria-live="polite">
              {tools.map((t) => (
                <p key={t.id}>
                  {toolLabels[t.name] ?? 'Read-only query'} ·{' '}
                  {statusLabels[t.status] ?? 'Pending'}
                  {t.status === 'partial'
                    ? ' · See coverage in the data card'
                    : ''}
                </p>
              ))}
            </div>
          )}
        {busy && !last?.text && <p role="status">Fetching read-only data…</p>}
        <div ref={bottom} />
      </div>
    </div>
  )
}
