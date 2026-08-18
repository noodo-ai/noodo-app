export function truncateDescription(description: string, limit = 30): string {
  return description.length > limit ? `${description.slice(0, limit)}…` : description
}
