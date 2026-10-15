import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronLeft, SlidersHorizontal } from 'lucide-react'
import { resourceFormats, resourceTopics, type Category, type ResourceFilters } from '../types'

export interface ResourceFilterMenuProps {
  filters: ResourceFilters
  categories: Category[]
  onChange: (key: 'format' | 'topic' | 'sort' | 'categoryId', value: string) => void
}
type FilterKey = 'format' | 'topic' | 'sort' | 'categoryId'
interface FilterGroup { key: FilterKey; label: string; options: { value: string; label: string }[] }

function moveFocus(event: KeyboardEvent<HTMLDivElement>): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(':scope > button'))
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length
  event.preventDefault()
  event.stopPropagation()
  buttons[next]?.focus()
}

export function ResourceFilterMenu({ filters, categories, onChange }: ResourceFilterMenuProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<FilterKey | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const options = useRef<HTMLDivElement>(null)
  const focusOptions = useRef(false)
  const id = useId()
  const groups: FilterGroup[] = [
    { key: 'format', label: 'Format', options: [{ value: '', label: 'All formats' }, ...resourceFormats.filter(format => format !== 'jpeg').map(format => ({ value: format, label: format.toUpperCase() }))] },
    { key: 'topic', label: 'Topic', options: [{ value: '', label: 'All topics' }, ...resourceTopics.map(topic => ({ value: topic, label: topic }))] },
    { key: 'sort', label: 'Sort by', options: [{ value: 'latest', label: 'Latest' }, { value: 'popular', label: 'Popular' }] },
    ...(filters.scope === 'personal' ? [{ key: 'categoryId' as const, label: 'Category', options: [{ value: '', label: 'All categories' }, { value: 'uncategorized', label: 'Uncategorized' }, ...categories.map(category => ({ value: category.id, label: category.name }))] }] : []),
  ]
  const group = groups.find(item => item.key === selected)
  const filtered = Boolean(filters.format || filters.topic || filters.categoryId || filters.sort !== 'latest')
  function close(restoreFocus: boolean): void {
    setOpen(false)
    setSelected(null)
    if (restoreFocus) trigger.current?.focus()
  }
  useEffect(() => {
    if (!open) return
    function outside(event: PointerEvent): void {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { setOpen(false); setSelected(null) }
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useLayoutEffect(() => {
    if (open) root.current?.querySelector<HTMLButtonElement>('[role="menu"] > button')?.focus()
  }, [open])
  useLayoutEffect(() => {
    if (focusOptions.current) { options.current?.querySelector<HTMLButtonElement>('button')?.focus(); focusOptions.current = false }
  }, [selected])
  function showGroup(key: FilterKey, keyboard: boolean): void {
    if (selected === key && keyboard) { options.current?.querySelector<HTMLButtonElement>('button')?.focus(); return }
    focusOptions.current = keyboard
    setSelected(key)
  }
  return <div className="resource-filter-control" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close(false)
  }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true) }
  }}>
    <button ref={trigger} className="resource-filter-trigger" aria-label={filtered ? 'Filter resources (active)' : 'Filter resources'} title="Filter resources" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => open ? close(false) : setOpen(true)} onKeyDown={event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true) }
    }}><SlidersHorizontal size={16} strokeWidth={1.6} />{filtered && <span className="resource-filter-dot" />}</button>
    {open && <div id={id} className={`resource-filter-popup ${group ? 'with-options' : ''}`}>
      <div role="menu" aria-label="Resource filters" className="resource-filter-groups" onKeyDown={moveFocus}>
        {groups.map(item => <button key={item.key} role="menuitem" aria-haspopup="menu" aria-expanded={selected === item.key} aria-controls={selected === item.key ? `${id}-options` : undefined} onClick={event => showGroup(item.key, event.detail === 0)} onKeyDown={event => {
          if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft')) { event.preventDefault(); showGroup(item.key, true) }
        }}><ChevronLeft size={14} strokeWidth={1.6} /><span>{item.label}</span></button>)}
      </div>
      {group && <div id={`${id}-options`} ref={options} role="menu" aria-label={`${group.label} options`} className="resource-filter-options" onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); event.stopPropagation()
          root.current?.querySelector<HTMLButtonElement>('[aria-expanded="true"][role="menuitem"]')?.focus()
          setSelected(null)
        } else moveFocus(event)
      }}>
        {group.options.map(option => <button key={option.value} role="menuitemradio" title={option.label} aria-checked={filters[group.key] === option.value} onClick={() => { onChange(group.key, option.value); close(true) }}><span>{option.label}</span>{filters[group.key] === option.value && <Check size={14} strokeWidth={1.6} />}</button>)}
      </div>}
    </div>}
  </div>
}
