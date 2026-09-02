import type { Ref } from 'react'
import { NoodoMark } from '../../../shared/components/NoodoMark'

export interface MobileHeaderProps {
  onOpenNavigation: () => void
  navigationButtonRef?: Ref<HTMLButtonElement>
}

export function MobileHeader({ onOpenNavigation, navigationButtonRef }: MobileHeaderProps) {
  return (
    <div className="mobile-head">
      <button ref={navigationButtonRef} type="button" className="brand-button" onClick={onOpenNavigation} aria-label="Open navigation"><NoodoMark /></button>
      <span>NOODO</span>
    </div>
  )
}
