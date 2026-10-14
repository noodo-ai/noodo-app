// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useWorkspaceController } from './useWorkspaceController'

beforeEach(() => { localStorage.clear(); vi.stubGlobal('innerWidth', 1440) })
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('restores resized widths across reloads and closing then reopening', () => {
  const first = renderHook(useWorkspaceController)
  act(() => { first.result.current.sidebar.toggle(); first.result.current.panel.openPanel(1440) })
  act(() => {
    first.result.current.sidebar.resizeByKeyboard('wider')
    first.result.current.panel.setWidth(420)
  })
  expect(first.result.current.sidebar.width).toBe(228)
  first.unmount()
  const second = renderHook(useWorkspaceController)
  expect(second.result.current.sidebar.width).toBe(228)
  expect(second.result.current.panel.width).toBe(420)
  act(() => { second.result.current.sidebar.toggle(); second.result.current.panel.close() })
  second.unmount()
  const third = renderHook(useWorkspaceController)
  act(() => { third.result.current.sidebar.toggle(); third.result.current.panel.openPanel(1440) })
  expect(third.result.current.sidebar.width).toBe(228)
  expect(third.result.current.panel.width).toBe(420)
  act(() => third.result.current.panel.resizeByKeyboard('wider', 1200))
  third.unmount()
  expect(renderHook(useWorkspaceController).result.current.panel.width).toBe(432)
})

it.each(['collapsed', 'expanded', 'preview'] as const)(
  'constrains a saved panel width when reopening in a narrower window with a %s sidebar', sidebar => {
    const { result, unmount } = renderHook(useWorkspaceController)
    act(() => result.current.panel.openPanel(1440))
    act(() => result.current.panel.setWidth(900))
    act(() => result.current.panel.close())
    vi.stubGlobal('innerWidth', 1024)
    act(() => {
      if (sidebar === 'expanded') result.current.sidebar.setExpanded(true)
      if (sidebar === 'preview') result.current.sidebar.setPreview(true)
    })
    act(() => result.current.panel.openPanel(1024))
    const expectedWidth = sidebar === 'collapsed' ? 580 : 358
    expect(result.current.panel.width).toBe(expectedWidth)
    expect(result.current.panel.open).toBe(true)
    unmount()
    expect(renderHook(useWorkspaceController).result.current.panel.width).toBe(expectedWidth)
  },
)

it('keeps old preferences compatible and initializes the first panel opening from available space', () => {
  localStorage.setItem('noodo:workspace-layout', JSON.stringify({ sidebarExpanded: true, rightPanelOpen: false }))
  const { result } = renderHook(useWorkspaceController)
  expect(result.current.sidebar.width).toBe(216)
  act(() => result.current.panel.openPanel(1440))
  expect(result.current.panel.width).toBe(600)
})

it('clamps restored widths to the available desktop space', () => {
  localStorage.setItem('noodo:workspace-layout', JSON.stringify({
    sidebarExpanded: true, rightPanelOpen: true, sidebarWidth: 5000, rightPanelWidth: 5000,
  }))
  const { result } = renderHook(useWorkspaceController)
  expect(result.current.sidebar.width).toBe(336)
  expect(result.current.panel.width).toBe(660)
})

it.each([-1, '400', null])('ignores invalid stored widths: %s', width => {
  localStorage.setItem('noodo:workspace-layout', JSON.stringify({ sidebarWidth: width, rightPanelWidth: width }))
  const { result } = renderHook(useWorkspaceController)
  expect(result.current.sidebar.width).toBe(216)
  act(() => result.current.panel.openPanel(1440))
  expect(result.current.panel.width).toBe(711)
})

it('restores both open and closed panel preferences after remounting', () => {
  const first = renderHook(useWorkspaceController)
  expect(first.result.current.sidebar.expanded).toBe(false)
  expect(first.result.current.panel.open).toBe(false)
  act(() => {
    first.result.current.sidebar.toggle()
    first.result.current.panel.openPanel()
  })
  first.unmount()
  const second = renderHook(useWorkspaceController)
  expect(second.result.current.sidebar.expanded).toBe(true)
  expect(second.result.current.panel.open).toBe(true)
  act(() => {
    second.result.current.sidebar.toggle()
    second.result.current.panel.close()
  })
  second.unmount()
  const third = renderHook(useWorkspaceController)
  expect(third.result.current.sidebar.expanded).toBe(false)
  expect(third.result.current.panel.open).toBe(false)
})

it('does not persist temporary hover previews', () => {
  const first = renderHook(useWorkspaceController)
  act(() => first.result.current.sidebar.setPreview(true))
  first.unmount()
  const second = renderHook(useWorkspaceController)
  expect(second.result.current.sidebar.expanded).toBe(false)
  expect(second.result.current.sidebar.preview).toBe(false)
})

it('persists sidebar collapse from keyboard resizing', () => {
  const first = renderHook(useWorkspaceController)
  act(() => first.result.current.sidebar.setExpanded(true))
  for (let step = 0; step < 10; step++) {
    act(() => first.result.current.sidebar.resizeByKeyboard('narrower'))
  }
  expect(first.result.current.sidebar.expanded).toBe(false)
  first.unmount()
  expect(renderHook(useWorkspaceController).result.current.sidebar.expanded).toBe(false)
})

it.each(['broken JSON', 'null', '[]', '{"sidebarExpanded":"true","rightPanelOpen":1}'])(
  'defaults safely when saved preferences are invalid: %s', saved => {
    localStorage.setItem('noodo:workspace-layout', saved)
    const { result } = renderHook(useWorkspaceController)
    expect(result.current.sidebar.expanded).toBe(false)
    expect(result.current.panel.open).toBe(false)
  },
)

it('keeps controls usable when reading and writing storage fail', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked') })
  const { result } = renderHook(useWorkspaceController)
  act(() => { result.current.sidebar.toggle(); result.current.panel.openPanel() })
  expect(result.current.sidebar.expanded).toBe(true)
  expect(result.current.panel.open).toBe(true)
})
