import { ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { SyncConfig, SyncStats } from '../types';
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
interface SyncProviderProps {
    children: ReactNode;
    supabase: SupabaseClient;
    configs: SyncConfig[];
    enableOptimisticUpdates?: boolean;
    enableCrossTab?: boolean;
}
export declare function SyncProvider({ children, supabase, configs, enableOptimisticUpdates, enableCrossTab, }: SyncProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useSyncContext(): SyncContextValue;
export declare function useSyncStatus(): {
    isConnected: boolean;
    isOnline: boolean;
    stats: SyncStats;
    lastSync: Date | null;
    error: Error | null;
    isHealthy: boolean;
};
export declare function useSyncManagers(): {
    subscriptionManager: SupabaseSubscriptionManager | null;
    optimisticManager: OptimisticUpdateManager;
    crossTabManager: CrossTabSyncManager;
};
export {};
