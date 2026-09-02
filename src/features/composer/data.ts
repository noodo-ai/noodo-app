import { Tractor } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { ComposerMode } from './types'

export const composerModes: ComposerMode[] = ['Quick Run', 'Deep Think', 'Create']

export type CapabilityId = 'farm'

export const capabilities: Array<{ id: CapabilityId; label: string; Icon: IconType }> = [
  { id: 'farm', label: 'Build, version, and deploy data workflows.', Icon: Tractor },
]
