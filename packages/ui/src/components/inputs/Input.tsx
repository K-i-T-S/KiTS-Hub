import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    helperText,
    startAdornment,
    endAdornment,
    fullWidth = false,
    id,
    ...props 
  }, ref) => {
    const inputId = React.useId()
    const finalId = id || inputId
    
    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={finalId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startAdornment && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {startAdornment}
            </div>
          )}
          
          <input
            type={type}
            id={finalId}
            className={cn(
              'kits-input',
              'transition-all duration-200',
              'focus:shadow-purple-glow focus:shadow-md',
              error && 'border-destructive focus-visible:ring-destructive',
              startAdornment && 'pl-10',
              endAdornment && 'pr-10',
              fullWidth && 'w-full',
              !props.value && props.placeholder && 'text-muted-foreground',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined}
            {...props}
          />
          
          {endAdornment && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {endAdornment}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${finalId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${finalId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
