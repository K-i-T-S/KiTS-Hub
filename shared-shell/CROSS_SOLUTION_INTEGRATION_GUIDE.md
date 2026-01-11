# KiTS Hub Cross-Solution Integration Documentation

## Overview

This document provides comprehensive documentation for the cross-solution integration features implemented in KiTS Hub. The integration enables seamless real-time communication and data synchronization between all micro-frontend applications.

## Architecture

### Core Components

1. **Event Bus System** - Central communication hub for cross-solution events
2. **Real-time Subscriptions** - Supabase-powered real-time database changes
3. **Shared State Management** - React Context-based state sharing
4. **Data Synchronization Service** - Conflict resolution and data sync
5. **Unified Notification System** - Cross-solution notifications
6. **Performance Monitoring** - Metrics, logging, and alerting

### Integration Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Solution  │    │ Event Bus   │    │   Solution  │
│   (Source)  │───▶│   System    │───▶│   (Target)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Database  │    │ Real-time   │    │  Shared     │
│   Changes   │◀───│ Subscriptions│◀───│   State     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Event Bus System

### Purpose
The event bus provides a centralized pub/sub mechanism for cross-solution communication.

### Key Features
- Type-safe event definitions
- Automatic retry logic with exponential backoff
- Event history and metrics
- Wildcard event subscriptions
- Error handling and recovery

### Usage

```typescript
import { globalEventBus } from './lib/events/event-bus';

// Subscribe to events
const subscriptionId = globalEventBus.on('stock_updated', (event) => {
  console.log('Stock updated:', event.data);
});

// Emit events
await globalEventBus.emit({
  id: 'stock-123',
  type: 'stock_updated',
  timestamp: new Date(),
  source: 'pos',
  tenantId: 'tenant-1',
  userId: 'user-1',
  data: {
    productId: 'product-1',
    previousStock: 100,
    newStock: 95,
    location: 'warehouse-1',
    reason: 'sale',
  },
});

// Cleanup
globalEventBus.off(subscriptionId);
```

### Event Types

#### Stock Events
- `stock_updated` - Inventory quantity changes
- `low_stock_alert` - Low stock warnings

#### Customer Events
- `customer_created` - New customer registration
- `customer_updated` - Customer information changes

#### Sales Events
- `sale_processed` - Completed sales transactions

#### Financial Events
- `transaction_recorded` - Accounting transactions

#### Employee Events
- `employee_performance_updated` - Performance metrics

#### System Events
- `notification` - General notifications
- `system_health` - Service health status

## Real-time Subscriptions

### Purpose
Real-time subscriptions enable automatic synchronization when database changes occur.

### Configuration

```typescript
import { realtimeManager } from './lib/events/realtime';

// Subscribe to table changes
await realtimeManager.subscribeToEvents('inventory-sync', {
  tables: ['inventory_stock'],
  events: ['UPDATE', 'INSERT'],
}, (event) => {
  console.log('Database change:', event);
});

// Subscribe to multiple tables
await realtimeManager.subscribeToMultipleTables('multi-sync', [
  {
    table: 'customers',
    event: 'INSERT',
    handler: (payload) => handleNewCustomer(payload),
  },
  {
    table: 'sales',
    event: 'INSERT',
    handler: (payload) => handleNewSale(payload),
  },
]);
```

### Connection Management

```typescript
// Check connection status
const status = realtimeManager.getConnectionStatus('inventory-sync');
console.log('Connected:', status?.isConnected);

// Get all connections
const allStatuses = realtimeManager.getConnectionStatus();

// Unsubscribe
await realtimeManager.unsubscribe('inventory-sync');
```

## Shared State Management

### Purpose
Shared state provides a centralized state management system accessible across all solutions.

### Usage

```typescript
import { SharedStateProvider, useSharedState } from './lib/state/shared-context';

// Wrap your app with the provider
function App() {
  return (
    <SharedStateProvider>
      <YourApp />
    </SharedStateProvider>
  );
}

// Use shared state in components
function MyComponent() {
  const { state, dispatch } = useSharedState();
  
  const currentUser = state.currentUser;
  const notifications = state.notifications;
  
  // Update state
  dispatch({ 
    type: 'ADD_NOTIFICATION', 
    payload: {
      title: 'Test',
      message: 'Test notification',
      severity: 'info',
      category: 'system',
      requiresAction: false,
    }
  });
}
```

### State Structure

```typescript
interface SharedState {
  currentUser: User | null;
  tenantContext: TenantContext | null;
  notifications: Notification[];
  unreadCount: number;
  globalSettings: GlobalSettings;
  connectionStatus: {
    eventBus: boolean;
    database: boolean;
    realtime: boolean;
  };
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}
```

## Data Synchronization Service

### Purpose
The data sync service handles cross-solution data synchronization with conflict resolution.

### Configuration

```typescript
import { dataSyncService } from './lib/sync/data-sync';

// Sync customer data
const result = await dataSyncService.syncCustomerData('customer-123', 'pos');
console.log('Sync result:', result);

// Sync inventory data
const inventoryResult = await dataSyncService.syncInventoryData(
  'product-456', 
  -5, 
  'sale'
);

// Sync financial data
const financialResult = await dataSyncService.syncFinancialData(
  'sale-789',
  saleData
);
```

### Conflict Resolution Strategies

- `source_wins` - Source data overwrites target
- `target_wins` - Target data is preserved
- `merge` - Intelligent data merging
- `timestamp` - Most recent data wins
- `manual` - Requires manual intervention

### Validation Rules

The sync service includes built-in validation for:
- Customer data (email format, required fields)
- Transaction data (amount validation, required fields)
- Performance data (metric validation)

## Unified Notification System

### Purpose
Provides a centralized notification system with multiple delivery channels.

### Usage

```typescript
import { NotificationProvider, useNotifications } from './lib/notifications/notification-system';

// Wrap app with provider
function App() {
  return (
    <NotificationProvider>
      <YourApp />
    </NotificationProvider>
  );
}

// Use notifications
function MyComponent() {
  const { 
    notifications, 
    sendNotification, 
    markAsRead,
    updatePreferences 
  } = useNotifications();

  // Send notification
  await sendNotification({
    title: 'Low Stock Alert',
    message: 'Product XYZ is running low on stock',
    severity: 'warning',
    category: 'inventory',
    actionUrl: '/inventory',
    requiresAction: true,
  });
}
```

### Notification Channels

- **Desktop** - Browser notifications
- **Email** - Email delivery (mocked)
- **Push** - Push notifications (mocked)
- **SMS** - Text messages (mocked)

### Preferences

```typescript
// Update notification preferences
updatePreferences({
  desktop: true,
  email: false,
  sound: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
  },
  categories: {
    inventory: true,
    sales: false,
  },
});
```

## Performance Monitoring

### Purpose
Comprehensive monitoring of integration performance and health.

### Usage

```typescript
import { performanceMonitor, log, trackPerformance } from './lib/monitoring/performance';

// Get metrics
const metrics = performanceMonitor.getMetrics();
console.log('Event bus metrics:', metrics.eventBus);

// Get logs
const errorLogs = performanceMonitor.getLogs(50, 'error', 'event-bus');

// Generate report
const report = performanceMonitor.generateReport();
console.log('Recommendations:', report.recommendations);

// Manual logging
log.info('Custom operation completed', { duration: 1500 }, 'integration');

// Performance tracking decorator
class MyService {
  @trackPerformance('sync-operation')
  async syncData() {
    // Your sync logic here
  }
}
```

### Metrics Tracked

- **Event Bus**: Events processed, error rate, processing time
- **Real-time**: Connection health, message latency
- **Sync**: Success rate, operation duration, conflicts
- **System**: Memory usage, CPU usage, network latency

### Alert Rules

```typescript
// Add custom alert rule
const ruleId = performanceMonitor.addAlertRule({
  name: 'Custom High Latency',
  description: 'Alert when latency exceeds threshold',
  enabled: true,
  condition: {
    metric: 'realtime.averageLatency',
    operator: '>',
    threshold: 500,
    duration: 300,
  },
  action: {
    type: 'notification',
    target: 'system',
    message: 'Latency is {{value}}ms (threshold: 500ms)',
  },
  cooldown: 900,
});
```

## Integration Scenarios

### Scenario 1: POS Sale → Inventory Update

1. **POS processes sale**
   ```typescript
   const saleEvent: SaleProcessedEvent = {
     id: 'sale-123',
     type: 'sale_processed',
     // ... sale data
   };
   await globalEventBus.emit(saleEvent);
   ```

2. **Event bus distributes to subscribers**
3. **Inventory service updates stock**
   ```typescript
   globalEventBus.on('sale_processed', async (event) => {
     if (event.type === 'sale_processed') {
       for (const item of event.data.items) {
         await dataSyncService.syncInventoryData(
           item.productId,
           -item.quantity,
           'sale'
         );
       }
     }
   });
   ```

4. **Low stock alert triggered if needed**

### Scenario 2: New Customer → CRM Sync

1. **POS creates customer**
   ```typescript
   const customerEvent: CustomerCreatedEvent = {
     id: 'customer-456',
     type: 'customer_created',
     // ... customer data
   };
   await globalEventBus.emit(customerEvent);
   ```

2. **Sync service handles cross-system sync**
   ```typescript
   globalEventBus.on('customer_created', async (event) => {
     if (event.type === 'customer_created') {
       await dataSyncService.syncCustomerData(
         event.data.customerId,
         event.data.source
       );
     }
   });
   ```

3. **CRM receives and enriches data**

### Scenario 3: Real-time Database Updates

1. **Database change occurs**
2. **Supabase triggers real-time subscription**
3. **Event bus emits cross-solution event**
4. **All solutions update accordingly**

## Testing

### Running Tests

```bash
# Run integration tests
npm run test integration

# Run with coverage
npm run test:integration:coverage

# Watch mode
npm run test:integration:watch
```

### Test Coverage

The test suite covers:
- Event bus functionality
- Real-time subscriptions
- Data synchronization
- Cross-solution workflows
- Error handling
- Performance scenarios

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { globalEventBus } from '../events/event-bus';

describe('My Integration', () => {
  beforeEach(() => {
    globalEventBus.clearHistory();
  });

  it('should handle cross-solution events', async () => {
    const handler = vi.fn();
    globalEventBus.on('test_event', handler);

    const event = {
      id: 'test-1',
      type: 'test_event',
      timestamp: new Date(),
      source: 'test',
      tenantId: 'tenant-1',
      userId: 'user-1',
      data: {},
    };

    await globalEventBus.emit(event);
    expect(handler).toHaveBeenCalledWith(event);
  });
});
```

## Troubleshooting

### Common Issues

#### Event Not Received

**Symptoms**: Event emitted but handler not called

**Causes**:
- Wrong event type in subscription
- Handler throws an error
- Event bus not initialized

**Solutions**:
1. Verify event type matches subscription
2. Check browser console for errors
3. Ensure event bus is initialized before use

```typescript
// Debug event bus
console.log('Event history:', globalEventBus.getEventHistory());
console.log('Metrics:', globalEventBus.getMetrics());
```

#### Real-time Subscription Not Working

**Symptoms**: Database changes not triggering events

**Causes**:
- Supabase connection issues
- Incorrect table configuration
- RLS policies blocking access

**Solutions**:
1. Check Supabase connection status
2. Verify table names and permissions
3. Check Row Level Security policies

```typescript
// Debug real-time connection
const status = realtimeManager.getConnectionStatus();
console.log('Connection status:', status);
```

#### Sync Failures

**Symptoms**: Data not syncing between solutions

**Causes**:
- Validation errors
- Network connectivity issues
- Conflict resolution failures

**Solutions**:
1. Check sync service logs
2. Verify data validation rules
3. Review conflict resolution strategy

```typescript
// Debug sync issues
const syncStatus = dataSyncService.getSyncStatus('entity-id');
console.log('Sync status:', syncStatus);
```

#### Performance Issues

**Symptoms**: Slow event processing, high latency

**Causes**:
- Too many event handlers
- Inefficient data processing
- Memory leaks

**Solutions**:
1. Monitor performance metrics
2. Optimize event handlers
3. Check for memory leaks

```typescript
// Debug performance
const metrics = performanceMonitor.getMetrics();
const report = performanceMonitor.generateReport();
console.log('Performance report:', report);
```

### Debug Tools

#### Event Bus Debugging

```typescript
// Get all event history
const history = globalEventBus.getEventHistory();

// Get specific event types
const stockEvents = globalEventBus.getEventHistory('stock_updated');

// Check metrics
const metrics = globalEventBus.getMetrics();
```

#### Real-time Debugging

```typescript
// Check all connections
const connections = realtimeManager.getConnectionStatus();

// Check specific connection
const connectionStatus = realtimeManager.getConnectionStatus('connection-id');
```

#### Sync Debugging

```typescript
// Get sync status
const status = dataSyncService.getSyncStatus('entity-id');

// Get all sync statuses
const allStatuses = dataSyncService.getAllSyncStatuses();
```

#### Performance Debugging

```typescript
// Get current metrics
const metrics = performanceMonitor.getMetrics();

// Get error logs
const errors = performanceMonitor.getLogs(100, 'error');

// Generate performance report
const report = performanceMonitor.generateReport();
```

### Performance Optimization

#### Event Handler Optimization

```typescript
// Bad: Synchronous heavy processing
globalEventBus.on('heavy_event', (event) => {
  heavyProcessing(event.data); // Blocks event bus
});

// Good: Asynchronous processing
globalEventBus.on('heavy_event', async (event) => {
  await heavyProcessing(event.data); // Doesn't block
});
```

#### Memory Management

```typescript
// Cleanup subscriptions when unmounting
useEffect(() => {
  const subscriptionId = globalEventBus.on('event', handler);
  
  return () => {
    globalEventBus.off(subscriptionId);
  };
}, []);
```

#### Batch Processing

```typescript
// Bad: Process events individually
events.forEach(event => processEvent(event));

// Good: Batch process events
await Promise.all(events.map(event => processEvent(event)));
```

## Best Practices

### Event Design

1. **Use descriptive event types**
2. **Include all necessary context**
3. **Keep event data minimal**
4. **Use consistent naming conventions**

```typescript
// Good event design
const event: StockUpdatedEvent = {
  id: generateId(),
  type: 'stock_updated',
  timestamp: new Date(),
  source: 'pos',
  tenantId: getCurrentTenant(),
  userId: getCurrentUser(),
  data: {
    productId: 'product-123',
    previousStock: 100,
    newStock: 95,
    location: 'warehouse-1',
    reason: 'sale',
  },
};
```

### Error Handling

1. **Always handle errors in event handlers**
2. **Use try-catch blocks**
3. **Log errors appropriately**
4. **Provide fallback behavior**

```typescript
globalEventBus.on('customer_created', async (event) => {
  try {
    await syncCustomerData(event.data.customerId);
  } catch (error) {
    log.error('Failed to sync customer', { error, event });
    // Fallback: queue for retry
  }
});
```

### Performance

1. **Use async handlers for heavy operations**
2. **Avoid blocking operations**
3. **Implement proper cleanup**
4. **Monitor performance metrics**

### Security

1. **Validate all incoming data**
2. **Use tenant isolation**
3. **Implement proper authentication**
4. **Audit sensitive operations**

## API Reference

### Event Bus API

#### Methods
- `emit(event: CrossSolutionEvent): Promise<void>`
- `on(eventType: string, handler: EventHandler): string`
- `once(eventType: string, handler: EventHandler): string`
- `off(subscriptionId: string): boolean`
- `removeAllListeners(eventType: string): void`
- `getEventHistory(eventType?: string, limit?: number): CrossSolutionEvent[]`
- `getMetrics(): EventBusMetrics`

### Real-time API

#### Methods
- `subscribeToEvents(connectionId: string, config, handler?): Promise<void>`
- `subscribeToMultipleTables(connectionId: string, subscriptions): Promise<void>`
- `unsubscribe(connectionId: string): Promise<void>`
- `unsubscribeAll(): Promise<void>`
- `getConnectionStatus(connectionId?: string): ConnectionStatus`

### Data Sync API

#### Methods
- `syncCustomerData(customerId: string, source: string): Promise<SyncResult>`
- `syncInventoryData(productId: string, quantityChange: number, reason: string): Promise<SyncResult>`
- `syncFinancialData(transactionId: string, saleData: any): Promise<SyncResult>`
- `syncEmployeePerformance(employeeId: string, performanceData: any): Promise<SyncResult>`
- `getSyncStatus(entityId: string): SyncStatus | undefined`
- `getAllSyncStatuses(): Record<string, SyncStatus>`

### Notification API

#### Methods
- `sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void>`
- `markAsRead(id: string): void`
- `markAllAsRead(): void`
- `deleteNotification(id: string): void`
- `clearAllNotifications(): void`
- `updatePreferences(preferences: Partial<NotificationPreferences>): void`
- `enableDesktopNotifications(): Promise<boolean>`

### Performance Monitoring API

#### Methods
- `getMetrics(): PerformanceMetrics`
- `getLogs(limit?: number, level?: LogEntry['level'], category?: LogEntry['category']): LogEntry[]`
- `getMetricHistory(metric: string): number[]`
- `addAlertRule(rule: Omit<AlertRule, 'id'>): string`
- `removeAlertRule(ruleId: string): boolean`
- `generateReport(): PerformanceReport`

## Migration Guide

### From Direct API Calls

**Before:**
```typescript
// Direct database calls
const customer = await api.getCustomer(customerId);
await crmApi.createCustomer(customer);
```

**After:**
```typescript
// Event-driven approach
await globalEventBus.emit({
  id: generateId(),
  type: 'customer_created',
  timestamp: new Date(),
  source: 'pos',
  tenantId: getCurrentTenant(),
  userId: getCurrentUser(),
  data: { customerId, customerData: customer },
});
```

### From Polling to Real-time

**Before:**
```typescript
// Polling for changes
setInterval(async () => {
  const changes = await api.getChanges();
  if (changes.length > 0) {
    processChanges(changes);
  }
}, 5000);
```

**After:**
```typescript
// Real-time subscriptions
await realtimeManager.subscribeToEvents('changes', {
  tables: ['target_table'],
  events: ['INSERT', 'UPDATE'],
}, (payload) => {
  processChange(payload);
});
```

## Support

For issues with the cross-solution integration:

1. Check this documentation first
2. Review the troubleshooting section
3. Check browser console for errors
4. Review performance metrics
5. Contact the development team with specific error details

### When Reporting Issues

Include:
- Error messages and stack traces
- Steps to reproduce
- Expected vs actual behavior
- Browser and environment details
- Relevant logs and metrics
