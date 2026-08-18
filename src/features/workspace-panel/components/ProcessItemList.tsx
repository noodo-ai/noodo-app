import { Pencil, Save, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { ProcessConfigItem } from '../data'
import { truncateDescription } from '../utils'

export interface ProcessItemListProps {
  items: ProcessConfigItem[]
  editingItemId: string | null
  onToggle: (itemId: string) => void
  onStartEditing: (itemId: string) => void
  onCancelEditing: () => void
  onSave: (itemId: string, name: string, description: string) => void
  onDelete: (itemId: string) => void
}

interface ProcessItemEditorProps {
  item: ProcessConfigItem
  onSave: (itemId: string, name: string, description: string) => void
  onCancel: () => void
}

function ProcessItemEditor({ item, onSave, onCancel }: ProcessItemEditorProps) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (name.trim() && description.trim()) onSave(item.id, name.trim(), description.trim())
  }

  return (
    <form className="process-item-editor" onSubmit={submit}>
      <label>Name<input value={name} onChange={(event) => setName(event.target.value)} aria-label="Item name" /></label>
      <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} aria-label="Item description" rows={3} /></label>
      <div><button type="submit" className="process-save" disabled={!name.trim() || !description.trim()}><Save size={14} />Save</button><button type="button" className="process-cancel" onClick={onCancel}><X size={14} />Cancel</button></div>
    </form>
  )
}

export function ProcessItemList({ items, editingItemId, onToggle, onStartEditing, onCancelEditing, onSave, onDelete }: ProcessItemListProps) {
  if (!items.length) return <div className="process-empty" role="status">No items in this group. Restore a deleted item or select another group.</div>

  return (
    <ul className="process-config-list" aria-label="Process configuration items">
      {items.map((item) => (
        <li className={`process-config-item ${item.enabled ? '' : 'disabled'}`} key={item.id}>
          <div className="process-item-summary">
            <span><strong>{item.name}</strong><small title={item.description}>{truncateDescription(item.description)}</small></span>
            <div className="process-item-actions">
              <button type="button" className="process-toggle" role="switch" aria-checked={item.enabled} aria-label={`${item.enabled ? 'Disable' : 'Enable'} ${item.name}`} onClick={() => onToggle(item.id)}><span /></button>
              <button type="button" className="process-icon-button" aria-label={`Edit ${item.name}`} onClick={() => onStartEditing(item.id)}><Pencil size={15} /></button>
              <button type="button" className="process-icon-button danger" aria-label={`Delete ${item.name}`} onClick={() => onDelete(item.id)}><Trash2 size={15} /></button>
            </div>
          </div>
          {editingItemId === item.id && <ProcessItemEditor item={item} onSave={onSave} onCancel={onCancelEditing} />}
        </li>
      ))}
    </ul>
  )
}
