import type { Ref } from 'react'
import { Plus } from 'lucide-react'
import { NoodoMark } from '../../../shared/components/NoodoMark'

export interface MobileHeaderProps {
  onOpenNavigation: () => void
  onReset: () => void
  navigationButtonRef?: Ref<HTMLButtonElement>
}

export function MobileHeader({ onOpenNavigation, onReset, navigationButtonRef }: MobileHeaderProps) {
  return (
    <div className="mobile-head">
      <button ref={navigationButtonRef} type="button" className="brand-button" onClick={onOpenNavigation} aria-label="Open navigation"><NoodoMark /></button>
      <span>NOODO</span>
      <button type="button" className="icon-button" onClick={onReset} aria-label="New chat"><Plus size={18} /></button>
    </div>
  )
}
