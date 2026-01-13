import type { BaseEvent } from '../types';
import { EventStore } from './EventStore';
export declare class MemoryEventStore extends EventStore {
    private events;
    private eventsByType;
    private eventsBySource;
    private eventsByCorrelation;
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
     * Get events by type
     */
    getEventsByType(type: string): Promise<BaseEvent[]>;
    /**
     * Get events by source
     */
    getEventsBySource(source: string): Promise<BaseEvent[]>;
    /**
     * Get events by correlation ID
     */
    getEventsByCorrelation(correlationId: string): Promise<BaseEvent[]>;
    /**
     * Clear all events (useful for testing)
     */
    clear(): void;
    /**
     * Get count of events
     */
    getCount(): number;
    /**
     * Get statistics
     */
    getStats(): {
        totalEvents: number;
        eventTypes: Record<string, number>;
        sources: Record<string, number>;
        correlations: number;
    };
}
