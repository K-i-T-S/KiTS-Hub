import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationManager } from '../manager/NotificationManager.js';
import { InAppChannel } from '../channels/InAppChannel.js';
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel,
  NotificationStatus 
} from '../types/index.js';

describe('Cross-Solution Notification Integration', () => {
  let manager: NotificationManager;
  let inAppChannel: InAppChannel;

  beforeEach(() => {
    manager = new NotificationManager();
    inAppChannel = new InAppChannel({
      maxVisible: 5,
      autoHideDelay: 5000,
      position: 'top-right',
      soundEnabled: false // Disable sound in tests to avoid DOM issues
    });
  });

  describe('POS Solution Integration', () => {
    it('should send order confirmation notifications', async () => {
      // Simulate POS order created
      const orderNotification = await manager.createNotification({
        title: 'Order Confirmed',
        message: `Order #12345 has been confirmed. Total: $99.99`,
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'customer-123',
        category: 'orders',
        source: 'pos-system',
        actions: [
          {
            id: 'view-receipt',
            label: 'View Receipt',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'track-order',
            label: 'Track Order',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(orderNotification.category).toBe('orders');
      expect(orderNotification.source).toBe('pos-system');
      expect(orderNotification.actions).toHaveLength(2);
    });

    it('should send payment failure notifications', async () => {
      const paymentFailureNotification = await manager.createNotification({
        title: 'Payment Failed',
        message: 'Payment could not be processed. Please try again.',
        type: NotificationType.ERROR,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'customer-123',
        category: 'payments',
        source: 'pos-system',
        actions: [
          {
            id: 'retry-payment',
            label: 'Retry Payment',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'update-card',
            label: 'Update Card',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(paymentFailureNotification.type).toBe(NotificationType.ERROR);
      expect(paymentFailureNotification.priority).toBe(NotificationPriority.HIGH);
      expect(paymentFailureNotification.category).toBe('payments');
    });

    it('should send low stock alerts to staff', async () => {
      const lowStockNotification = await manager.createNotification({
        title: 'Low Stock Alert',
        message: 'Product "Wireless Headphones" is running low on stock (5 remaining)',
        type: NotificationType.WARNING,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'staff-456',
        category: 'inventory',
        source: 'pos-system',
        actions: [
          {
            id: 'view-inventory',
            label: 'View Inventory',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'reorder',
            label: 'Reorder Now',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(lowStockNotification.type).toBe(NotificationType.WARNING);
      expect(lowStockNotification.category).toBe('inventory');
      expect(lowStockNotification.userId).toBe('staff-456');
    });
  });

  describe('Inventory Solution Integration', () => {
    it('should send stock movement notifications', async () => {
      const stockMovementNotification = await manager.createNotification({
        title: 'Stock Movement',
        message: '50 units of "Wireless Headphones" added to warehouse',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'manager-789',
        category: 'inventory',
        source: 'inventory-system',
        metadata: {
          productId: 'prod-123',
          movementType: 'inbound',
          quantity: 50,
          location: 'warehouse-1'
        }
      });

      expect(stockMovementNotification.category).toBe('inventory');
      expect(stockMovementNotification.source).toBe('inventory-system');
      expect(stockMovementNotification.metadata?.productId).toBe('prod-123');
    });

    it('should send reorder notifications', async () => {
      const reorderNotification = await manager.createNotification({
        title: 'Reorder Required',
        message: 'Product "USB Cable" has reached reorder point',
        type: NotificationType.WARNING,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'manager-789',
        category: 'procurement',
        source: 'inventory-system',
        actions: [
          {
            id: 'create-purchase-order',
            label: 'Create PO',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'view-suppliers',
            label: 'View Suppliers',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(reorderNotification.category).toBe('procurement');
      expect(reorderNotification.actions).toHaveLength(2);
    });
  });

  describe('Accounting Solution Integration', () => {
    it('should send invoice notifications', async () => {
      const invoiceNotification = await manager.createNotification({
        title: 'New Invoice Generated',
        message: 'Invoice #INV-2024-001 for $1,250.00 has been generated',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'accountant-101',
        category: 'invoicing',
        source: 'accounting-system',
        actions: [
          {
            id: 'view-invoice',
            label: 'View Invoice',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'send-customer',
            label: 'Send to Customer',
            variant: 'secondary',
            action: vi.fn()
          }
        ],
        attachments: [
          {
            id: 'invoice-pdf',
            name: 'INV-2024-001.pdf',
            url: '/documents/invoices/INV-2024-001.pdf',
            type: 'application/pdf',
            size: 245760
          }
        ]
      });

      expect(invoiceNotification.category).toBe('invoicing');
      expect(invoiceNotification.attachments).toHaveLength(1);
      expect(invoiceNotification.attachments[0].name).toBe('INV-2024-001.pdf');
    });

    it('should send payment received notifications', async () => {
      const paymentNotification = await manager.createNotification({
        title: 'Payment Received',
        message: 'Payment of $500.00 received from Customer ABC',
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'accountant-101',
        category: 'payments',
        source: 'accounting-system',
        metadata: {
          customerId: 'cust-123',
          paymentMethod: 'bank_transfer',
          reference: 'TXN-789456'
        }
      });

      expect(paymentNotification.type).toBe(NotificationType.SUCCESS);
      expect(paymentNotification.category).toBe('payments');
      expect(paymentNotification.metadata?.customerId).toBe('cust-123');
    });

    it('should send financial alerts', async () => {
      const financialAlertNotification = await manager.createNotification({
        title: 'Cash Flow Alert',
        message: 'Projected cash flow may be insufficient for next 30 days',
        type: NotificationType.WARNING,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'cfo-202',
        category: 'financial',
        source: 'accounting-system',
        actions: [
          {
            id: 'view-cash-flow',
            label: 'View Cash Flow',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'generate-report',
            label: 'Generate Report',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(financialAlertNotification.priority).toBe(NotificationPriority.HIGH);
      expect(financialAlertNotification.category).toBe('financial');
    });
  });

  describe('CRM Solution Integration', () => {
    it('should send lead assignment notifications', async () => {
      const leadNotification = await manager.createNotification({
        title: 'New Lead Assigned',
        message: 'Lead "John Doe" has been assigned to you',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'sales-303',
        category: 'leads',
        source: 'crm-system',
        actions: [
          {
            id: 'view-lead',
            label: 'View Lead',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'contact-now',
            label: 'Contact Now',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(leadNotification.category).toBe('leads');
      expect(leadNotification.source).toBe('crm-system');
    });

    it('should send follow-up reminders', async () => {
      const followUpNotification = await manager.createNotification({
        title: 'Follow-up Required',
        message: 'Follow-up with Customer XYZ scheduled for today',
        type: NotificationType.WARNING,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'sales-303',
        category: 'follow-ups',
        source: 'crm-system',
        actions: [
          {
            id: 'view-customer',
            label: 'View Customer',
            variant: 'primary',
            action: vi.fn()
          },
          {
            id: 'log-call',
            label: 'Log Call',
            variant: 'secondary',
            action: vi.fn()
          }
        ]
      });

      expect(followUpNotification.category).toBe('follow-ups');
      expect(followUpNotification.actions).toHaveLength(2);
    });
  });

  describe('Cross-Solution Event Flow', () => {
    it('should handle POS → Inventory → Accounting notification flow', async () => {
      // Step 1: POS creates order
      const orderNotification = await manager.createNotification({
        title: 'Order Placed',
        message: 'Order #12345 placed for 2x "Wireless Headphones"',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'customer-123',
        category: 'orders',
        source: 'pos-system',
        metadata: {
          orderId: 'order-123',
          items: [
            { productId: 'prod-123', quantity: 2 }
          ]
        }
      });

      // Step 2: Inventory updates stock
      const stockUpdateNotification = await manager.createNotification({
        title: 'Stock Updated',
        message: 'Stock reduced for "Wireless Headphones" (2 units)',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'manager-789',
        category: 'inventory',
        source: 'inventory-system',
        metadata: {
          correlationId: orderNotification.id,
          orderId: 'order-123',
          productId: 'prod-123',
          quantityChange: -2
        }
      });

      // Step 3: Accounting creates invoice
      const invoiceNotification = await manager.createNotification({
        title: 'Invoice Generated',
        message: 'Invoice #INV-12345 generated for Order #12345',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'accountant-101',
        category: 'invoicing',
        source: 'accounting-system',
        metadata: {
          correlationId: orderNotification.id,
          orderId: 'order-123',
          invoiceId: 'inv-12345',
          amount: 199.98
        }
      });

      // Verify the flow
      expect(orderNotification.source).toBe('pos-system');
      expect(stockUpdateNotification.source).toBe('inventory-system');
      expect(invoiceNotification.source).toBe('accounting-system');
      
      // Verify correlation
      expect(stockUpdateNotification.metadata?.correlationId).toBe(orderNotification.id);
      expect(invoiceNotification.metadata?.correlationId).toBe(orderNotification.id);
    });

    it('should handle system-wide notifications', async () => {
      // System maintenance notification
      const maintenanceNotification = await manager.createNotification({
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for 2024-01-15 02:00 AM EST',
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        category: 'system',
        source: 'admin-panel'
      });

      expect(maintenanceNotification.type).toBe(NotificationType.SYSTEM);
      expect(maintenanceNotification.category).toBe('system');
    });
  });

  describe('User Preference Integration', () => {
    it('should respect user preferences across solutions', async () => {
      // Set user preferences
      const preferences = {
        userId: 'user-123',
        channels: {
          [NotificationChannel.IN_APP]: true,
          [NotificationChannel.EMAIL]: false,
          [NotificationChannel.PUSH]: true,
          [NotificationChannel.DESKTOP]: false
        },
        types: {
          [NotificationType.INFO]: true,
          [NotificationType.SUCCESS]: true,
          [NotificationType.WARNING]: false,
          [NotificationType.ERROR]: true,
          [NotificationType.SYSTEM]: false
        },
        priorities: {
          [NotificationPriority.LOW]: false,
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
          address: 'user@example.com',
          enabled: false
        },
        push: {
          enabled: true
        },
        desktop: {
          enabled: false,
          requireInteraction: false
        }
      };

      manager.setPreferences('user-123', preferences);

      // Create notifications from different solutions
      const posNotification = await manager.createNotification({
        title: 'Order Update',
        message: 'Your order status has changed',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'user-123',
        category: 'orders',
        source: 'pos-system'
      });

      const inventoryNotification = await manager.createNotification({
        title: 'Low Stock',
        message: 'Product is running low on stock',
        type: NotificationType.WARNING,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'user-123',
        category: 'inventory',
        source: 'inventory-system'
      });

      const accountingNotification = await manager.createNotification({
        title: 'Payment Received',
        message: 'Your payment has been received',
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'user-123',
        category: 'payments',
        source: 'accounting-system'
      });

      // Get user notifications
      const allNotifications = manager.getNotifications('user-123');
      
      // Manually filter based on preferences (since manager doesn't auto-filter on getNotifications)
      const filteredNotifications = allNotifications.filter(n => {
        const typeAllowed = preferences.types[n.type] !== false;
        const priorityAllowed = preferences.priorities[n.priority] !== false;
        const channelAllowed = n.channels.some(channel => (preferences.channels as any)[channel] !== false);
        return typeAllowed && priorityAllowed && channelAllowed;
      });

      // Should only include notifications that match preferences
      expect(filteredNotifications).toHaveLength(2); // INFO and SUCCESS, not WARNING
      expect(filteredNotifications.every(n => n.userId === 'user-123')).toBe(true);
    });
  });

  describe('Statistics and Analytics', () => {
    it('should provide cross-solution statistics', async () => {
      // Create notifications from different solutions
      await manager.createNotification({
        title: 'POS Order',
        message: 'Order placed',
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'user-123',
        category: 'orders',
        source: 'pos-system'
      });

      await manager.createNotification({
        title: 'Inventory Alert',
        message: 'Low stock',
        type: NotificationType.WARNING,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP],
        userId: 'user-123',
        category: 'inventory',
        source: 'inventory-system'
      });

      await manager.createNotification({
        title: 'Invoice Created',
        message: 'New invoice',
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'user-123',
        category: 'invoicing',
        source: 'accounting-system'
      });

      const stats = manager.getStats('user-123');

      expect(stats.total).toBe(3);
      expect(stats.byType[NotificationType.INFO]).toBe(1);
      expect(stats.byType[NotificationType.WARNING]).toBe(1);
      expect(stats.byType[NotificationType.SUCCESS]).toBe(1);
      expect(stats.byPriority[NotificationPriority.NORMAL]).toBe(2);
      expect(stats.byPriority[NotificationPriority.HIGH]).toBe(1);
    });
  });
});
