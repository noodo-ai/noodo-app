import { useMemo, useState } from 'react'
import { agentOutcomes } from '../data'
import { filterAgentOutcomes, paginateAgentOutcomes, sortAgentOutcomes } from '../slurpTableUtils'
import type { SlurpSort, SlurpStatusFilter } from '../slurpTableTypes'

export const SLURP_PAGE_SIZE = 20

export function useSlurpTable() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SlurpStatusFilter>('all')
  const [sort, setSort] = useState<SlurpSort>('score-desc')
  const [page, setPage] = useState(1)

  const filteredItems = useMemo(() => sortAgentOutcomes(filterAgentOutcomes(agentOutcomes, query, statusFilter), sort), [query, sort, statusFilter])
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / SLURP_PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = paginateAgentOutcomes(filteredItems, currentPage, SLURP_PAGE_SIZE)

  const updateQuery = (value: string) => { setQuery(value); setPage(1) }
  const updateStatusFilter = (value: SlurpStatusFilter) => { setStatusFilter(value); setPage(1) }
  const updateSort = (value: SlurpSort) => { setSort(value); setPage(1) }

  return {
    query,
    statusFilter,
    sort,
    page: currentPage,
    pageCount,
    total: filteredItems.length,
    pageItems,
    setQuery: updateQuery,
    setStatusFilter: updateStatusFilter,
    setSort: updateSort,
    previousPage: () => setPage((current) => Math.max(1, current - 1)),
    nextPage: () => setPage((current) => Math.min(pageCount, current + 1)),
  }
}
