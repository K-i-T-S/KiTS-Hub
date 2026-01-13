import { Notification, NotificationDeliveryResult, NotificationChannel } from '../types/index.js';

export interface PushChannelConfig {
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  serviceWorkerPath?: string;
  defaultOptions?: NotificationOptions;
  rateLimit: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
}

export class PushChannel {
  private config: PushChannelConfig;
  private subscription: PushSubscription | null = null;
  private rateLimitTracker: Map<string, number[]> = new Map();

  constructor(config: PushChannelConfig = {}) {
    this.config = {
      serviceWorkerPath: '/sw.js',
      defaultOptions: {
        icon: '/favicon.ico',
        badge: '/badge.png',
        tag: 'kits-hub-notification',
        renotify: true,
        requireInteraction: false,
        silent: false
      },
      rateLimit: {
        maxPerMinute: 10,
        maxPerHour: 100,
        maxPerDay: 500
      },
      ...config
    };

    this.initializeServiceWorker();
  }

  /**
   * Send push notification
   */
  async send(notification: Notification): Promise<NotificationDeliveryResult> {
    try {
      // Check if push notifications are supported
      if (!this.isSupported()) {
        return {
          success: false,
          channel: NotificationChannel.PUSH,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'Push notifications not supported'
        };
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          channel: NotificationChannel.PUSH,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'Rate limit exceeded'
        };
      }

      // Get or request subscription
      const subscription = await this.getSubscription();
      if (!subscription) {
        return {
          success: false,
          channel: NotificationChannel.PUSH,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'No push subscription available'
        };
      }

      // Send push notification
      await this.sendPushNotification(subscription, notification);

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        notificationId: notification.id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        notificationId: notification.id,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const registration = await this.getServiceWorkerRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey || '')
        });
      }

      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      this.subscription = null;
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  getSubscription(): Promise<PushSubscription | null> {
    return new Promise(async (resolve) => {
      if (!this.isSupported()) {
        resolve(null);
        return;
      }

      try {
        const registration = await this.getServiceWorkerRegistration();
        if (!registration) {
          resolve(null);
          return;
        }

        const subscription = await registration.pushManager.getSubscription();
        this.subscription = subscription;
        resolve(subscription);
      } catch (error) {
        resolve(null);
      }
    });
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator;
  }

  /**
   * Check if permission is granted
   */
  isPermissionGranted(): boolean {
    return Notification.permission === 'granted';
  }

  /**
   * Send push notification via service worker
   */
  private async sendPushNotification(
    subscription: PushSubscription, 
    notification: Notification
  ): Promise<void> {
    const payload = this.createPushPayload(notification);

    // In a real implementation, this would send to a push service
    // For now, we'll show a local notification as fallback
    if (this.isPermissionGranted()) {
      this.showLocalNotification(notification);
    }

    // Simulate sending to push service
    console.log('Sending push notification:', payload);
    console.log('Subscription endpoint:', subscription.endpoint);
  }

  /**
   * Create push notification payload
   */
  private createPushPayload(notification: Notification): any {
    return {
      title: notification.title,
      body: notification.message,
      icon: this.config.defaultOptions?.icon,
      badge: this.config.defaultOptions?.badge,
      tag: this.config.defaultOptions?.tag,
      data: {
        notificationId: notification.id,
        type: notification.type,
        priority: notification.priority,
        source: notification.source,
        category: notification.category,
        actions: notification.actions,
        url: window.location.href
      },
      actions: notification.actions.map(action => ({
        action: action.id,
        title: action.label,
        icon: action.icon
      })),
      requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
      silent: notification.type === 'system'
    };
  }

  /**
   * Show local notification as fallback
   */
  private showLocalNotification(notification: Notification): void {
    const options: NotificationOptions = {
      ...this.config.defaultOptions,
      body: notification.message,
      tag: `${this.config.defaultOptions?.tag}-${notification.id}`,
      requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
      silent: notification.type === 'system'
    };

    const localNotification = new Notification(notification.title, options);

    // Add click handler
    localNotification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      localNotification.close();
      
      // Handle actions if available
      if (notification.actions.length > 0) {
        this.handleNotificationAction(notification, notification.actions[0]);
      }
    };

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'high' && notification.priority !== 'urgent') {
      setTimeout(() => {
        localNotification.close();
      }, 5000);
    }
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(notification: Notification, action: any): void {
    try {
      if (typeof action.action === 'function') {
        action.action();
      }
    } catch (error) {
      console.error('Failed to execute notification action:', error);
    }
  }

  /**
   * Initialize service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(this.config.serviceWorkerPath!);
      console.log('Service worker registered:', registration);
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  }

  /**
   * Get service worker registration
   */
  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      return await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      return null;
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const key = 'push';
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
   * Convert URL base64 to Uint8Array for VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.subscription = null;
    this.rateLimitTracker.clear();
  }
}
