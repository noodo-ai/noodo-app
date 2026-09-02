import { Tractor } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { RightPanelView } from './types'

export interface PanelViewDefinition {
  id: RightPanelView
  label: string
  Icon: IconType
}

export const panelViews: PanelViewDefinition[] = [
  { id: 'farm', label: 'Farm', Icon: Tractor },
]
