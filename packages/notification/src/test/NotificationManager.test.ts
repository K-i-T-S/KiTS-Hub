import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationManager } from '../manager/NotificationManager.js';
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel,
  NotificationStatus 
} from '../types/index.js';

describe('NotificationManager', () => {
  let manager: NotificationManager;

  beforeEach(() => {
    manager = new NotificationManager();
  });

  describe('createNotification', () => {
    it('should create a notification with default values', async () => {
      const notification = await manager.createNotification({
        title: 'Test Notification',
        message: 'This is a test message',
        userId: 'user-123'
      });

      expect(notification.id).toBeDefined();
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('This is a test message');
      expect(notification.type).toBe(NotificationType.INFO);
      expect(notification.priority).toBe(NotificationPriority.NORMAL);
      expect(notification.status).toBe(NotificationStatus.SENT);
      expect(notification.channels).toEqual([NotificationChannel.IN_APP]);
      expect(notification.userId).toBe('user-123');
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a notification with custom values', async () => {
      const notification = await manager.createNotification({
        title: 'Error Notification',
        message: 'Something went wrong',
        type: NotificationType.ERROR,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'user-456',
        category: 'system',
        tags: ['urgent', 'system'],
        source: 'api'
      });

      expect(notification.type).toBe(NotificationType.ERROR);
      expect(notification.priority).toBe(NotificationPriority.HIGH);
      expect(notification.channels).toEqual([NotificationChannel.IN_APP, NotificationChannel.EMAIL]);
      expect(notification.category).toBe('system');
      expect(notification.tags).toEqual(['urgent', 'system']);
      expect(notification.source).toBe('api');
    });

    it('should emit notification:created event', async () => {
      const listener = vi.fn();
      manager.on('notification:created', listener);

      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        userId: 'user-123'
      });

      expect(listener).toHaveBeenCalledWith(notification);
    });

    it('should throw error for invalid notification', async () => {
      await expect(manager.createNotification({
        title: '',
        message: 'Test message',
        userId: 'user-123'
      })).rejects.toThrow('Notification title is required');

      await expect(manager.createNotification({
        title: 'Test',
        message: '',
        userId: 'user-123'
      })).rejects.toThrow('Notification message is required');
    });
  });

  describe('sendNotification', () => {
    it('should send notification to configured channels', async () => {
      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.IN_APP],
        userId: 'user-123'
      });

      const results = await manager.sendNotification(notification.id);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].channel).toBe(NotificationChannel.IN_APP);
      expect(results[0].notificationId).toBe(notification.id);
    });

    it('should fail if notification not found', async () => {
      await expect(manager.sendNotification('invalid-id')).rejects.toThrow('Notification invalid-id not found');
    });

    it('should emit notification:sent event', async () => {
      const listener = vi.fn();
      manager.on('notification:sent', listener);

      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.IN_APP],
        userId: 'user-123'
      });

      await manager.sendNotification(notification.id);

      expect(listener).toHaveBeenCalledWith(notification, expect.any(Array));
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        userId: 'user-123'
      });

      await manager.markAsRead(notification.id);

      const updatedNotification = await manager.getNotifications('user-123');
      expect(updatedNotification[0].status).toBe(NotificationStatus.READ);
      expect(updatedNotification[0].readAt).toBeInstanceOf(Date);
    });

    it('should emit notification:read event', async () => {
      const listener = vi.fn();
      manager.on('notification:read', listener);

      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        userId: 'user-123'
      });

      await manager.markAsRead(notification.id);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        id: notification.id,
        status: NotificationStatus.READ
      }));
    });

    it('should throw error if notification not found', async () => {
      await expect(manager.markAsRead('invalid-id')).rejects.toThrow('Notification invalid-id not found');
    });
  });

  describe('dismissNotification', () => {
    it('should dismiss notification', async () => {
      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        userId: 'user-123'
      });

      await manager.dismissNotification(notification.id);

      const updatedNotification = await manager.getNotifications('user-123');
      expect(updatedNotification[0].status).toBe(NotificationStatus.DISMISSED);
      expect(updatedNotification[0].dismissedAt).toBeInstanceOf(Date);
    });

    it('should emit notification:dismissed event', async () => {
      const listener = vi.fn();
      manager.on('notification:dismissed', listener);

      const notification = await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        userId: 'user-123'
      });

      await manager.dismissNotification(notification.id);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        id: notification.id,
        status: NotificationStatus.DISMISSED
      }));
    });
  });

  describe('getNotifications', () => {
    it('should return user notifications sorted by creation date', async () => {
      const now = new Date();
      
      const notification1 = await manager.createNotification({
        title: 'First',
        message: 'First message',
        userId: 'user-123'
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const notification2 = await manager.createNotification({
        title: 'Second',
        message: 'Second message',
        userId: 'user-123'
      });

      const notifications = manager.getNotifications('user-123');

      expect(notifications).toHaveLength(2);
      expect(notifications[0].id).toBe(notification2.id); // Most recent first
      expect(notifications[1].id).toBe(notification1.id);
    });

    it('should return empty array for user with no notifications', () => {
      const notifications = manager.getNotifications('user-456');
      expect(notifications).toEqual([]);
    });

    it('should filter notifications by type', async () => {
      await manager.createNotification({
        title: 'Info',
        message: 'Info message',
        type: NotificationType.INFO,
        userId: 'user-123'
      });

      await manager.createNotification({
        title: 'Error',
        message: 'Error message',
        type: NotificationType.ERROR,
        userId: 'user-123'
      });

      const notifications = manager.getNotifications('user-123', {
        types: [NotificationType.ERROR]
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.ERROR);
    });

    it('should filter notifications by priority', async () => {
      await manager.createNotification({
        title: 'Low Priority',
        message: 'Low priority message',
        priority: NotificationPriority.LOW,
        userId: 'user-123'
      });

      await manager.createNotification({
        title: 'High Priority',
        message: 'High priority message',
        priority: NotificationPriority.HIGH,
        userId: 'user-123'
      });

      const notifications = manager.getNotifications('user-123', {
        priorities: [NotificationPriority.HIGH]
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].priority).toBe(NotificationPriority.HIGH);
    });

    it('should filter notifications by search term', async () => {
      await manager.createNotification({
        title: 'Order Confirmation',
        message: 'Your order has been confirmed',
        userId: 'user-123'
      });

      await manager.createNotification({
        title: 'Payment Failed',
        message: 'Your payment could not be processed',
        userId: 'user-123'
      });

      const notifications = manager.getNotifications('user-123', {
        search: 'order'
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Order Confirmation');
    });
  });

  describe('getStats', () => {
    it('should return notification statistics', async () => {
      const notification1 = await manager.createNotification({
        title: 'Info',
        message: 'Info message',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        userId: 'user-123'
      });

      const notification2 = await manager.createNotification({
        title: 'Error',
        message: 'Error message',
        type: NotificationType.ERROR,
        priority: NotificationPriority.HIGH,
        userId: 'user-123'
      });

      await manager.markAsRead(notification1.id);

      const stats = manager.getStats('user-123');

      expect(stats.total).toBe(2);
      expect(stats.byType[NotificationType.INFO]).toBe(1);
      expect(stats.byType[NotificationType.ERROR]).toBe(1);
      expect(stats.byPriority[NotificationPriority.NORMAL]).toBe(1);
      expect(stats.byPriority[NotificationPriority.HIGH]).toBe(1);
      expect(stats.read).toBe(1);
    });

    it('should return global statistics when no userId provided', async () => {
      await manager.createNotification({
        title: 'User 1 Notification',
        message: 'Message for user 1',
        userId: 'user-123'
      });

      await manager.createNotification({
        title: 'User 2 Notification',
        message: 'Message for user 2',
        userId: 'user-456'
      });

      const stats = manager.getStats();

      expect(stats.total).toBe(2);
    });
  });

  describe('preferences', () => {
    it('should set and get user preferences', () => {
      const preferences = {
        userId: 'user-123',
        channels: {
          [NotificationChannel.IN_APP]: true,
          [NotificationChannel.EMAIL]: false
        },
        types: {
          [NotificationType.INFO]: true,
          [NotificationType.ERROR]: false
        },
        priorities: {
          [NotificationPriority.NORMAL]: true,
          [NotificationPriority.HIGH]: false
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
          address: 'test@example.com',
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

      manager.setPreferences('user-123', preferences);

      const retrieved = manager.getPreferences('user-123');
      expect(retrieved).toEqual(preferences);
    });

    it('should emit preferences:updated event', () => {
      const listener = vi.fn();
      manager.on('preferences:updated', listener);

      const preferences = {
        userId: 'user-123',
        channels: {},
        types: {},
        priorities: {},
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

      manager.setPreferences('user-123', preferences);

      expect(listener).toHaveBeenCalledWith('user-123', preferences);
    });

    it('should return undefined for non-existent preferences', () => {
      const preferences = manager.getPreferences('user-999');
      expect(preferences).toBeUndefined();
    });
  });

  describe('filters and transformers', () => {
    it('should apply filters to notifications', async () => {
      const filter = vi.fn().mockReturnValue(true);
      manager.addFilter(filter);

      await manager.createNotification({
        title: 'Test',
        message: 'Test message',
        userId: 'user-123'
      });

      const notifications = manager.getNotifications('user-123');
      expect(filter).toHaveBeenCalled();
    });

    it('should remove filters', () => {
      const filter = vi.fn();
      manager.addFilter(filter);
      manager.removeFilter(filter);

      const notifications = manager.getNotifications('user-123');
      expect(filter).not.toHaveBeenCalled();
    });

    it('should apply transformers to notifications', async () => {
      const transformer = vi.fn().mockImplementation((notification) => ({
        ...notification,
        title: `Transformed: ${notification.title}`
      }));
      manager.addTransformer(transformer);

      const notification = await manager.createNotification({
        title: 'Original',
        message: 'Test message',
        userId: 'user-123'
      });

      expect(transformer).toHaveBeenCalled();
      expect(notification.title).toBe('Transformed: Original');
    });

    it('should remove transformers', () => {
      const transformer = vi.fn();
      manager.addTransformer(transformer);
      manager.removeTransformer(transformer);

      expect(transformer).not.toHaveBeenCalled();
    });
  });

  describe('clearHistory', () => {
    it('should clear all notifications', async () => {
      await manager.createNotification({
        title: 'Test 1',
        message: 'Test message 1',
        userId: 'user-123'
      });

      await manager.createNotification({
        title: 'Test 2',
        message: 'Test message 2',
        userId: 'user-456'
      });

      manager.clearHistory();

      const notifications1 = manager.getNotifications('user-123');
      const notifications2 = manager.getNotifications('user-456');

      expect(notifications1).toEqual([]);
      expect(notifications2).toEqual([]);
    });

    it('should clear notifications for specific user', async () => {
      await manager.createNotification({
        title: 'User 1',
        message: 'Message for user 1',
        userId: 'user-123'
      });

      await manager.createNotification({
        title: 'User 2',
        message: 'Message for user 2',
        userId: 'user-456'
      });

      manager.clearHistory('user-123');

      const notifications1 = manager.getNotifications('user-123');
      const notifications2 = manager.getNotifications('user-456');

      expect(notifications1).toEqual([]);
      expect(notifications2).toHaveLength(1);
    });

    it('should emit history:cleared event', () => {
      const listener = vi.fn();
      manager.on('history:cleared', listener);

      manager.clearHistory('user-123');

      expect(listener).toHaveBeenCalledWith('user-123');
    });
  });
});
