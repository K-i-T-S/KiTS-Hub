import { ReactNode } from 'react';
import { Loader2, Package, AlertCircle } from 'lucide-react';

// Loading skeleton component for different solution types
interface SkeletonProps {
  type: 'inventory' | 'pos' | 'crm' | 'hr' | 'accounting' | 'analytics' | 'generic';
  message?: string;
}

const SolutionSkeleton: React.FC<SkeletonProps> = ({ type, message }) => {
  const getSkeletonContent = () => {
    switch (type) {
      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        );
      case 'pos':
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'crm':
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        );
      case 'hr':
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        );
      case 'accounting':
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
        <span className="text-lg font-medium text-gray-700">
          {message || 'Loading...'}
        </span>
      </div>
      {getSkeletonContent()}
    </div>
  );
};

// Main RemoteLoading component
interface RemoteLoadingProps {
  solutionName?: string;
  solutionType?: 'inventory' | 'pos' | 'crm' | 'hr' | 'accounting' | 'analytics' | 'generic';
  message?: string;
  showProgress?: boolean;
  progress?: number;
  customIcon?: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const RemoteLoading: React.FC<RemoteLoadingProps> = ({
  solutionName,
  solutionType = 'generic',
  message,
  showProgress = false,
  progress = 0,
  customIcon,
  size = 'medium'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-4';
      case 'large':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'h-4 w-4';
      case 'large':
        return 'h-12 w-12';
      default:
        return 'h-8 w-8';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-50 ${getSizeClasses()}`}>
      {/* Loading indicator */}
      <div className="flex flex-col items-center mb-8">
        {customIcon || (
          <div className="relative">
            <Package className={`${getIconSize()} text-blue-500 animate-pulse`} />
            <Loader2 className={`absolute -top-1 -right-1 ${getIconSize()} animate-spin text-blue-600`} />
          </div>
        )}
        
        <div className="mt-4 text-center">
          <h2 className={`font-semibold text-gray-900 ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'}`}>
            Loading {solutionName || 'Application'}
          </h2>
          <p className={`text-gray-600 mt-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
            {message || 'Please wait while we prepare your workspace...'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-md mb-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {progress}% complete
          </p>
        </div>
      )}

      {/* Solution-specific skeleton */}
      <div className="w-full max-w-4xl">
        <SolutionSkeleton type={solutionType} message={message} />
      </div>

      {/* Additional loading states */}
      <div className="mt-8 flex flex-col items-center space-y-2">
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
};

// Loading states for different scenarios
export const RemoteLoadingStates = {
  // Initial loading
  Initial: (props?: Partial<RemoteLoadingProps>) => (
    <RemoteLoading
      {...props}
      message="Initializing application..."
      showProgress={true}
      progress={25}
    />
  ),

  // Loading remote entry
  LoadingEntry: (props?: Partial<RemoteLoadingProps>) => (
    <RemoteLoading
      {...props}
      message="Loading application resources..."
      showProgress={true}
      progress={50}
    />
  ),

  // Loading components
  LoadingComponents: (props?: Partial<RemoteLoadingProps>) => (
    <RemoteLoading
      {...props}
      message="Loading components..."
      showProgress={true}
      progress={75}
    />
  ),

  // Almost ready
  AlmostReady: (props?: Partial<RemoteLoadingProps>) => (
    <RemoteLoading
      {...props}
      message="Almost ready..."
      showProgress={true}
      progress={90}
    />
  ),

  // Finalizing
  Finalizing: (props?: Partial<RemoteLoadingProps>) => (
    <RemoteLoading
      {...props}
      message="Finalizing setup..."
      showProgress={true}
      progress={95}
    />
  ),
};

// Error state for remote loading
interface RemoteLoadingErrorProps {
  solutionName?: string;
  error?: Error;
  onRetry?: () => void;
}

export const RemoteLoadingError: React.FC<RemoteLoadingErrorProps> = ({
  solutionName,
  error,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to load {solutionName || 'Application'}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {error?.message || 'An unexpected error occurred while loading the application.'}
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details
            </summary>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-32">
              {error.stack}
            </div>
          </details>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

// Development mode helper
export const DevelopmentModeHelper: React.FC<{ solutionName: string }> = ({ solutionName }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800">
            Development Mode: {solutionName}
          </p>
          <p className="text-yellow-700">
            Make sure the {solutionName} service is running on its designated port.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RemoteLoading;
