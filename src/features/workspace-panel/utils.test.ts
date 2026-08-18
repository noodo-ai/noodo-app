import { describe, expect, it } from 'vitest'
import { truncateDescription } from './utils'

describe('truncateDescription', () => {
  it('keeps descriptions at the configured limit intact', () => {
    expect(truncateDescription('123456789012345678901234567890')).toBe('123456789012345678901234567890')
  })

  it('uses the first 30 characters followed by an ellipsis', () => {
    expect(truncateDescription('123456789012345678901234567890123')).toBe('123456789012345678901234567890…')
  })
})
