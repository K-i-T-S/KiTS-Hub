"use client"

import * as React from "react"
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const enhancedCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-purple-glow',
        gradient: 'border-transparent bg-gradient-primary shadow-purple-glow',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md shadow-luxury',
        luxury: 'border-purple-500/30 bg-gradient-luxury shadow-luxury',
        outlined: 'border-2 border-purple-500 bg-transparent',
        ghost: 'border-transparent bg-transparent shadow-none',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      animation: {
        none: '',
        hover: 'transition-all duration-300 hover:shadow-purple-glow hover:scale-105',
        float: 'transition-all duration-300 hover:shadow-purple-glow-lg hover:-translate-y-1',
        glow: 'transition-all duration-300 hover:shadow-purple-glow-lg',
        scale: 'transition-all duration-300 hover:scale-105',
      },
      interactive: {
        false: '',
        true: 'cursor-pointer active:scale-95',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'hover',
      interactive: false,
    },
  },
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof enhancedCardVariants> {
  asChild?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, animation, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'div'
    
    return (
      <Comp
        ref={ref}
        className={cn(enhancedCardVariants({ variant, size, animation, interactive, className }))}
        {...props}
      />
    )
  }
)
EnhancedCard.displayName = 'EnhancedCard'

export { EnhancedCard, enhancedCardVariants }
