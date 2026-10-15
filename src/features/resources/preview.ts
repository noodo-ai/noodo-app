export function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
// Parse only the visible sample, including quoted commas, escaped quotes and multiline fields.
export function csvPreview(text: string, limit = 101): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', quoted = false
  for (let i = 0; i < text.length && rows.length < limit; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { if (field.length < 2000) field += '"'; i++ }
      else quoted = !quoted
    } else if (char === ',' && !quoted) { if (row.length < 20) row.push(field); field = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++
      if (row.length < 20) row.push(field); rows.push(row.slice(0, 20)); row = []; field = ''
    } else if (field.length < 2000) field += char
  }
  if (rows.length < limit && (field || row.length)) { if (row.length < 20) row.push(field); rows.push(row.slice(0, 20)) }
  return rows
}
