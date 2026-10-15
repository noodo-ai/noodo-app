import { expect, it } from 'vitest'
import { csvPreview } from './preview'
it('previews quoted commas, escaped quotes, multiline fields and CRLF without changing cell values', () => {
  expect(csvPreview('name,note\r\n"BTC,ETH","a ""quote""\nand another line"\r\nSOL,last')).toEqual([
    ['name', 'note'], ['BTC,ETH', 'a "quote"\nand another line'], ['SOL', 'last'],
  ])
})
it('bounds rows, columns and cell length for large datasets', () => {
  const text = Array.from({ length: 200 }, () => Array.from({ length: 30 }, () => 'x'.repeat(3000)).join(',')).join('\n')
  const result = csvPreview(text)
  expect(result).toHaveLength(101)
  expect(result.every(row => row.length === 20 && row.every(cell => cell.length === 2000))).toBe(true)
})
