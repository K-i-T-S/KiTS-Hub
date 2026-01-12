import * as React from 'react'
import { cn } from '../../lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    options,
    placeholder,
    fullWidth = false,
    id,
    value,
    ...props 
  }, ref) => {
    const selectId = React.useId()
    const finalId = id || selectId
    
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
        
        <select
          id={finalId}
          className={cn(
            'kits-input',
            'pr-8', // Space for dropdown arrow
            error && 'border-destructive focus-visible:ring-destructive',
            fullWidth && 'w-full',
            !value && placeholder && 'text-muted-foreground',
            className
          )}
          ref={ref}
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        
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
Select.displayName = 'Select'

export { Select }
