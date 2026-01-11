/**
 * Enhanced Card Component for KiTS Hub
 * Advanced card with animations, gradients, and accessibility features
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const cardVariants = cva(
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

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, animation, interactive, asChild = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, animation, interactive, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Enhanced card with built-in features
export interface EnhancedCardProps extends CardProps {
  header?: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  loading?: boolean
  error?: string
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation, 
    interactive,
    header,
    title,
    description,
    footer,
    icon,
    badge,
    loading = false,
    error,
    children,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        variant={variant}
        size={size}
        animation={animation}
        interactive={interactive}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-destructive/10 border border-destructive/20 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <div className="text-destructive text-sm font-medium">{error}</div>
            </div>
          </div>
        )}
        
        {(header || title || description || icon || badge) && (
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {icon && (
                  <div className="flex-shrink-0 text-primary">
                    {icon}
                  </div>
                )}
                <div>
                  {title && <CardTitle>{title}</CardTitle>}
                  {description && <CardDescription>{description}</CardDescription>}
                </div>
              </div>
              {badge && (
                <div className="flex-shrink-0">
                  {badge}
                </div>
              )}
            </div>
            {header}
          </CardHeader>
        )}
        
        {children && <CardContent>{children}</CardContent>}
        
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    )
  }
)
EnhancedCard.displayName = 'EnhancedCard'

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  EnhancedCard,
  cardVariants 
}
