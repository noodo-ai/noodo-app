import { useEffect, useState } from 'react'
import { ArrowLeft, Download, FileText, Lock, Globe } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { request } from '../../../shared/api'
import { fileUrl } from '../api'
import type { ResourceDetail } from '../types'
import { formatBytes } from '../preview'
import { FilePreview } from './FilePreview'
export interface ResourceDetailViewProps { id: string; userId: string; onBack: () => void; onEdit: (resource: ResourceDetail) => void; onDeleted: () => void }
export function ResourceDetailView({ id, userId, onBack, onEdit, onDeleted }: ResourceDetailViewProps) {
  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    void request<ResourceDetail>(`/resources/${id}`, { signal: controller.signal }).then(detail => {
      if (controller.signal.aborted) return
      setResource(detail)
      setSelectedFile(detail.body.trim() ? null : detail.files[0]?.id ?? null)
      void request(`/resources/${id}/view`, { method: 'POST', body: '{}', signal: controller.signal }).catch(() => { /* Reading is independent of view accounting. */ })
    }).catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Resource could not be loaded') })
    return () => controller.abort()
  }, [id, revision])
  async function remove(): Promise<void> {
    setDeleting(true); setError('')
    try { await request(`/resources/${id}`, { method: 'DELETE' }); onDeleted() }
    catch (e) { setError(e instanceof Error ? e.message : 'Resource could not be deleted') }
    finally { setDeleting(false) }
  }
  const file = resource?.files.find(f => f.id === selectedFile)
  return <section className="resource-detail">
    <button className="resource-back" onClick={onBack} disabled={deleting}><ArrowLeft size={15} />Back to resources</button>
    {error && <div role="alert" className="resource-error">{error}{!resource && <button onClick={() => { setError(''); setRevision(r => r + 1) }}>Retry</button>}</div>}
    {!resource && !error && <p role="status" className="resource-hint">Loading resource…</p>}
    {resource && <>
      <h2>{resource.title}</h2><p className="resource-meta">{resource.author} · {resource.topic} · {new Date(resource.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
      <span className="resource-visibility">{resource.visibility === 'private' ? <Lock size={13} /> : <Globe size={13} />}{resource.visibility === 'private' ? 'Private · only you' : 'Public · signed-in community'}</span>
      {resource.summary && <p className="resource-summary">{resource.summary}</p>}
      {resource.ownerId === userId && <div className="resource-actions"><button onClick={() => onEdit(resource)} disabled={deleting}>Edit resource</button><button onClick={() => setConfirmDelete(true)} disabled={deleting}>Delete</button></div>}
      {confirmDelete && <div className="resource-confirm"><p>Delete this resource and all attachments?</p><button onClick={() => void remove()} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete resource'}</button><button onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</button></div>}
      <div className="resource-file-tabs" aria-label="Resource contents">
        {resource.body.trim() && <button aria-pressed={selectedFile === null} onClick={() => setSelectedFile(null)}><FileText size={14} />Report</button>}
        {resource.files.map(f => <button key={f.id} aria-pressed={selectedFile === f.id} onClick={() => setSelectedFile(f.id)}>{f.name}</button>)}
      </div>
      {file ? <><div className="resource-file-head"><span>{file.format.toUpperCase()} · {formatBytes(file.bytes)}</span><a href={fileUrl(id, file.id)} download={file.name}><Download size={14} />Download</a></div><FilePreview key={file.id} resourceId={id} file={file} /></> : <div className="resource-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{resource.body}</ReactMarkdown></div>}
    </>}
  </section>
}
