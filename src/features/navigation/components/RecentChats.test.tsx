// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { RecentChats } from './RecentChats'

it('marks only the current conversation and keeps every conversation switch enabled', () => {
  const chats = ['a', 'b'].map((id) => ({ id, title: `Chat ${id}`, observedAddress: null, addressVersion: 1, updatedAt: 1 }))
  const html = renderToStaticMarkup(<RecentChats chats={chats} activeConversationId="b" onOpenChat={() => {}} onDeleteChat={async () => true} />)
  expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  expect(html).toContain('recent-chat-row active')
  expect(html).toMatch(/aria-current="page"[^>]*title="Chat b"/)
  expect(html).not.toContain('disabled')
})

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(cleanup)

const chat = { id: 'a', title: 'Chat a', observedAddress: null, addressVersion: 1, updatedAt: 1 }
it('requires confirmation and restores focus after Cancel or Escape without deleting', () => {
  const onDelete = vi.fn(async () => true)
  const onOpen = vi.fn()
  render(<RecentChats chats={[chat]} activeConversationId="a" onOpenChat={onOpen} onDeleteChat={onDelete} />)
  const trigger = screen.getByRole('button', { name: 'Delete chat: Chat a' })
  trigger.focus()
  fireEvent.click(trigger)
  expect(screen.getByRole('dialog', { name: 'Delete chat?' })).toBeTruthy()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }))
  expect(onDelete).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  fireEvent.click(trigger)
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(onDelete).not.toHaveBeenCalled()
  expect(onOpen).not.toHaveBeenCalled()
})
it('confirms only once and keeps the modal locked while deletion is pending', async () => {
  let finish!: (deleted: boolean) => void
  const onDelete = vi.fn(() => new Promise<boolean>((resolve) => { finish = resolve }))
  render(<RecentChats chats={[chat]} activeConversationId="a" onOpenChat={() => {}} onDeleteChat={onDelete} />)
  fireEvent.click(screen.getByRole('button', { name: 'Delete chat: Chat a' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  fireEvent.click(screen.getByRole('button', { name: 'Deleting…' }))
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
  expect(onDelete).toHaveBeenCalledExactlyOnceWith('a')
  expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(true)
  await act(async () => { finish(true) })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})
it('keeps the dialog open on failure and allows cancelling', async () => {
  const { rerender } = render(<RecentChats chats={[chat]} activeConversationId="a" onOpenChat={() => {}} onDeleteChat={async () => false} />)
  fireEvent.click(screen.getByRole('button', { name: 'Delete chat: Chat a' }))
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Delete' })) })
  rerender(<RecentChats chats={[chat]} activeConversationId="a" onOpenChat={() => {}} onDeleteChat={async () => false} deleteError="Could not delete chat" />)
  expect(screen.getByRole('dialog').textContent).toContain('Could not delete chat')
  expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})
