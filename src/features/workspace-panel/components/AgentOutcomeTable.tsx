import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AgentOutcome } from '../data'
import { useVirtualRows } from '../hooks/useVirtualRows'

const ROW_HEIGHT = 50
const VIEWPORT_HEIGHT = 300

export interface AgentOutcomeTableProps {
  items: AgentOutcome[]
  page: number
  pageCount: number
  total: number
  onSelectOutcome: (outcomeId: string) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

function StatusLabel({ status }: { status: AgentOutcome['status'] }) {
  return <span className={`outcome-status ${status}`}><i />{status}</span>
}

export function AgentOutcomeTable({ items, page, pageCount, total, onSelectOutcome, onPreviousPage, onNextPage }: AgentOutcomeTableProps) {
  const { onScroll, visibleItems, topSpacerHeight, bottomSpacerHeight } = useVirtualRows({ items, rowHeight: ROW_HEIGHT, viewportHeight: VIEWPORT_HEIGHT })

  if (!items.length) return <div className="slurp-table-empty" role="status">No agents match the current search and filter.</div>

  return (
    <>
      <div className="slurp-table-viewport" onScroll={onScroll}>
        <table className="slurp-table">
          <thead><tr><th scope="col">Agent</th><th scope="col">Focus</th><th scope="col" className="numeric">Runs</th><th scope="col" className="numeric">Score</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {topSpacerHeight > 0 && <tr className="slurp-spacer" aria-hidden="true"><td colSpan={5} style={{ height: topSpacerHeight }} /></tr>}
            {visibleItems.map((item) => <tr key={item.id} className="slurp-table-row" tabIndex={0} onClick={() => onSelectOutcome(item.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectOutcome(item.id) } }}><td><strong>{item.name}</strong></td><td>{item.specialty}</td><td className="numeric">{item.completed}</td><td className="numeric"><b>{item.score}</b></td><td><StatusLabel status={item.status} /></td></tr>)}
            {bottomSpacerHeight > 0 && <tr className="slurp-spacer" aria-hidden="true"><td colSpan={5} style={{ height: bottomSpacerHeight }} /></tr>}
          </tbody>
        </table>
      </div>
      <div className="slurp-pagination" aria-label="Table pagination"><span>{total} agents · Page {page} of {pageCount}</span><div><button type="button" aria-label="Previous page" onClick={onPreviousPage} disabled={page === 1}><ChevronLeft size={15} /></button><button type="button" aria-label="Next page" onClick={onNextPage} disabled={page === pageCount}><ChevronRight size={15} /></button></div></div>
    </>
  )
}
