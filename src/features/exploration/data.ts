import { BarChart3, Check, FileText, Globe2, MonitorUp, Sparkles } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'

export interface Inspiration {
  title: string
  description: string
  Icon: IconType
}

export const inspirations: Inspiration[] = [
  { title: 'Plan a product launch', description: 'Build a complete plan from positioning to channels and timeline', Icon: Sparkles },
  { title: 'Turn meeting notes into actions', description: 'Identify owners, priorities, and due dates', Icon: Check },
  { title: 'Research competitor pricing', description: 'Compare plans, prices, and key differentiators', Icon: BarChart3 },
  { title: 'Create a weekly update', description: 'Summarize this week’s progress in a concise report', Icon: FileText },
  { title: 'Extract insights from a webpage', description: 'Capture key facts and organize them by topic', Icon: Globe2 },
  { title: 'Design a mobile homepage', description: 'Define the information hierarchy and key interactions', Icon: MonitorUp },
]
