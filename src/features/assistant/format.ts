export const object = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export const list = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : []
export const text = (value: unknown, fallback = 'Unknown'): string =>
  typeof value === 'string' ? value : fallback
export { decimal } from '../../shared/format'
export const shortAddress = (address: string | null) =>
  address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : 'No account selected'
export const queryTime = (time: number) =>
  new Date(time).toLocaleString(undefined, { hour12: false })
