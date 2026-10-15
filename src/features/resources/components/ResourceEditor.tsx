import { useRef, useState, type FormEvent } from 'react'
import { saveResource, uploadFile } from '../api'
import { MAX_RESOURCE_BYTES, resourceTopics, type Category, type ResourceDetail, type ResourceMetadata } from '../types'
import { formatBytes } from '../preview'

export interface ResourceEditorProps { resource?: ResourceDetail; categories: Category[]; onSaved: (resource: ResourceDetail) => void; onCancel: () => void }
export function ResourceEditor({ resource, categories, onSaved, onCancel }: ResourceEditorProps) {
  const [input, setInput] = useState<ResourceMetadata>({ title: resource?.title ?? '', summary: resource?.summary ?? '', body: resource?.body ?? '', visibility: resource?.visibility ?? 'private', categoryId: resource?.categoryId ?? null, topic: resource?.topic ?? 'Other' })
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  function change<K extends keyof ResourceMetadata>(key: K, value: ResourceMetadata[K]): void { setInput(old => ({ ...old, [key]: value })) }
  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (pending.current) return
    setError('')
    const bytes = new TextEncoder().encode(input.body).length + (resource ? resource.files : files).reduce((sum, file) => sum + ('size' in file ? file.size : file.bytes), 0)
    if (bytes > MAX_RESOURCE_BYTES) { setError('Keep report text and attachments within 10 MB.'); return }
    if (!input.body.trim() && !(resource?.files.length || files.length)) { setError('Add report text or at least one file.'); return }
    pending.current = true
    setBusy(true)
    try { onSaved(await saveResource(resource?.id, input, await Promise.all(files.map(uploadFile)))) }
    catch (e) { setError(e instanceof Error ? e.message : 'Resource could not be saved') }
    finally { pending.current = false; setBusy(false) }
  }
  return <form className="resource-form" onSubmit={event => void submit(event)} aria-label={resource ? 'Edit resource' : 'Add resource'}>
    <h2>{resource ? 'Edit resource' : 'Add resource'}</h2>
    <label>Title<input autoFocus required maxLength={120} value={input.title} onChange={e => change('title', e.target.value)} disabled={busy} /></label>
    <label>Summary<textarea rows={2} maxLength={500} value={input.summary} onChange={e => change('summary', e.target.value)} disabled={busy} /></label>
    <label>Report<textarea rows={9} maxLength={200000} placeholder="Write or paste a Markdown report…" value={input.body} onChange={e => change('body', e.target.value)} disabled={busy} /></label>
    <div className="resource-form-grid">
      <label>Category<select value={input.categoryId ?? ''} onChange={e => change('categoryId', e.target.value || null)} disabled={busy}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Topic<select value={input.topic} onChange={e => change('topic', e.target.value)} disabled={busy}>{resourceTopics.map(topic => <option key={topic}>{topic}</option>)}</select></label>
    </div>
    <label>Visibility<select value={input.visibility} onChange={e => change('visibility', e.target.value as ResourceMetadata['visibility'])} disabled={busy}><option value="private">Private — only you</option><option value="public">Public — signed-in community</option></select></label>
    <p className="resource-hint">{input.visibility === 'public' ? 'Publishing makes this report and every attachment visible to all signed-in users.' : 'Only you can read or download this resource.'}</p>
    {!resource && <label>Attachments<input type="file" multiple accept=".md,.txt,.csv,.json,.pdf,.png,.jpg,.jpeg,.webp" disabled={busy} onChange={e => {
      const selected = Array.from(e.target.files ?? [])
      if (selected.length > 5) { setError('Choose up to 5 attachments.'); e.target.value = ''; setFiles([]); return }
      setError(''); setFiles(selected)
    }} /></label>}
    <p className="resource-hint">Markdown, TXT, CSV, JSON, PDF, PNG, JPG, WebP. Up to 5 files and 10 MB per resource.</p>
    {(resource ? resource.files.map(f => ({ name: f.name, size: f.bytes })) : files).map((f, i) => <p className="resource-file-label" key={`${f.name}-${i}`}>{f.name} · {formatBytes(f.size)}</p>)}
    {error && <p role="alert" className="resource-error">{error}</p>}
    <div className="resource-actions"><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="resource-primary" disabled={busy}>{busy ? 'Saving…' : input.visibility === 'public' ? 'Save public resource' : 'Save resource'}</button></div>
  </form>
}
