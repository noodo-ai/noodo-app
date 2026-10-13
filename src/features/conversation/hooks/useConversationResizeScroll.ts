import { useEffect, type RefObject } from 'react'

export function useConversationResizeScroll(
  messagesRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const messages = messagesRef.current
    const content = contentRef.current
    if (!messages || !content || typeof ResizeObserver === 'undefined') return

    let height = messages.clientHeight
    let scrollHeight = messages.scrollHeight
    // scrollIntoView leaves the messages container's bottom padding visible.
    let atBottom = messages.scrollHeight - height - messages.scrollTop <= 32
    const onScroll = () => {
      // A resize can emit a scroll event before ResizeObserver runs.
      if (messages.clientHeight !== height || messages.scrollHeight !== scrollHeight) return
      atBottom = messages.scrollHeight - height - messages.scrollTop <= 32
    }
    const observer = new ResizeObserver(() => {
      height = messages.clientHeight
      scrollHeight = messages.scrollHeight
      if (atBottom) messages.scrollTop = messages.scrollHeight - height
    })
    observer.observe(messages)
    observer.observe(content)
    messages.addEventListener('scroll', onScroll)
    return () => {
      observer.disconnect()
      messages.removeEventListener('scroll', onScroll)
    }
  }, [messagesRef, contentRef])
}
