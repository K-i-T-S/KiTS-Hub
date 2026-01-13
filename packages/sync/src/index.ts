// Core types and interfaces
export * from './types';

// Subscription management
export { SupabaseSubscriptionManager } from './subscription-manager';

// React hooks
export { useSync, useRealtimeSync } from './hooks/use-sync';

// Optimistic updates
export { 
  OptimisticUpdateManager, 
  getOptimisticUpdateManager, 
  resetOptimisticUpdateManager 
} from './optimistic-updates';

// Cross-tab synchronization
export { 
  CrossTabSyncManager, 
  getCrossTabSyncManager, 
  resetCrossTabSyncManager 
} from './cross-tab-sync';

// Utility functions
export { SyncProvider, useSyncContext, useSyncStatus, useSyncManagers } from './components/sync-provider';

// Validation helpers
export { validateSyncConfig, validateSyncEvent } from './utils/validation';

// Performance monitoring
export { SyncPerformanceMonitor } from './utils/performance-monitor';
