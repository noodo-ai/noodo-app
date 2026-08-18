import { ChevronRight } from 'lucide-react'
import { processItems } from '../data'

export function ProcessPanel() {
  return (
    <div className="panel-content">
      <h2>Define how work gets done.</h2>
      <p className="panel-intro">Keep capabilities, guidance, and connections in one place.</p>
      <div className="process-list">
        {processItems.map(([label, detail, Icon]) => (
          <button type="button" key={label}>
            <span className="process-icon"><Icon size={17} /></span>
            <span><strong>{label}</strong><small>{detail}</small></span><ChevronRight size={15} />
          </button>
        ))}
      </div>
    </div>
  )
}
