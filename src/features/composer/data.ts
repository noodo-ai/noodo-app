import { Tractor } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { ComposerMode } from './types'

export const composerModes: ComposerMode[] = ['Quick Run', 'Deep Think', 'Create']

export const capabilities: Array<{ label: string; Icon: IconType }> = [
  { label: 'Build, version, and deploy data workflows.', Icon: Tractor },
]
