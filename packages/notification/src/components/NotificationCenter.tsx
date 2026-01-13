import React, { useState, useEffect, useCallback } from 'react';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus,
  NotificationFilter,
  NotificationStats
} from '../types/index.js';

interface NotificationCenterProps {
  notifications: Notification[];
  stats?: NotificationStats;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onActionClick?: (notificationId: string, actionId: string) => void;
  onFilterChange?: (filter: NotificationFilter) => void;
  className?: string;
  maxHeight?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  stats,
  onMarkAsRead,
  onDismiss,
  onActionClick,
  onFilterChange,
  className = '',
  maxHeight = 500
}) => {
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(notification => {
      if (filter.types && !filter.types.includes(notification.type)) return false;
      if (filter.priorities && !filter.priorities.includes(notification.priority)) return false;
      if (filter.statuses && !filter.statuses.includes(notification.status)) return false;
      if (filter.categories && notification.category && !filter.categories.includes(notification.category)) return false;
      if (filter.tags && !filter.tags.some(tag => notification.tags.includes(tag))) return false;
      if (filter.sources && notification.source && !filter.sources.includes(notification.source)) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return notification.title.toLowerCase().includes(searchLower) ||
               notification.message.toLowerCase().includes(searchLower);
      }
      if (filter.dateRange) {
        const notifTime = notification.createdAt.getTime();
        return notifTime >= filter.dateRange.start.getTime() && 
               notifTime <= filter.dateRange.end.getTime();
      }
      return true;
    });
  }, [notifications, filter]);

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    
    filteredNotifications.forEach(notification => {
      const dateKey = formatDateKey(notification.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: Partial<NotificationFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    onFilterChange?.(updatedFilter);
  }, [filter, onFilterChange]);

  // Toggle notification expansion
  const toggleExpansion = useCallback((notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  // Mark notification as read
  const handleMarkAsRead = useCallback((notificationId: string) => {
    onMarkAsRead?.(notificationId);
  }, [onMarkAsRead]);

  // Dismiss notification
  const handleDismiss = useCallback((notificationId: string) => {
    onDismiss?.(notificationId);
    setSelectedNotification(null);
  }, [onDismiss]);

  // Handle action click
  const handleActionClick = useCallback((notificationId: string, actionId: string) => {
    onActionClick?.(notificationId, actionId);
  }, [onActionClick]);

  // Get notification type icon
  const getTypeIcon = (type: NotificationType): string => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      system: '🔧'
    };
    return icons[type] || '📢';
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority): string => {
    const colors = {
      low: '#666',
      normal: '#333',
      high: '#ff9800',
      urgent: '#f44336'
    };
    return colors[priority] || '#333';
  };

  // Format date key
  function formatDateKey(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  return (
    <div className={`notification-center ${className}`}>
      {/* Header */}
      <div className="notification-center-header">
        <h3>Notifications</h3>
        {stats && (
          <div className="notification-stats">
            <span className="stat-item">
              <span className="stat-value">{stats.unread || 0}</span>
              <span className="stat-label">unread</span>
            </span>
            <span className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">total</span>
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="notification-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search notifications..."
            value={filter.search || ''}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="search-input"
          />
          
          <select
            value={filter.types?.[0] || ''}
            onChange={(e) => handleFilterChange({ 
              types: e.target.value ? [e.target.value as NotificationType] : undefined 
            })}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="system">System</option>
          </select>

          <select
            value={filter.priorities?.[0] || ''}
            onChange={(e) => handleFilterChange({ 
              priorities: e.target.value ? [e.target.value as NotificationPriority] : undefined 
            })}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list" style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}>
        {Object.entries(groupedNotifications).length === 0 ? (
          <div className="empty-state">
            <p>No notifications found</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
            <div key={dateKey} className="notification-group">
              <div className="group-header">
                <h4>{dateKey}</h4>
                <span className="group-count">{dateNotifications.length}</span>
              </div>
              
              {dateNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.status} ${notification.type} ${notification.priority}`}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div className="notification-header">
                    <div className="notification-meta">
                      <span className="type-icon">{getTypeIcon(notification.type)}</span>
                      <span className="title">{notification.title}</span>
                      <span 
                        className="priority-indicator"
                        style={{ color: getPriorityColor(notification.priority) }}
                      >
                        ●
                      </span>
                    </div>
                    <div className="notification-actions">
                      {notification.status !== 'read' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="action-button mark-read"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(notification.id);
                        }}
                        className="action-button dismiss"
                        title="Dismiss"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="notification-content">
                    <p className="message">{notification.message}</p>
                    
                    {notification.attachments.length > 0 && (
                      <div className="attachments">
                        {notification.attachments.map(attachment => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📎 {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {notification.actions.length > 0 && (
                      <div className="notification-actions-row">
                        {notification.actions.map(action => (
                          <button
                            key={action.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(notification.id, action.id);
                            }}
                            className={`action-button ${action.variant || 'secondary'}`}
                          >
                            {action.icon && <span className="action-icon">{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="notification-footer">
                    <span className="timestamp">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                    {notification.source && (
                      <span className="source">{notification.source}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="notification-modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {getTypeIcon(selectedNotification.type)} {selectedNotification.title}
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="notification-details">
                <div className="detail-row">
                  <strong>Type:</strong> {selectedNotification.type}
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong> {selectedNotification.priority}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> {selectedNotification.status}
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {selectedNotification.createdAt.toLocaleString()}
                </div>
                {selectedNotification.source && (
                  <div className="detail-row">
                    <strong>Source:</strong> {selectedNotification.source}
                  </div>
                )}
                {selectedNotification.category && (
                  <div className="detail-row">
                    <strong>Category:</strong> {selectedNotification.category}
                  </div>
                )}
                {selectedNotification.tags.length > 0 && (
                  <div className="detail-row">
                    <strong>Tags:</strong> {selectedNotification.tags.join(', ')}
                  </div>
                )}
              </div>
              
              <div className="notification-message">
                <p>{selectedNotification.message}</p>
              </div>
              
              {selectedNotification.attachments.length > 0 && (
                <div className="modal-attachments">
                  <h4>Attachments</h4>
                  {selectedNotification.attachments.map(attachment => (
                    <div key={attachment.id} className="attachment-item">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        📎 {attachment.name}
                      </a>
                      {attachment.size && (
                        <span className="attachment-size">
                          ({formatFileSize(attachment.size)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {selectedNotification.actions.length > 0 && (
                <div className="modal-actions">
                  <h4>Actions</h4>
                  <div className="action-buttons">
                    {selectedNotification.actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(selectedNotification.id, action.id)}
                        className={`action-button ${action.variant || 'secondary'}`}
                      >
                        {action.icon && <span className="action-icon">{action.icon}</span>}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setSelectedNotification(null)}
                className="button secondary"
              >
                Close
              </button>
              {selectedNotification.status !== 'read' && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="button primary"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => {
                  handleDismiss(selectedNotification.id);
                  setSelectedNotification(null);
                }}
                className="button danger"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-center {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .notification-center-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .notification-center-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .notification-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #2196F3;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }

        .notification-filters {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          background: #fff;
        }

        .filter-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .notifications-list {
          background: white;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .notification-group {
          border-bottom: 1px solid #f0f0f0;
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .group-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .group-count {
          font-size: 12px;
          color: #666;
          background: #e0e0e0;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .notification-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.read {
          opacity: 0.7;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .type-icon {
          font-size: 16px;
        }

        .title {
          font-weight: 600;
          color: #333;
        }

        .priority-indicator {
          font-size: 12px;
        }

        .notification-actions {
          display: flex;
          gap: 4px;
        }

        .action-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .action-button:hover {
          background: #e0e0e0;
        }

        .action-button.mark-read {
          color: #4CAF50;
        }

        .action-button.dismiss {
          color: #f44336;
        }

        .notification-content {
          margin-bottom: 8px;
        }

        .message {
          margin: 0 0 8px 0;
          color: #666;
          line-height: 1.4;
        }

        .attachments {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .attachment-link {
          font-size: 12px;
          color: #2196F3;
          text-decoration: none;
          padding: 4px 8px;
          background: #f5f5f5;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .attachment-link:hover {
          background: #e0e0e0;
        }

        .notification-actions-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .notification-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #999;
        }

        .timestamp {
          font-style: italic;
        }

        .source {
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .notification-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .notification-modal {
          background: white;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background: #f0f0f0;
        }

        .modal-content {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .notification-details {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 8px;
        }

        .detail-row strong {
          min-width: 100px;
          color: #333;
        }

        .notification-message {
          margin-bottom: 20px;
        }

        .modal-attachments {
          margin-bottom: 20px;
        }

        .modal-attachments h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #333;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .attachment-size {
          font-size: 12px;
          color: #666;
        }

        .modal-actions {
          margin-bottom: 20px;
        }

        .modal-actions h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #333;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #eee;
          background: #f8f9fa;
        }

        .button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .button.primary {
          background: #2196F3;
          color: white;
          border-color: #2196F3;
        }

        .button.danger {
          background: #f44336;
          color: white;
          border-color: #f44336;
        }

        .button.secondary {
          background: white;
          color: #333;
        }

        .button:hover {
          opacity: 0.8;
        }

        .action-icon {
          margin-right: 4px;
        }
      `}</style>
    </div>
  );
};

// Helper functions
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
