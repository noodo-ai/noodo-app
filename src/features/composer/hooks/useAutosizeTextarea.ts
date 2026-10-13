import { useLayoutEffect, type RefObject } from 'react'

export function useAutosizeTextarea(
  inputRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  compact: boolean,
) {
  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return

    const updateScrollState = () => {
      const overflowing = input.scrollHeight - input.clientHeight > 1
      input.style.overflowY = overflowing ? 'auto' : 'hidden'
      input.dataset.fadeBottom = String(overflowing && input.scrollHeight - input.clientHeight - input.scrollTop > 1)
    }
    const resize = () => {
      input.style.overflowY = 'hidden'
      input.style.height = '0px'
      // scrollHeight rounds to whole pixels; leave room for fractional line heights.
      input.style.height = `${input.scrollHeight + 1}px`
      updateScrollState()
    }
    resize()
    input.addEventListener('scroll', updateScrollState)

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize)
      return () => {
        window.removeEventListener('resize', resize)
        input.removeEventListener('scroll', updateScrollState)
      }
    }

    let width = input.getBoundingClientRect().width
    const observer = new ResizeObserver(() => {
      const nextWidth = input.getBoundingClientRect().width
      if (nextWidth === width) {
        updateScrollState()
        return
      }
      width = nextWidth
      resize()
    })
    observer.observe(input)
    return () => {
      observer.disconnect()
      input.removeEventListener('scroll', updateScrollState)
    }
  }, [inputRef, value, compact])
}
