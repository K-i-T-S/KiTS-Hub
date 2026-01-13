import { Notification, NotificationDeliveryResult, NotificationChannel } from '../types/index.js';

export interface DesktopChannelConfig {
  defaultOptions?: NotificationOptions;
  rateLimit: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  permissions: {
    autoRequest: boolean;
    fallbackToInApp: boolean;
  };
}

export class DesktopChannel {
  private config: DesktopChannelConfig;
  private rateLimitTracker: Map<string, number[]> = new Map();
  private activeNotifications: Map<string, Notification> = new Map();

  constructor(config: Partial<DesktopChannelConfig> = {}) {
    this.config = {
      defaultOptions: {
        icon: '/favicon.ico',
        badge: '/badge.png',
        tag: 'kits-hub-notification',
        requireInteraction: false,
        silent: false
      },
      rateLimit: {
        maxPerMinute: 20,
        maxPerHour: 200,
        maxPerDay: 1000
      },
      permissions: {
        autoRequest: true,
        fallbackToInApp: true
      },
      ...config
    };

    // Request permission if auto-request is enabled
    if (this.config.permissions.autoRequest) {
      this.requestPermission();
    }
  }

  /**
   * Send desktop notification
   */
  async send(notification: Notification): Promise<NotificationDeliveryResult> {
    try {
      // Check if desktop notifications are supported
      if (!this.isSupported()) {
        return {
          success: false,
          channel: NotificationChannel.DESKTOP,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'Desktop notifications not supported'
        };
      }

      // Check permission
      if (!this.isPermissionGranted()) {
        if (this.config.permissions.fallbackToInApp) {
          return {
            success: false,
            channel: NotificationChannel.DESKTOP,
            notificationId: notification.id,
            timestamp: new Date(),
            error: 'Permission denied, falling back to in-app'
          };
        } else {
          return {
            success: false,
            channel: NotificationChannel.DESKTOP,
            notificationId: notification.id,
            timestamp: new Date(),
            error: 'Permission denied for desktop notifications'
          };
        }
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          channel: NotificationChannel.DESKTOP,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'Rate limit exceeded'
        };
      }

      // Show desktop notification
      await this.showDesktopNotification(notification);

      return {
        success: true,
        channel: NotificationChannel.DESKTOP,
        notificationId: notification.id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.DESKTOP,
        notificationId: notification.id,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Request permission for desktop notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Check if desktop notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if permission is granted
   */
  isPermissionGranted(): boolean {
    return Notification.permission === 'granted';
  }

  /**
   * Show desktop notification
   */
  private async showDesktopNotification(notification: Notification): Promise<void> {
    const options = this.createNotificationOptions(notification);
    const desktopNotification = new (window as any).Notification(notification.title, options);

    // Store active notification
    this.activeNotifications.set(notification.id, notification);

    // Add event listeners
    this.addNotificationEventListeners(desktopNotification, notification);

    // Auto-close after delay if not requiring interaction
    if (!options.requireInteraction) {
      const autoCloseDelay = this.getAutoCloseDelay(notification.priority);
      setTimeout(() => {
        desktopNotification.close();
        this.activeNotifications.delete(notification.id);
      }, autoCloseDelay);
    }
  }

  /**
   * Create notification options
   */
  private createNotificationOptions(notification: Notification): NotificationOptions {
    const baseOptions = {
      ...this.config.defaultOptions,
      body: notification.message,
      tag: `${this.config.defaultOptions?.tag}-${notification.id}`,
      requireInteraction: this.shouldRequireInteraction(notification),
      silent: notification.type === 'system'
    };

    // Add actions if available
    if (notification.actions.length > 0) {
      (baseOptions as any).actions = notification.actions.slice(0, 2).map(action => ({
        action: action.id,
        title: action.label,
        icon: action.icon
      }));
    }

    // Add custom icon based on type
    const typeIcon = this.getTypeIcon(notification.type);
    if (typeIcon) {
      baseOptions.icon = typeIcon;
    }

    return baseOptions;
  }

  /**
   * Add event listeners to notification
   */
  private addNotificationEventListeners(
    desktopNotification: any, 
    notification: Notification
  ): void {
    // Click handler
    desktopNotification.onclick = (event: MouseEvent) => {
      event.preventDefault();
      this.handleNotificationClick(notification);
      desktopNotification.close();
      this.activeNotifications.delete(notification.id);
    };

    // Close handler
    desktopNotification.onclose = () => {
      this.activeNotifications.delete(notification.id);
    };

    // Error handler
    desktopNotification.onerror = (error: Event) => {
      console.error('Desktop notification error:', error);
      this.activeNotifications.delete(notification.id);
    };

    // Action handlers
    desktopNotification.addEventListener('click', (event: any) => {
      if (event.action) {
        this.handleNotificationAction(notification, event.action);
      }
    });
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notification: Notification): void {
    // Focus the window
    window.focus();

    // Emit click event for external handling
    window.dispatchEvent(new CustomEvent('notification:click', {
      detail: { notification }
    }));

    // Handle default action if available
    if (notification.actions.length > 0) {
      const defaultAction = notification.actions.find(action => action.variant === 'primary') || notification.actions[0];
      this.executeAction(defaultAction);
    }
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(notification: Notification, actionId: string): void {
    const action = notification.actions.find(a => a.id === actionId);
    if (action) {
      this.executeAction(action);
    }

    // Emit action event for external handling
    window.dispatchEvent(new CustomEvent('notification:action', {
      detail: { notification, actionId }
    }));
  }

  /**
   * Execute notification action
   */
  private executeAction(action: any): void {
    try {
      if (typeof action.action === 'function') {
        action.action();
      }
    } catch (error) {
      console.error('Failed to execute notification action:', error);
    }
  }

  /**
   * Get auto-close delay based on priority
   */
  private getAutoCloseDelay(priority: string): number {
    const delays = {
      low: 3000,
      normal: 5000,
      high: 8000,
      urgent: 0 // Don't auto-close urgent notifications
    };
    return delays[priority as keyof typeof delays] || 5000;
  }

  /**
   * Determine if notification should require interaction
   */
  private shouldRequireInteraction(notification: Notification): boolean {
    return notification.priority === 'high' || 
           notification.priority === 'urgent' ||
           notification.type === 'error';
  }

  /**
   * Get icon based on notification type
   */
  private getTypeIcon(type: string): string {
    const icons = {
      info: '/icons/notification-info.png',
      success: '/icons/notification-success.png',
      warning: '/icons/notification-warning.png',
      error: '/icons/notification-error.png',
      system: '/icons/notification-system.png'
    };
    return icons[type as keyof typeof icons] || this.config.defaultOptions?.icon || '/favicon.ico';
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const key = 'desktop';
    let timestamps = this.rateLimitTracker.get(key) || [];

    // Remove old timestamps (older than 1 minute)
    const oneMinuteAgo = now - 60000;
    timestamps = timestamps.filter(timestamp => timestamp > oneMinuteAgo);

    // Check rate limits
    if (timestamps.length >= this.config.rateLimit.maxPerMinute) {
      return false;
    }

    // Add current timestamp
    timestamps.push(now);
    this.rateLimitTracker.set(key, timestamps);

    return true;
  }

  /**
   * Get active notifications count
   */
  getActiveCount(): number {
    return this.activeNotifications.size;
  }

  /**
   * Close specific notification
   */
  closeNotification(notificationId: string): void {
    // Desktop notifications don't provide a way to close by ID
    // We can only track our own active notifications
    this.activeNotifications.delete(notificationId);
  }

  /**
   * Close all notifications
   */
  closeAllNotifications(): void {
    // Clear our tracking
    this.activeNotifications.clear();
    
    // Note: Browser doesn't provide a way to close all desktop notifications
    // Each notification must be closed individually
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    active: number;
    rateLimited: boolean;
    permissionGranted: boolean;
    supported: boolean;
  } {
    return {
      active: this.activeNotifications.size,
      rateLimited: !this.checkRateLimit(),
      permissionGranted: this.isPermissionGranted(),
      supported: this.isSupported()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.closeAllNotifications();
    this.rateLimitTracker.clear();
    this.activeNotifications.clear();
  }
}
