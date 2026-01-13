import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import type {
  BaseEvent,
  EventHandler,
  EventMiddleware,
  SubscriptionOptions,
  EventBusConfig,
  EventStore,
  EventMetrics,
} from './types';

export class EventBus extends EventEmitter {
  private config: EventBusConfig;
  private eventStore?: EventStore;
  private middleware: EventMiddleware[] = [];
  private metrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: {},
    eventsBySource: {},
    averageProcessingTime: 0,
    errorCount: 0,
  };
  private processingTimes: number[] = [];

  constructor(config: EventBusConfig = {}) {
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
  setEventStore(eventStore: EventStore): void {
    this.eventStore = eventStore;
  }

  /**
   * Add middleware to the event processing pipeline
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Publish an event to the bus
   */
  async publish<T extends BaseEvent>(event: T): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Ensure event has required fields
      const processedEvent: T = {
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

    } catch (error) {
      if (this.config.enableMetrics) {
        this.metrics.errorCount++;
      }
      throw error;
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    const wrappedHandler = async (event: T) => {
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
      } catch (error) {
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
  subscribeToAll<T extends BaseEvent>(
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    return this.subscribe('*', handler, options);
  }

  /**
   * Process event through middleware chain
   */
  private async processMiddleware(event: BaseEvent): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
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
  getMetrics(): EventMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
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
  async publishWithRetry<T extends BaseEvent>(event: T): Promise<void> {
    const maxRetries = this.config.maxRetries || 3;
    const retryDelay = this.config.retryDelay || 1000;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.publish(event);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw lastError!;
  }

  /**
   * Create a correlation ID for related events
   */
  static createCorrelationId(): string {
    return uuidv4();
  }

  /**
   * Create an event with correlation and causation IDs
   */
  static createEvent<T extends BaseEvent>(
    eventData: Omit<T, 'id' | 'timestamp' | 'version'>,
    correlationId?: string,
    causationId?: string
  ): T {
    return {
      id: uuidv4(),
      timestamp: new Date(),
      version: '1.0',
      correlationId,
      causationId,
      ...eventData,
    } as T;
  }

  /**
   * Get event history from store
   */
  async getEventHistory(filter?: {
    type?: string;
    source?: string;
    fromDate?: Date;
    toDate?: Date;
    correlationId?: string;
  }): Promise<BaseEvent[]> {
    if (!this.eventStore) {
      throw new Error('Event store not configured');
    }

    return this.eventStore.getEvents(filter);
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.removeAllListeners();
  }

  /**
   * Get the number of listeners for an event type
   */
  getListenerCount(eventType: string): number {
    return this.listenerCount(eventType);
  }

  /**
   * Get all event types with listeners
   */
  getEventTypes(): string[] {
    return Array.from(this.eventNames()).filter(name => typeof name === 'string') as string[];
  }
}
