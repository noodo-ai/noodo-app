import { BarChart3, BookOpen, Bot, Check, CookingPot, FileText, Globe2, Lightbulb, LoaderPinwheel, MonitorUp, Search, SlidersHorizontal, Soup, Sparkles, Wheat } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { RightPanelView } from './types'

export interface PanelViewDefinition {
  id: RightPanelView
  label: string
  Icon: IconType
  description: string
}

export const panelViews: PanelViewDefinition[] = [
  { id: 'farm', label: 'Farm', Icon: Wheat, description: 'Bring agents into one calm, coordinated workspace.' },
  { id: 'process', label: 'Process', Icon: LoaderPinwheel, description: 'Shape how work runs with skills, rules, and MCP.' },
  { id: 'cooking', label: 'Cooking', Icon: CookingPot, description: 'Follow live tasks, execution stages, and reasoning summaries.' },
  { id: 'slurp', label: 'Slurp', Icon: Soup, description: 'Review completed work signals and agent capability levels.' },
]

export const farmAgents: Array<{ name: string; Icon: IconType; status: 'ready' | 'working' }> = [
  { name: 'Scout', Icon: Search, status: 'ready' },
  { name: 'Maker', Icon: MonitorUp, status: 'working' },
  { name: 'Planner', Icon: BarChart3, status: 'ready' },
  { name: 'Editor', Icon: FileText, status: 'ready' },
  { name: 'Analyst', Icon: Bot, status: 'working' },
  { name: 'Writer', Icon: BookOpen, status: 'ready' },
  { name: 'Coder', Icon: SlidersHorizontal, status: 'working' },
  { name: 'Reviewer', Icon: Check, status: 'ready' },
  { name: 'Mapper', Icon: Globe2, status: 'ready' },
  { name: 'Tester', Icon: Sparkles, status: 'working' },
  { name: 'Runner', Icon: CookingPot, status: 'ready' },
  { name: 'Guide', Icon: Lightbulb, status: 'ready' },
]

export const processItems: Array<[string, string, IconType]> = [
  ['Skills', '4 enabled', Sparkles],
  ['Rules', 'Workspace defaults', BookOpen],
  ['MCP', '2 connections', SlidersHorizontal],
]

export const agentOutcomes = [
  { name: 'Product researcher', completed: 42, score: 94, metrics: [['Research', 96], ['Synthesis', 93], ['Sources', 91]] },
  { name: 'Interface designer', completed: 28, score: 88, metrics: [['Structure', 91], ['Clarity', 89], ['Polish', 84]] },
  { name: 'Workflow operator', completed: 35, score: 76, metrics: [['Planning', 81], ['Execution', 78], ['Follow-through', 69]] },
] as const
