import { CircleUserRound, X } from 'lucide-react'
import { NoodoMark } from '../../../shared/components/NoodoMark'
import { Composer } from '../../composer/components/Composer'
import type { ComposerMode } from '../../composer/types'

export interface ConversationViewProps {
  messages: string[]
  input: string
  mode: ComposerMode
  onInputChange: (value: string) => void
  onModeChange: (mode: ComposerMode) => void
  onSubmit: () => void
  onReset: () => void
}

export function ConversationView({ messages, input, mode, onInputChange, onModeChange, onSubmit, onReset }: ConversationViewProps) {
  return (
    <section className="chat-view" aria-label="Conversation">
      <header className="chat-header">
        <div><span className="status-dot" />Workspace session</div>
        <button type="button" onClick={onReset}><X size={15} />End</button>
      </header>
      <div className="messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className="message-pair" key={`${message}-${index}`}>
            <div className="user-message"><span>{message}</span><CircleUserRound size={20} /></div>
            <div className="assistant-message" role="status">
              <span className="assistant-mark"><NoodoMark /></span>
              <div>
                <strong>Task received</strong>
                <p>I’ll break this down in {mode} mode and present the result here.</p>
                <div className="mock-progress" aria-label="Preparing response"><span /><span /><span /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-composer">
        <Composer compact value={input} onChange={onInputChange} onSubmit={onSubmit} mode={mode} onModeChange={onModeChange} />
      </div>
    </section>
  )
}
