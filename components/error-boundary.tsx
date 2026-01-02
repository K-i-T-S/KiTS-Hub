"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service in production
    if (typeof window !== 'undefined') {
      console.error('Error caught by boundary:', error, errorInfo)
      
      // In production, you would send this to a monitoring service
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div 
      className="min-h-screen bg-zinc-950 flex items-center justify-center px-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-400" aria-hidden="true" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h1>
        
        <p className="text-zinc-400 mb-6">
          We&apos;re sorry, but something unexpected happened. Please try again or contact support if the problem persists.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-zinc-400 cursor-pointer hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Error details (Development Only)
            </summary>
            <pre className="mt-2 p-4 bg-zinc-800 rounded text-xs text-red-400 overflow-auto max-h-64">
              <code>
                {error.toString()}
                {error && (
                  <>
                    {'\n\nComponent Stack:\n'}
                    {error.stack}
                  </>
                )}
              </code>
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={reset} 
            className="w-full rounded-full"
            aria-label="Try reloading the page"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full rounded-full"
            onClick={() => window.location.href = '/'}
            aria-label="Go to homepage"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
