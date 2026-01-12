import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  "kits-button",
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 focus-visible:ring-2 focus-visible:ring-purple-500/50 dark:from-primary/90 dark:to-purple-700 dark:hover:from-primary/80 dark:hover:to-purple-600 dark:focus-visible:ring-purple-400/50',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 focus-visible:ring-2 focus-visible:ring-red-500/50 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 dark:focus-visible:ring-red-400/50',
        outline:
          'border-2 bg-gradient-to-r from-background to-muted/50 text-foreground hover:from-muted hover:to-accent hover:text-accent-foreground hover:shadow-md hover:shadow-border/20 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring/50 dark:from-background dark:to-muted dark:hover:from-accent dark:hover:to-accent-foreground dark:focus-visible:ring-ring/50',
        secondary:
          'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 hover:shadow-md hover:shadow-secondary/50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-secondary/50 dark:from-secondary dark:to-secondary/70 dark:hover:from-secondary/80 dark:hover:to-secondary/60 dark:focus-visible:ring-secondary/50',
        ghost:
          'bg-gradient-to-r from-transparent to-muted/20 text-muted-foreground hover:from-muted/30 hover:to-muted/40 hover:bg-muted/50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring/50 dark:from-transparent dark:to-muted/30 dark:hover:to-muted/40 dark:hover:bg-muted/50 dark:focus-visible:ring-ring/50',
        link: 'text-gradient-to-r from-primary to-purple-600 bg-transparent hover:from-primary/80 hover:to-purple-700 hover:bg-primary/10 rounded-md px-3 py-2 font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/50 dark:from-primary/80 dark:to-purple-700 dark:hover:from-primary/70 dark:hover:bg-primary/20 dark:focus-visible:ring-primary/50',
        luxury: 'bg-gradient-luxury text-white hover:opacity-90 shadow-luxury hover:scale-105 transition-all duration-200',
        gradient: 'bg-gradient-primary text-white hover:opacity-90 shadow-purple-glow hover:scale-105 transition-all duration-200',
        glass: 'glass border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
        xl: 'h-12 rounded-lg px-8 text-base has-[>svg]:px-6',
        '2xl': 'h-14 rounded-xl px-10 text-lg has-[>svg]:px-8',
      },
      animation: {
        none: '',
        scale: 'hover:scale-105 active:scale-95',
        bounce: 'hover:animate-bounce-subtle',
        glow: 'hover:shadow-purple-glow-lg',
        float: 'hover:animate-float',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'scale',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          fullWidth && 'w-full',
          loading && 'cursor-not-allowed'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="inline-flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span className="truncate">
          {loading ? (loadingText || 'Loading...') : children}
        </span>
        
        {!loading && rightIcon && (
          <span className="inline-flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
