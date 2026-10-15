import { request } from '../../shared/api'
import type { ResourceFilters, ResourcePage, ResourceMetadata, ResourceDetail, UploadFile } from './types'
export function listResources(filters: ResourceFilters, offset: number, signal?: AbortSignal): Promise<ResourcePage> {
  const query = new URLSearchParams({ scope: filters.scope, search: filters.search, sort: filters.sort, offset: String(offset) })
  for (const key of ['visibility', 'categoryId', 'topic', 'format'] as const) if (filters[key]) query.set(key, filters[key])
  return request(`/resources?${query}`, { signal })
}
export function saveResource(id: string | undefined, input: ResourceMetadata, files: UploadFile[]): Promise<ResourceDetail> {
  return request(id ? `/resources/${id}` : '/resources', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(id ? input : { ...input, files }) })
}
export async function uploadFile(file: File): Promise<UploadFile> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return { name: file.name, base64: btoa(binary) }
}
export function fileUrl(resourceId: string, fileId: string, preview = false): string {
  return `/v1/resources/${resourceId}/files/${fileId}${preview ? '?preview=1' : ''}`
}
