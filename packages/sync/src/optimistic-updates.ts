import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  OptimisticUpdate,
  SyncOperation,
  SyncStatus,
  SyncEvents,
  ConflictResolution,
} from './types';

export class OptimisticUpdateManager extends EventEmitter {
  private updates: Map<string, OptimisticUpdate> = new Map();
  private conflictResolutions: Map<string, ConflictResolution> = new Map();
  private maxPendingUpdates: number = 100;
  private updateTimeout: number = 30000; // 30 seconds

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  // Create a new optimistic update
  createOptimisticUpdate<T>(
    data: T,
    operation: SyncOperation,
    originalData?: T
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const updateId = uuidv4();
      const update: OptimisticUpdate<T> = {
        id: updateId,
        type: operation,
        data,
        originalData,
        timestamp: Date.now(),
        status: SyncStatus.PENDING,
        resolve,
        reject,
      };

      // Check if we have too many pending updates
      if (this.updates.size >= this.maxPendingUpdates) {
        this.cleanupExpiredUpdates();
      }

      this.updates.set(updateId, update);

      // Set timeout for the update
      setTimeout(() => {
        if (this.updates.has(updateId)) {
          this.failUpdate(updateId, new Error('Update timeout'));
        }
      }, this.updateTimeout);

      // Emit the optimistic update event
      this.emit(SyncEvents.OPTIMISTIC_UPDATE, update);

      return updateId;
    });
  }

  // Complete an optimistic update successfully
  completeUpdate(updateId: string, finalData?: any): void {
    const update = this.updates.get(updateId);
    if (!update) {
      return;
    }

    update.status = SyncStatus.COMPLETED;
    
    if (finalData) {
      update.data = finalData;
    }

    if (update.resolve) {
      update.resolve(finalData || update.data);
    }

    this.updates.delete(updateId);
    this.emit('update_completed', update);
  }

  // Fail an optimistic update
  failUpdate(updateId: string, error: Error): void {
    const update = this.updates.get(updateId);
    if (!update) {
      return;
    }

    update.status = SyncStatus.FAILED;

    if (update.reject) {
      update.reject(error);
    }

    this.updates.delete(updateId);
    this.emit('update_failed', { update, error });
  }

  // Handle conflict resolution
  handleConflict<T>(
    updateId: string,
    serverData: T,
    clientData: T,
    table: string,
    recordId: string
  ): ConflictResolution<T> {
    const update = this.updates.get(updateId);
    if (!update) {
      throw new Error('Update not found');
    }

    const conflict: ConflictResolution<T> = {
      conflictId: uuidv4(),
      table,
      recordId,
      clientData,
      serverData,
      timestamp: new Date(),
    };

    this.conflictResolutions.set(conflict.conflictId, conflict);
    update.status = SyncStatus.CONFLICT;

    this.emit(SyncEvents.CONFLICT, conflict);

    return conflict;
  }

  // Resolve a conflict
  resolveConflict(
    conflictId: string,
    resolution: 'client' | 'server' | 'merge',
    mergedData?: any
  ): void {
    const conflict = this.conflictResolutions.get(conflictId);
    if (!conflict) {
      return;
    }

    conflict.resolution = resolution;

    let finalData;
    switch (resolution) {
      case 'client':
        finalData = conflict.clientData;
        break;
      case 'server':
        finalData = conflict.serverData;
        break;
      case 'merge':
        finalData = mergedData || this.mergeData(conflict.serverData, conflict.clientData);
        break;
    }

    // Find and update the corresponding optimistic update
    const updateId = this.findUpdateByRecord(conflict.table, conflict.recordId);
    if (updateId) {
      this.completeUpdate(updateId, finalData);
    }

    this.conflictResolutions.delete(conflictId);
    this.emit('conflict_resolved', { conflict, resolution, finalData });
  }

  // Get pending updates
  getPendingUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter(
      update => update.status === SyncStatus.PENDING
    );
  }

  // Get update by ID
  getUpdate(updateId: string): OptimisticUpdate | undefined {
    return this.updates.get(updateId);
  }

  // Cancel an update
  cancelUpdate(updateId: string): void {
    const update = this.updates.get(updateId);
    if (!update) {
      return;
    }

    update.status = SyncStatus.FAILED;
    
    if (update.reject) {
      update.reject(new Error('Update cancelled'));
    }

    this.updates.delete(updateId);
    this.emit('update_cancelled', update);
  }

  // Clear all pending updates
  clearAllUpdates(): void {
    const updates = Array.from(this.updates.values());
    
    updates.forEach(update => {
      if (update.reject) {
        update.reject(new Error('Updates cleared'));
      }
    });

    this.updates.clear();
    this.emit('all_updates_cleared');
  }

  // Get statistics
  getStats(): {
    pending: number;
    completed: number;
    failed: number;
    conflicts: number;
    total: number;
  } {
    const updates = Array.from(this.updates.values());
    
    return {
      pending: updates.filter(u => u.status === SyncStatus.PENDING).length,
      completed: updates.filter(u => u.status === SyncStatus.COMPLETED).length,
      failed: updates.filter(u => u.status === SyncStatus.FAILED).length,
      conflicts: updates.filter(u => u.status === SyncStatus.CONFLICT).length,
      total: updates.length,
    };
  }

  // Private helper methods
  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredUpdates();
    }, 60000); // Check every minute
  }

  private cleanupExpiredUpdates(): void {
    const now = Date.now();
    const expiredUpdates: string[] = [];

    this.updates.forEach((update, id) => {
      if (now - update.timestamp > this.updateTimeout) {
        expiredUpdates.push(id);
      }
    });

    expiredUpdates.forEach(id => {
      this.failUpdate(id, new Error('Update expired'));
    });
  }

  private findUpdateByRecord(table: string, recordId: string): string | undefined {
    for (const [id, update] of this.updates.entries()) {
      if (update.data && typeof update.data === 'object' && 'id' in update.data) {
        if (update.data.id === recordId) {
          return id;
        }
      }
    }
    return undefined;
  }

  private mergeData(serverData: any, clientData: any): any {
    // Simple merge strategy - client data takes precedence
    // In a real implementation, you might want more sophisticated merging
    return {
      ...serverData,
      ...clientData,
      // Preserve server timestamps
      updated_at: serverData.updated_at || new Date().toISOString(),
      created_at: serverData.created_at || clientData.created_at,
    };
  }

  // Configuration methods
  setMaxPendingUpdates(max: number): void {
    this.maxPendingUpdates = max;
  }

  setUpdateTimeout(timeout: number): void {
    this.updateTimeout = timeout;
  }

  getMaxPendingUpdates(): number {
    return this.maxPendingUpdates;
  }

  getUpdateTimeout(): number {
    return this.updateTimeout;
  }
}

// Global instance for use across the application
let globalOptimisticUpdateManager: OptimisticUpdateManager | null = null;

export function getOptimisticUpdateManager(): OptimisticUpdateManager {
  if (!globalOptimisticUpdateManager) {
    globalOptimisticUpdateManager = new OptimisticUpdateManager();
  }
  return globalOptimisticUpdateManager;
}

export function resetOptimisticUpdateManager(): void {
  globalOptimisticUpdateManager = null;
}
