import { z } from 'zod';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Sync operation types
export enum SyncOperation {
  CREATE = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Sync status
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

// Sync direction
export enum SyncDirection {
  BIDIRECTIONAL = 'bidirectional',
  CLIENT_TO_SERVER = 'client_to_server',
  SERVER_TO_CLIENT = 'server_to_client',
}

// Base sync event schema
export const SyncEventSchema = z.object({
  id: z.string().uuid(),
  table: z.string(),
  operation: z.nativeEnum(SyncOperation),
  data: z.any(),
  oldData: z.any().optional(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.nativeEnum(SyncStatus).default(SyncStatus.PENDING),
  retryCount: z.number().default(0),
  correlationId: z.string().optional(),
});

export type SyncEvent = z.infer<typeof SyncEventSchema>;

// Sync configuration
export const SyncConfigSchema = z.object({
  table: z.string(),
  direction: z.nativeEnum(SyncDirection).default(SyncDirection.BIDIRECTIONAL),
  filter: z.string().optional(),
  optimisticUpdates: z.boolean().default(true),
  conflictResolution: z.enum(['client_wins', 'server_wins', 'manual']).default('server_wins'),
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000),
  enableCrossTab: z.boolean().default(true),
});

export type SyncConfig = z.infer<typeof SyncConfigSchema>;

// Subscription manager interface
export interface SubscriptionManager {
  subscribe(config: SyncConfig): Promise<RealtimeChannel>;
  unsubscribe(channel: RealtimeChannel): Promise<void>;
  unsubscribeAll(): Promise<void>;
  getSubscriptions(): Map<string, RealtimeChannel>;
}

// Optimistic update interface
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

// Cross-tab message types
export enum CrossTabMessageType {
  SYNC_EVENT = 'sync_event',
  OPTIMISTIC_UPDATE = 'optimistic_update',
  CONFLICT = 'conflict',
  STATUS_UPDATE = 'status_update',
}

export const CrossTabMessageSchema = z.object({
  type: z.nativeEnum(CrossTabMessageType),
  payload: z.any(),
  timestamp: z.number(),
  clientId: z.string(),
  tabId: z.string(),
});

export type CrossTabMessage = z.infer<typeof CrossTabMessageSchema>;

// Sync hooks return types
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

// Conflict resolution
export interface ConflictResolution<T = any> {
  conflictId: string;
  table: string;
  recordId: string;
  clientData: T;
  serverData: T;
  timestamp: Date;
  resolution?: 'client' | 'server' | 'merge';
}

// Sync statistics
export interface SyncStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  pendingEvents: number;
  conflicts: number;
  lastSyncTime: Date | null;
  averageLatency: number;
}

// Event emitter events
export enum SyncEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  SYNC_EVENT = 'sync_event',
  OPTIMISTIC_UPDATE = 'optimistic_update',
  CONFLICT = 'conflict',
  ERROR = 'error',
  STATS_UPDATED = 'stats_updated',
  STATUS_UPDATE = 'status_update',
}

// Database change payload
export type DatabaseChangePayload<T extends Record<string, any> = any> = RealtimePostgresChangesPayload<T>;

// Sync queue item
export interface SyncQueueItem {
  id: string;
  event: SyncEvent;
  priority: number;
  attempts: number;
  nextRetryAt: Date;
  createdAt: Date;
}

// Cache interface
export interface SyncCache<T = any> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
}

// Validation schemas for different entities
export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  category: z.string(),
  updated_at: z.string().datetime(),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  description: z.string(),
  date: z.string().datetime(),
  account_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
