// @vitest-environment jsdom
import { act, cleanup, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useConversationResizeScroll } from './useConversationResizeScroll'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function setup() {
  let resize: () => void = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback }
    observe() {}
    disconnect = disconnect
  })
  const messages = document.createElement('div')
  const content = document.createElement('div')
  let height = 600
  let scrollHeight = 1600
  Object.defineProperties(messages, {
    clientHeight: { get: () => height },
    scrollHeight: { get: () => scrollHeight },
  })
  messages.scrollTop = 1000
  const hook = renderHook(() => useConversationResizeScroll(
    { current: messages }, { current: content },
  ))
  return {
    messages,
    disconnect,
    unmount: hook.unmount,
    resize: (nextHeight: number, nextScrollHeight = scrollHeight) => {
      height = nextHeight
      scrollHeight = nextScrollHeight
      // Browsers may emit a scroll event before delivering the resize.
      fireEvent.scroll(messages)
      act(resize)
    },
  }
}

it('keeps the latest answer visible when the composer grows or text reflows', () => {
  const view = setup()
  view.resize(400)
  expect(view.messages.scrollTop).toBe(1200)
  view.resize(400, 2000)
  expect(view.messages.scrollTop).toBe(1600)
})

it('preserves the position of someone reading older messages', () => {
  const view = setup()
  view.messages.scrollTop = 500
  fireEvent.scroll(view.messages)
  view.resize(400)
  expect(view.messages.scrollTop).toBe(500)
  view.messages.scrollTop = 1200
  fireEvent.scroll(view.messages)
  view.resize(600)
  expect(view.messages.scrollTop).toBe(1000)
})

it('disconnects the observer on unmount', () => {
  const view = setup()
  view.unmount()
  expect(view.disconnect).toHaveBeenCalledOnce()
})
