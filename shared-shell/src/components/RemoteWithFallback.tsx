import React, { ComponentType, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface RemoteWithFallbackProps {
  fallback: ComponentType<any>;
  fallbackProps?: Record<string, any>;
  children: React.ReactNode;
  solutionName: string;
}

const RemoteWithFallback: React.FC<RemoteWithFallbackProps> = ({
  fallback: FallbackComponent,
  fallbackProps = {},
  children,
  solutionName
}) => {
  return (
    <ErrorBoundary
      customMessage={`Failed to load ${solutionName}`}
      showRetry={true}
      showHome={true}
    >
      <Suspense 
        fallback={
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading {solutionName}...</span>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default RemoteWithFallback;
