import { decimal, object } from '../format'

export function Metric({
  label,
  value,
  places = 2,
  percent = false,
}: {
  label: string
  value: unknown
  places?: number
  percent?: boolean
}) {
  const m = object(value),
    raw = 'value' in m ? m.value : value
  return (
    <div className="data-metric">
      <dt>{label}</dt>
      <dd>{decimal(raw, places, percent)}</dd>
      {typeof m.reason === 'string' && <small>{m.reason}</small>}
    </div>
  )
}
