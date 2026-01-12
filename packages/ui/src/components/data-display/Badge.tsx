import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success: "border-transparent bg-green-500 text-white shadow hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600",
        luxury:
          "border-transparent bg-gradient-luxury text-white shadow hover:opacity-90",
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  count?: number
  maxCount?: number
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, count, maxCount = 99, children, ...props }, ref) => {
    const displayCount = count && count > maxCount ? `${maxCount}+` : count
    
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1 h-2 w-2 rounded-full',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'destructive' && 'bg-destructive',
              variant === 'info' && 'bg-primary',
              variant === 'default' && 'bg-primary'
            )}
            aria-hidden="true"
          />
        )}
        
        {displayCount !== undefined ? (
          <span>{displayCount}</span>
        ) : (
          children
        )}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
