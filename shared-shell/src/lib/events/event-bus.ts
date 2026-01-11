import { 
  CrossSolutionEvent, 
  EventHandler, 
  EventSubscription, 
  EventBusConfig
} from './types';

export class EventBus {
  private events: Map<string, EventHandler[]> = new Map();
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: CrossSolutionEvent[] = [];
  private config: Required<EventBusConfig>;
  private metrics: {
    eventsEmitted: number;
    eventsProcessed: number;
    errors: number;
    averageProcessingTime: number;
  } = {
    eventsEmitted: 0,
    eventsProcessed: 0,
    errors: 0,
    averageProcessingTime: 0,
  };

  constructor(config: EventBusConfig = {}) {
    this.config = {
      maxEvents: config.maxEvents || 1000,
      enablePersistence: config.enablePersistence || false,
      enableMetrics: config.enableMetrics || true,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    // Load persisted events if enabled
    if (this.config.enablePersistence) {
      this.loadPersistedEvents();
    }

    // Cleanup old events periodically
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60000); // Every minute
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<T extends CrossSolutionEvent>(event: T): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Validate event structure
      this.validateEvent(event);

      // Add to history
      this.addToHistory(event);

      // Get all handlers for this event type
      const handlers = this.events.get(event.type) || [];
      const allHandlers = [...handlers];

      // Also get wildcard handlers
      const wildcardHandlers = this.events.get('*') || [];
      allHandlers.push(...wildcardHandlers);

      // Process all handlers
      const promises = allHandlers.map(async (handler) => {
        try {
          await this.executeHandlerWithRetry(handler, event);
        } catch (handlerError) {
          console.error(`Error in event handler for ${event.type}:`, handlerError);
          this.metrics.errors++;
          
          // Emit error event if not already an error event
          if (event.type !== 'system_health') {
            await this.emitErrorEvent(handlerError, event);
          }
        }
      });

      await Promise.allSettled(promises);

      // Update metrics
      this.metrics.eventsEmitted++;
      this.metrics.eventsProcessed += allHandlers.length;
      
      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);

      // Persist if enabled
      if (this.config.enablePersistence) {
        this.persistEvent(event);
      }

    } catch (error) {
      console.error('Error emitting event:', error);
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Subscribe to specific event types
   */
  on(eventType: string, handler: EventHandler, options: Partial<EventSubscription> = {}): string {
    const subscriptionId = this.generateSubscriptionId();
    
    // Add handler to event map
    if (!this.events.has(eventType)) {
      this.events.set(eventType, []);
    }
    this.events.get(eventType)!.push(handler);

    // Store subscription details
    const subscription: EventSubscription = {
      eventType,
      handler,
      source: options.source,
      tenantId: options.tenantId,
      once: options.once || false,
    };
    
    this.subscriptions.set(subscriptionId, subscription);

    return subscriptionId;
  }

  /**
   * Subscribe to event only once
   */
  once(eventType: string, handler: EventHandler, options: Partial<EventSubscription> = {}): string {
    return this.on(eventType, handler, { ...options, once: true });
  }

  /**
   * Unsubscribe from events
   */
  off(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    // Remove handler from event map
    const handlers = this.events.get(subscription.eventType);
    if (handlers) {
      const index = handlers.indexOf(subscription.handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }

    // Remove subscription
    this.subscriptions.delete(subscriptionId);
    return true;
  }

  /**
   * Remove all subscriptions for an event type
   */
  removeAllListeners(eventType: string): void {
    this.events.delete(eventType);
    
    // Remove related subscriptions
    for (const [id, subscription] of this.subscriptions) {
      if (subscription.eventType === eventType) {
        this.subscriptions.delete(id);
      }
    }
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit?: number): CrossSolutionEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }
    
    if (limit) {
      events = events.slice(-limit);
    }
    
    return events;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeSubscriptions: this.subscriptions.size,
      eventTypes: Array.from(this.events.keys()),
      historySize: this.eventHistory.length,
    };
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: CrossSolutionEvent): void {
    const required = ['id', 'type', 'timestamp', 'source', 'tenantId', 'userId', 'data'];
    for (const field of required) {
      if (!(field in event)) {
        throw new Error(`Event missing required field: ${field}`);
      }
    }

    if (typeof event.type !== 'string' || !event.type) {
      throw new Error('Event type must be a non-empty string');
    }

    if (!(event.timestamp instanceof Date)) {
      throw new Error('Event timestamp must be a Date object');
    }
  }

  /**
   * Execute handler with retry logic
   */
  private async executeHandlerWithRetry(handler: EventHandler, event: CrossSolutionEvent): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = handler(event);
        
        // Handle both sync and async handlers
        if (result instanceof Promise) {
          await result;
        }
        
        return; // Success
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Add event to history with size limit
   */
  private addToHistory(event: CrossSolutionEvent): void {
    this.eventHistory.push(event);
    
    // Enforce size limit
    if (this.eventHistory.length > this.config.maxEvents) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxEvents);
    }
  }

  /**
   * Clean up old events (older than 24 hours)
   */
  private cleanupOldEvents(): void {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.eventHistory = this.eventHistory.filter(event => event.timestamp > twentyFourHoursAgo);
  }

  /**
   * Update average processing time
   */
  private updateAverageProcessingTime(newTime: number): void {
    const total = this.metrics.averageProcessingTime * (this.metrics.eventsProcessed - 1) + newTime;
    this.metrics.averageProcessingTime = total / this.metrics.eventsProcessed;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit error event
   */
  private async emitErrorEvent(error: unknown, originalEvent: CrossSolutionEvent): Promise<void> {
    try {
      const errorEvent: CrossSolutionEvent = {
        id: this.generateSubscriptionId(),
        type: 'system_health',
        timestamp: new Date(),
        source: 'event-bus',
        tenantId: originalEvent.tenantId,
        userId: originalEvent.userId,
        data: {
          service: 'event-bus',
          status: 'degraded' as const,
          error: error instanceof Error ? error.message : String(error),
          originalEventType: originalEvent.type,
        },
      };
      
      // Emit error event without retry to avoid infinite loops
      const handlers = this.events.get('system_health') || [];
      await Promise.allSettled(
        handlers.map(handler => this.executeHandlerWithRetry(handler, errorEvent))
      );
    } catch (emitError) {
      console.error('Failed to emit error event:', emitError);
    }
  }

  /**
   * Load persisted events from localStorage
   */
  private loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem('event-bus-history');
      if (stored) {
        const data = JSON.parse(stored);
        this.eventHistory = data.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load persisted events:', error);
    }
  }

  /**
   * Persist event to localStorage
   */
  private persistEvent(_event: CrossSolutionEvent): void {
    try {
      const key = `event-bus-history`;
      localStorage.setItem(key, JSON.stringify(this.eventHistory));
    } catch (error) {
      console.warn('Failed to persist event:', error);
    }
  }
}

// Global event bus instance
export const globalEventBus = new EventBus({
  maxEvents: 1000,
  enablePersistence: true,
  enableMetrics: true,
  retryAttempts: 3,
  retryDelay: 1000,
});
