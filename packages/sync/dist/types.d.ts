import { z } from 'zod';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
export declare enum SyncOperation {
    CREATE = "INSERT",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
}
export declare enum SyncStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CONFLICT = "conflict"
}
export declare enum SyncDirection {
    BIDIRECTIONAL = "bidirectional",
    CLIENT_TO_SERVER = "client_to_server",
    SERVER_TO_CLIENT = "server_to_client"
}
export declare const SyncEventSchema: z.ZodObject<{
    id: z.ZodString;
    table: z.ZodString;
    operation: z.ZodNativeEnum<typeof SyncOperation>;
    data: z.ZodAny;
    oldData: z.ZodOptional<z.ZodAny>;
    timestamp: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof SyncStatus>>;
    retryCount: z.ZodDefault<z.ZodNumber>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    table: string;
    operation: SyncOperation;
    status: SyncStatus;
    timestamp: string;
    retryCount: number;
    data?: any;
    oldData?: any;
    userId?: string | undefined;
    clientId?: string | undefined;
    correlationId?: string | undefined;
}, {
    id: string;
    table: string;
    operation: SyncOperation;
    timestamp: string;
    status?: SyncStatus | undefined;
    data?: any;
    oldData?: any;
    userId?: string | undefined;
    clientId?: string | undefined;
    retryCount?: number | undefined;
    correlationId?: string | undefined;
}>;
export type SyncEvent = z.infer<typeof SyncEventSchema>;
export declare const SyncConfigSchema: z.ZodObject<{
    table: z.ZodString;
    direction: z.ZodDefault<z.ZodNativeEnum<typeof SyncDirection>>;
    filter: z.ZodOptional<z.ZodString>;
    optimisticUpdates: z.ZodDefault<z.ZodBoolean>;
    conflictResolution: z.ZodDefault<z.ZodEnum<["client_wins", "server_wins", "manual"]>>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
    retryDelay: z.ZodDefault<z.ZodNumber>;
    enableCrossTab: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    table: string;
    direction: SyncDirection;
    optimisticUpdates: boolean;
    conflictResolution: "client_wins" | "server_wins" | "manual";
    retryAttempts: number;
    retryDelay: number;
    enableCrossTab: boolean;
    filter?: string | undefined;
}, {
    table: string;
    filter?: string | undefined;
    direction?: SyncDirection | undefined;
    optimisticUpdates?: boolean | undefined;
    conflictResolution?: "client_wins" | "server_wins" | "manual" | undefined;
    retryAttempts?: number | undefined;
    retryDelay?: number | undefined;
    enableCrossTab?: boolean | undefined;
}>;
export type SyncConfig = z.infer<typeof SyncConfigSchema>;
export interface SubscriptionManager {
    subscribe(config: SyncConfig): Promise<RealtimeChannel>;
    unsubscribe(channel: RealtimeChannel): Promise<void>;
    unsubscribeAll(): Promise<void>;
    getSubscriptions(): Map<string, RealtimeChannel>;
}
export interface OptimisticUpdate<T = any> {
    id: string;
    type: SyncOperation;
    data: T;
    originalData?: T;
    timestamp: number;
    status: SyncStatus;
    resolve?: (value: T) => void;
    reject?: (error: Error) => void;
}
export declare enum CrossTabMessageType {
    SYNC_EVENT = "sync_event",
    OPTIMISTIC_UPDATE = "optimistic_update",
    CONFLICT = "conflict",
    STATUS_UPDATE = "status_update"
}
export declare const CrossTabMessageSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof CrossTabMessageType>;
    payload: z.ZodAny;
    timestamp: z.ZodNumber;
    clientId: z.ZodString;
    tabId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: CrossTabMessageType;
    timestamp: number;
    clientId: string;
    tabId: string;
    payload?: any;
}, {
    type: CrossTabMessageType;
    timestamp: number;
    clientId: string;
    tabId: string;
    payload?: any;
}>;
export type CrossTabMessage = z.infer<typeof CrossTabMessageSchema>;
export interface UseSyncResult<T = any> {
    data: T[] | null;
    loading: boolean;
    error: Error | null;
    sync: (data: T, operation?: SyncOperation) => Promise<void>;
    optimisticSync: (data: T, operation?: SyncOperation) => Promise<T>;
    refresh: () => Promise<void>;
    lastSync: Date | null;
    isOnline: boolean;
}
export interface UseRealtimeSyncResult<T extends Record<string, any> = any> extends UseSyncResult<T> {
    isConnected: boolean;
    subscription: RealtimeChannel | null;
    reconnect: () => Promise<void>;
}
export interface ConflictResolution<T = any> {
    conflictId: string;
    table: string;
    recordId: string;
    clientData: T;
    serverData: T;
    timestamp: Date;
    resolution?: 'client' | 'server' | 'merge';
}
export interface SyncStats {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    pendingEvents: number;
    conflicts: number;
    lastSyncTime: Date | null;
    averageLatency: number;
}
export declare enum SyncEvents {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    SYNC_EVENT = "sync_event",
    OPTIMISTIC_UPDATE = "optimistic_update",
    CONFLICT = "conflict",
    ERROR = "error",
    STATS_UPDATED = "stats_updated",
    STATUS_UPDATE = "status_update"
}
export type DatabaseChangePayload<T extends Record<string, any> = any> = RealtimePostgresChangesPayload<T>;
export interface SyncQueueItem {
    id: string;
    event: SyncEvent;
    priority: number;
    attempts: number;
    nextRetryAt: Date;
    createdAt: Date;
}
export interface SyncCache<T = any> {
    get(key: string): T | null;
    set(key: string, value: T, ttl?: number): void;
    delete(key: string): void;
    clear(): void;
    has(key: string): boolean;
    keys(): string[];
}
export declare const InventoryItemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    category: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
    updated_at: string;
}, {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
    updated_at: string;
}>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    amount: z.ZodNumber;
    type: z.ZodEnum<["income", "expense"]>;
    description: z.ZodString;
    date: z.ZodString;
    account_id: z.ZodString;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "income" | "expense";
    date: string;
    amount: number;
    description: string;
    account_id: string;
    created_at: string;
}, {
    id: string;
    type: "income" | "expense";
    date: string;
    amount: number;
    description: string;
    account_id: string;
    created_at: string;
}>;
export declare const CustomerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    updated_at: string;
    created_at: string;
    email: string;
    phone?: string | undefined;
}, {
    id: string;
    name: string;
    updated_at: string;
    created_at: string;
    email: string;
    phone?: string | undefined;
}>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
