import { useEffect, useRef, useState } from 'react'
import { FileText, Globe, Lock, Search, TrendingUp } from 'lucide-react'
import { useResources, initialFilters } from '../hooks/useResources'
import { type ResourceDetail, type ResourceItem } from '../types'
import { formatBytes } from '../preview'
import { ResourceEditor } from './ResourceEditor'
import { ResourceDetailView } from './ResourceDetailView'
import { ResourceFilterMenu } from './ResourceFilterMenu'
export interface ResourcesPanelProps { userId: string; active: boolean }
type View = { kind: 'list' } | { kind: 'detail'; id: string } | { kind: 'editor'; resource: ResourceDetail }
function ResourceCard({ item, onOpen, popular = false }: { item: ResourceItem; onOpen: (id: string) => void; popular?: boolean }) {
  const formats = [...new Set([...(item.hasBody ? ['md'] : []), ...item.files.map(file => file.format)])]
  return <button className={`resource-card ${popular ? 'popular' : ''}`} onClick={() => onOpen(item.id)}>
    <span className="resource-card-top"><FileText size={16} /><span>{item.topic}</span>{item.visibility === 'private' ? <Lock size={13} aria-label="Private" /> : <Globe size={13} aria-label="Public" />}</span>
    <strong>{item.title}</strong>{item.summary && <span className="resource-card-summary">{item.summary}</span>}
    <span className="resource-meta">{item.author} · {formats.join(' / ').toUpperCase()}</span>
    <span className="resource-meta">{popular ? `${item.views} ${item.views === 1 ? 'reader' : 'readers'} this week` : `${formatBytes(item.bytes)} · ${new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</span>
  </button>
}
export function ResourcesPanel({ userId, active }: ResourcesPanelProps) {
  const data = useResources(active)
  const [view, setView] = useState<View>({ kind: 'list' })
  const focusRef = useRef<HTMLDivElement>(null)
  const previousView = useRef(view)
  useEffect(() => {
    if (active && previousView.current !== view) focusRef.current?.querySelector<HTMLElement>('input,button')?.focus()
    previousView.current = view
  }, [active, view])
  function open(id: string): void { setView({ kind: 'detail', id }) }
  function back(): void { setView({ kind: 'list' }); data.refresh() }
  const { filters } = data
  const showPopular = filters.scope === 'community' && !filters.search && !filters.topic && !filters.format
  return <div className="resources" ref={focusRef}>
    {view.kind === 'editor' ? <ResourceEditor key={view.resource.id} resource={view.resource} categories={data.storage.categories} onCancel={() => open(view.resource.id)} onSaved={resource => { open(resource.id); data.refresh() }} /> : view.kind === 'detail' ? <ResourceDetailView key={view.id} id={view.id} userId={userId} onBack={back} onEdit={resource => setView({ kind: 'editor', resource })} onDeleted={back} /> : <>
      <div className="resource-scope" aria-label="Resource library"><button aria-pressed={filters.scope === 'community'} onClick={() => { data.setFilters({ ...initialFilters, scope: 'community' }) }}>Community</button><button aria-pressed={filters.scope === 'personal'} onClick={() => data.setFilters({ ...initialFilters, scope: 'personal', visibility: 'private' })}>Personal</button></div>
      <div className="resource-section-head"><p className="resource-hint">{filters.scope === 'community' ? 'Reports and datasets shared by the community.' : 'Your reports, datasets and saved AI work.'}</p></div>
      <div className="resource-search-row">
        <label className="resource-search"><Search size={16} /><input aria-label="Search resources" placeholder="Search titles and summaries" value={filters.search} maxLength={120} onChange={e => data.setFilters(old => ({ ...old, search: e.target.value }))} /></label>
        {active && <ResourceFilterMenu key={filters.scope} filters={filters} categories={data.storage.categories} onChange={(key, value) => data.setFilters(old => ({ ...old, [key]: value }))} />}
      </div>
      {filters.scope === 'personal' && <>
        <div className="resource-personal-toolbar">
          <div className="resource-visibility-filters" aria-label="Visibility">{(['public', 'private'] as const).map(value => <button key={value} aria-pressed={filters.visibility === value} onClick={() => data.setFilters(old => ({ ...old, visibility: value }))}>{value === 'public' ? 'Public' : 'Private'}</button>)}</div>
        </div>
        <p className="resource-hint">{formatBytes(data.storage.usedBytes)} of {formatBytes(data.storage.limitBytes)} used</p>
      </>}
      {data.error && <div role="alert" className="resource-error">{data.error}<button onClick={data.refresh}>Retry</button></div>}
      <section className="resource-results" aria-label="Resource results" aria-busy={data.refreshing}>
        {showPopular && !data.error && data.popular.length > 0 && <section className="resource-popular"><h2><TrendingUp size={15} />Popular resources</h2><div className="resource-popular-grid">{data.popular.map(item => <ResourceCard key={item.id} item={item} onOpen={open} popular />)}</div></section>}
        <div className="resource-section-head"><h2>{filters.scope === 'personal' ? 'My resources' : 'Explore resources'}</h2></div>
        <div className="resource-list">{data.items.map(item => <ResourceCard key={item.id} item={item} onOpen={open} />)}</div>
        {!data.items.length && !data.error && !data.loading && <div className="resource-empty"><FileText size={24} /><strong>{filters.search || filters.categoryId || filters.topic || filters.format ? 'No matching resources' : filters.scope === 'personal' ? 'No resources yet' : 'No public resources yet'}</strong><p>{filters.scope === 'personal' ? 'Your saved reports and datasets will appear here.' : 'Public reports and datasets will appear here.'}</p></div>}
        {data.loading && <p role="status" className="resource-hint">Loading resources…</p>}
        {data.nextOffset !== null && <button className="resource-load-more" onClick={() => void data.loadMore()} disabled={data.loadingMore || data.refreshing}>{data.loadingMore ? 'Loading…' : 'Load more'}</button>}
      </section>
    </>}
  </div>
}
