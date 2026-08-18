import { useState } from 'react'
import { processGroups, type ProcessConfigItem, type ProcessGroupId } from '../data'

type ItemsByGroup = Record<ProcessGroupId, ProcessConfigItem[]>
type DeletedItem = { groupId: ProcessGroupId; item: ProcessConfigItem; index: number }

function createInitialItems(): ItemsByGroup {
  return processGroups.reduce<ItemsByGroup>((groups, group) => {
    groups[group.id] = group.items.map((item) => ({ ...item }))
    return groups
  }, { skills: [], rules: [], mcp: [] })
}

export function useProcessConfiguration() {
  const [activeGroup, setActiveGroup] = useState<ProcessGroupId>('skills')
  const [itemsByGroup, setItemsByGroup] = useState<ItemsByGroup>(createInitialItems)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [deletedItem, setDeletedItem] = useState<DeletedItem | null>(null)

  const selectGroup = (groupId: ProcessGroupId) => {
    setActiveGroup(groupId)
    setEditingItemId(null)
  }

  const updateItems = (groupId: ProcessGroupId, updater: (items: ProcessConfigItem[]) => ProcessConfigItem[]) => {
    setItemsByGroup((current) => ({ ...current, [groupId]: updater(current[groupId]) }))
  }

  const toggleItem = (itemId: string) => updateItems(activeGroup, (items) => items.map((item) => item.id === itemId ? { ...item, enabled: !item.enabled } : item))

  const saveItem = (itemId: string, name: string, description: string) => {
    updateItems(activeGroup, (items) => items.map((item) => item.id === itemId ? { ...item, name, description } : item))
    setEditingItemId(null)
  }

  const createItem = () => {
    const itemId = `${activeGroup}-new-${Date.now()}`
    const item: ProcessConfigItem = {
      id: itemId,
      name: 'Untitled item',
      description: 'Add a concise description for this configuration item before using it.',
      enabled: true,
    }
    updateItems(activeGroup, (items) => [...items, item])
    setEditingItemId(itemId)
  }

  const deleteItem = (itemId: string) => {
    const index = itemsByGroup[activeGroup].findIndex((item) => item.id === itemId)
    if (index < 0) return
    const item = itemsByGroup[activeGroup][index]
    updateItems(activeGroup, (items) => items.filter(({ id }) => id !== itemId))
    setEditingItemId(null)
    setDeletedItem({ groupId: activeGroup, item, index })
  }

  const undoDelete = () => {
    if (!deletedItem) return
    updateItems(deletedItem.groupId, (items) => {
      const restored = [...items]
      restored.splice(deletedItem.index, 0, deletedItem.item)
      return restored
    })
    setDeletedItem(null)
  }

  return {
    activeGroup,
    items: itemsByGroup[activeGroup],
    editingItemId,
    deletedItem,
    selectGroup,
    toggleItem,
    startEditing: setEditingItemId,
    cancelEditing: () => setEditingItemId(null),
    saveItem,
    createItem,
    deleteItem,
    undoDelete,
  }
}
