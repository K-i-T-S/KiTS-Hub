import React, { useState } from 'react';
import { Clock, ArrowLeft, ArrowRight, Trash2, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { NavigationHistoryItem } from '../types';

interface NavigationHistoryProps {
  history: NavigationHistoryItem[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onNavigateToItem: (item: NavigationHistoryItem) => void;
  onClearHistory: () => void;
  className?: string;
  maxItems?: number;
  showTimestamps?: boolean;
  showActions?: boolean;
}

export const NavigationHistory: React.FC<NavigationHistoryProps> = ({
  history,
  currentIndex,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onNavigateToItem,
  onClearHistory,
  className,
  maxItems = 10,
  showTimestamps = true,
  showActions = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Get display history
  const displayHistory = expanded 
    ? history.slice(-maxItems)
    : history.slice(-5);

  if (history.length === 0) {
    return (
      <div className={clsx('text-center py-8 text-gray-500', className)}>
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No navigation history</p>
        <p className="text-sm text-gray-400 mt-2">
          Your browsing history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Navigation History</h3>
          <span className="text-sm text-gray-500">
            {history.length} items
          </span>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onGoBack}
              disabled={!canGoBack}
              className={clsx(
                'p-2 rounded-md transition-colors',
                canGoBack 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 cursor-not-allowed'
              )}
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={onGoForward}
              disabled={!canGoForward}
              className={clsx(
                'p-2 rounded-md transition-colors',
                canGoForward 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 cursor-not-allowed'
              )}
              title="Go forward"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClearHistory}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="max-h-96 overflow-y-auto">
        {displayHistory.map((item, index) => {
          const isCurrent = history.length - displayHistory.length + index === currentIndex;
          const actualIndex = history.length - displayHistory.length + index;
          
          return (
            <div
              key={item.id}
              className={clsx(
                'flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 transition-colors',
                isCurrent 
                  ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                  : 'hover:bg-gray-50'
              )}
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={clsx(
                      'font-medium truncate',
                      isCurrent ? 'text-blue-900' : 'text-gray-900'
                    )}>
                      {item.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {item.path}
                  </p>
                  
                  {showTimestamps && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  )}
                  
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      {Object.entries(item.metadata).slice(0, 2).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {!isCurrent && (
                <button
                  onClick={() => onNavigateToItem(item)}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Navigate to this page"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {history.length > 5 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {expanded ? 'Show less' : `Show ${history.length - 5} more items`}
          </button>
        </div>
      )}
    </div>
  );
};

// Compact history component
export const CompactHistory: React.FC<{
  history: NavigationHistoryItem[];
  onNavigateToItem: (item: NavigationHistoryItem) => void;
  className?: string;
  maxItems?: number;
}> = ({
  history,
  onNavigateToItem,
  className,
  maxItems = 5,
}) => {
  const recentHistory = history.slice(-maxItems).reverse();

  if (recentHistory.length === 0) {
    return null;
  }

  return (
    <div className={clsx('space-y-1', className)}>
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Recent Pages
      </h4>
      
      {recentHistory.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigateToItem(item)}
          className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
        >
          <div className="font-medium truncate">{item.title}</div>
          <div className="text-xs text-gray-400 truncate">{item.path}</div>
        </button>
      ))}
    </div>
  );
};

// History dropdown component
export const HistoryDropdown: React.FC<{
  history: NavigationHistoryItem[];
  onNavigateToItem: (item: NavigationHistoryItem) => void;
  onClearHistory: () => void;
  className?: string;
}> = ({
  history,
  onNavigateToItem,
  onClearHistory,
  className,
}) => {
  const recentHistory = history.slice(-10).reverse();

  return (
    <div className={clsx(
      'bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden',
      className
    )}>
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Recent History</h4>
          <button
            onClick={onClearHistory}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {recentHistory.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigateToItem(item)}
            className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          >
            <div className="font-medium text-gray-900 truncate">{item.title}</div>
            <div className="text-sm text-gray-500 truncate">{item.path}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
