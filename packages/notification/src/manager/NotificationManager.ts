import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel, 
  NotificationStatus,
  NotificationPreferences,
  NotificationFilter,
  NotificationStats,
  NotificationManagerConfig,
  NotificationEventHandler,
  NotificationFilterFunction,
  NotificationTransformer,
  NotificationDeliveryResult,
  NotificationBatch
} from '../types/index.js';

export class NotificationManager extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private config: NotificationManagerConfig;
  private filters: NotificationFilterFunction[] = [];
  private transformers: NotificationTransformer[] = [];
  private rateLimits: Map<NotificationChannel, number[]> = new Map();
  private batches: Map<string, NotificationBatch> = new Map();

  constructor(config: Partial<NotificationManagerConfig> = {}) {
    super();
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 10,
      batchDelay: 1000,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      timezone: 'UTC',
      persistenceEnabled: true,
      maxHistorySize: 1000,
      ...config
    };

    // Initialize rate limiting for each channel
    Object.values(NotificationChannel).forEach(channel => {
      this.rateLimits.set(channel, []);
    });
  }

  /**
   * Create and send a new notification
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      title: data.title || '',
      message: data.message || '',
      type: data.type || NotificationType.INFO,
      priority: data.priority || NotificationPriority.NORMAL,
      channels: data.channels || [NotificationChannel.IN_APP],
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: data.userId,
      source: data.source,
      category: data.category,
      tags: data.tags || [],
      actions: data.actions || [],
      attachments: data.attachments || [],
      metadata: data.metadata
    };

    // Validate notification
    this.validateNotification(notification);

    // Apply transformers
    const transformedNotification = this.applyTransformers(notification);

    // Store notification
    this.notifications.set(notification.id, transformedNotification);

    // Emit creation event
    this.emit('notification:created', transformedNotification);

    // Process notification
    await this.processNotification(transformedNotification);

    return transformedNotification;
  }

  /**
   * Send notification to specified channels
   */
  async sendNotification(notificationId: string): Promise<NotificationDeliveryResult[]> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    const results: NotificationDeliveryResult[] = [];

    // Check if user preferences allow this notification
    if (!this.isAllowedByPreferences(notification)) {
      return [{
        success: false,
        channel: NotificationChannel.IN_APP,
        notificationId,
        timestamp: new Date(),
        error: 'Blocked by user preferences'
      }];
    }

    // Check quiet hours
    if (this.isQuietHours() && notification.priority !== NotificationPriority.URGENT) {
      return [{
        success: false,
        channel: NotificationChannel.IN_APP,
        notificationId,
        timestamp: new Date(),
        error: 'Quiet hours active'
      }];
    }

    // Send to each channel
    for (const channel of notification.channels) {
      try {
        const result = await this.sendToChannel(notification, channel);
        results.push(result);
        
        // Update notification status
        if (result.success) {
          notification.status = NotificationStatus.SENT;
          notification.updatedAt = new Date();
        }
      } catch (error) {
        results.push({
          success: false,
          channel,
          notificationId,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Emit send event
    this.emit('notification:sent', notification, results);

    return results;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    notification.updatedAt = new Date();

    this.emit('notification:read', notification);
  }

  /**
   * Dismiss notification
   */
  async dismissNotification(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    notification.status = NotificationStatus.DISMISSED;
    notification.dismissedAt = new Date();
    notification.updatedAt = new Date();

    this.emit('notification:dismissed', notification);
  }

  /**
   * Get notifications for a user
   */
  getNotifications(userId: string, filter?: NotificationFilter): Notification[] {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    // Apply filters
    if (filter) {
      notifications = this.applyFilter(notifications, filter);
    }

    // Apply custom filters
    notifications = notifications.filter(n => 
      this.filters.every(filterFn => filterFn(n))
    );

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get notification statistics
   */
  getStats(userId?: string): NotificationStats {
    const notifications = userId 
      ? Array.from(this.notifications.values()).filter(n => n.userId === userId)
      : Array.from(this.notifications.values());

    const stats: NotificationStats = {
      total: notifications.length,
      pending: notifications.filter(n => n.status === NotificationStatus.PENDING).length,
      sent: notifications.filter(n => n.status === NotificationStatus.SENT).length,
      delivered: notifications.filter(n => n.status === NotificationStatus.DELIVERED).length,
      read: notifications.filter(n => n.status === NotificationStatus.READ).length,
      failed: notifications.filter(n => n.status === NotificationStatus.FAILED).length,
      dismissed: notifications.filter(n => n.status === NotificationStatus.DISMISSED).length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      byChannel: {} as Record<NotificationChannel, number>,
      deliveryRate: 0,
      readRate: 0,
      averageDeliveryTime: 0
    };

    // Calculate by type
    Object.values(NotificationType).forEach(type => {
      stats.byType[type] = notifications.filter(n => n.type === type).length;
    });

    // Calculate by priority
    Object.values(NotificationPriority).forEach(priority => {
      stats.byPriority[priority] = notifications.filter(n => n.priority === priority).length;
    });

    // Calculate by channel
    Object.values(NotificationChannel).forEach(channel => {
      stats.byChannel[channel] = notifications.filter(n => n.channels.includes(channel)).length;
    });

    // Calculate rates
    const deliveredNotifications = notifications.filter(n => 
      n.status === NotificationStatus.DELIVERED || n.status === NotificationStatus.READ
    );
    stats.deliveryRate = notifications.length > 0 ? (deliveredNotifications.length / notifications.length) * 100 : 0;
    stats.readRate = notifications.length > 0 ? (stats.read / notifications.length) * 100 : 0;

    return stats;
  }

  /**
   * Set user preferences
   */
  setPreferences(userId: string, preferences: NotificationPreferences): void {
    this.preferences.set(userId, preferences);
    this.emit('preferences:updated', userId, preferences);
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): NotificationPreferences | undefined {
    return this.preferences.get(userId);
  }

  /**
   * Add notification filter
   */
  addFilter(filter: NotificationFilterFunction): void {
    this.filters.push(filter);
  }

  /**
   * Remove notification filter
   */
  removeFilter(filter: NotificationFilterFunction): void {
    const index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
    }
  }

  /**
   * Add notification transformer
   */
  addTransformer(transformer: NotificationTransformer): void {
    this.transformers.push(transformer);
  }

  /**
   * Remove notification transformer
   */
  removeTransformer(transformer: NotificationTransformer): void {
    const index = this.transformers.indexOf(transformer);
    if (index > -1) {
      this.transformers.splice(index, 1);
    }
  }

  /**
   * Clear notification history
   */
  clearHistory(userId?: string): void {
    if (userId) {
      const userNotifications = Array.from(this.notifications.entries())
        .filter(([_, notification]) => notification.userId === userId);
      
      userNotifications.forEach(([id]) => this.notifications.delete(id));
    } else {
      this.notifications.clear();
    }

    this.emit('history:cleared', userId);
  }

  /**
   * Process notification (send to channels)
   */
  private async processNotification(notification: Notification): Promise<void> {
    try {
      await this.sendNotification(notification.id);
    } catch (error) {
      console.error('Failed to process notification:', error);
      notification.status = NotificationStatus.FAILED;
      notification.updatedAt = new Date();
      this.emit('notification:failed', notification, error);
    }
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(notification: Notification, channel: NotificationChannel): Promise<NotificationDeliveryResult> {
    // Check rate limiting
    if (!this.checkRateLimit(channel)) {
      return {
        success: false,
        channel,
        notificationId: notification.id,
        timestamp: new Date(),
        error: 'Rate limit exceeded'
      };
    }

    // Emit channel-specific event
    this.emit(`notification:${channel}`, notification);

    return {
      success: true,
      channel,
      notificationId: notification.id,
      timestamp: new Date()
    };
  }

  /**
   * Check if notification is allowed by user preferences
   */
  private isAllowedByPreferences(notification: Notification): boolean {
    if (!notification.userId) return true;

    const preferences = this.preferences.get(notification.userId);
    if (!preferences) return true;

    // Check channel preferences
    const channelAllowed = notification.channels.some(channel => 
      preferences.channels[channel] !== false
    );

    // Check type preferences
    const typeAllowed = preferences.types[notification.type] !== false;

    // Check priority preferences
    const priorityAllowed = preferences.priorities[notification.priority] !== false;

    // Check category preferences
    const categoryAllowed = notification.category 
      ? preferences.categories[notification.category] !== false
      : true;

    return channelAllowed && typeAllowed && priorityAllowed && categoryAllowed;
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.config.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.config.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = this.config.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Check rate limiting for channel
   */
  private checkRateLimit(channel: NotificationChannel): boolean {
    const now = Date.now();
    const timestamps = this.rateLimits.get(channel) || [];
    
    // Remove old timestamps (older than 1 minute)
    const oneMinuteAgo = now - 60000;
    const recentTimestamps = timestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Check if under rate limit (100 per minute)
    if (recentTimestamps.length >= 100) {
      return false;
    }

    // Add current timestamp
    recentTimestamps.push(now);
    this.rateLimits.set(channel, recentTimestamps);
    
    return true;
  }

  /**
   * Apply transformers to notification
   */
  private applyTransformers(notification: Notification): Notification {
    return this.transformers.reduce((acc, transformer) => transformer(acc), notification);
  }

  /**
   * Apply filter to notifications
   */
  private applyFilter(notifications: Notification[], filter: NotificationFilter): Notification[] {
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
   * Validate notification data
   */
  private validateNotification(notification: Notification): void {
    if (!notification.title?.trim()) {
      throw new Error('Notification title is required');
    }
    if (!notification.message?.trim()) {
      throw new Error('Notification message is required');
    }
    if (!notification.channels || notification.channels.length === 0) {
      throw new Error('At least one channel is required');
    }
  }
}
