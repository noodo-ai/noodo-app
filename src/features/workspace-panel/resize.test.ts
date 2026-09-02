import { describe, expect, it } from 'vitest'
import { MIN_PANEL_WIDTH, resolvePanelKeyboardResize, resolvePanelPointerResize } from './resize'

describe('right panel resizing', () => {
  it('uses the workspace edge rather than the viewport edge', () => {
    expect(resolvePanelPointerResize(700, 100, 1000)).toBe(400)
  })

  it('preserves the minimum content width', () => {
    expect(resolvePanelPointerResize(200, 0, 900)).toBe(474)
  })

  it('does not shrink below the panel minimum', () => {
    expect(resolvePanelKeyboardResize(MIN_PANEL_WIDTH, 'narrower', 1000)).toBe(MIN_PANEL_WIDTH)
  })
})
