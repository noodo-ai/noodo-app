// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Composer } from './Composer'

afterEach(cleanup)
const props = () => ({
  value: 'Analyze this',
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  mode: 'Hyperliquid' as const,
  onModeChange: vi.fn(),
})
it('submits long questions without a textarea limit', () => {
  const callbacks = { ...props(), value: 'x'.repeat(8000) }
  render(<Composer {...callbacks} />)
  expect(screen.getByRole('textbox').getAttribute('maxlength')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Send task' }))
  expect(callbacks.onSubmit).toHaveBeenCalledOnce()
})
