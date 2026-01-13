import { Notification, NotificationFilter, NotificationStats } from '../types/index.js';

export interface NotificationStoreConfig {
  maxHistorySize: number;
  persistenceEnabled: boolean;
  storageKey?: string;
  autoCleanup: boolean;
  cleanupInterval: number; // milliseconds
}

export abstract class NotificationStore {
  protected config: NotificationStoreConfig;
  protected notifications: Map<string, Notification> = new Map();

  constructor(config: Partial<NotificationStoreConfig> = {}) {
    this.config = {
      maxHistorySize: 1000,
      persistenceEnabled: true,
      storageKey: 'kits-notifications',
      autoCleanup: true,
      cleanupInterval: 3600000, // 1 hour
      ...config
    };

    if (this.config.autoCleanup) {
      this.startCleanupTimer();
    }
  }

  /**
   * Add notification to store
   */
  async add(notification: Notification): Promise<void> {
    this.notifications.set(notification.id, notification);

    // Enforce max history size
    if (this.notifications.size > this.config.maxHistorySize) {
      await this.cleanup();
    }

    // Persist if enabled
    if (this.config.persistenceEnabled) {
      await this.persist();
    }
  }

  /**
   * Get notification by ID
   */
  async get(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  /**
   * Get all notifications
   */
  async getAll(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, filter?: NotificationFilter): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    // Apply filter
    if (filter) {
      notifications = this.applyFilter(notifications, filter);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update notification
   */
  async update(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const notification = this.notifications.get(id);
    if (!notification) return null;

    const updatedNotification = { ...notification, ...updates, updatedAt: new Date() };
    this.notifications.set(id, updatedNotification);

    if (this.config.persistenceEnabled) {
      await this.persist();
    }

    return updatedNotification;
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<boolean> {
    const deleted = this.notifications.delete(id);

    if (deleted && this.config.persistenceEnabled) {
      await this.persist();
    }

    return deleted;
  }

  /**
   * Clear all notifications
   */
  async clear(userId?: string): Promise<void> {
    if (userId) {
      const userNotifications = Array.from(this.notifications.entries())
        .filter(([_, notification]) => notification.userId === userId);
      
      userNotifications.forEach(([id]) => this.notifications.delete(id));
    } else {
      this.notifications.clear();
    }

    if (this.config.persistenceEnabled) {
      await this.persist();
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(userId?: string): Promise<NotificationStats> {
    const notifications = userId 
      ? Array.from(this.notifications.values()).filter(n => n.userId === userId)
      : Array.from(this.notifications.values());

    const stats: NotificationStats = {
      total: notifications.length,
      pending: notifications.filter(n => n.status === 'pending').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      delivered: notifications.filter(n => n.status === 'delivered').length,
      read: notifications.filter(n => n.status === 'read').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      dismissed: notifications.filter(n => n.status === 'dismissed').length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
      deliveryRate: 0,
      readRate: 0,
      averageDeliveryTime: 0
    };

    // Calculate by type
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    // Calculate by priority
    notifications.forEach(notification => {
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });

    // Calculate by channel
    notifications.forEach(notification => {
      notification.channels.forEach(channel => {
        stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
      });
    });

    // Calculate rates
    const deliveredNotifications = notifications.filter(n => 
      n.status === 'delivered' || n.status === 'read'
    );
    stats.deliveryRate = notifications.length > 0 ? (deliveredNotifications.length / notifications.length) * 100 : 0;
    stats.readRate = notifications.length > 0 ? (stats.read / notifications.length) * 100 : 0;

    return stats;
  }

  /**
   * Search notifications
   */
  async search(query: string, userId?: string): Promise<Notification[]> {
    const searchLower = query.toLowerCase();
    let notifications = Array.from(this.notifications.values());

    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }

    return notifications.filter(notification =>
      notification.title.toLowerCase().includes(searchLower) ||
      notification.message.toLowerCase().includes(searchLower) ||
      notification.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Get notifications by date range
   */
  async getByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values());

    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }

    return notifications.filter(notification => {
      const notifTime = notification.createdAt.getTime();
      return notifTime >= startDate.getTime() && notifTime <= endDate.getTime();
    });
  }

  /**
   * Get expired notifications
   */
  async getExpired(): Promise<Notification[]> {
    const now = new Date();
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.expiresAt && notification.expiresAt <= now
      );
  }

  /**
   * Cleanup expired notifications
   */
  async cleanup(): Promise<void> {
    const expired = await this.getExpired();
    
    for (const notification of expired) {
      this.notifications.delete(notification.id);
    }

    // If still over max size, remove oldest
    if (this.notifications.size > this.config.maxHistorySize) {
      const sorted = Array.from(this.notifications.entries())
        .sort(([, a], [, b]) => a.createdAt.getTime() - b.createdAt.getTime());
      
      const toRemove = sorted.slice(0, this.notifications.size - this.config.maxHistorySize);
      toRemove.forEach(([id]) => this.notifications.delete(id));
    }

    if (this.config.persistenceEnabled) {
      await this.persist();
    }
  }

  /**
   * Persist notifications to storage
   */
  protected abstract persist(): Promise<void>;

  /**
   * Load notifications from storage
   */
  protected abstract load(): Promise<void>;

  /**
   * Apply filter to notifications
   */
  protected applyFilter(notifications: Notification[], filter: NotificationFilter): Notification[] {
    return notifications.filter(notification => {
      if (filter.types && !filter.types.includes(notification.type)) return false;
      if (filter.priorities && !filter.priorities.includes(notification.priority)) return false;
      if (filter.channels && !notification.channels.some(channel => filter.channels!.includes(channel))) return false;
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
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Destroy store
   */
  async destroy(): Promise<void> {
    if (this.config.persistenceEnabled) {
      await this.persist();
    }
    this.notifications.clear();
  }
}

/**
 * In-memory notification store
 */
export class MemoryNotificationStore extends NotificationStore {
  constructor(config: Partial<NotificationStoreConfig> = {}) {
    super(config);
  }

  protected async persist(): Promise<void> {
    // No persistence needed for memory store
  }

  protected async load(): Promise<void> {
    // No loading needed for memory store
  }
}

/**
 * Local storage notification store
 */
export class LocalStorageNotificationStore extends NotificationStore {
  constructor(config: Partial<NotificationStoreConfig> = {}) {
    super(config);
    this.load();
  }

  protected async persist(): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(this.notifications.entries()));
      localStorage.setItem(this.config.storageKey!, data);
    } catch (error) {
      console.error('Failed to persist notifications to localStorage:', error);
    }
  }

  protected async load(): Promise<void> {
    try {
      const data = localStorage.getItem(this.config.storageKey!);
      if (data) {
        const entries = JSON.parse(data);
        this.notifications = new Map(
          entries.map(([id, notification]: [string, any]) => [
            id,
            {
              ...notification,
              createdAt: new Date(notification.createdAt),
              updatedAt: new Date(notification.updatedAt),
              readAt: notification.readAt ? new Date(notification.readAt) : undefined,
              dismissedAt: notification.dismissedAt ? new Date(notification.dismissedAt) : undefined,
              expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error);
    }
  }
}

/**
 * IndexedDB notification store
 */
export class IndexedDBNotificationStore extends NotificationStore {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(config: Partial<NotificationStoreConfig> & { dbName?: string; storeName?: string } = {}) {
    super(config);
    this.dbName = config.dbName || 'KitsNotifications';
    this.storeName = config.storeName || 'notifications';
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.load();
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  protected async persist(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Clear existing data
    await store.clear();

    // Add all notifications
    for (const notification of this.notifications.values()) {
      store.add(notification);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  protected async load(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const notifications = request.result;
        this.notifications = new Map(
          notifications.map((notification: any) => [
            notification.id,
            {
              ...notification,
              createdAt: new Date(notification.createdAt),
              updatedAt: new Date(notification.updatedAt),
              readAt: notification.readAt ? new Date(notification.readAt) : undefined,
              dismissedAt: notification.dismissedAt ? new Date(notification.dismissedAt) : undefined,
              expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
            }
          ])
        );
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getUserNotifications(userId: string, filter?: NotificationFilter): Promise<Notification[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        let notifications = request.result.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt),
          updatedAt: new Date(notification.updatedAt),
          readAt: notification.readAt ? new Date(notification.readAt) : undefined,
          dismissedAt: notification.dismissedAt ? new Date(notification.dismissedAt) : undefined,
          expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
        }));

        // Apply filter
        if (filter) {
          notifications = this.applyFilter(notifications, filter);
        }

        resolve(notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async destroy(): Promise<void> {
    await super.destroy();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
