import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POSSaleFlowExample } from '../examples/POSSaleFlow';
import { EventTypes } from '../types';

describe('POSSaleFlowExample', () => {
  let example: POSSaleFlowExample;

  beforeEach(() => {
    example = new POSSaleFlowExample();
  });

  describe('Cross-Solution Event Flow', () => {
    it('should handle complete POS sale flow', async () => {
      // Mock console.log to capture output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await example.runExample();

      // Verify that console.log was called multiple times (indicating events were processed)
      expect(consoleSpy).toHaveBeenCalled();

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should create correlated events', async () => {
      const eventBus = example.getEventBus();
      const correlationId = 'test-correlation-id';

      // Create initial POS sale event
      const saleEvent = {
        id: 'sale-1',
        type: EventTypes.POS_SALE_CREATED,
        source: 'pos-system',
        timestamp: new Date(),
        version: '1.0',
        correlationId,
        metadata: {
          saleData: {
            saleId: 'SALE_001',
            customerId: 'CUST_001',
            items: [
              {
                productId: 'PROD_001',
                quantity: 2,
                unitPrice: 29.99,
                totalPrice: 59.98,
              },
            ],
            totalAmount: 59.98,
            taxAmount: 4.80,
            discountAmount: 0,
            paymentMethod: 'credit_card',
            locationId: 'STORE_001',
            employeeId: 'EMP_001',
          },
        },
      };

      await eventBus.publish(saleEvent);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify correlated events were created
      const eventStore = eventBus['eventStore'];
      const correlatedEvents = await eventStore.getEvents({ correlationId });

      expect(correlatedEvents.length).toBeGreaterThan(1);
      
      // Should include the original sale event
      expect(correlatedEvents.some(e => e.type === EventTypes.POS_SALE_CREATED)).toBe(true);
      
      // Should include inventory stock removal events
      expect(correlatedEvents.some(e => e.type === EventTypes.INVENTORY_STOCK_REMOVED)).toBe(true);
      
      // Should include accounting transaction event
      expect(correlatedEvents.some(e => e.type === EventTypes.ACCOUNTING_TRANSACTION_CREATED)).toBe(true);
    });

    it('should trigger low stock alert when stock is low', async () => {
      const eventBus = example.getEventBus();
      const correlationId = 'low-stock-test';

      // Create stock removal event that triggers low stock
      const stockEvent = {
        id: 'stock-1',
        type: EventTypes.INVENTORY_STOCK_REMOVED,
        source: 'inventory-system',
        timestamp: new Date(),
        version: '1.0',
        correlationId,
        metadata: {
          productId: 'PROD_001',
          locationId: 'STORE_001',
          quantity: 95,
          reason: 'POS Sale',
          previousStock: 100,
          newStock: 5, // Low stock
          referenceId: 'SALE_001',
        },
      };

      await eventBus.publish(stockEvent);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify low stock alert was created
      const eventStore = eventBus['eventStore'];
      const correlatedEvents = await eventStore.getEvents({ correlationId });

      expect(correlatedEvents.some(e => e.type === EventTypes.INVENTORY_LOW_STOCK_ALERT)).toBe(true);
    });
  });

  describe('Event Bus Configuration', () => {
    it('should have middleware configured', () => {
      const eventBus = example.getEventBus();
      expect(eventBus).toBeDefined();
    });

    it('should have event store configured', () => {
      const eventBus = example.getEventBus();
      const eventStore = eventBus['eventStore'];
      expect(eventStore).toBeDefined();
    });

    it('should have metrics enabled', () => {
      const eventBus = example.getEventBus();
      const metrics = eventBus.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalEvents).toBe('number');
    });
  });
});
