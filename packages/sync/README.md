# @kits-hub/sync

Cross-solution real-time data synchronization for KiTS Hub ecosystem.

## Features

- **Real-time Synchronization**: Instant data sync across all connected clients using Supabase subscriptions
- **Optimistic Updates**: Immediate UI updates with automatic rollback on failures
- **Cross-tab Communication**: Synchronize data across multiple browser tabs
- **Conflict Resolution**: Handle data conflicts with configurable resolution strategies
- **Performance Monitoring**: Built-in metrics and alerting for sync performance
- **Type Safety**: Full TypeScript support with runtime validation
- **React Hooks**: Easy integration with React applications

## Installation

```bash
npm install @kits-hub/sync
```

## Quick Start

### 1. Set up the Sync Provider

```tsx
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { SyncProvider } from '@kits-hub/sync';

const supabase = createClient('your-url', 'your-anon-key');

const syncConfigs = [
  {
    table: 'inventory_items',
    direction: 'bidirectional',
    optimisticUpdates: true,
    enableCrossTab: true,
  },
  {
    table: 'transactions',
    direction: 'bidirectional',
    optimisticUpdates: true,
    conflictResolution: 'server_wins',
  },
];

function App() {
  return (
    <SyncProvider supabase={supabase} configs={syncConfigs}>
      <YourApp />
    </SyncProvider>
  );
}
```

### 2. Use the Sync Hook

```tsx
import React from 'react';
import { useRealtimeSync } from '@kits-hub/sync';

function InventoryList() {
  const {
    data,
    loading,
    error,
    sync,
    optimisticSync,
    refresh,
    isConnected,
  } = useRealtimeSync(supabase, {
    table: 'inventory_items',
    optimisticUpdates: true,
  });

  const handleAddItem = async (item) => {
    try {
      await optimisticSync(item, 'INSERT');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleUpdateItem = async (item) => {
    try {
      await optimisticSync(item, 'UPDATE');
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Inventory Items</h2>
      <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
      
      {data?.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.price}</p>
          <button onClick={() => handleUpdateItem(item)}>
            Update
          </button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### SyncProvider

Wrap your application with `SyncProvider` to enable real-time synchronization.

```tsx
<SyncProvider
  supabase={supabaseClient}
  configs={syncConfigs}
  enableOptimisticUpdates={true}
  enableCrossTab={true}
>
  {children}
</SyncProvider>
```

#### Props

- `supabase`: Supabase client instance
- `configs`: Array of sync configurations
- `enableOptimisticUpdates`: Enable optimistic updates (default: true)
- `enableCrossTab`: Enable cross-tab synchronization (default: true)

### Sync Configuration

```typescript
interface SyncConfig {
  table: string;
  direction: 'bidirectional' | 'client_to_server' | 'server_to_client';
  filter?: string;
  optimisticUpdates: boolean;
  conflictResolution: 'client_wins' | 'server_wins' | 'manual';
  retryAttempts: number;
  retryDelay: number;
  enableCrossTab: boolean;
}
```

### useRealtimeSync Hook

```typescript
const {
  data,
  loading,
  error,
  sync,
  optimisticSync,
  refresh,
  lastSync,
  isOnline,
  isConnected,
  subscription,
  reconnect,
} = useRealtimeSync<T>(supabase, config);
```

#### Returns

- `data`: Synchronized data array
- `loading`: Loading state
- `error`: Error object if any
- `sync`: Function to sync data to server
- `optimisticSync`: Function for optimistic updates
- `refresh`: Function to refresh data
- `lastSync`: Timestamp of last sync
- `isOnline`: Network connectivity status
- `isConnected`: Real-time connection status
- `subscription`: Supabase subscription object
- `reconnect`: Function to reconnect

### useSync Hook

Similar to `useRealtimeSync` but without real-time subscription.

```typescript
const {
  data,
  loading,
  error,
  sync,
  optimisticSync,
  refresh,
  lastSync,
  isOnline,
} = useSync<T>(supabase, config);
```

## Advanced Usage

### Conflict Resolution

Handle data conflicts when multiple clients update the same record:

```tsx
import { useSyncManagers } from '@kits-hub/sync';

function ConflictHandler() {
  const { optimisticManager } = useSyncManagers();

  const handleConflict = (conflict) => {
    // Resolve conflict with server data
    optimisticManager.resolveConflict(conflict.conflictId, 'server');
  };

  // Listen for conflicts
  optimisticManager.on('conflict', handleConflict);

  return null;
}
```

### Performance Monitoring

Monitor sync performance and set up alerts:

```tsx
import { getPerformanceMonitor } from '@kits-hub/sync';

const monitor = getPerformanceMonitor();

// Set custom thresholds
monitor.setThreshold('latency', 2000); // 2 seconds
monitor.setThreshold('error_rate', 0.1); // 10%

// Listen for performance alerts
monitor.on('performance_alert', (alert) => {
  console.warn('Performance alert:', alert);
});

// Get current metrics
const metrics = monitor.getMetrics();
console.log('Current metrics:', metrics);
```

### Cross-tab Communication

Synchronize data across multiple browser tabs:

```tsx
import { getCrossTabSyncManager } from '@kits-hub/sync';

const crossTab = getCrossTabSyncManager();

// Send custom message
crossTab.sendMessage({
  type: 'custom_message',
  payload: { action: 'refresh_data' },
});

// Listen for messages
crossTab.on('custom_message', (payload) => {
  if (payload.action === 'refresh_data') {
    refreshData();
  }
});
```

### Validation

Validate sync configurations and events:

```typescript
import { validateSyncConfig, validateSyncEvent } from '@kits-hub/sync';

// Validate configuration
try {
  const validConfig = validateSyncConfig(config);
} catch (error) {
  console.error('Invalid config:', error.message);
}

// Validate event
try {
  const validEvent = validateSyncEvent(event);
} catch (error) {
  console.error('Invalid event:', error.message);
}
```

## Examples

### Inventory Management

```tsx
function InventoryManagement() {
  const { data: items, optimisticSync } = useRealtimeSync(supabase, {
    table: 'inventory_items',
    optimisticUpdates: true,
    conflictResolution: 'server_wins',
  });

  const updateStock = async (itemId, newQuantity) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      await optimisticSync({
        ...item,
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      }, 'UPDATE');
    }
  };

  return (
    <div>
      {items?.map(item => (
        <InventoryItem
          key={item.id}
          item={item}
          onUpdateStock={updateStock}
        />
      ))}
    </div>
  );
}
```

### Transaction Processing

```tsx
function TransactionProcessor() {
  const { optimisticSync } = useRealtimeSync(supabase, {
    table: 'transactions',
    optimisticUpdates: true,
    conflictResolution: 'client_wins',
  });

  const processTransaction = async (transaction) => {
    try {
      // Optimistic update for immediate UI feedback
      await optimisticSync({
        ...transaction,
        status: 'processing',
        created_at: new Date().toISOString(),
      }, 'INSERT');

      // Process transaction...
      // Server will confirm or reject
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return <TransactionForm onSubmit={processTransaction} />;
}
```

## Best Practices

1. **Use Optimistic Updates**: Enable optimistic updates for better user experience
2. **Configure Conflict Resolution**: Choose appropriate conflict resolution strategy
3. **Monitor Performance**: Set up performance monitoring and alerts
4. **Handle Errors**: Always handle sync errors gracefully
5. **Validate Data**: Use validation helpers to ensure data integrity
6. **Test Cross-tab**: Test synchronization across multiple tabs
7. **Set Timeouts**: Configure appropriate timeouts for optimistic updates

## Troubleshooting

### Common Issues

1. **Connection Issues**: Check Supabase configuration and network connectivity
2. **Permission Errors**: Ensure proper RLS policies are set up
3. **Performance Issues**: Monitor metrics and adjust thresholds
4. **Memory Leaks**: Clean up subscriptions and event listeners
5. **Conflicts**: Review conflict resolution strategy

### Debug Mode

Enable debug logging:

```typescript
import { getOptimisticUpdateManager } from '@kits-hub/sync';

const manager = getOptimisticUpdateManager();
manager.on('*', (event, data) => {
  console.debug('Sync event:', event, data);
});
```

## License

MIT © KiTS Hub Team
