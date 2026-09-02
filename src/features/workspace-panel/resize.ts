export const MIN_PANEL_WIDTH = 280
export const MIN_CONTENT_WIDTH = 426
export const PANEL_RESIZE_STEP = 12

export function getPanelMaximum(workspaceWidth: number) {
  return Math.max(MIN_PANEL_WIDTH, workspaceWidth - MIN_CONTENT_WIDTH)
}

export function resolvePanelPointerResize(pointerX: number, workspaceLeft: number, workspaceWidth: number) {
  const requestedWidth = workspaceLeft + workspaceWidth - pointerX
  return Math.max(MIN_PANEL_WIDTH, Math.min(getPanelMaximum(workspaceWidth), requestedWidth))
}

export function resolvePanelKeyboardResize(currentWidth: number, direction: 'wider' | 'narrower', workspaceWidth: number) {
  const requestedWidth = currentWidth + (direction === 'wider' ? PANEL_RESIZE_STEP : -PANEL_RESIZE_STEP)
  return Math.max(MIN_PANEL_WIDTH, Math.min(getPanelMaximum(workspaceWidth), requestedWidth))
}
