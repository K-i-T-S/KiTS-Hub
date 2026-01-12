import * as React from 'react'
import { Button, type ButtonProps } from './Button'
import { cn } from '../../lib/utils'

export interface LoadingButtonProps extends Omit<ButtonProps, 'onError'> {
  loading?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    loading = false,
    loadingText = 'Loading...',
    successText = 'Success!',
    errorText = 'Error',
    onSuccess,
    onError,
    children,
    onClick,
    disabled,
    className,
    ...props 
  }, ref) => {
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [internalLoading, setInternalLoading] = React.useState(false)
    
    const isLoading = loading || internalLoading || status === 'loading'
    
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) return
      
      try {
        setStatus('loading')
        setInternalLoading(true)
        
        const result = onClick?.(event)
        
        if (result && typeof result === 'object' && typeof (result as any).then === 'function') {
          await result
          setStatus('success')
          onSuccess?.()
          
          // Reset status after 2 seconds
          setTimeout(() => {
            setStatus('idle')
            setInternalLoading(false)
          }, 2000)
        } else {
          setStatus('idle')
          setInternalLoading(false)
        }
      } catch (error) {
        setStatus('error')
        onError?.(error as Error)
        setInternalLoading(false)
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setStatus('idle')
        }, 3000)
      }
    }
    
    const getButtonText = () => {
      if (status === 'success') return successText
      if (status === 'error') return errorText
      if (isLoading) return loadingText
      return children
    }
    
    const getVariant = () => {
      if (status === 'success') return 'default'
      if (status === 'error') return 'destructive'
      return props.variant
    }
    
    return (
      <Button
        ref={ref}
        loading={isLoading}
        className={cn(
          'transition-all duration-300',
          status === 'success' && 'bg-green-500 hover:bg-green-600',
          status === 'error' && 'bg-red-500 hover:bg-red-600',
          className
        )}
        variant={getVariant()}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {getButtonText()}
      </Button>
    )
  }
)
LoadingButton.displayName = 'LoadingButton'

export { LoadingButton }
