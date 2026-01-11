import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { globalEventBus } from '../events/event-bus';
import { CrossSolutionEvent, NotificationEvent } from '../events/types';
import { useSharedState } from '../state/shared-context';

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'inventory' | 'sales' | 'customer' | 'financial' | 'hr';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  requiresAction: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Notification preferences
export interface NotificationPreferences {
  enabled: boolean;
  desktop: boolean;
  email: boolean;
  sound: boolean;
  categories: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  maxVisible: number;
}

// Notification channel types
export type NotificationChannel = 'desktop' | 'email' | 'push' | 'sms';

// Notification template
export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  severity: Notification['severity'];
  category: Notification['category'];
  variables: string[];
  channels: NotificationChannel[];
}

// Notification delivery result
export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Notification service interface
export interface NotificationService {
  send(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<string>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getNotifications(limit?: number): Promise<Notification[]>;
  getUnreadCount(): Promise<number>;
  updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void>;
  getPreferences(): Promise<NotificationPreferences>;
}

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  
  // Channels
  enableDesktopNotifications: () => Promise<boolean>;
  sendEmailNotification: (notification: Notification) => Promise<DeliveryResult>;
  sendPushNotification: (notification: Notification) => Promise<DeliveryResult>;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Default preferences
const defaultPreferences: NotificationPreferences = {
  enabled: true,
  desktop: true,
  email: true,
  sound: false,
  categories: {
    system: true,
    inventory: true,
    sales: true,
    customer: true,
    financial: true,
    hr: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  maxVisible: 10,
};

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { state, dispatch } = useSharedState();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission>('default');

  // Initialize notifications from shared state
  const notifications = state.notifications;
  const unreadCount = state.unreadCount;

  useEffect(() => {
    // Load preferences from localStorage
    loadPreferences();
    
    // Check desktop notification permission
    checkDesktopPermission();
    
    // Setup event listeners
    setupEventListeners();
    
    // Cleanup expired notifications periodically
    const interval = setInterval(cleanupExpiredNotifications, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  /**
   * Load preferences from localStorage
   */
  const loadPreferences = async () => {
    try {
      const saved = localStorage.getItem('notification-preferences');
      if (saved) {
        const loadedPrefs = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...loadedPrefs });
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  };

  /**
   * Check desktop notification permission
   */
  const checkDesktopPermission = async () => {
    if ('Notification' in window) {
      setDesktopPermission(Notification.permission);
    }
  };

  /**
   * Setup event listeners for cross-solution events
   */
  const setupEventListeners = () => {
    // Listen for notification events
    globalEventBus.on('notification', async (event: CrossSolutionEvent) => {
      if (event.type === 'notification') {
        await handleNotificationEvent(event as NotificationEvent);
      }
    });

    // Listen for other events that should generate notifications
    globalEventBus.on('low_stock_alert', async (event: CrossSolutionEvent) => {
      if (event.type === 'low_stock_alert') {
        await sendNotification({
          title: 'Low Stock Alert',
          message: `Product ${event.data.productName} is running low on stock (${event.data.currentStock} remaining)`,
          severity: 'warning',
          category: 'inventory',
          actionUrl: '/inventory',
          requiresAction: true,
        });
      }
    });

    globalEventBus.on('customer_created', async (event: CrossSolutionEvent) => {
      if (event.type === 'customer_created') {
        await sendNotification({
          title: 'New Customer Added',
          message: `Customer ${event.data.customerData.name} has been added to the system`,
          severity: 'success',
          category: 'customer',
          actionUrl: `/crm/customer/${event.data.customerId}`,
          requiresAction: false,
        });
      }
    });

    globalEventBus.on('sale_processed', async (event: CrossSolutionEvent) => {
      if (event.type === 'sale_processed') {
        await sendNotification({
          title: 'Sale Completed',
          message: `Sale #${event.data.saleId} completed successfully - $${event.data.totalAmount.toFixed(2)}`,
          severity: 'success',
          category: 'sales',
          actionUrl: `/pos/receipt/${event.data.saleId}`,
          requiresAction: false,
        });
      }
    });
  };

  /**
   * Handle notification events from event bus
   */
  const handleNotificationEvent = async (event: NotificationEvent) => {
    await sendNotification({
      title: event.data.title,
      message: event.data.message,
      severity: event.data.severity,
      category: event.data.category,
      actionUrl: event.data.actionUrl,
      requiresAction: event.data.requiresAction,
    });
  };

  /**
   * Send a notification
   */
  const sendNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!preferences.enabled) return;
    
    // Check quiet hours
    if (preferences.quietHours.enabled && isQuietHours()) {
      return;
    }

    // Check category preferences
    if (!preferences.categories[notification.category]) {
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Add to shared state
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Send to different channels
    const deliveryPromises: Promise<DeliveryResult>[] = [];

    if (preferences.desktop) {
      deliveryPromises.push(sendDesktopNotification(newNotification));
    }

    if (preferences.email) {
      deliveryPromises.push(sendEmailNotification(newNotification));
    }

    // Wait for all deliveries (but don't block)
    Promise.allSettled(deliveryPromises).then(results => {
      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error('Notification delivery failed:', result.reason);
        }
      });
    });

    // Play sound if enabled
    if (preferences.sound) {
      playNotificationSound();
    }
  };

  /**
   * Send desktop notification
   */
  const sendDesktopNotification = async (notification: Notification): Promise<DeliveryResult> => {
    try {
      if ('Notification' in window) {
        if (desktopPermission === 'default') {
          const permission = await Notification.requestPermission();
          setDesktopPermission(permission);
          
          if (permission !== 'granted') {
            return {
              channel: 'desktop',
              success: false,
              error: 'Permission denied',
              timestamp: new Date(),
            };
          }
        }

        if (desktopPermission === 'granted') {
          const notif = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: notification.requiresAction,
          });

          if (notification.actionUrl) {
            notif.onclick = () => {
              window.location.href = notification.actionUrl || '';
            };
          }

          return {
            channel: 'desktop',
            success: true,
            timestamp: new Date(),
          };
        }
      }

      return {
        channel: 'desktop',
        success: false,
        error: 'Desktop notifications not supported',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        channel: 'desktop',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      };
    }
  };

  /**
   * Send email notification
   */
  const sendEmailNotification = async (notification: Notification): Promise<DeliveryResult> => {
    try {
      // In a real implementation, this would call an email service
      console.log('Sending email notification:', notification);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        channel: 'email',
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        channel: 'email',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      };
    }
  };

  /**
   * Send push notification
   */
  const sendPushNotification = async (notification: Notification): Promise<DeliveryResult> => {
    try {
      // In a real implementation, this would use a push service
      console.log('Sending push notification:', notification);
      
      return {
        channel: 'push',
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        channel: 'push',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      };
    }
  };

  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  };

  /**
   * Check if current time is within quiet hours
   */
  const isQuietHours = (): boolean => {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Same day range (e.g., 22:00 - 08:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range (e.g., 22:00 - 08:00 next day)
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  /**
   * Cleanup expired notifications
   */
  const cleanupExpiredNotifications = () => {
    const now = new Date();
    notifications.forEach(notification => {
      if (notification.expiresAt && notification.expiresAt < now) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }
    });
  };

  /**
   * Enable desktop notifications
   */
  const enableDesktopNotifications = async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setDesktopPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  /**
   * Mark notification as read
   */
  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  /**
   * Delete notification
   */
  const deleteNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  /**
   * Clear all notifications
   */
  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  /**
   * Update preferences
   */
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPreferences };
    setPreferences(updatedPrefs);
    
    // Save to localStorage
    try {
      localStorage.setItem('notification-preferences', JSON.stringify(updatedPrefs));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    isLoading: false,
    error: null,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    enableDesktopNotifications,
    sendEmailNotification,
    sendPushNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notifications
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Notification templates
 */
export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'low_stock',
    name: 'Low Stock Alert',
    title: 'Low Stock Alert',
    message: 'Product {productName} is running low on stock ({currentStock} remaining)',
    severity: 'warning',
    category: 'inventory',
    variables: ['productName', 'currentStock'],
    channels: ['desktop', 'email'],
  },
  {
    id: 'new_customer',
    name: 'New Customer',
    title: 'New Customer Added',
    message: 'Customer {customerName} has been added to the system',
    severity: 'success',
    category: 'customer',
    variables: ['customerName'],
    channels: ['desktop'],
  },
  {
    id: 'sale_completed',
    name: 'Sale Completed',
    title: 'Sale Completed',
    message: 'Sale #{saleId} completed successfully - {totalAmount}',
    severity: 'success',
    category: 'sales',
    variables: ['saleId', 'totalAmount'],
    channels: ['desktop'],
  },
  {
    id: 'system_error',
    name: 'System Error',
    title: 'System Error',
    message: 'An error occurred in {service}: {error}',
    severity: 'error',
    category: 'system',
    variables: ['service', 'error'],
    channels: ['desktop', 'email'],
  },
];

/**
 * Render notification template with variables
 */
export const renderTemplate = (
  template: NotificationTemplate,
  variables: Record<string, any>
): Omit<Notification, 'id' | 'timestamp' | 'read'> => {
  let title = template.title;
  let message = template.message;

  // Replace variables in title and message
  for (const variable of template.variables) {
    const value = variables[variable];
    if (value !== undefined) {
      const placeholder = `{${variable}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      message = message.replace(new RegExp(placeholder, 'g'), String(value));
    }
  }

  return {
    title,
    message,
    severity: template.severity,
    category: template.category,
    requiresAction: template.category === 'inventory' || template.category === 'system',
  };
};
