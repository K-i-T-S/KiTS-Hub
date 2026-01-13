import { SyncConfig, SyncEvent } from '../types';
export declare function validateSyncConfig(config: unknown): SyncConfig;
export declare function validateSyncEvent(event: unknown): SyncEvent;
export declare function isValidTableName(tableName: string): boolean;
export declare function isValidFilter(filter: string): boolean;
export declare function isValidRetryAttempts(attempts: number): boolean;
export declare function isValidRetryDelay(delay: number): boolean;
export declare function validateInventoryItem(data: unknown): boolean;
export declare function validateTransaction(data: unknown): boolean;
export declare function validateCustomer(data: unknown): boolean;
export declare function validateConflictResolution(resolution: string): boolean;
export declare function validateLatencyThreshold(threshold: number): boolean;
export declare function validateBatchSize(size: number): boolean;
export declare function sanitizeTableName(tableName: string): string;
export declare function sanitizeFilter(filter: string): string;
export declare function isSyncConfig(config: any): config is SyncConfig;
export declare function isSyncEvent(event: any): event is SyncEvent;
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare function validateBatchSyncEvents(events: unknown[]): SyncEvent[];
export declare function validateAndNormalizeConfig(config: Partial<SyncConfig>): SyncConfig;
