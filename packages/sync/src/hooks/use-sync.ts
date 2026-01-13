import { useState, useEffect, useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  UseSyncResult,
  UseRealtimeSyncResult,
  SyncConfig,
  SyncEvent,
  SyncOperation,
  SyncStatus,
  SyncEvents,
  SyncStats,
} from '../types';
import { SupabaseSubscriptionManager } from '../subscription-manager';

export function useSync<T extends Record<string, any>>(
  supabase: SupabaseClient,
  config: SyncConfig
): UseSyncResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const subscriptionManagerRef = useRef<SupabaseSubscriptionManager | null>(null);
  const statsRef = useRef<SyncStats>({
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    pendingEvents: 0,
    conflicts: 0,
    lastSyncTime: null,
    averageLatency: 0,
  });

  // Initialize subscription manager
  useEffect(() => {
    if (!subscriptionManagerRef.current) {
      subscriptionManagerRef.current = new SupabaseSubscriptionManager(supabase, config.enableCrossTab);
    }

    const manager = subscriptionManagerRef.current;

    // Set up event listeners
    const handleSyncEvent = (event: SyncEvent) => {
      if (event.table === config.table) {
        updateLocalData(event);
        updateStats(event);
        setLastSync(new Date());
      }
    };

    const handleConnectionChange = (connected: boolean) => {
      setIsOnline(connected);
      if (!connected) {
        setError(new Error('Connection lost'));
      } else {
        setError(null);
      }
    };

    const handleError = (err: Error) => {
      setError(err);
      statsRef.current.failedEvents++;
    };

    manager.on(SyncEvents.SYNC_EVENT, handleSyncEvent);
    manager.on(SyncEvents.CONNECTED, () => handleConnectionChange(true));
    manager.on(SyncEvents.DISCONNECTED, () => handleConnectionChange(false));
    manager.on(SyncEvents.ERROR, handleError);

    // Initial data fetch
    fetchInitialData();

    return () => {
      manager.off(SyncEvents.SYNC_EVENT, handleSyncEvent);
      manager.off(SyncEvents.CONNECTED, () => handleConnectionChange(true));
      manager.off(SyncEvents.DISCONNECTED, () => handleConnectionChange(false));
      manager.off(SyncEvents.ERROR, handleError);
    };
  }, [supabase, config]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(config.table).select('*');
      
      if (config.filter) {
        query = query.filter(config.filter.split('=')[0], config.filter.split('=')[1], config.filter.split('=')[2]);
      }

      const { data: fetchData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData(fetchData as T[]);
      setLastSync(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalData = (event: SyncEvent) => {
    setData(prevData => {
      if (!prevData) return prevData;

      switch (event.operation) {
        case SyncOperation.CREATE:
          return [...prevData, event.data as T];
        
        case SyncOperation.UPDATE:
          return prevData.map(item => 
            item.id === event.data.id ? { ...item, ...event.data } as T : item
          );
        
        case SyncOperation.DELETE:
          return prevData.filter(item => item.id !== event.oldData?.id);
        
        default:
          return prevData;
      }
    });
  };

  const updateStats = (event: SyncEvent) => {
    const stats = statsRef.current;
    stats.totalEvents++;
    
    if (event.status === SyncStatus.COMPLETED) {
      stats.successfulEvents++;
    } else if (event.status === SyncStatus.FAILED) {
      stats.failedEvents++;
    } else if (event.status === SyncStatus.PENDING) {
      stats.pendingEvents++;
    }

    if (event.status === SyncStatus.CONFLICT) {
      stats.conflicts++;
    }

    stats.lastSyncTime = new Date();
  };

  const sync = useCallback(async (item: T, operation: SyncOperation = SyncOperation.UPDATE) => {
    try {
      setError(null);
      statsRef.current.pendingEvents++;

      let result;
      switch (operation) {
        case SyncOperation.CREATE:
          result = await supabase.from(config.table).insert(item);
          break;
        case SyncOperation.UPDATE:
          result = await supabase.from(config.table).update(item).eq('id', item.id);
          break;
        case SyncOperation.DELETE:
          result = await supabase.from(config.table).delete().eq('id', item.id);
          break;
      }

      if (result.error) {
        throw result.error;
      }

      statsRef.current.successfulEvents++;
      statsRef.current.pendingEvents--;
      setLastSync(new Date());
    } catch (err) {
      statsRef.current.failedEvents++;
      statsRef.current.pendingEvents--;
      setError(err as Error);
      throw err;
    }
  }, [supabase, config.table]);

  const optimisticSync = useCallback(async (item: T, operation: SyncOperation = SyncOperation.UPDATE): Promise<T> => {
    if (!config.optimisticUpdates) {
      return sync(item, operation).then(() => item);
    }

    const originalData = data?.find(d => d.id === item.id);
    const tempId = uuidv4();

    // Apply optimistic update immediately
    const optimisticEvent: SyncEvent = {
      id: tempId,
      table: config.table,
      operation,
      data: operation === SyncOperation.DELETE ? {} : item,
      oldData: operation === SyncOperation.DELETE ? item : originalData,
      timestamp: new Date().toISOString(),
      clientId: subscriptionManagerRef.current?.getConnectionStats().clientId,
      status: SyncStatus.PENDING,
      retryCount: 0,
    };

    updateLocalData(optimisticEvent);

    try {
      await sync(item, operation);
      
      // Update the event status to completed
      optimisticEvent.status = SyncStatus.COMPLETED;
      updateStats(optimisticEvent);
      
      return item;
    } catch (err) {
      // Revert optimistic update on error
      const revertEvent: SyncEvent = {
        ...optimisticEvent,
        operation: operation === SyncOperation.CREATE ? SyncOperation.DELETE : 
                  operation === SyncOperation.DELETE ? SyncOperation.CREATE : SyncOperation.UPDATE,
        data: originalData || {},
        oldData: item,
        status: SyncStatus.FAILED,
      };
      
      updateLocalData(revertEvent);
      throw err;
    }
  }, [data, config.optimisticUpdates, sync, config.table]);

  const refresh = useCallback(async () => {
    await fetchInitialData();
  }, []);

  return {
    data,
    loading,
    error,
    sync,
    optimisticSync,
    refresh,
    lastSync,
    isOnline,
  };
}

export function useRealtimeSync<T extends Record<string, any>>(
  supabase: SupabaseClient,
  config: SyncConfig
): UseRealtimeSyncResult<T> {
  const syncResult = useSync<T>(supabase, config);
  const [isConnected, setIsConnected] = useState(false);
  const [subscription, setSubscription] = useState(null);
  
  const subscriptionManagerRef = useRef<SupabaseSubscriptionManager | null>(null);

  useEffect(() => {
    if (!subscriptionManagerRef.current) {
      subscriptionManagerRef.current = new SupabaseSubscriptionManager(supabase, config.enableCrossTab);
    }

    const manager = subscriptionManagerRef.current;

    const setupSubscription = async () => {
      try {
        const channel = await manager.subscribe(config);
        setSubscription(channel as any);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to setup subscription:', err);
        setIsConnected(false);
      }
    };

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    manager.on(SyncEvents.CONNECTED, handleConnected);
    manager.on(SyncEvents.DISCONNECTED, handleDisconnected);

    setupSubscription();

    return () => {
      manager.off(SyncEvents.CONNECTED, handleConnected);
      manager.off(SyncEvents.DISCONNECTED, handleDisconnected);
      
      if (subscription) {
        manager.unsubscribe(subscription);
      }
    };
  }, [supabase, config]);

  const reconnect = useCallback(async () => {
    if (subscriptionManagerRef.current) {
      try {
        await subscriptionManagerRef.current.unsubscribeAll();
        const channel = await subscriptionManagerRef.current.subscribe(config);
        setSubscription(channel as any);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to reconnect:', err);
        setIsConnected(false);
      }
    }
  }, [config]);

  return {
    ...syncResult,
    isConnected,
    subscription,
    reconnect,
  };
}
