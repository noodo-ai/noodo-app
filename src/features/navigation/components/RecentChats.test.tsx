import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { RecentChats } from './RecentChats'

it('marks only the current conversation and keeps every conversation switch enabled', () => {
  const chats = ['a', 'b'].map((id) => ({ id, title: `Chat ${id}`, observedAddress: null, addressVersion: 1, updatedAt: 1 }))
  const html = renderToStaticMarkup(<RecentChats chats={chats} activeConversationId="b" onOpenChat={() => {}} />)
  expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  expect(html).toContain('recent-chat-row active')
  expect(html).toMatch(/aria-current="page"[^>]*title="Chat b"/)
  expect(html).not.toContain('disabled')
})
