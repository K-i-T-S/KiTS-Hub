import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  SyncConfig,
  SyncStats,
  SyncEvent,
  SyncEvents,
  SyncStatus,
} from '../types';
import { SupabaseSubscriptionManager } from '../subscription-manager';
import { OptimisticUpdateManager } from '../optimistic-updates';
import { CrossTabSyncManager } from '../cross-tab-sync';

interface SyncContextValue {
  isConnected: boolean;
  isOnline: boolean;
  stats: SyncStats;
  lastSync: Date | null;
  subscriptionManager: SupabaseSubscriptionManager | null;
  optimisticManager: OptimisticUpdateManager;
  crossTabManager: CrossTabSyncManager;
  error: Error | null;
}

const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
  children: ReactNode;
  supabase: SupabaseClient;
  configs: SyncConfig[];
  enableOptimisticUpdates?: boolean;
  enableCrossTab?: boolean;
}

export function SyncProvider({
  children,
  supabase,
  configs,
  enableOptimisticUpdates = true,
  enableCrossTab = true,
}: SyncProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const [subscriptionManager] = useState(() => 
    new SupabaseSubscriptionManager(supabase, enableCrossTab)
  );
  
  const [optimisticManager] = useState(() => 
    new OptimisticUpdateManager()
  );
  
  const [crossTabManager] = useState(() => 
    new CrossTabSyncManager()
  );

  const [stats] = useState<SyncStats>({
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    pendingEvents: 0,
    conflicts: 0,
    lastSyncTime: null,
    averageLatency: 0,
  });

  useEffect(() => {
    // Set up subscription manager event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleSyncEvent = (event: SyncEvent) => {
      setLastSync(new Date());
      stats.totalEvents++;
      
      if (event.status === SyncStatus.COMPLETED) {
        stats.successfulEvents++;
      } else if (event.status === SyncStatus.FAILED) {
        stats.failedEvents++;
      } else if (event.status === SyncStatus.PENDING) {
        stats.pendingEvents++;
      }
    };

    const handleError = (err: Error) => {
      setError(err);
      stats.failedEvents++;
    };

    subscriptionManager.on(SyncEvents.CONNECTED, handleConnected);
    subscriptionManager.on(SyncEvents.DISCONNECTED, handleDisconnected);
    subscriptionManager.on(SyncEvents.SYNC_EVENT, handleSyncEvent);
    subscriptionManager.on(SyncEvents.ERROR, handleError);

    // Set up optimistic update manager listeners
    optimisticManager.on(SyncEvents.CONFLICT, (conflict) => {
      stats.conflicts++;
    });

    // Set up cross-tab manager listeners
    crossTabManager.on('tab_visible', () => {
      // Refresh data when tab becomes visible
      setLastSync(new Date());
    });

    // Subscribe to all configured tables
    const setupSubscriptions = async () => {
      try {
        for (const config of configs) {
          await subscriptionManager.subscribe(config);
        }
      } catch (err) {
        setError(err as Error);
      }
    };

    setupSubscriptions();

    // Set up network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      subscriptionManager.off(SyncEvents.CONNECTED, handleConnected);
      subscriptionManager.off(SyncEvents.DISCONNECTED, handleDisconnected);
      subscriptionManager.off(SyncEvents.SYNC_EVENT, handleSyncEvent);
      subscriptionManager.off(SyncEvents.ERROR, handleError);
      
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      subscriptionManager.unsubscribeAll();
    };
  }, [subscriptionManager, optimisticManager, crossTabManager, configs, stats]);

  const contextValue: SyncContextValue = {
    isConnected,
    isOnline,
    stats,
    lastSync,
    subscriptionManager,
    optimisticManager,
    crossTabManager,
    error,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
}

// Hook for accessing sync status
export function useSyncStatus() {
  const { isConnected, isOnline, stats, lastSync, error } = useSyncContext();
  
  return {
    isConnected,
    isOnline,
    stats,
    lastSync,
    error,
    isHealthy: isConnected && isOnline && !error,
  };
}

// Hook for accessing managers
export function useSyncManagers() {
  const { subscriptionManager, optimisticManager, crossTabManager } = useSyncContext();
  
  return {
    subscriptionManager,
    optimisticManager,
    crossTabManager,
  };
}
