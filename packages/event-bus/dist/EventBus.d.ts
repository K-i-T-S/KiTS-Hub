import { EventEmitter } from 'eventemitter3';
import type { BaseEvent, EventHandler, EventMiddleware, SubscriptionOptions, EventBusConfig, EventStore, EventMetrics } from './types';
export declare class EventBus extends EventEmitter {
    private config;
    private eventStore?;
    private middleware;
    private metrics;
    private processingTimes;
    constructor(config?: EventBusConfig);
    /**
     * Set the event store for persistence
     */
    setEventStore(eventStore: EventStore): void;
    /**
     * Add middleware to the event processing pipeline
     */
    use(middleware: EventMiddleware): void;
    /**
     * Publish an event to the bus
     */
    publish<T extends BaseEvent>(event: T): Promise<void>;
    /**
     * Subscribe to events of a specific type
     */
    subscribe<T extends BaseEvent>(eventType: string, handler: EventHandler<T>, options?: SubscriptionOptions): () => void;
    /**
     * Subscribe to all events
     */
    subscribeToAll<T extends BaseEvent>(handler: EventHandler<T>, options?: SubscriptionOptions): () => void;
    /**
     * Process event through middleware chain
     */
    private processMiddleware;
    /**
     * Get current metrics
     */
    getMetrics(): EventMetrics;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Publish event with retry logic
     */
    publishWithRetry<T extends BaseEvent>(event: T): Promise<void>;
    /**
     * Create a correlation ID for related events
     */
    static createCorrelationId(): string;
    /**
     * Create an event with correlation and causation IDs
     */
    static createEvent<T extends BaseEvent>(eventData: Omit<T, 'id' | 'timestamp' | 'version'>, correlationId?: string, causationId?: string): T;
    /**
     * Get event history from store
     */
    getEventHistory(filter?: {
        type?: string;
        source?: string;
        fromDate?: Date;
        toDate?: Date;
        correlationId?: string;
    }): Promise<BaseEvent[]>;
    /**
     * Clear all subscriptions
     */
    clear(): void;
    /**
     * Get the number of listeners for an event type
     */
    getListenerCount(eventType: string): number;
    /**
     * Get all event types with listeners
     */
    getEventTypes(): string[];
}
