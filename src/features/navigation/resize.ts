export const MIN_SIDEBAR_WIDTH = 168
export const DEFAULT_SIDEBAR_WIDTH = 216
export const MAX_SIDEBAR_WIDTH = 336
export const SIDEBAR_LEFT_INSET = 6
export const MIN_WORKSPACE_WIDTH = 620
export const RESIZE_STEP = 12

export function getSidebarMaximum(viewportWidth: number) {
  return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, viewportWidth - MIN_WORKSPACE_WIDTH))
}

export function resolveSidebarPointerResize(clientX: number, viewportWidth: number) {
  const requestedWidth = clientX - SIDEBAR_LEFT_INSET
  if (requestedWidth < MIN_SIDEBAR_WIDTH) {
    return { width: MIN_SIDEBAR_WIDTH, collapse: true }
  }

  return {
    width: Math.min(requestedWidth, getSidebarMaximum(viewportWidth)),
    collapse: false,
  }
}

export function resolveSidebarKeyboardResize(currentWidth: number, direction: 'wider' | 'narrower', viewportWidth: number) {
  if (direction === 'narrower' && currentWidth <= MIN_SIDEBAR_WIDTH) {
    return { width: MIN_SIDEBAR_WIDTH, collapse: true }
  }

  const requestedWidth = currentWidth + (direction === 'wider' ? RESIZE_STEP : -RESIZE_STEP)
  return {
    width: Math.max(MIN_SIDEBAR_WIDTH, Math.min(getSidebarMaximum(viewportWidth), requestedWidth)),
    collapse: false,
  }
}
