import { EXPLORE_MAX, EXPLORE_STAGE_ONE } from './constants'

export function clampExploreProgress(progress: number): number {
  return Math.max(0, Math.min(EXPLORE_MAX, progress))
}

export function getExploreTransforms(progress: number) {
  const stageTwoProgress = Math.max(0, progress - EXPLORE_STAGE_ONE)
  return {
    drawerShift: -(Math.min(progress, EXPLORE_STAGE_ONE) + stageTwoProgress),
    heroShift: stageTwoProgress,
  }
}
