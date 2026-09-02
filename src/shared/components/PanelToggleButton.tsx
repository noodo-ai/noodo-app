import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

export interface PanelToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  buttonRef?: Ref<HTMLButtonElement>
  defaultIcon: ReactNode
  actionIcon: ReactNode
  tooltip: string
}

export function PanelToggleButton({ buttonRef, defaultIcon, actionIcon, tooltip, className = '', ...props }: PanelToggleButtonProps) {
  return (
    <button ref={buttonRef} type="button" className={`${className} panel-control-tooltip`} data-tooltip={tooltip} {...props}>
      <span className="panel-icon panel-icon-default">{defaultIcon}</span>
      <span className="panel-icon panel-icon-action">{actionIcon}</span>
    </button>
  )
}
