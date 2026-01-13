import { EventEmitter } from 'eventemitter3';
import { OptimisticUpdate, SyncOperation, ConflictResolution } from './types';
export declare class OptimisticUpdateManager extends EventEmitter {
    private updates;
    private conflictResolutions;
    private maxPendingUpdates;
    private updateTimeout;
    constructor();
    createOptimisticUpdate<T>(data: T, operation: SyncOperation, originalData?: T): Promise<T>;
    completeUpdate(updateId: string, finalData?: any): void;
    failUpdate(updateId: string, error: Error): void;
    handleConflict<T>(updateId: string, serverData: T, clientData: T, table: string, recordId: string): ConflictResolution<T>;
    resolveConflict(conflictId: string, resolution: 'client' | 'server' | 'merge', mergedData?: any): void;
    getPendingUpdates(): OptimisticUpdate[];
    getUpdate(updateId: string): OptimisticUpdate | undefined;
    cancelUpdate(updateId: string): void;
    clearAllUpdates(): void;
    getStats(): {
        pending: number;
        completed: number;
        failed: number;
        conflicts: number;
        total: number;
    };
    private setupCleanupInterval;
    private cleanupExpiredUpdates;
    private findUpdateByRecord;
    private mergeData;
    setMaxPendingUpdates(max: number): void;
    setUpdateTimeout(timeout: number): void;
    getMaxPendingUpdates(): number;
    getUpdateTimeout(): number;
}
export declare function getOptimisticUpdateManager(): OptimisticUpdateManager;
export declare function resetOptimisticUpdateManager(): void;
