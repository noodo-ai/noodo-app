import { FileText, Search, WandSparkles } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { ComposerMode } from './types'

export const composerModes: ComposerMode[] = ['Quick Run', 'Deep Think', 'Create']

export const capabilities: Array<{ label: string; Icon: IconType; prompt: string }> = [
  { label: 'Research', Icon: Search, prompt: 'Research the 2026 AI productivity market and deliver a structured brief' },
  { label: 'Document', Icon: FileText, prompt: 'Turn this long document into clear summaries and action items' },
  { label: 'Design', Icon: WandSparkles, prompt: 'Design a calm and focused mobile product homepage' },
]
