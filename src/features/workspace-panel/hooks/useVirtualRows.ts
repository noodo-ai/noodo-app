import { useMemo, useState, type UIEvent } from 'react'

interface VirtualRowsOptions<T> {
  items: T[]
  rowHeight: number
  viewportHeight: number
  overscan?: number
}

export function useVirtualRows<T>({ items, rowHeight, viewportHeight, overscan = 5 }: VirtualRowsOptions<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const visibleCount = Math.ceil(viewportHeight / rowHeight)

  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)
    return { start, end }
  }, [items.length, overscan, rowHeight, scrollTop, visibleCount])

  const onScroll = (event: UIEvent<HTMLDivElement>) => setScrollTop(event.currentTarget.scrollTop)

  return {
    onScroll,
    visibleItems: items.slice(range.start, range.end),
    topSpacerHeight: range.start * rowHeight,
    bottomSpacerHeight: Math.max(0, (items.length - range.end) * rowHeight),
  }
}
