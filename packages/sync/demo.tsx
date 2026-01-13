import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  SyncProvider, 
  useRealtimeSync, 
  useSyncStatus,
  SyncProviderProps 
} from './src/index';

// Demo Supabase client (replace with actual credentials)
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Sync configuration for demo
const syncConfigs = [
  {
    table: 'inventory_items',
    direction: 'bidirectional' as const,
    optimisticUpdates: true,
    conflictResolution: 'server_wins' as const,
    retryAttempts: 3,
    retryDelay: 1000,
    enableCrossTab: true,
  },
  {
    table: 'transactions',
    direction: 'bidirectional' as const,
    optimisticUpdates: true,
    conflictResolution: 'client_wins' as const,
    retryAttempts: 3,
    retryDelay: 1000,
    enableCrossTab: true,
  },
];

// Demo component for inventory management
function InventoryDemo() {
  const {
    data: items,
    loading,
    error,
    optimisticSync,
    refresh,
    isConnected,
  } = useRealtimeSync(supabase, {
    table: 'inventory_items',
    direction: 'bidirectional',
    optimisticUpdates: true,
    conflictResolution: 'server_wins',
    retryAttempts: 3,
    retryDelay: 1000,
    enableCrossTab: true,
  });

  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });

  const handleAddItem = async () => {
    if (!newItem.name) return;

    try {
      const itemToAdd = {
        ...newItem,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await optimisticSync(itemToAdd, 'INSERT');
      setNewItem({ name: '', quantity: 0, price: 0 });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleUpdateItem = async (item: any) => {
    try {
      await optimisticSync({
        ...item,
        updated_at: new Date().toISOString(),
      }, 'UPDATE');
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (item: any) => {
    try {
      await optimisticSync(item, 'DELETE');
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Inventory Management</h2>
      <div style={{ marginBottom: '20px' }}>
        <span>Connection: </span>
        <span style={{ 
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Add new item form */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Add New Item</h3>
        <input
          type="text"
          placeholder="Item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
          style={{ marginRight: '10px', width: '100px' }}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
          style={{ marginRight: '10px', width: '100px' }}
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>

      {/* Inventory list */}
      <div>
        <h3>Current Inventory ({items?.length || 0} items)</h3>
        <button onClick={refresh} style={{ marginBottom: '10px' }}>
          Refresh
        </button>
        {items?.map((item: any) => (
          <div 
            key={item.id} 
            style={{ 
              padding: '10px', 
              margin: '5px 0', 
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <h4>{item.name}</h4>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.price}</p>
            <p>Last updated: {new Date(item.updated_at).toLocaleString()}</p>
            <div>
              <button 
                onClick={() => handleUpdateItem({ ...item, quantity: item.quantity + 1 })}
                style={{ marginRight: '5px' }}
              >
                +1 Stock
              </button>
              <button 
                onClick={() => handleUpdateItem({ ...item, quantity: Math.max(0, item.quantity - 1) })}
                style={{ marginRight: '5px' }}
              >
                -1 Stock
              </button>
              <button 
                onClick={() => handleDeleteItem(item)}
                style={{ backgroundColor: 'red', color: 'white' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Demo component for sync status
function SyncStatusDemo() {
  const { isConnected, isOnline, stats, lastSync, error } = useSyncStatus();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px 0' }}>
      <h3>Sync Status</h3>
      <div>
        <p><strong>Online:</strong> {isOnline ? 'Yes' : 'No'}</p>
        <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
        <p><strong>Last Sync:</strong> {lastSync ? lastSync.toLocaleString() : 'Never'}</p>
        <p><strong>Total Events:</strong> {stats.totalEvents}</p>
        <p><strong>Successful:</strong> {stats.successfulEvents}</p>
        <p><strong>Failed:</strong> {stats.failedEvents}</p>
        <p><strong>Pending:</strong> {stats.pendingEvents}</p>
        <p><strong>Conflicts:</strong> {stats.conflicts}</p>
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error.message}</p>}
      </div>
    </div>
  );
}

// Main demo app
function SyncDemoApp() {
  return (
    <SyncProvider 
      supabase={supabase} 
      configs={syncConfigs}
      enableOptimisticUpdates={true}
      enableCrossTab={true}
    >
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <h1>KiTS Hub Real-time Sync Demo</h1>
        <p>This demo showcases real-time data synchronization across multiple tabs and clients.</p>
        
        <SyncStatusDemo />
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <InventoryDemo />
          </div>
          
          <div style={{ flex: 1 }}>
            <h2>Instructions</h2>
            <ol>
              <li>Open this page in multiple browser tabs to test cross-tab synchronization</li>
              <li>Add, update, or delete items in one tab</li>
              <li>Watch as changes instantly appear in other tabs</li>
              <li>Try going offline and online to test reconnection</li>
              <li>Monitor the sync status panel for real-time metrics</li>
            </ol>
            
            <h2>Features Demonstrated</h2>
            <ul>
              <li>✅ Real-time data synchronization</li>
              <li>✅ Optimistic updates for instant UI feedback</li>
              <li>✅ Cross-tab communication</li>
              <li>✅ Automatic reconnection</li>
              <li>✅ Conflict resolution</li>
              <li>✅ Performance monitoring</li>
              <li>✅ Error handling and recovery</li>
            </ul>
          </div>
        </div>
      </div>
    </SyncProvider>
  );
}

export default SyncDemoApp;
