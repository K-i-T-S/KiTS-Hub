import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useApp';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification, markNotificationRead } = useAppContext();
  const [expanded, setExpanded] = useState(false);

  // Auto-expand on new notifications
  useEffect(() => {
    if (notifications.length > 0 && !expanded) {
      setExpanded(true);
      // Auto-collapse after 10 seconds if no interaction
      const timer = setTimeout(() => {
        setExpanded(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notifications.length, expanded]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const visibleNotifications = expanded ? notifications : notifications.slice(0, 3);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="space-y-2">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
              className={`
              relative p-4 rounded-lg border shadow-lg transition-all duration-300 transform
              ${getToastStyles(notification.type)}
              ${!notification.read ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
              hover:scale-105
            `}
            onClick={() => markNotificationRead(notification.id)}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Content */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  
                  {notification.metadata && (
                    <div className="flex items-center space-x-2">
                      {notification.metadata.priority && (
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          ${notification.metadata.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                          ${notification.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${notification.metadata.priority === 'low' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {notification.metadata.priority}
                        </span>
                      )}
                      {notification.metadata.source && (
                        <span className="text-xs text-gray-500">
                          {notification.metadata.source}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.action();
                        }}
                        className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
        ))}

        {/* Expand/Collapse button */}
        {notifications.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full p-2 text-center text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {expanded ? 'Show Less' : `Show ${notifications.length - 3} More`}
          </button>
        )}

        {/* Clear all button */}
        {notifications.length > 1 && (
          <button
            onClick={() => {
              notifications.forEach(n => removeNotification(n.id));
            }}
            className="w-full p-2 text-center text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear All Notifications
          </button>
        )}
      </div>
    </div>
  );
};

export default ToastContainer;
