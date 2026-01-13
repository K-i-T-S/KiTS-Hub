import type { BaseEvent } from '../types';
import { EventStore } from './EventStore';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
}
export declare class DatabaseEventStore extends EventStore {
    private config;
    private pool;
    constructor(config: DatabaseConfig);
    save(event: BaseEvent): Promise<void>;
    getEvents(filter?: {
        type?: string;
        source?: string;
        fromDate?: Date;
        toDate?: Date;
        correlationId?: string;
    }): Promise<BaseEvent[]>;
    getEvent(id: string): Promise<BaseEvent | null>;
    /**
     * Create events table if it doesn't exist
     */
    ensureTable(): Promise<void>;
    /**
     * Clean up old events (for maintenance)
     */
    cleanup(olderThanDays?: number): Promise<number>;
    /**
     * Get event statistics
     */
    getStats(): Promise<{
        totalEvents: number;
        eventTypes: Record<string, number>;
        sources: Record<string, number>;
        correlations: number;
        oldestEvent?: Date;
        newestEvent?: Date;
    }>;
    /**
     * Map database row to event object
     */
    private mapRowToEvent;
    /**
     * Simulate database operation (for demonstration)
     */
    private simulateDatabaseOperation;
    /**
     * Simulate database query (for demonstration)
     */
    private simulateDatabaseQuery;
}
