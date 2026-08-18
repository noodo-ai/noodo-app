import { useState } from 'react'

export interface NoodoMarkProps {
  label?: string
}

type GlintDirection = 'forward' | 'reverse' | null

const MARK_PATH = 'M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2'

export function NoodoMark({ label }: NoodoMarkProps) {
  const [glintDirection, setGlintDirection] = useState<GlintDirection>(null)

  return (
    <span
      className="noodo-mark-target"
      onMouseEnter={() => setGlintDirection('forward')}
      onMouseLeave={() => glintDirection && setGlintDirection('reverse')}
    >
      <svg
        className={`noodo-mark ${glintDirection ? `glint-${glintDirection}` : ''}`}
        viewBox="0 0 24 24"
        aria-hidden="true"
        onAnimationEnd={(event) => {
          if (event.animationName === 'noodo-mark-glint-reverse') setGlintDirection(null)
        }}
      >
        <path d={MARK_PATH} />
        <path className="noodo-mark-glint" d={MARK_PATH} pathLength={100} />
      </svg>
      {label && <span className="noodo-brand-label">{label}</span>}
    </span>
  )
}
