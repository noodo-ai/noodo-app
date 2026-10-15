export type ResourceScope = 'community' | 'personal'
export type Visibility = 'public' | 'private'
export const resourceTopics = ['Research', 'Markets', 'Trading', 'Data', 'Other'] as const
export const resourceFormats = ['md', 'txt', 'csv', 'json', 'pdf', 'png', 'jpg', 'jpeg', 'webp'] as const
export const MAX_RESOURCE_BYTES = 10 * 1024 * 1024
export interface ResourceFile { id: string; name: string; format: string; mime: string; bytes: number }
export interface ResourceMetadata {
  title: string; summary: string; body: string; visibility: Visibility; categoryId: string | null; topic: string
}
export interface ResourceItem extends Omit<ResourceMetadata, 'body'> {
  id: string; ownerId: string; author: string; bytes: number; createdAt: number; updatedAt: number
  hasBody: number; views: number; files: ResourceFile[]
}
export interface ResourceDetail extends ResourceMetadata {
  id: string; ownerId: string; author: string; bytes: number; updatedAt: number; files: ResourceFile[]
}
export interface Category { id: string; name: string }
export interface ResourceFilters { scope: ResourceScope; search: string; visibility: string; categoryId: string; topic: string; format: string; sort: string }
export interface ResourcePage { resources: ResourceItem[]; nextOffset: number | null }
export interface ResourceStorage { categories: Category[]; usedBytes: number; limitBytes: number }
export interface UploadFile { name: string; base64: string }
