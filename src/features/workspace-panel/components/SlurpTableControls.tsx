import { Check, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { useState, type FocusEvent } from 'react'
import type { SlurpSort, SlurpStatusFilter } from '../slurpTableTypes'

const statusOptions: Array<{ value: SlurpStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'ready', label: 'Ready' },
  { value: 'working', label: 'Working' },
  { value: 'paused', label: 'Paused' },
]

const sortOptions: Array<{ value: SlurpSort; label: string }> = [
  { value: 'score-desc', label: 'Score: high to low' },
  { value: 'score-asc', label: 'Score: low to high' },
  { value: 'runs-desc', label: 'Most runs' },
  { value: 'name-asc', label: 'Name: A to Z' },
]

export interface SlurpTableControlsProps {
  query: string
  statusFilter: SlurpStatusFilter
  sort: SlurpSort
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: SlurpStatusFilter) => void
  onSortChange: (value: SlurpSort) => void
}

export function SlurpTableControls({ query, statusFilter, sort, onQueryChange, onStatusFilterChange, onSortChange }: SlurpTableControlsProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'status' | 'sort' | null>(null)
  const activeOptions = activeMenu === 'status' ? statusOptions : sortOptions
  const activeValue = activeMenu === 'status' ? statusFilter : sort
  const statusLabel = statusOptions.find((option) => option.value === statusFilter)?.label ?? 'All statuses'
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? 'Score: high to low'

  const closeOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFilterMenuOpen(false)
      setActiveMenu(null)
    }
  }

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen((isOpen) => !isOpen)
    setActiveMenu(null)
  }

  const selectOption = (value: SlurpStatusFilter | SlurpSort) => {
    if (activeMenu === 'status') onStatusFilterChange(value as SlurpStatusFilter)
    if (activeMenu === 'sort') onSortChange(value as SlurpSort)
    setIsFilterMenuOpen(false)
    setActiveMenu(null)
  }

  return (
    <div className="slurp-table-controls">
      <label className="slurp-search"><Search size={15} aria-hidden="true" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search agents" aria-label="Search agents" /></label>
      <div className="slurp-filter" onBlur={closeOnBlur}>
        <button type="button" className="slurp-filter-button" aria-label="Filter and sort outcomes" aria-expanded={isFilterMenuOpen} aria-haspopup="menu" onClick={toggleFilterMenu}><SlidersHorizontal size={15} /></button>
        {isFilterMenuOpen && <div className="slurp-filter-menu" role="menu" aria-label="Table filter and sort">
          <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={activeMenu === 'status'} onClick={() => setActiveMenu('status')}><span>Status<small>{statusLabel}</small></span><ChevronRight size={14} /></button>
          <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={activeMenu === 'sort'} onClick={() => setActiveMenu('sort')}><span>Sort<small>{sortLabel}</small></span><ChevronRight size={14} /></button>
          {activeMenu && <div className="slurp-filter-submenu" role="menu" aria-label={`${activeMenu} options`}>
            {activeOptions.map((option) => <button key={option.value} type="button" role="menuitemradio" aria-checked={option.value === activeValue} onClick={() => selectOption(option.value)}><span>{option.label}</span>{option.value === activeValue && <Check size={14} aria-hidden="true" />}</button>)}
          </div>}
        </div>}
      </div>
    </div>
  )
}
