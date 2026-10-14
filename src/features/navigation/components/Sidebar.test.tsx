// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

afterEach(cleanup)

it('activates New chat when selecting the draft and deactivates it when selecting a conversation', () => {
  function Navigation() {
    const [selected, setSelected] = useState<string | null>('a')
    return <Sidebar
      expanded preview={false} onPreviewChange={() => {}} onToggle={() => {}}
      onNewChat={() => setSelected(null)} onOpenRecentChat={setSelected}
      chats={[{ id: 'a', title: 'Chat A', observedAddress: null, addressVersion: 1, updatedAt: 1 }]}
      activeConversationId={selected} user={{ id: 'u', username: 'User' }}
      busy onLogout={() => {}} activePanel={null} onSelectPanel={() => {}}
      isResizing={false} width={240} onStartResize={() => {}} onResizeByKeyboard={() => {}}
    />
  }
  render(<Navigation />)
  const draft = screen.getByRole('button', { name: 'New chat' })
  const chat = screen.getByRole('button', { name: 'Chat A' })
  expect(draft.getAttribute('aria-current')).toBeNull()
  fireEvent.click(draft)
  expect(draft.classList.contains('active')).toBe(true)
  expect(draft.getAttribute('aria-current')).toBe('page')
  expect(chat.getAttribute('aria-current')).toBeNull()
  fireEvent.click(draft)
  expect(draft.getAttribute('aria-current')).toBe('page')
  fireEvent.click(chat)
  expect(draft.classList.contains('active')).toBe(false)
  expect(draft.getAttribute('aria-current')).toBeNull()
  expect(chat.getAttribute('aria-current')).toBe('page')
})
