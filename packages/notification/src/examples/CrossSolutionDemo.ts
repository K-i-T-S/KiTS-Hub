import { NotificationManager } from '../manager/NotificationManager.js';
import { InAppChannel } from '../channels/InAppChannel.js';
import { EmailChannel } from '../channels/EmailChannel.js';
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel 
} from '../types/index.js';

/**
 * Cross-Solution Notification Demo
 * 
 * This demo shows how the notification system works across different KiTS Hub solutions:
 * - POS (Point of Sale)
 * - Inventory Management
 * - Accounting
 * - CRM (Customer Relationship Management)
 */

export class CrossSolutionDemo {
  private manager: NotificationManager;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private inAppChannel: InAppChannel;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emailChannel: EmailChannel;

  constructor() {
    this.manager = new NotificationManager({
      maxRetries: 3,
      retryDelay: 1000,
      quietHoursEnabled: false,
      persistenceEnabled: true
    });

    // Initialize channels (stored for potential future use)
    this.inAppChannel = new InAppChannel({
      maxVisible: 5,
      autoHideDelay: 5000,
      position: 'top-right',
      soundEnabled: true
    });

    this.emailChannel = new EmailChannel({
      provider: 'smtp',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'notifications@kits-hub.com',
          pass: 'password'
        }
      },
      templates: {
        html: '<div>{{message}}</div>',
        text: '{{message}}'
      },
      rateLimit: {
        maxPerMinute: 10,
        maxPerHour: 100,
        maxPerDay: 1000
      }
    });

    // Set up event listeners for cross-solution coordination
    this.setupEventListeners();
  }

  /**
   * Demo: POS Solution Notifications
   */
  async demoPOSNotifications() {
    console.log('🏪 POS Solution Notifications Demo');

    // Order confirmation
    const orderNotification = await this.manager.createNotification({
      title: 'Order Confirmed!',
      message: `Order #${this.generateOrderId()} has been confirmed. Total: $${this.generateAmount()}`,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId: 'customer-123',
      category: 'orders',
      source: 'pos-system',
      tags: ['order', 'confirmation', 'customer'],
      actions: [
        {
          id: 'view-receipt',
          label: 'View Receipt',
          variant: 'primary',
          action: () => console.log('🧾 Opening receipt...')
        },
        {
          id: 'track-order',
          label: 'Track Order',
          variant: 'secondary',
          action: () => console.log('📦 Opening order tracking...')
        }
      ]
    });

    console.log('✅ Order confirmation notification created:', orderNotification.id);

    // Payment failure
    const paymentFailureNotification = await this.manager.createNotification({
      title: 'Payment Failed',
      message: 'Payment could not be processed. Please update your payment method.',
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId: 'customer-123',
      category: 'payments',
      source: 'pos-system',
      tags: ['payment', 'failure', 'urgent'],
      actions: [
        {
          id: 'retry-payment',
          label: 'Retry Payment',
          variant: 'primary',
          action: () => console.log('💳 Retrying payment...')
        },
        {
          id: 'update-card',
          label: 'Update Card',
          variant: 'secondary',
          action: () => console.log('💳 Opening payment update form...')
        }
      ]
    });

    console.log('❌ Payment failure notification created:', paymentFailureNotification.id);

    return { orderNotification, paymentFailureNotification };
  }

  /**
   * Demo: Inventory Solution Notifications
   */
  async demoInventoryNotifications() {
    console.log('📦 Inventory Solution Notifications Demo');

    // Low stock alert
    const lowStockNotification = await this.manager.createNotification({
      title: 'Low Stock Alert',
      message: `Product "${this.generateProductName()}" is running low on stock (${this.generateStockLevel()} remaining)`,
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId: 'manager-456',
      category: 'inventory',
      source: 'inventory-system',
      tags: ['inventory', 'low-stock', 'reorder'],
      metadata: {
        productId: this.generateProductId(),
        currentStock: this.generateStockLevel(),
        reorderPoint: 10,
        location: 'warehouse-1'
      },
      actions: [
        {
          id: 'view-inventory',
          label: 'View Inventory',
          variant: 'primary',
          action: () => console.log('📊 Opening inventory dashboard...')
        },
        {
          id: 'reorder-now',
          label: 'Reorder Now',
          variant: 'secondary',
          action: () => console.log('🛒 Creating purchase order...')
        }
      ]
    });

    console.log('⚠️ Low stock notification created:', lowStockNotification.id);

    // Stock movement
    const stockMovementNotification = await this.manager.createNotification({
      title: 'Stock Movement',
      message: `${this.generateQuantity()} units of "${this.generateProductName()}" added to warehouse`,
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
      userId: 'staff-789',
      category: 'inventory',
      source: 'inventory-system',
      tags: ['inventory', 'stock-in', 'warehouse'],
      metadata: {
        productId: this.generateProductId(),
        quantity: this.generateQuantity(),
        movementType: 'inbound',
        location: 'warehouse-1',
        timestamp: new Date().toISOString()
      }
    });

    console.log('📥 Stock movement notification created:', stockMovementNotification.id);

    return { lowStockNotification, stockMovementNotification };
  }

  /**
   * Demo: Accounting Solution Notifications
   */
  async demoAccountingNotifications() {
    console.log('💰 Accounting Solution Notifications Demo');

    // Invoice generated
    const invoiceNotification = await this.manager.createNotification({
      title: 'New Invoice Generated',
      message: `Invoice #${this.generateInvoiceId()} for $${this.generateAmount()} has been generated`,
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId: 'accountant-101',
      category: 'invoicing',
      source: 'accounting-system',
      tags: ['invoice', 'billing', 'customer'],
      metadata: {
        invoiceId: this.generateInvoiceId(),
        customerId: 'customer-123',
        amount: this.generateAmount(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      actions: [
        {
          id: 'view-invoice',
          label: 'View Invoice',
          variant: 'primary',
          action: () => console.log('🧾 Opening invoice details...')
        },
        {
          id: 'send-customer',
          label: 'Send to Customer',
          variant: 'secondary',
          action: () => console.log('📧 Sending invoice to customer...')
        }
      ],
      attachments: [
        {
          id: 'invoice-pdf',
          name: `INV-${this.generateInvoiceId()}.pdf`,
          url: `/documents/invoices/INV-${this.generateInvoiceId()}.pdf`,
          type: 'application/pdf',
          size: 245760
        }
      ]
    });

    console.log('🧾 Invoice notification created:', invoiceNotification.id);

    // Payment received
    const paymentNotification = await this.manager.createNotification({
      title: 'Payment Received',
      message: `Payment of $${this.generateAmount()} received from ${this.generateCustomerName()}`,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
      userId: 'accountant-101',
      category: 'payments',
      source: 'accounting-system',
      tags: ['payment', 'received', 'revenue'],
      metadata: {
        paymentId: this.generatePaymentId(),
        customerId: this.generateCustomerId(),
        amount: this.generateAmount(),
        paymentMethod: 'bank_transfer',
        reference: `TXN-${this.generateTransactionId()}`
      }
    });

    console.log('💰 Payment received notification created:', paymentNotification.id);

    return { invoiceNotification, paymentNotification };
  }

  /**
   * Demo: CRM Solution Notifications
   */
  async demoCRMNotifications() {
    console.log('👥 CRM Solution Notifications Demo');

    // New lead assigned
    const leadNotification = await this.manager.createNotification({
      title: 'New Lead Assigned',
      message: `Lead "${this.generateCustomerName()}" has been assigned to you`,
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
      userId: 'sales-202',
      category: 'leads',
      source: 'crm-system',
      tags: ['lead', 'assignment', 'sales'],
      metadata: {
        leadId: this.generateLeadId(),
        customerName: this.generateCustomerName(),
        assignedTo: 'sales-202',
        priority: 'hot'
      },
      actions: [
        {
          id: 'view-lead',
          label: 'View Lead',
          variant: 'primary',
          action: () => console.log('👤 Opening lead details...')
        },
        {
          id: 'contact-now',
          label: 'Contact Now',
          variant: 'secondary',
          action: () => console.log('📞 Opening contact form...')
        }
      ]
    });

    console.log('👤 Lead assignment notification created:', leadNotification.id);

    // Follow-up reminder
    const followUpNotification = await this.manager.createNotification({
      title: 'Follow-up Required',
      message: `Follow-up with ${this.generateCustomerName()} scheduled for today`,
      type: NotificationType.WARNING,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId: 'sales-202',
      category: 'follow-ups',
      source: 'crm-system',
      tags: ['follow-up', 'reminder', 'customer'],
      metadata: {
        customerId: this.generateCustomerId(),
        customerName: this.generateCustomerName(),
        scheduledDate: new Date().toISOString(),
        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      actions: [
        {
          id: 'view-customer',
          label: 'View Customer',
          variant: 'primary',
          action: () => console.log('👤 Opening customer profile...')
        },
        {
          id: 'log-call',
          label: 'Log Call',
          variant: 'secondary',
          action: () => console.log('📞 Opening call logging form...')
        }
      ]
    });

    console.log('⏰ Follow-up reminder created:', followUpNotification.id);

    return { leadNotification, followUpNotification };
  }

  /**
   * Demo: Cross-Solution Event Flow
   */
  async demoCrossSolutionFlow() {
    console.log('🔄 Cross-Solution Event Flow Demo');

    // Step 1: Customer places order in POS
    const orderNotification = await this.manager.createNotification({
      title: 'Order Placed',
      message: `Order #${this.generateOrderId()} placed for ${this.generateQuantity()}x "${this.generateProductName()}"`,
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
      userId: 'customer-123',
      category: 'orders',
      source: 'pos-system',
      tags: ['order', 'customer'],
      metadata: {
        orderId: this.generateOrderId(),
        customerId: 'customer-123',
        items: [
          { productId: this.generateProductId(), quantity: this.generateQuantity(), price: this.generateAmount() }
        ],
        total: this.generateAmount()
      }
    });

    console.log('📦 Step 1 - Order placed:', orderNotification.id);

    // Step 2: Inventory automatically updates stock
    setTimeout(async () => {
      const stockUpdateNotification = await this.manager.createNotification({
        title: 'Stock Automatically Updated',
        message: `Stock reduced for "${this.generateProductName()}" (${this.generateQuantity()} units)`,
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        userId: 'manager-456',
        category: 'inventory',
        source: 'inventory-system',
        tags: ['inventory', 'auto-update'],
        metadata: {
          correlationId: orderNotification.id,
          orderId: this.generateOrderId(),
          productId: this.generateProductId(),
          quantityChange: -this.generateQuantity(),
          previousStock: this.generateStockLevel() + this.generateQuantity(),
          newStock: this.generateStockLevel()
        }
      });

      console.log('📉 Step 2 - Stock updated:', stockUpdateNotification.id);
    }, 1000);

    // Step 3: Accounting generates invoice
    setTimeout(async () => {
      const invoiceNotification = await this.manager.createNotification({
        title: 'Invoice Automatically Generated',
        message: `Invoice #${this.generateInvoiceId()} generated for Order #${this.generateOrderId()}`,
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        userId: 'accountant-101',
        category: 'invoicing',
        source: 'accounting-system',
        tags: ['invoice', 'auto-generated'],
        metadata: {
          correlationId: orderNotification.id,
          orderId: this.generateOrderId(),
          invoiceId: this.generateInvoiceId(),
          amount: this.generateAmount(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      });

      console.log('🧾 Step 3 - Invoice generated:', invoiceNotification.id);
    }, 2000);

    // Step 4: CRM updates customer activity
    setTimeout(async () => {
      const crmUpdateNotification = await this.manager.createNotification({
        title: 'Customer Activity Updated',
        message: `Customer ${this.generateCustomerName()} recent activity: New order placed`,
        type: NotificationType.INFO,
        priority: NotificationPriority.LOW,
        channels: [NotificationChannel.IN_APP],
        userId: 'sales-202',
        category: 'customer-activity',
        source: 'crm-system',
        tags: ['customer', 'activity', 'order'],
        metadata: {
          correlationId: orderNotification.id,
          customerId: 'customer-123',
          customerName: this.generateCustomerName(),
          activity: 'order_placed',
          orderId: this.generateOrderId(),
          orderValue: this.generateAmount()
        }
      });

      console.log('👥 Step 4 - CRM updated:', crmUpdateNotification.id);
    }, 3000);

    return orderNotification;
  }

  /**
   * Demo: User Preferences Across Solutions
   */
  async demoUserPreferences() {
    console.log('⚙️ User Preferences Demo');

    // Set up user preferences
    const userId = 'user-123';
    this.manager.setPreferences(userId, {
      userId,
      channels: {
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.PUSH]: false,
        [NotificationChannel.DESKTOP]: true,
        [NotificationChannel.SMS]: false
      },
      types: {
        [NotificationType.INFO]: true,
        [NotificationType.SUCCESS]: true,
        [NotificationType.WARNING]: true,
        [NotificationType.ERROR]: true,
        [NotificationType.SYSTEM]: false
      },
      priorities: {
        [NotificationPriority.LOW]: false,
        [NotificationPriority.NORMAL]: true,
        [NotificationPriority.HIGH]: true,
        [NotificationPriority.URGENT]: true
      },
      categories: {
        'orders': true,
        'inventory': false,
        'invoicing': true,
        'payments': true,
        'leads': false,
        'follow-ups': false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      frequency: {
        maxPerHour: 20,
        maxPerDay: 200,
        batchDelay: 5
      },
      email: {
        address: 'user@example.com',
        enabled: true
      },
      push: {
        enabled: false
      },
      desktop: {
        enabled: true,
        requireInteraction: false
      }
    });

    console.log('✅ User preferences set for:', userId);

    // Create notifications from different solutions
    const notifications = [];

    // POS notification (allowed)
    const posNotification = await this.manager.createNotification({
      title: 'Order Update',
      message: 'Your order status has changed to "Shipped"',
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId,
      category: 'orders',
      source: 'pos-system'
    });
    notifications.push(posNotification);

    // Inventory notification (blocked by category preference)
    const inventoryNotification = await this.manager.createNotification({
      title: 'Stock Alert',
      message: 'Product availability has changed',
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
      userId,
      category: 'inventory',
      source: 'inventory-system'
    });
    notifications.push(inventoryNotification);

    // Accounting notification (allowed)
    const accountingNotification = await this.manager.createNotification({
      title: 'Payment Processed',
      message: 'Your payment has been successfully processed',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      userId,
      category: 'payments',
      source: 'accounting-system'
    });
    notifications.push(accountingNotification);

    // Get user notifications (should be filtered by preferences)
    const userNotifications = this.manager.getNotifications(userId);
    console.log(`📊 User has ${userNotifications.length} notifications after preference filtering`);

    // Show statistics
    const stats = this.manager.getStats(userId);
    console.log('📈 User notification statistics:', {
      total: stats.total,
      byType: stats.byType,
      byCategory: notifications.reduce((acc, n) => {
        acc[n.category || 'unknown'] = (acc[n.category || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    return { notifications, userNotifications, stats };
  }

  /**
   * Run complete cross-solution demo
   */
  async runCompleteDemo() {
    console.log('🚀 Starting Complete Cross-Solution Notification Demo');
    console.log('=' .repeat(60));

    try {
      // Demo individual solutions
      await this.demoPOSNotifications();
      console.log('');

      await this.demoInventoryNotifications();
      console.log('');

      await this.demoAccountingNotifications();
      console.log('');

      await this.demoCRMNotifications();
      console.log('');

      // Demo cross-solution flow
      await this.demoCrossSolutionFlow();
      console.log('');

      // Demo user preferences
      await this.demoUserPreferences();
      console.log('');

      // Show overall statistics
      const overallStats = this.manager.getStats();
      console.log('📊 Overall System Statistics:', {
        totalNotifications: overallStats.total,
        byType: overallStats.byType,
        byPriority: overallStats.byPriority,
        byChannel: overallStats.byChannel,
        deliveryRate: `${overallStats.deliveryRate.toFixed(2)}%`
      });

      console.log('=' .repeat(60));
      console.log('✅ Complete Cross-Solution Demo Finished Successfully!');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  /**
   * Set up event listeners for cross-solution coordination
   */
  private setupEventListeners() {
    // Listen for order events to trigger inventory updates
    this.manager.on('notification:created', (notification) => {
      if (notification.category === 'orders' && notification.source === 'pos-system') {
        console.log(`🔄 Order created: ${notification.id} - triggering inventory update`);
        // In real implementation, this would trigger inventory system
      }
    });

    // Listen for inventory events to trigger reorder alerts
    this.manager.on('notification:created', (notification) => {
      if (notification.category === 'inventory' && notification.type === NotificationType.WARNING) {
        console.log(`⚠️ Low stock detected: ${notification.id} - triggering reorder workflow`);
        // In real implementation, this would trigger procurement system
      }
    });

    // Listen for payment events to update customer status
    this.manager.on('notification:created', (notification) => {
      if (notification.category === 'payments' && notification.type === NotificationType.SUCCESS) {
        console.log(`💰 Payment received: ${notification.id} - updating customer status`);
        // In real implementation, this would trigger CRM updates
      }
    });
  }

  // Helper methods for generating demo data
  private generateOrderId(): string {
    return `ORD-${Math.floor(Math.random() * 100000)}`;
  }

  private generateInvoiceId(): string {
    return `INV-${Math.floor(Math.random() * 100000)}`;
  }

  private generatePaymentId(): string {
    return `PAY-${Math.floor(Math.random() * 100000)}`;
  }

  private generateTransactionId(): string {
    return Math.floor(Math.random() * 1000000).toString();
  }

  private generateProductId(): string {
    return `PROD-${Math.floor(Math.random() * 1000)}`;
  }

  private generateLeadId(): string {
    return `LEAD-${Math.floor(Math.random() * 100000)}`;
  }

  private generateCustomerId(): string {
    return `CUST-${Math.floor(Math.random() * 100000)}`;
  }

  private generateCustomerName(): string {
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateProductName(): string {
    const products = ['Wireless Headphones', 'USB Cable', 'Laptop Stand', 'Mouse Pad', 'Keyboard'];
    return products[Math.floor(Math.random() * products.length)];
  }

  private generateAmount(): number {
    return Math.floor(Math.random() * 1000) + 10;
  }

  private generateQuantity(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  private generateStockLevel(): number {
    return Math.floor(Math.random() * 50) + 5;
  }
}

// Export for easy usage
export default CrossSolutionDemo;
