# @kits-hub/notification

A comprehensive unified notification system for the KiTS Hub ecosystem. This package provides a complete notification infrastructure with multiple delivery channels, user preferences, persistence, and React integration.

## Features

- **🔔 Multiple Channels**: In-app, email, push, and desktop notifications
- **🎯 Smart Filtering**: Filter by type, priority, category, and custom criteria
- **⚙️ User Preferences**: Granular control over notification delivery
- **💾 Persistence**: Multiple storage options (memory, localStorage, IndexedDB)
- **🔄 Real-time Updates**: Event-driven architecture with live updates
- **🎨 Modern UI**: Beautiful notification center and preference components
- **📱 Cross-Platform**: Works on web, mobile, and desktop
- **🔒 Type Safe**: Full TypeScript support with runtime validation
- **📊 Analytics**: Built-in statistics and monitoring
- **🔧 Extensible**: Plugin architecture for custom channels and middleware

## Installation

```bash
npm install @kits-hub/notification
```

## Quick Start

```typescript
import { NotificationManager, InAppChannel } from '@kits-hub/notification';

// Create notification manager
const manager = new NotificationManager();

// Add channels
const inAppChannel = new InAppChannel();
manager.addChannel(NotificationChannel.IN_APP, inAppChannel);

// Create and send notification
await manager.createNotification({
  title: 'Welcome to KiTS Hub!',
  message: 'Your account has been successfully created.',
  type: NotificationType.SUCCESS,
  priority: NotificationPriority.NORMAL,
  channels: [NotificationChannel.IN_APP],
  userId: 'user-123'
});
```

## React Integration

```tsx
import { NotificationProvider, useNotifications, NotificationCenter } from '@kits-hub/notification';

function App() {
  const manager = new NotificationManager();
  
  return (
    <NotificationProvider manager={manager}>
      <MyApp />
    </NotificationProvider>
  );
}

function MyApp() {
  const { notifications, createNotification, markAsRead } = useNotifications(manager, {
    userId: 'user-123'
  });

  return (
    <div>
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}
```

## Core Concepts

### Notification Manager

The central orchestrator that handles notification creation, delivery, and management.

```typescript
const manager = new NotificationManager({
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 10,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
});
```

### Notification Channels

Different delivery mechanisms for notifications:

- **In-App**: Display within the application UI
- **Email**: Send via email (SMTP, SendGrid, SES, Mailgun)
- **Push**: Mobile push notifications
- **Desktop**: Browser desktop notifications

```typescript
// Configure email channel
const emailChannel = new EmailChannel({
  provider: 'sendgrid',
  sendgrid: {
    apiKey: 'your-api-key',
    from: 'noreply@kits-hub.com'
  }
});

// Configure push channel
const pushChannel = new PushChannel({
  vapidPublicKey: 'your-vapid-key',
  serviceWorkerPath: '/sw.js'
});
```

### User Preferences

Granular control over notification delivery:

```typescript
const preferences: NotificationPreferences = {
  userId: 'user-123',
  channels: {
    [NotificationChannel.IN_APP]: true,
    [NotificationChannel.EMAIL]: false,
    [NotificationChannel.PUSH]: true,
    [NotificationChannel.DESKTOP]: true
  },
  types: {
    [NotificationType.INFO]: true,
    [NotificationType.SUCCESS]: true,
    [NotificationType.WARNING]: true,
    [NotificationType.ERROR]: true,
    [NotificationType.SYSTEM]: false
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York'
  }
};

manager.setPreferences('user-123', preferences);
```

### Persistence

Multiple storage options for notification history:

```typescript
// In-memory store (default)
const memoryStore = new MemoryNotificationStore();

// Local storage
const localStorageStore = new LocalStorageNotificationStore({
  maxHistorySize: 1000,
  storageKey: 'my-notifications'
});

// IndexedDB for large datasets
const indexedDBStore = new IndexedDBNotificationStore({
  dbName: 'MyAppNotifications',
  storeName: 'notifications'
});
```

## API Reference

### NotificationManager

#### Methods

- `createNotification(data: Partial<Notification>): Promise<Notification>`
- `sendNotification(notificationId: string): Promise<NotificationDeliveryResult[]>`
- `markAsRead(notificationId: string): Promise<void>`
- `dismissNotification(notificationId: string): Promise<void>`
- `getNotifications(userId: string, filter?: NotificationFilter): Notification[]`
- `getStats(userId?: string): NotificationStats`
- `setPreferences(userId: string, preferences: NotificationPreferences): void`
- `getPreferences(userId: string): NotificationPreferences | undefined`

#### Events

- `notification:created` - When a notification is created
- `notification:sent` - When a notification is sent
- `notification:read` - When a notification is marked as read
- `notification:dismissed` - When a notification is dismissed
- `notification:failed` - When notification delivery fails

### React Hooks

#### useNotifications

```typescript
const {
  notifications,
  stats,
  unreadCount,
  createNotification,
  markAsRead,
  dismissNotification,
  updateFilter,
  loading,
  error
} = useNotifications(manager, {
  userId: 'user-123',
  autoRefresh: true,
  refreshInterval: 30000
});
```

#### useNotificationPreferences

```typescript
const {
  preferences,
  updatePreferences,
  resetToDefaults,
  toggleChannel,
  toggleType,
  togglePriority
} = useNotificationPreferences(manager, 'user-123');
```

#### useNotificationStats

```typescript
const { stats, loading, error, refresh } = useNotificationStats(manager, 'user-123');
```

### React Components

#### NotificationCenter

A comprehensive notification center component:

```tsx
<NotificationCenter
  notifications={notifications}
  stats={stats}
  onMarkAsRead={handleMarkAsRead}
  onDismiss={handleDismiss}
  onFilterChange={handleFilterChange}
  maxHeight={500}
  className="my-notification-center"
/>
```

#### NotificationPreferences

A preferences management component:

```tsx
<NotificationPreferences
  preferences={preferences}
  onUpdatePreferences={handleUpdatePreferences}
  onResetToDefaults={handleResetToDefaults}
  className="my-preferences"
/>
```

## Configuration

### Notification Types

```typescript
enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system'
}
```

### Notification Priorities

```typescript
enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### Notification Channels

```typescript
enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  DESKTOP = 'desktop',
  SMS = 'sms'
}
```

## Advanced Usage

### Custom Channels

Create custom notification channels:

```typescript
class SlackChannel implements NotificationChannel {
  async send(notification: Notification): Promise<NotificationDeliveryResult> {
    // Send to Slack
    await slackClient.postMessage({
      channel: '#notifications',
      text: notification.title,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${notification.title}*\n${notification.message}`
          }
        }
      ]
    });

    return {
      success: true,
      channel: NotificationChannel.SLACK,
      notificationId: notification.id,
      timestamp: new Date()
    };
  }
}
```

### Middleware

Add custom middleware for processing notifications:

```typescript
// Logging middleware
manager.addMiddleware((notification, next) => {
  console.log('Processing notification:', notification.id);
  return next(notification);
});

// Transformation middleware
manager.addTransformer((notification) => {
  return {
    ...notification,
    message: notification.message.toUpperCase()
  };
});
```

### Batch Processing

Process notifications in batches for better performance:

```typescript
const batch = await manager.createBatch([
  notification1,
  notification2,
  notification3
]);

await manager.processBatch(batch.id);
```

## Examples

### E-commerce Notifications

```typescript
// Order confirmation
await manager.createNotification({
  title: 'Order Confirmed!',
  message: `Your order #${orderNumber} has been confirmed.`,
  type: NotificationType.SUCCESS,
  priority: NotificationPriority.NORMAL,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  userId: customer.id,
  category: 'orders',
  actions: [
    {
      id: 'view-order',
      label: 'View Order',
      variant: 'primary',
      action: () => router.push(`/orders/${orderNumber}`)
    }
  ]
});

// Low stock alert
await manager.createNotification({
  title: 'Low Stock Alert',
  message: `Product "${productName}" is running low on stock.`,
  type: NotificationType.WARNING,
  priority: NotificationPriority.HIGH,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  userId: admin.id,
  category: 'inventory',
  source: 'inventory-system'
});
```

### System Notifications

```typescript
// System maintenance
await manager.createNotification({
  title: 'Scheduled Maintenance',
  message: 'System will be under maintenance from 2 AM to 4 AM EST.',
  type: NotificationType.SYSTEM,
  priority: NotificationPriority.NORMAL,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  category: 'system',
  source: 'admin-panel'
});

// Security alert
await manager.createNotification({
  title: 'Security Alert',
  message: 'New login detected from unrecognized device.',
  type: NotificationType.WARNING,
  priority: NotificationPriority.HIGH,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
  userId: user.id,
  category: 'security',
  actions: [
    {
      id: 'review-login',
      label: 'Review Login',
      variant: 'primary',
      action: () => router.push('/security/login-history')
    },
    {
      id: 'secure-account',
      label: 'Secure Account',
      variant: 'danger',
      action: () => router.push('/security/2fa')
    }
  ]
});
```

## Best Practices

1. **Use Appropriate Types**: Choose the right notification type for the context
2. **Set Clear Priorities**: Use priorities to help users manage urgency
3. **Respect Preferences**: Always honor user notification preferences
4. **Provide Actions**: Include relevant actions for better user experience
5. **Handle Failures**: Implement proper error handling and retry logic
6. **Monitor Performance**: Track delivery rates and user engagement
7. **Clean Up History**: Regularly clean up old notifications to maintain performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on the GitHub repository or contact the KiTS Hub team.
