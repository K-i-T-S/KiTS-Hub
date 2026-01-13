import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../EventBus';
import { EventTypes } from '../types';
import { MemoryEventStore } from '../store';
import type { BaseEvent } from '../types';

describe('EventBus', () => {
  let eventBus: EventBus;
  let eventStore: MemoryEventStore;

  beforeEach(() => {
    eventStore = new MemoryEventStore();
    eventBus = new EventBus({
      enablePersistence: true,
      enableMetrics: true,
    });
    eventBus.setEventStore(eventStore);
  });

  describe('Basic Functionality', () => {
    it('should create an event bus with default configuration', () => {
      const bus = new EventBus();
      expect(bus).toBeDefined();
      expect(bus.getMetrics().totalEvents).toBe(0);
    });

    it('should publish and receive events', async () => {
      const mockHandler = vi.fn();
      
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, mockHandler);
      
      const event: BaseEvent = {
        id: 'test-event-1',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event);

      expect(mockHandler).toHaveBeenCalledWith(event);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple subscribers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, handler1);
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, handler2);
      
      const event: BaseEvent = {
        id: 'test-event-2',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe correctly', () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.subscribe(EventTypes.POS_SALE_CREATED, handler);
      unsubscribe();
      
      expect(eventBus.getListenerCount(EventTypes.POS_SALE_CREATED)).toBe(0);
    });
  });

  describe('Event Persistence', () => {
    it('should save events to store when persistence is enabled', async () => {
      const event: BaseEvent = {
        id: 'test-event-3',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event);

      const savedEvent = await eventStore.getEvent(event.id);
      expect(savedEvent).toEqual(event);
    });

    it('should retrieve event history', async () => {
      const correlationId = 'test-correlation';
      
      const event1: BaseEvent = {
        id: 'test-event-4',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
        correlationId,
      };

      const event2: BaseEvent = {
        id: 'test-event-5',
        type: EventTypes.INVENTORY_STOCK_REMOVED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
        correlationId,
      };

      await eventBus.publish(event1);
      await eventBus.publish(event2);

      const history = await eventBus.getEventHistory({ correlationId });
      expect(history).toHaveLength(2);
      expect(history.map(e => e.id)).toContain(event1.id);
      expect(history.map(e => e.id)).toContain(event2.id);
    });
  });

  describe('Metrics', () => {
    it('should track metrics correctly', async () => {
      const event1: BaseEvent = {
        id: 'test-event-6',
        type: EventTypes.POS_SALE_CREATED,
        source: 'pos-system',
        timestamp: new Date(),
        version: '1.0',
      };

      const event2: BaseEvent = {
        id: 'test-event-7',
        type: EventTypes.INVENTORY_STOCK_REMOVED,
        source: 'inventory-system',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event1);
      await eventBus.publish(event2);

      const metrics = eventBus.getMetrics();
      expect(metrics.totalEvents).toBe(2);
      expect(metrics.eventsByType[EventTypes.POS_SALE_CREATED]).toBe(1);
      expect(metrics.eventsByType[EventTypes.INVENTORY_STOCK_REMOVED]).toBe(1);
      expect(metrics.eventsBySource['pos-system']).toBe(1);
      expect(metrics.eventsBySource['inventory-system']).toBe(1);
    });

    it('should reset metrics', async () => {
      const event: BaseEvent = {
        id: 'test-event-8',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event);
      expect(eventBus.getMetrics().totalEvents).toBe(1);

      eventBus.resetMetrics();
      expect(eventBus.getMetrics().totalEvents).toBe(0);
    });
  });

  describe('Middleware', () => {
    it('should process middleware in order', async () => {
      const order: string[] = [];
      
      const middleware1 = async (event: BaseEvent, next: () => Promise<void>) => {
        order.push('middleware1-start');
        await next();
        order.push('middleware1-end');
      };

      const middleware2 = async (event: BaseEvent, next: () => Promise<void>) => {
        order.push('middleware2-start');
        await next();
        order.push('middleware2-end');
      };

      eventBus.use(middleware1);
      eventBus.use(middleware2);

      const handler = vi.fn();
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, handler);

      const event: BaseEvent = {
        id: 'test-event-9',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event);

      expect(order).toEqual([
        'middleware1-start',
        'middleware2-start',
        'middleware2-end',
        'middleware1-end',
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors gracefully', async () => {
      const errorHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
      const goodHandler = vi.fn();
      
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, errorHandler);
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, goodHandler);

      const event: BaseEvent = {
        id: 'test-event-10',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await eventBus.publish(event);

      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
      expect(eventBus.getMetrics().errorCount).toBe(1);
    });

    it('should retry failed publishes', async () => {
      const failingStore = {
        save: vi.fn().mockRejectedValue(new Error('Database error')),
        getEvents: vi.fn(),
        getEvent: vi.fn(),
      };

      eventBus.setEventStore(failingStore);

      const event: BaseEvent = {
        id: 'test-event-11',
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
        timestamp: new Date(),
        version: '1.0',
      };

      await expect(eventBus.publishWithRetry(event)).rejects.toThrow();
      expect(failingStore.save).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });
  });

  describe('Utility Methods', () => {
    it('should create correlation IDs', () => {
      const correlationId = EventBus.createCorrelationId();
      expect(correlationId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });

    it('should create events with correlation and causation IDs', () => {
      const correlationId = EventBus.createCorrelationId();
      const causationId = EventBus.createCorrelationId();

      const event = EventBus.createEvent({
        type: EventTypes.POS_SALE_CREATED,
        source: 'test-source',
      }, correlationId, causationId);

      expect(event.id).toBeDefined();
      expect(event.correlationId).toBe(correlationId);
      expect(event.causationId).toBe(causationId);
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.version).toBe('1.0');
    });

    it('should get event types with listeners', () => {
      eventBus.subscribe(EventTypes.POS_SALE_CREATED, vi.fn());
      eventBus.subscribe(EventTypes.INVENTORY_STOCK_REMOVED, vi.fn());

      const eventTypes = eventBus.getEventTypes();
      expect(eventTypes).toContain(EventTypes.POS_SALE_CREATED);
      expect(eventTypes).toContain(EventTypes.INVENTORY_STOCK_REMOVED);
    });
  });
});
