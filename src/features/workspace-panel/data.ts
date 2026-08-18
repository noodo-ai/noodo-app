import { BarChart3, BookOpen, Bot, Check, CookingPot, FileText, Globe2, Lightbulb, LoaderPinwheel, MonitorUp, Search, SlidersHorizontal, Soup, Sparkles, Wheat } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { RightPanelView } from './types'

export interface PanelViewDefinition {
  id: RightPanelView
  label: string
  Icon: IconType
  description: string
}

export type FarmAgentStatus = 'ready' | 'working'

export interface FarmAgent {
  name: string
  Icon: IconType
  status: FarmAgentStatus
  description: string
  specialty: string
  completedRuns: number
  averageDuration: string
}

export type ProcessGroupId = 'skills' | 'rules' | 'mcp'

export interface ProcessConfigItem {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface ProcessGroup {
  id: ProcessGroupId
  label: string
  items: ProcessConfigItem[]
}

export const panelViews: PanelViewDefinition[] = [
  { id: 'farm', label: 'Farm', Icon: Wheat, description: 'Bring agents into one calm, coordinated workspace.' },
  { id: 'process', label: 'Process', Icon: LoaderPinwheel, description: 'Shape how work runs with skills, rules, and MCP.' },
  { id: 'cooking', label: 'Cooking', Icon: CookingPot, description: 'Follow live tasks, execution stages, and reasoning summaries.' },
  { id: 'slurp', label: 'Slurp', Icon: Soup, description: 'Review completed work signals and agent capability levels.' },
]

export const farmAgents: FarmAgent[] = [
  { name: 'Scout', Icon: Search, status: 'ready', description: 'Finds reliable signals and turns them into concise research briefs.', specialty: 'Research', completedRuns: 42, averageDuration: '4 min' },
  { name: 'Maker', Icon: MonitorUp, status: 'working', description: 'Builds focused product surfaces from a clear implementation brief.', specialty: 'Product building', completedRuns: 28, averageDuration: '12 min' },
  { name: 'Planner', Icon: BarChart3, status: 'ready', description: 'Scopes work into milestones, risks, and a practical sequence of actions.', specialty: 'Planning', completedRuns: 35, averageDuration: '6 min' },
  { name: 'Editor', Icon: FileText, status: 'ready', description: 'Clarifies draft material while preserving its original intent and voice.', specialty: 'Editing', completedRuns: 31, averageDuration: '5 min' },
  { name: 'Analyst', Icon: Bot, status: 'working', description: 'Connects evidence, trends, and constraints to help teams make decisions.', specialty: 'Analysis', completedRuns: 26, averageDuration: '8 min' },
  { name: 'Writer', Icon: BookOpen, status: 'ready', description: 'Turns structured input into useful product, project, and narrative copy.', specialty: 'Writing', completedRuns: 39, averageDuration: '7 min' },
  { name: 'Coder', Icon: SlidersHorizontal, status: 'working', description: 'Translates implementation plans into maintainable production code.', specialty: 'Engineering', completedRuns: 47, averageDuration: '15 min' },
  { name: 'Reviewer', Icon: Check, status: 'ready', description: 'Checks work for completeness, clarity, and meaningful edge cases.', specialty: 'Review', completedRuns: 33, averageDuration: '5 min' },
  { name: 'Mapper', Icon: Globe2, status: 'ready', description: 'Organizes systems, content, and dependencies into clear shared maps.', specialty: 'Mapping', completedRuns: 22, averageDuration: '6 min' },
  { name: 'Tester', Icon: Sparkles, status: 'working', description: 'Explores product behavior and identifies the highest-value quality checks.', specialty: 'Quality', completedRuns: 29, averageDuration: '9 min' },
  { name: 'Runner', Icon: CookingPot, status: 'ready', description: 'Coordinates routine execution steps and follows work through to delivery.', specialty: 'Operations', completedRuns: 37, averageDuration: '10 min' },
  { name: 'Guide', Icon: Lightbulb, status: 'ready', description: 'Offers concise guidance to unblock decisions and next actions.', specialty: 'Guidance', completedRuns: 24, averageDuration: '4 min' },
]

export const connectionOptions: Array<{ id: string; label: string; description: string; Icon: IconType }> = [
  { id: 'workspace-agent', label: 'Workspace agent', description: 'Bring in an existing specialized agent.', Icon: Bot },
  { id: 'local-skill', label: 'Local skill', description: 'Connect a focused capability from this workspace.', Icon: Sparkles },
  { id: 'mcp-connection', label: 'MCP connection', description: 'Make an approved external tool available to an agent.', Icon: SlidersHorizontal },
]

export const processGroups: ProcessGroup[] = [
  {
    id: 'skills',
    label: 'Skills',
    items: [
      { id: 'research-brief', name: 'Research brief', description: 'Turn reliable sources into a concise structured research brief for the workspace.', enabled: true },
      { id: 'product-writing', name: 'Product writing', description: 'Write clear interface, release, and product guidance with a consistent voice.', enabled: true },
      { id: 'quality-review', name: 'Quality review', description: 'Review work for edge cases, correctness, accessibility, and delivery readiness.', enabled: false },
    ],
  },
  {
    id: 'rules',
    label: 'Rules',
    items: [
      { id: 'calm-ui', name: 'Calm interface', description: 'Use the quiet Noodo visual language for product surfaces and interaction feedback.', enabled: true },
      { id: 'source-check', name: 'Source check', description: 'Verify time-sensitive facts against authoritative sources before presenting them.', enabled: true },
      { id: 'small-changes', name: 'Small changes', description: 'Prefer focused, reversible implementation steps and preserve unrelated user work.', enabled: true },
    ],
  },
  {
    id: 'mcp',
    label: 'MCP',
    items: [
      { id: 'project-files', name: 'Project files', description: 'Read and update the current workspace files when the task explicitly requires it.', enabled: true },
      { id: 'local-browser', name: 'Local browser', description: 'Use the local browser only to validate visual and interactive product changes.', enabled: true },
      { id: 'research-search', name: 'Research search', description: 'Search authoritative sources when current or precise external information is required.', enabled: false },
    ],
  },
]

export const agentOutcomes = [
  { name: 'Product researcher', completed: 42, score: 94, metrics: [['Research', 96], ['Synthesis', 93], ['Sources', 91]] },
  { name: 'Interface designer', completed: 28, score: 88, metrics: [['Structure', 91], ['Clarity', 89], ['Polish', 84]] },
  { name: 'Workflow operator', completed: 35, score: 76, metrics: [['Planning', 81], ['Execution', 78], ['Follow-through', 69]] },
] as const
