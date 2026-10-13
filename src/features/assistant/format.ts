export const object = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export const list = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : []
export const text = (value: unknown, fallback = 'Unknown'): string =>
  typeof value === 'string' ? value : fallback
export function decimal(value: unknown, places = 2, percent = false): string {
  if (typeof value !== 'string') return 'Unknown'
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(value)
  if (!match) return 'Unknown'
  const exponent = Number(match[4] ?? 0)
  // Bound expansion while keeping the coefficient entirely in decimal/BigInt form.
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000)
    return 'Unknown'
  const sign = match[1],
    fraction = match[3] ?? '',
    scale = fraction.length - exponent
  let units = BigInt(match[2] + fraction)
  const adjust = (percent ? 2 : 0) + places - scale
  if (adjust >= 0) units *= 10n ** BigInt(adjust)
  else {
    const divisor = 10n ** BigInt(-adjust)
    if (units !== 0n && units * 2n < divisor)
      return `${sign}<${places ? `0.${'0'.repeat(places - 1)}1` : '1'}${percent ? '%' : ''}`
    units = (units + divisor / 2n) / divisor
  }
  const str = units.toString().padStart(places + 1, '0'),
    whole = places ? str.slice(0, -places) : str,
    tail = places ? `.${str.slice(-places)}` : ''
  return `${units && sign ? sign : ''}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${tail}${percent ? '%' : ''}`
}
export const shortAddress = (address: string | null) =>
  address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : 'No account selected'
export const queryTime = (time: number) =>
  new Date(time).toLocaleString(undefined, { hour12: false })
