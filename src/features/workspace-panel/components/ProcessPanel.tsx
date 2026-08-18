import { Undo2 } from 'lucide-react'
import { useProcessConfiguration } from '../hooks/useProcessConfiguration'
import { ProcessGroupTabs } from './ProcessGroupTabs'
import { ProcessItemList } from './ProcessItemList'

export function ProcessPanel() {
  const configuration = useProcessConfiguration()

  return (
    <div className="panel-content">
      <h2>Define how work gets done.</h2>
      <p className="panel-intro">Keep capabilities, guidance, and connections in one place.</p>
      <ProcessGroupTabs activeGroup={configuration.activeGroup} onSelect={configuration.selectGroup} onCreate={configuration.createItem} />
      <ProcessItemList
        items={configuration.items}
        editingItemId={configuration.editingItemId}
        onToggle={configuration.toggleItem}
        onStartEditing={configuration.startEditing}
        onCancelEditing={configuration.cancelEditing}
        onSave={configuration.saveItem}
        onDelete={configuration.deleteItem}
      />
      {configuration.deletedItem && <div className="process-undo" role="status"><span>{configuration.deletedItem.item.name} deleted.</span><button type="button" onClick={configuration.undoDelete}><Undo2 size={14} />Undo</button></div>}
    </div>
  )
}
