import { Activity, ScanBox } from 'lucide-react'
import type { IconType } from '../../shared/types/icon'
import type { RightPanelView } from './types'

export interface PanelViewDefinition {
  id: RightPanelView
  label: string
  Icon: IconType
}

export const panelViews: PanelViewDefinition[] = [
  { id: 'trends', label: 'Trends', Icon: Activity },
  { id: 'resources', label: 'Resources', Icon: ScanBox },
]
