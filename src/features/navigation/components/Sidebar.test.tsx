// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { Sidebar, type SidebarProps } from './Sidebar'

afterEach(cleanup)

const sidebarProps: SidebarProps = {
  expanded: true, preview: false, onPreviewChange: () => {}, onToggle: () => {},
  onNewChat: () => {}, onOpenRecentChat: () => {}, chats: [], activeConversationId: null,
  user: { id: 'u', username: 'User' }, busy: false, onLogout: () => {},
  isResizing: false, width: 240, onStartResize: () => {}, onResizeByKeyboard: () => {},
}

it('skips entrance on restored expansion but animates after closing and reopening', () => {
  const { container, rerender } = render(<Sidebar {...sidebarProps} />)
  const region = container.querySelector('.sidebar-region')!
  expect(region.classList.contains('skip-entrance')).toBe(true)
  rerender(<Sidebar {...sidebarProps} width={280} />)
  expect(region.classList.contains('skip-entrance')).toBe(true)
  rerender(<Sidebar {...sidebarProps} expanded={false} />)
  expect(screen.queryByRole('button', { name: 'Collapse sidebar' })).toBeNull()
  rerender(<Sidebar {...sidebarProps} />)
  expect(region.classList.contains('skip-entrance')).toBe(false)
  expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeTruthy()
})

it('retains entrance for manual expansion and hover preview from a collapsed start', () => {
  const { container, rerender } = render(<Sidebar {...sidebarProps} expanded={false} />)
  rerender(<Sidebar {...sidebarProps} expanded={false} preview />)
  expect(screen.getByRole('button', { name: 'Pin sidebar open' })).toBeTruthy()
  expect(container.querySelector('.sidebar-region')!.classList.contains('skip-entrance')).toBe(false)
  rerender(<Sidebar {...sidebarProps} />)
  expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeTruthy()
  expect(container.querySelector('.sidebar-region')!.classList.contains('skip-entrance')).toBe(false)
})

it('activates New chat when selecting the draft and deactivates it when selecting a conversation', () => {
  function Navigation() {
    const [selected, setSelected] = useState<string | null>('a')
    return <Sidebar
      expanded preview={false} onPreviewChange={() => {}} onToggle={() => {}}
      onNewChat={() => setSelected(null)} onOpenRecentChat={setSelected}
      chats={[{ id: 'a', title: 'Chat A', observedAddress: null, addressVersion: 1, updatedAt: 1 }]}
      activeConversationId={selected} user={{ id: 'u', username: 'User' }}
      busy onLogout={() => {}}
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
