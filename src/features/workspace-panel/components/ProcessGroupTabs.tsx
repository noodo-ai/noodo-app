import { Plus } from 'lucide-react'
import { processGroups, type ProcessGroupId } from '../data'

export interface ProcessGroupTabsProps {
  activeGroup: ProcessGroupId
  onSelect: (groupId: ProcessGroupId) => void
  onCreate: () => void
}

export function ProcessGroupTabs({ activeGroup, onSelect, onCreate }: ProcessGroupTabsProps) {
  return (
    <div className="process-group-controls">
      <div className="process-group-tabs" role="tablist" aria-label="Process configuration groups">
        {processGroups.map(({ id, label }) => (
          <button type="button" role="tab" key={id} aria-selected={activeGroup === id} className={activeGroup === id ? 'selected' : ''} onClick={() => onSelect(id)}>{label}</button>
        ))}
      </div>
      <button type="button" className="process-new-item" onClick={onCreate}><Plus size={14} />New</button>
    </div>
  )
}
