import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
export class EventBus extends EventEmitter {
    config;
    eventStore;
    middleware = [];
    metrics = {
        totalEvents: 0,
        eventsByType: {},
        eventsBySource: {},
        averageProcessingTime: 0,
        errorCount: 0,
    };
    processingTimes = [];
    constructor(config = {}) {
        super();
        this.config = {
            enablePersistence: false,
            enableMetrics: true,
            maxRetries: 3,
            retryDelay: 1000,
            ...config,
        };
        this.middleware = config.middleware || [];
    }
    /**
     * Set the event store for persistence
     */
    setEventStore(eventStore) {
        this.eventStore = eventStore;
    }
    /**
     * Add middleware to the event processing pipeline
     */
    use(middleware) {
        this.middleware.push(middleware);
    }
    /**
     * Publish an event to the bus
     */
    async publish(event) {
        const startTime = Date.now();
        try {
            // Ensure event has required fields
            const processedEvent = {
                ...event,
                id: event.id || uuidv4(),
                timestamp: event.timestamp || new Date(),
                version: event.version || '1.0',
            };
            // Update metrics
            if (this.config.enableMetrics) {
                this.metrics.totalEvents++;
                this.metrics.eventsByType[processedEvent.type] =
                    (this.metrics.eventsByType[processedEvent.type] || 0) + 1;
                this.metrics.eventsBySource[processedEvent.source] =
                    (this.metrics.eventsBySource[processedEvent.source] || 0) + 1;
            }
            // Persist event if enabled
            if (this.config.enablePersistence && this.eventStore) {
                await this.eventStore.save(processedEvent);
            }
            // Process through middleware
            await this.processMiddleware(processedEvent);
            // Emit to subscribers
            this.emit(processedEvent.type, processedEvent);
            this.emit('*', processedEvent); // Wildcard listener
            // Update processing time metrics
            if (this.config.enableMetrics) {
                const processingTime = Date.now() - startTime;
                this.processingTimes.push(processingTime);
                this.metrics.averageProcessingTime =
                    this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
            }
        }
        catch (error) {
            if (this.config.enableMetrics) {
                this.metrics.errorCount++;
            }
            throw error;
        }
    }
    /**
     * Subscribe to events of a specific type
     */
    subscribe(eventType, handler, options = {}) {
        const wrappedHandler = async (event) => {
            try {
                // Apply filter if provided
                if (options.filter && !options.filter(event)) {
                    return;
                }
                await handler(event);
                // Unsubscribe if once option is true
                if (options.once) {
                    this.off(eventType, wrappedHandler);
                }
            }
            catch (error) {
                console.error(`Error in event handler for ${eventType}:`, error);
                this.metrics.errorCount++;
            }
        };
        this.on(eventType, wrappedHandler);
        // Return unsubscribe function
        return () => {
            this.off(eventType, wrappedHandler);
        };
    }
    /**
     * Subscribe to all events
     */
    subscribeToAll(handler, options = {}) {
        return this.subscribe('*', handler, options);
    }
    /**
     * Process event through middleware chain
     */
    async processMiddleware(event) {
        let index = 0;
        const next = async () => {
            if (index >= this.middleware.length) {
                return;
            }
            const middleware = this.middleware[index++];
            await middleware(event, next);
        };
        await next();
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalEvents: 0,
            eventsByType: {},
            eventsBySource: {},
            averageProcessingTime: 0,
            errorCount: 0,
        };
        this.processingTimes = [];
    }
    /**
     * Publish event with retry logic
     */
    async publishWithRetry(event) {
        const maxRetries = this.config.maxRetries || 3;
        const retryDelay = this.config.retryDelay || 1000;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await this.publish(event);
                return;
            }
            catch (error) {
                lastError = error;
                if (attempt === maxRetries) {
                    throw lastError;
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            }
        }
        throw lastError;
    }
    /**
     * Create a correlation ID for related events
     */
    static createCorrelationId() {
        return uuidv4();
    }
    /**
     * Create an event with correlation and causation IDs
     */
    static createEvent(eventData, correlationId, causationId) {
        return {
            id: uuidv4(),
            timestamp: new Date(),
            version: '1.0',
            correlationId,
            causationId,
            ...eventData,
        };
    }
    /**
     * Get event history from store
     */
    async getEventHistory(filter) {
        if (!this.eventStore) {
            throw new Error('Event store not configured');
        }
        return this.eventStore.getEvents(filter);
    }
    /**
     * Clear all subscriptions
     */
    clear() {
        this.removeAllListeners();
    }
    /**
     * Get the number of listeners for an event type
     */
    getListenerCount(eventType) {
        return this.listenerCount(eventType);
    }
    /**
     * Get all event types with listeners
     */
    getEventTypes() {
        return Array.from(this.eventNames()).filter(name => typeof name === 'string');
    }
}
