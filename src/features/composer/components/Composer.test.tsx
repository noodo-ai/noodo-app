// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
it('imports the complete text file alongside the existing question', async () => {
  const callbacks = props()
  const { container } = render(<Composer {...callbacks} />)
  const text = `${'x'.repeat(8000)} END`
  const file = new File([text], 'data.csv', { type: 'text/csv' })
  Object.defineProperty(file, 'text', { value: async () => text })
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } })
  await waitFor(() => expect(callbacks.onChange).toHaveBeenCalledWith(`Analyze this\n\nFile: data.csv\n${text}`))
  expect(callbacks.onSubmit).not.toHaveBeenCalled()
})
it('shows read failures without replacing the draft', async () => {
  const callbacks = props()
  const { container } = render(<Composer {...callbacks} />)
  const file = new File([''], 'data.txt')
  Object.defineProperty(file, 'text', { value: async () => { throw new Error('read failed') } })
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } })
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not read'))
  expect(callbacks.onChange).not.toHaveBeenCalled()
})
it('submits long questions without a textarea limit', () => {
  const callbacks = { ...props(), value: 'x'.repeat(8000) }
  render(<Composer {...callbacks} />)
  expect(screen.getByRole('textbox').getAttribute('maxlength')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Send task' }))
  expect(callbacks.onSubmit).toHaveBeenCalledOnce()
})
