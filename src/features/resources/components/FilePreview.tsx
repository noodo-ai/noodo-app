import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fileUrl } from '../api'
import { csvPreview } from '../preview'
import type { ResourceFile } from '../types'
export interface FilePreviewProps { resourceId: string; file: ResourceFile }
export function FilePreview({ resourceId, file }: FilePreviewProps) {
  const [preview, setPreview] = useState<{ text?: string; url?: string } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | undefined
    void fetch(fileUrl(resourceId, file.id, true), { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('File could not be loaded. It may no longer be available.')
      const blob = await response.blob()
      if (controller.signal.aborted) return
      if (file.format === 'pdf' || file.mime.startsWith('image/')) {
        objectUrl = URL.createObjectURL(blob); setPreview({ url: objectUrl })
      } else { const text = await blob.text(); if (!controller.signal.aborted) setPreview({ text }) }
    }).catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Preview failed') })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [resourceId, file.id, file.format, file.mime])
  if (error) return <p role="alert" className="resource-error">{error}</p>
  if (!preview) return <p role="status" className="resource-hint">Loading preview…</p>
  if (file.format === 'pdf') return <><iframe className="resource-pdf" title={file.name} src={preview.url} /><p className="resource-hint">If your browser cannot preview this PDF, use Download.</p></>
  if (preview.url) return <img className="resource-image" src={preview.url} alt={file.name} onError={() => setError('This image could not be decoded. Download to inspect it.')} />
  const text = preview.text ?? ''
  if (file.format === 'csv') {
    const rows = csvPreview(text)
    return <><p className="resource-hint">Preview: first 100 data rows, 20 columns. Download for the complete dataset.</p><div className="resource-table-scroll"><table><thead><tr>{rows[0]?.map((cell, i) => <th key={i}>{cell || `Column ${i + 1}`}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></>
  }
  if (file.format === 'md') return <div className="resource-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text.slice(0, 100000)}</ReactMarkdown>{text.length > 100000 && <p className="resource-hint">Preview truncated. Download for the complete report.</p>}</div>
  let display = text
  if (file.format === 'json' && text.length <= 100000) { try { display = JSON.stringify(JSON.parse(text), null, 2) } catch { /* show raw text */ } }
  return <><pre className="resource-code">{display.slice(0, 100000)}</pre>{display.length > 100000 && <p className="resource-hint">Preview truncated. Download for the complete file.</p>}</>
}
