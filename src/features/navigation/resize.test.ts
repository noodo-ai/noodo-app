import { describe, expect, it } from 'vitest'
import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  resolveSidebarKeyboardResize,
  resolveSidebarPointerResize,
} from './resize'

describe('sidebar resizing', () => {
  it('collapses when dragged below the minimum width', () => {
    expect(resolveSidebarPointerResize(150, 1440)).toEqual({ width: MIN_SIDEBAR_WIDTH, collapse: true })
  })

  it('caps pointer resizing at the configured maximum', () => {
    expect(resolveSidebarPointerResize(800, 1440)).toEqual({ width: MAX_SIDEBAR_WIDTH, collapse: false })
  })

  it('keeps enough workspace visible on narrower screens', () => {
    expect(resolveSidebarPointerResize(400, 820)).toEqual({ width: 200, collapse: false })
  })

  it('collapses on a narrower key press at minimum width', () => {
    expect(resolveSidebarKeyboardResize(MIN_SIDEBAR_WIDTH, 'narrower', 1440)).toEqual({ width: MIN_SIDEBAR_WIDTH, collapse: true })
  })
})
