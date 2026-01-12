import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
  customMessage?: string;
}

export interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log errors for debugging
    this.logError(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({ error, errorInfo });
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Enhanced error logging for debugging
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    console.group('🚨 ErrorBoundary Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Full Error Data:', errorData);
    console.groupEnd();
  };

  handleRetry = () => {
    const maxRetries = 3;
    const { retryCount } = this.state;
    
    if (retryCount < maxRetries) {
      this.setState(prevState => ({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Max retries reached, show different message
      console.warn('Max retries reached in ErrorBoundary');
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      const { retryCount } = this.state;
      const maxRetries = 3;
      const maxRetriesReached = retryCount >= maxRetries;

      // Custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRemoteError = this.state.error?.message.includes('remote') || 
                          this.state.error?.message.includes('RemoteLoadError');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-lg mx-auto">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                {this.props.customMessage || 
                 (isRemoteError ? 'Remote Application Error' : 'Something went wrong')}
              </h2>
              <p className="text-sm text-red-600">
                {maxRetriesReached 
                  ? 'Maximum retry attempts reached. The application may be temporarily unavailable.'
                  : (this.state.error?.message || 'An unexpected error occurred')
                }
              </p>
            </div>

            {/* Error details in development */}
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details
                </summary>
                <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.showRetry !== false && !maxRetriesReached && (
                <button 
                  onClick={this.handleRetry} 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </button>
              )}
              
              {this.props.showHome !== false && (
                <button 
                  onClick={this.handleGoHome} 
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </button>
              )}
            </div>

            {/* Additional help text */}
            {isRemoteError && (
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  This error occurs when a remote application fails to load. 
                  This could be due to:
                </p>
                <ul className="mt-2 text-left list-disc list-inside">
                  <li>Network connectivity issues</li>
                  <li>Remote service being temporarily unavailable</li>
                  <li>Configuration errors</li>
                </ul>
                <p className="mt-2">
                  Please try again in a few moments or contact support if the problem persists.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };
