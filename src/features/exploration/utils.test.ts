import { describe, expect, it } from 'vitest'
import { EXPLORE_MAX, EXPLORE_STAGE_ONE } from './constants'
import { clampExploreProgress, getExploreTransforms } from './utils'

describe('exploration progress', () => {
  it('clamps progress to its supported range', () => {
    expect(clampExploreProgress(-20)).toBe(0)
    expect(clampExploreProgress(EXPLORE_MAX + 20)).toBe(EXPLORE_MAX)
  })

  it('moves only the drawer during stage one', () => {
    expect(getExploreTransforms(EXPLORE_STAGE_ONE)).toEqual({
      drawerShift: -EXPLORE_STAGE_ONE,
      heroShift: 0,
    })
  })

  it('moves the drawer and hero together during stage two', () => {
    expect(getExploreTransforms(EXPLORE_STAGE_ONE + 50)).toEqual({
      drawerShift: -(EXPLORE_STAGE_ONE + 50),
      heroShift: 50,
    })
  })
})
