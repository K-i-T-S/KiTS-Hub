import * as React from 'react'
import { Button, type ButtonProps } from './Button'
import { cn } from '../../lib/utils'

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode
  label?: string
  tooltip?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    icon, 
    label, 
    tooltip,
    className,
    size = 'icon',
    variant = 'ghost',
    ...props 
  }, ref) => {
    const [showTooltip, setShowTooltip] = React.useState(false)
    
    return (
      <div className="relative inline-block">
        <Button
          ref={ref}
          size={size}
          variant={variant}
          className={cn('p-2', className)}
          aria-label={label}
          {...props}
        >
          <span className="flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        </Button>
        
        {tooltip && (
          <div
            className={cn(
              "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap pointer-events-none transition-opacity duration-200 z-50",
              showTooltip ? 'opacity-100' : 'opacity-0'
            )}
            role="tooltip"
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
IconButton.displayName = 'IconButton'

export { IconButton }
