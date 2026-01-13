import { z } from 'zod';
import { SyncConfig, SyncEvent, SyncOperation, SyncStatus, SyncDirection } from '../types';

// Validation schemas
const SyncConfigValidationSchema = z.object({
  table: z.string().min(1, 'Table name is required'),
  direction: z.nativeEnum(SyncDirection).default(SyncDirection.BIDIRECTIONAL),
  filter: z.string().optional(),
  optimisticUpdates: z.boolean().default(true),
  conflictResolution: z.enum(['client_wins', 'server_wins', 'manual']).default('server_wins'),
  retryAttempts: z.number().int().min(0).default(3),
  retryDelay: z.number().int().min(0).default(1000),
  enableCrossTab: z.boolean().default(true),
});

const SyncEventValidationSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
  table: z.string().min(1, 'Table name is required'),
  operation: z.nativeEnum(SyncOperation),
  data: z.any(),
  oldData: z.any().optional(),
  timestamp: z.string().datetime('Invalid timestamp format'),
  userId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.nativeEnum(SyncStatus),
  retryCount: z.number().int().min(0),
  correlationId: z.string().optional(),
});

// Validation functions
export function validateSyncConfig(config: unknown): SyncConfig {
  try {
    return SyncConfigValidationSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Invalid sync configuration: ${errorMessages.join(', ')}`);
    }
    throw new Error('Invalid sync configuration');
  }
}

export function validateSyncEvent(event: unknown): SyncEvent {
  try {
    return SyncEventValidationSchema.parse(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Invalid sync event: ${errorMessages.join(', ')}`);
    }
    throw new Error('Invalid sync event');
  }
}

// Utility validation functions
export function isValidTableName(tableName: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) && tableName.length > 0;
}

export function isValidFilter(filter: string): boolean {
  if (!filter) return true; // Empty filter is valid
  
  // Basic filter validation: column=operator=value
  const filterPattern = /^[a-zA-Z_][a-zA-Z0-9_]*=(eq|neq|gt|gte|lt|lte|like|ilike|in|cs)=[^=]+$/;
  return filterPattern.test(filter);
}

export function isValidRetryAttempts(attempts: number): boolean {
  return Number.isInteger(attempts) && attempts >= 0 && attempts <= 10;
}

export function isValidRetryDelay(delay: number): boolean {
  return Number.isInteger(delay) && delay >= 100 && delay <= 60000; // 100ms to 60s
}

// Data validation for common entities
export function validateInventoryItem(data: unknown): boolean {
  const schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    quantity: z.number().int().min(0),
    price: z.number().min(0),
    category: z.string().optional(),
    updated_at: z.string().datetime(),
  });

  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function validateTransaction(data: unknown): boolean {
  const schema = z.object({
    id: z.string().uuid(),
    amount: z.number(),
    type: z.enum(['income', 'expense']),
    description: z.string(),
    date: z.string().datetime(),
    account_id: z.string().uuid(),
    created_at: z.string().datetime(),
  });

  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function validateCustomer(data: unknown): boolean {
  const schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  });

  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

// Conflict resolution validation
export function validateConflictResolution(resolution: string): boolean {
  return ['client_wins', 'server_wins', 'manual'].includes(resolution);
}

// Performance validation
export function validateLatencyThreshold(threshold: number): boolean {
  return Number.isInteger(threshold) && threshold >= 0 && threshold <= 10000; // 0-10 seconds
}

export function validateBatchSize(size: number): boolean {
  return Number.isInteger(size) && size >= 1 && size <= 1000;
}

// Security validation
export function sanitizeTableName(tableName: string): string {
  // Remove any potentially harmful characters
  return tableName.replace(/[^a-zA-Z0-9_]/g, '');
}

export function sanitizeFilter(filter: string): string {
  // Basic sanitization - remove SQL injection attempts
  return filter.replace(/['";\\]/g, '');
}

// Type guards
export function isSyncConfig(config: any): config is SyncConfig {
  try {
    validateSyncConfig(config);
    return true;
  } catch {
    return false;
  }
}

export function isSyncEvent(event: any): event is SyncEvent {
  try {
    validateSyncEvent(event);
    return true;
  } catch {
    return false;
  }
}

// Validation error class
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Batch validation
export function validateBatchSyncEvents(events: unknown[]): SyncEvent[] {
  const validatedEvents: SyncEvent[] = [];
  const errors: string[] = [];

  events.forEach((event, index) => {
    try {
      const validatedEvent = validateSyncEvent(event);
      validatedEvents.push(validatedEvent);
    } catch (error) {
      errors.push(`Event ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(`Batch validation failed: ${errors.join('; ')}`);
  }

  return validatedEvents;
}

// Configuration validation with defaults
export function validateAndNormalizeConfig(config: Partial<SyncConfig>): SyncConfig {
  const validatedConfig = validateSyncConfig(config);
  
  return {
    ...validatedConfig,
    direction: validatedConfig.direction || 'bidirectional',
    optimisticUpdates: validatedConfig.optimisticUpdates ?? true,
    conflictResolution: validatedConfig.conflictResolution || 'server_wins',
    retryAttempts: validatedConfig.retryAttempts ?? 3,
    retryDelay: validatedConfig.retryDelay ?? 1000,
    enableCrossTab: validatedConfig.enableCrossTab ?? true,
  };
}
