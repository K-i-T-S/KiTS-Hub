import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Notification, 
  NotificationFilter, 
  NotificationStats, 
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus
} from '../types/index.js';
import { NotificationManager } from '../manager/NotificationManager.js';

interface UseNotificationsOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilter?: NotificationFilter;
}

export function useNotifications(
  manager: NotificationManager,
  options: UseNotificationsOptions = {}
) {
  const { userId, autoRefresh = false, refreshInterval = 30000, initialFilter = {} } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>(initialFilter);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userNotifications = manager.getNotifications(userId, filter);
      setNotifications(userNotifications);
      setStats(manager.getStats(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [manager, userId, filter]);

  // Load preferences
  const loadPreferences = useCallback(() => {
    if (!userId) return;
    
    const userPreferences = manager.getPreferences(userId);
    setPreferences(userPreferences || null);
  }, [manager, userId]);

  // Create notification
  const createNotification = useCallback(async (data: Partial<Notification>) => {
    try {
      const notification = await manager.createNotification({
        ...data,
        userId: userId || data.userId
      });
      
      // Refresh notifications if this is for the current user
      if (!userId || notification.userId === userId) {
        await loadNotifications();
      }
      
      return notification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
      throw err;
    }
  }, [manager, userId, loadNotifications]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await manager.markAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    }
  }, [manager, loadNotifications]);

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      await manager.dismissNotification(notificationId);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss notification');
      throw err;
    }
  }, [manager, loadNotifications]);

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<NotificationFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!userId) return;
    
    try {
      const updatedPreferences = { ...preferences, ...newPreferences } as NotificationPreferences;
      manager.setPreferences(userId, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  }, [manager, userId, preferences]);

  // Clear notifications
  const clearNotifications = useCallback(async () => {
    try {
      manager.clearHistory(userId);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
      throw err;
    }
  }, [manager, userId, loadNotifications]);

  // Get unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.status !== 'read' && n.status !== 'dismissed').length;
  }, [notifications]);

  // Get notifications by type
  const notificationsByType = useMemo(() => {
    const grouped: Record<NotificationType, Notification[]> = {} as Record<NotificationType, Notification[]>;
    
    notifications.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = [];
      }
      grouped[notification.type].push(notification);
    });
    
    return grouped;
  }, [notifications]);

  // Get notifications by priority
  const notificationsByPriority = useMemo(() => {
    const grouped: Record<NotificationPriority, Notification[]> = {} as Record<NotificationPriority, Notification[]>;
    
    notifications.forEach(notification => {
      if (!grouped[notification.priority]) {
        grouped[notification.priority] = [];
      }
      grouped[notification.priority].push(notification);
    });
    
    return grouped;
  }, [notifications]);

  // Get recent notifications (last 24 hours)
  const recentNotifications = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => n.createdAt >= twentyFourHoursAgo);
  }, [notifications]);

  // Initialize
  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadPreferences();
    }
  }, [userId, loadNotifications, loadPreferences]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(loadNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadNotifications, userId]);

  // Listen to manager events
  useEffect(() => {
    if (!userId) return;

    const handleNotificationCreated = (notification: Notification) => {
      if (notification.userId === userId) {
        loadNotifications();
      }
    };

    const handleNotificationRead = (notification: Notification) => {
      if (notification.userId === userId) {
        loadNotifications();
      }
    };

    const handleNotificationDismissed = (notification: Notification) => {
      if (notification.userId === userId) {
        loadNotifications();
      }
    };

    const handlePreferencesUpdated = (updatedUserId: string) => {
      if (updatedUserId === userId) {
        loadPreferences();
      }
    };

    manager.on('notification:created', handleNotificationCreated);
    manager.on('notification:read', handleNotificationRead);
    manager.on('notification:dismissed', handleNotificationDismissed);
    manager.on('preferences:updated', handlePreferencesUpdated);

    return () => {
      manager.off('notification:created', handleNotificationCreated);
      manager.off('notification:read', handleNotificationRead);
      manager.off('notification:dismissed', handleNotificationDismissed);
      manager.off('preferences:updated', handlePreferencesUpdated);
    };
  }, [manager, userId, loadNotifications, loadPreferences]);

  return {
    // Data
    notifications,
    stats,
    preferences,
    loading,
    error,
    
    // Computed values
    unreadCount,
    notificationsByType,
    notificationsByPriority,
    recentNotifications,
    
    // Actions
    createNotification,
    markAsRead,
    dismissNotification,
    updateFilter,
    updatePreferences,
    clearNotifications,
    refresh: loadNotifications,
    
    // Filter state
    filter,
    setFilter
  };
}

// Hook for notification preferences
export function useNotificationPreferences(
  manager: NotificationManager,
  userId: string
) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences
  const loadPreferences = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      const userPreferences = manager.getPreferences(userId);
      setPreferences(userPreferences || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [manager, userId]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPreferences = { ...preferences, ...updates } as NotificationPreferences;
      manager.setPreferences(userId, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [manager, userId, preferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    const defaultPreferences: NotificationPreferences = {
      userId,
      channels: {
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.PUSH]: false,
        [NotificationChannel.DESKTOP]: true,
        [NotificationChannel.SMS]: false
      },
      types: {
        [NotificationType.INFO]: true,
        [NotificationType.SUCCESS]: true,
        [NotificationType.WARNING]: true,
        [NotificationType.ERROR]: true,
        [NotificationType.SYSTEM]: true
      },
      priorities: {
        [NotificationPriority.LOW]: true,
        [NotificationPriority.NORMAL]: true,
        [NotificationPriority.HIGH]: true,
        [NotificationPriority.URGENT]: true
      },
      categories: {},
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      frequency: {
        maxPerHour: 10,
        maxPerDay: 100,
        batchDelay: 5
      },
      email: {
        address: '',
        enabled: false
      },
      push: {
        enabled: false
      },
      desktop: {
        enabled: true,
        requireInteraction: false
      }
    };

    await updatePreferences(defaultPreferences);
  }, [userId, updatePreferences]);

  // Toggle channel preference
  const toggleChannel = useCallback(async (channel: NotificationChannel) => {
    if (!preferences) return;
    
    await updatePreferences({
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel]
      }
    });
  }, [preferences, updatePreferences]);

  // Toggle type preference
  const toggleType = useCallback(async (type: NotificationType) => {
    if (!preferences) return;
    
    await updatePreferences({
      types: {
        ...preferences.types,
        [type]: !preferences.types[type]
      }
    });
  }, [preferences, updatePreferences]);

  // Toggle priority preference
  const togglePriority = useCallback(async (priority: NotificationPriority) => {
    if (!preferences) return;
    
    await updatePreferences({
      priorities: {
        ...preferences.priorities,
        [priority]: !preferences.priorities[priority]
      }
    });
  }, [preferences, updatePreferences]);

  // Initialize
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Listen to preference updates
  useEffect(() => {
    const handlePreferencesUpdated = (updatedUserId: string) => {
      if (updatedUserId === userId) {
        loadPreferences();
      }
    };

    manager.on('preferences:updated', handlePreferencesUpdated);

    return () => {
      manager.off('preferences:updated', handlePreferencesUpdated);
    };
  }, [manager, userId, loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults,
    toggleChannel,
    toggleType,
    togglePriority,
    refresh: loadPreferences
  };
}

// Hook for notification stats
export function useNotificationStats(
  manager: NotificationManager,
  userId?: string
) {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stats
  const loadStats = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      const notificationStats = manager.getStats(userId);
      setStats(notificationStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [manager, userId]);

  // Initialize
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Listen to notification events that affect stats
  useEffect(() => {
    const handleNotificationEvent = (notification: Notification) => {
      if (!userId || notification.userId === userId) {
        loadStats();
      }
    };

    manager.on('notification:created', handleNotificationEvent);
    manager.on('notification:read', handleNotificationEvent);
    manager.on('notification:dismissed', handleNotificationEvent);
    manager.on('notification:failed', handleNotificationEvent);

    return () => {
      manager.off('notification:created', handleNotificationEvent);
      manager.off('notification:read', handleNotificationEvent);
      manager.off('notification:dismissed', handleNotificationEvent);
      manager.off('notification:failed', handleNotificationEvent);
    };
  }, [manager, userId, loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}
