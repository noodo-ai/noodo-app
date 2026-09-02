import type { KeyboardEvent } from 'react'

export interface ResizeHandleProps {
  className: string
  label: string
  value: number
  min: number
  max?: number
  active: boolean
  widerKey: 'ArrowLeft' | 'ArrowRight'
  narrowerKey: 'ArrowLeft' | 'ArrowRight'
  onStart: () => void
  onResizeByKeyboard: (direction: 'wider' | 'narrower') => void
}

export function ResizeHandle({ className, label, value, min, max, active, widerKey, narrowerKey, onStart, onResizeByKeyboard }: ResizeHandleProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== widerKey && event.key !== narrowerKey) return
    event.preventDefault()
    onResizeByKeyboard(event.key === widerKey ? 'wider' : 'narrower')
  }

  return (
    <div
      className={`${className} ${active ? 'active' : ''}`}
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      title="Drag or use arrow keys to resize"
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        onStart()
      }}
      onKeyDown={handleKeyDown}
    >
      <span />
    </div>
  )
}
