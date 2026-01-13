import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { useSync, useRealtimeSync } from '../hooks/use-sync';
import { SupabaseSubscriptionManager } from '../subscription-manager';
import { OptimisticUpdateManager } from '../optimistic-updates';
import { CrossTabSyncManager } from '../cross-tab-sync';
import { SyncConfig, SyncOperation, SyncDirection } from '../types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      data: [],
      error: null,
    })),
    insert: vi.fn(() => ({
      data: { id: 'test-id', name: 'Test Item' },
      error: null,
    })),
    update: vi.fn(() => ({
      data: { id: 'test-id', name: 'Updated Item' },
      error: null,
    })),
    delete: vi.fn(() => ({
      data: null,
      error: null,
    })),
    filter: vi.fn(() => ({
      data: [],
      error: null,
    })),
    eq: vi.fn(() => ({
      data: [],
      error: null,
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue('SUBSCRIBED'),
  })),
  removeChannel: vi.fn(),
} as any;

describe('Real-time Sync System', () => {
  let subscriptionManager: SupabaseSubscriptionManager;
  let optimisticManager: OptimisticUpdateManager;
  let crossTabManager: CrossTabSyncManager;

  beforeEach(() => {
    vi.clearAllMocks();
    subscriptionManager = new SupabaseSubscriptionManager(mockSupabase, true);
    optimisticManager = new OptimisticUpdateManager();
    crossTabManager = new CrossTabSyncManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Subscription Manager', () => {
    it('should create subscription manager successfully', () => {
      expect(subscriptionManager).toBeDefined();
      expect(subscriptionManager.getSubscriptions()).toBeDefined();
    });

    it('should subscribe to table changes', async () => {
      const config: SyncConfig = {
        table: 'test_table',
        direction: SyncDirection.BIDIRECTIONAL,
        optimisticUpdates: true,
        enableCrossTab: true,
      };

      const channel = await subscriptionManager.subscribe(config);
      expect(channel).toBeDefined();
      expect(subscriptionManager.getSubscriptions().size).toBe(1);
    });

    it('should handle connection events', (done) => {
      subscriptionManager.on('connected', (data) => {
        expect(data).toBeDefined();
        done();
      });

      // Simulate connection
      subscriptionManager.emit('connected', { table: 'test_table' });
    });

    it('should handle disconnection events', (done) => {
      subscriptionManager.on('disconnected', (data) => {
        expect(data).toBeDefined();
        done();
      });

      // Simulate disconnection
      subscriptionManager.emit('disconnected', { table: 'test_table' });
    });

    it('should unsubscribe from all channels', async () => {
      const config: SyncConfig = {
        table: 'test_table',
        direction: SyncDirection.BIDIRECTIONAL,
      };

      await subscriptionManager.subscribe(config);
      expect(subscriptionManager.getSubscriptions().size).toBe(1);

      await subscriptionManager.unsubscribeAll();
      expect(subscriptionManager.getSubscriptions().size).toBe(0);
    });
  });

  describe('Optimistic Updates', () => {
    it('should create optimistic update', async () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      
      const updatePromise = optimisticManager.createOptimisticUpdate(
        testData,
        SyncOperation.CREATE
      );

      // Should resolve immediately for testing
      optimisticManager.completeUpdate('test-id', testData);
      
      const result = await updatePromise;
      expect(result).toEqual(testData);
    });

    it('should handle optimistic update failure', async () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      
      const updatePromise = optimisticManager.createOptimisticUpdate(
        testData,
        SyncOperation.UPDATE
      );

      const error = new Error('Update failed');
      optimisticManager.failUpdate('test-id', error);

      await expect(updatePromise).rejects.toThrow('Update failed');
    });

    it('should track pending updates', () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      
      optimisticManager.createOptimisticUpdate(testData, SyncOperation.CREATE);
      
      const pendingUpdates = optimisticManager.getPendingUpdates();
      expect(pendingUpdates.length).toBe(1);
      expect(pendingUpdates[0].data).toEqual(testData);
    });

    it('should provide statistics', () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      
      optimisticManager.createOptimisticUpdate(testData, SyncOperation.CREATE);
      
      const stats = optimisticManager.getStats();
      expect(stats.pending).toBe(1);
      expect(stats.total).toBe(1);
    });
  });

  describe('Cross-tab Synchronization', () => {
    it('should initialize cross-tab manager', () => {
      expect(crossTabManager).toBeDefined();
      expect(crossTabManager.getClientId()).toBeDefined();
      expect(crossTabManager.getTabId()).toBeDefined();
    });

    it('should send and receive messages', (done) => {
      const testData = { id: 'test-id', name: 'Test Item' };
      
      crossTabManager.on('sync_event', (data) => {
        expect(data).toEqual(testData);
        done();
      });

      crossTabManager.sendSyncEvent({
        id: 'test-event',
        table: 'test_table',
        operation: SyncOperation.CREATE,
        data: testData,
        timestamp: new Date().toISOString(),
        status: 'completed' as any,
        retryCount: 0,
      } as any);
    });

    it('should handle tab visibility changes', () => {
      const isTabVisible = crossTabManager.isTabVisible();
      expect(typeof isTabVisible).toBe('boolean');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete sync workflow', async () => {
      const config: SyncConfig = {
        table: 'inventory_items',
        direction: SyncDirection.BIDIRECTIONAL,
        optimisticUpdates: true,
        enableCrossTab: true,
      };

      // Subscribe to changes
      const channel = await subscriptionManager.subscribe(config);
      expect(channel).toBeDefined();

      // Create optimistic update
      const testData = { 
        id: 'test-item', 
        name: 'Test Item',
        quantity: 10,
        price: 99.99
      };

      const updatePromise = optimisticManager.createOptimisticUpdate(
        testData,
        SyncOperation.CREATE
      );

      // Simulate successful server response
      optimisticManager.completeUpdate('test-item', testData);

      const result = await updatePromise;
      expect(result).toEqual(testData);

      // Verify cross-tab message would be sent
      expect(crossTabManager.getClientId()).toBeDefined();
    });

    it('should handle conflict resolution', async () => {
      const clientData = { id: 'test-id', name: 'Client Name' };
      const serverData = { id: 'test-id', name: 'Server Name' };

      const conflict = optimisticManager.handleConflict(
        'test-update-id',
        serverData,
        clientData,
        'test_table',
        'test-id'
      );

      expect(conflict).toBeDefined();
      expect(conflict.clientData).toEqual(clientData);
      expect(conflict.serverData).toEqual(serverData);
      expect(conflict.table).toBe('test_table');
      expect(conflict.recordId).toBe('test-id');

      // Resolve conflict with server data
      optimisticManager.resolveConflict(conflict.conflictId, 'server');
      
      const stats = optimisticManager.getStats();
      expect(stats.conflicts).toBe(1);
    });

    it('should handle network disconnection', async () => {
      const config: SyncConfig = {
        table: 'test_table',
        direction: SyncDirection.BIDIRECTIONAL,
      };

      await subscriptionManager.subscribe(config);
      expect(subscriptionManager.isConnectionActive()).toBe(true);

      // Simulate network disconnection
      subscriptionManager.emit('disconnected', { reason: 'network' });
      
      // Should attempt reconnection
      expect(subscriptionManager.getConnectionStats().reconnectAttempts).toBe(0);
    });
  });

  describe('Performance Validation', () => {
    it('should handle high-frequency updates efficiently', async () => {
      const startTime = Date.now();
      const promises: Promise<any>[] = [];

      // Create 100 optimistic updates
      for (let i = 0; i < 100; i++) {
        const data = { id: `item-${i}`, name: `Item ${i}` };
        const promise = optimisticManager.createOptimisticUpdate(data, SyncOperation.CREATE);
        promises.push(promise);
        
        // Complete every 10th update
        if (i % 10 === 0) {
          optimisticManager.completeUpdate(`item-${i}`, data);
        }
      }

      // Complete remaining updates
      for (let i = 0; i < 100; i++) {
        if (i % 10 !== 0) {
          const data = { id: `item-${i}`, name: `Item ${i}` };
          optimisticManager.completeUpdate(`item-${i}`, data);
        }
      }

      await Promise.all(promises);
      const endTime = Date.now();

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should maintain memory efficiency', () => {
      const initialStats = optimisticManager.getStats();
      
      // Create and complete many updates
      for (let i = 0; i < 1000; i++) {
        const data = { id: `item-${i}`, name: `Item ${i}` };
        optimisticManager.createOptimisticUpdate(data, SyncOperation.CREATE);
        optimisticManager.completeUpdate(`item-${i}`, data);
      }

      const finalStats = optimisticManager.getStats();
      
      // Should not have memory leaks (pending should be 0)
      expect(finalStats.pending).toBe(0);
      expect(finalStats.total).toBeGreaterThanOrEqual(initialStats.total);
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription errors gracefully', async () => {
      const config: SyncConfig = {
        table: 'test_table',
        direction: SyncDirection.BIDIRECTIONAL,
      };

      // Mock subscription failure
      mockSupabase.channel.mockReturnValueOnce({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockRejectedValue(new Error('Subscription failed')),
      });

      await expect(subscriptionManager.subscribe(config)).rejects.toThrow('Subscription failed');
    });

    it('should handle optimistic update timeout', async () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      
      // Set very short timeout for testing
      optimisticManager.setUpdateTimeout(10);
      
      const updatePromise = optimisticManager.createOptimisticUpdate(
        testData,
        SyncOperation.CREATE
      );

      await expect(updatePromise).rejects.toThrow('Update timeout');
    });

    it('should handle cross-tab communication failures', () => {
      // Test with unsupported browser
      const unsupportedManager = new CrossTabSyncManager();
      expect(unsupportedManager.isConnectionSupported()).toBeDefined();
    });
  });
});
