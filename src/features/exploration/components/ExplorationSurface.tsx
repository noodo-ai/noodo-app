import { ArrowUp } from 'lucide-react'
import { BACK_TO_TOP_THRESHOLD } from '../constants'
import { InspirationDrawer } from './InspirationDrawer'

export interface ExplorationSurfaceProps {
  progress: number
  setProgress: (value: number) => void
  onPick: (prompt: string) => void
}

export function ExplorationSurface({ progress, setProgress, onPick }: ExplorationSurfaceProps) {
  return (
    <>
      <footer className={progress > 0 ? 'hidden' : ''}>© 2026 Noodo Labs <span>·</span> Privacy <span>·</span> Terms</footer>
      <InspirationDrawer progress={progress} setProgress={setProgress} onPick={onPick} />
      <button
        type="button"
        className={`back-to-top ${progress > BACK_TO_TOP_THRESHOLD ? 'visible' : ''}`}
        onClick={() => setProgress(0)}
        aria-label="Back to top"
      >
        <ArrowUp size={17} strokeWidth={1.8} />Back to top
      </button>
    </>
  )
}
