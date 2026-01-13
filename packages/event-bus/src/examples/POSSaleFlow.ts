import { EventBus } from '../EventBus';
import { EventTypes } from '../types';
import { POSHandlers } from '../handlers';
import { InventoryHandlers } from '../handlers';
import { AccountingHandlers } from '../handlers';
import { LoggingMiddleware } from '../middleware';
import { ValidationMiddleware } from '../middleware';
import { TransformationMiddleware } from '../middleware';
import { MemoryEventStore } from '../store';
import type { BaseEvent } from '../types';

export class POSSaleFlowExample {
  private eventBus: EventBus;

  constructor() {
    // Initialize event bus with middleware and persistence
    this.eventBus = new EventBus({
      enablePersistence: true,
      enableMetrics: true,
      middleware: [
        LoggingMiddleware.logger(),
        ValidationMiddleware.baseValidator(),
        ValidationMiddleware.businessRulesValidator(),
        TransformationMiddleware.correlationManager(),
        TransformationMiddleware.normalizer(),
        LoggingMiddleware.performanceLogger(),
      ],
    });

    // Set up event store
    const eventStore = new MemoryEventStore();
    this.eventBus.setEventStore(eventStore);

    // Register event handlers
    this.setupHandlers();
  }

  /**
   * Set up event handlers for the flow
   */
  private setupHandlers(): void {
    // POS Event Handlers
    this.eventBus.subscribe(EventTypes.POS_SALE_CREATED, POSHandlers.handleSaleCreated);
    this.eventBus.subscribe(EventTypes.POS_PAYMENT_RECEIVED, POSHandlers.handlePaymentReceived);
    this.eventBus.subscribe(EventTypes.POS_REFUND_PROCESSED, POSHandlers.handleRefundProcessed);
    this.eventBus.subscribe(EventTypes.POS_SALE_CANCELLED, POSHandlers.handleSaleCancelled);

    // Inventory Event Handlers
    this.eventBus.subscribe(EventTypes.INVENTORY_STOCK_REMOVED, InventoryHandlers.handleStockRemoved);
    this.eventBus.subscribe(EventTypes.INVENTORY_STOCK_ADDED, InventoryHandlers.handleStockAdded);
    this.eventBus.subscribe(EventTypes.INVENTORY_LOW_STOCK_ALERT, InventoryHandlers.handleLowStockAlert);
    this.eventBus.subscribe(EventTypes.INVENTORY_STOCK_TRANSFERRED, InventoryHandlers.handleStockTransferred);
    this.eventBus.subscribe(EventTypes.INVENTORY_ITEM_CREATED, InventoryHandlers.handleItemCreated);
    this.eventBus.subscribe(EventTypes.INVENTORY_ITEM_UPDATED, InventoryHandlers.handleItemUpdated);

    // Accounting Event Handlers
    this.eventBus.subscribe(EventTypes.ACCOUNTING_TRANSACTION_CREATED, AccountingHandlers.handleTransactionCreated);
    this.eventBus.subscribe(EventTypes.ACCOUNTING_INVOICE_CREATED, AccountingHandlers.handleInvoiceCreated);
    this.eventBus.subscribe(EventTypes.ACCOUNTING_INVOICE_PAID, AccountingHandlers.handleInvoicePaid);
    this.eventBus.subscribe(EventTypes.ACCOUNTING_PAYMENT_RECORDED, AccountingHandlers.handlePaymentRecorded);
    this.eventBus.subscribe(EventTypes.ACCOUNTING_JOURNAL_ENTRY_CREATED, AccountingHandlers.handleJournalEntryCreated);

    // Cross-solution event handlers
    this.setupCrossSolutionHandlers();
  }

  /**
   * Set up cross-solution event handlers that trigger other events
   */
  private setupCrossSolutionHandlers(): void {
    // When POS sale is created, trigger inventory updates and accounting transaction
    this.eventBus.subscribe(EventTypes.POS_SALE_CREATED, async (event: BaseEvent) => {
      await this.handlePOSSaleCreated(event);
    });

    // When inventory stock is removed, check for low stock alerts
    this.eventBus.subscribe(EventTypes.INVENTORY_STOCK_REMOVED, async (event: BaseEvent) => {
      await this.handleStockRemoved(event);
    });
  }

  /**
   * Handle POS sale created event - triggers inventory and accounting events
   */
  private async handlePOSSaleCreated(saleEvent: BaseEvent): Promise<void> {
    console.log('\n🔄 Processing POS Sale - Triggering cross-solution events...');

    // Extract sale data
    const saleData = saleEvent.metadata?.saleData;
    if (!saleData) {
      console.error('❌ No sale data found in event');
      return;
    }

    // Create inventory stock removal events for each item
    for (const item of saleData.items) {
      const stockEvent = EventBus.createEvent({
        type: EventTypes.INVENTORY_STOCK_REMOVED,
        source: 'inventory-system',
        metadata: {
          productId: item.productId,
          locationId: saleData.locationId,
          quantity: item.quantity,
          reason: `POS Sale #${saleData.saleId}`,
          previousStock: 100, // Simulated current stock
          newStock: 100 - item.quantity, // Simulated new stock
          referenceId: saleData.saleId,
          referenceType: 'pos_sale',
        },
      }, saleEvent.correlationId, saleEvent.id);

      await this.eventBus.publish(stockEvent);
    }

    // Create accounting transaction event
    const accountingEvent = AccountingHandlers.createTransactionFromSale(saleEvent);
    if (accountingEvent) {
      await this.eventBus.publish(accountingEvent);
    }

    // Create analytics event
    const analyticsEvent = EventBus.createEvent({
      type: EventTypes.ANALYTICS_METRIC_CALCULATED,
      source: 'analytics-system',
      metadata: {
        metricType: 'sales',
        metricValue: saleData.totalAmount,
        metricUnit: 'currency',
        dimensions: {
          location: saleData.locationId,
          employee: saleData.employeeId,
          itemCount: saleData.items.length,
        },
        referenceId: saleData.saleId,
        referenceType: 'pos_sale',
      },
    }, saleEvent.correlationId, saleEvent.id);

    await this.eventBus.publish(analyticsEvent);
  }

  /**
   * Handle stock removed event - check for low stock alerts
   */
  private async handleStockRemoved(stockEvent: BaseEvent): Promise<void> {
    const newStock = stockEvent.metadata?.newStock || 0;
    const productId = stockEvent.metadata?.productId;

    if (newStock <= 10) {
      console.log(`⚠️ Low stock detected for ${productId}, creating alert...`);

      const alertEvent = EventBus.createEvent({
        type: EventTypes.INVENTORY_LOW_STOCK_ALERT,
        source: 'inventory-system',
        metadata: {
          productId,
          currentStock: newStock,
          reorderPoint: 10,
          recommendedOrderQuantity: 50,
          urgency: newStock <= 5 ? 'high' : 'medium',
          locationId: stockEvent.metadata?.locationId,
          triggeredBy: stockEvent.id,
        },
      }, stockEvent.correlationId, stockEvent.id);

      await this.eventBus.publish(alertEvent);
    }
  }

  /**
   * Run the complete POS sale flow example
   */
  async runExample(): Promise<void> {
    console.log('🚀 Starting POS Sale Flow Example...\n');

    // Create a correlation ID for the entire flow
    const correlationId = EventBus.createCorrelationId();

    // Create a sample POS sale event
    const saleEvent = EventBus.createEvent({
      type: EventTypes.POS_SALE_CREATED,
      source: 'pos-system',
      metadata: {
        saleData: {
          saleId: `SALE_${Date.now()}`,
          customerId: 'CUST_001',
          items: [
            {
              productId: 'PROD_001',
              quantity: 2,
              unitPrice: 29.99,
              totalPrice: 59.98,
            },
            {
              productId: 'PROD_002',
              quantity: 1,
              unitPrice: 49.99,
              totalPrice: 49.99,
            },
          ],
          totalAmount: 109.97,
          taxAmount: 8.80,
          discountAmount: 0,
          paymentMethod: 'credit_card',
          locationId: 'STORE_001',
          employeeId: 'EMP_001',
          currency: 'USD',
        },
      },
    }, correlationId);

    console.log('📋 Publishing POS Sale Event...');
    await this.eventBus.publish(saleEvent);

    // Wait a moment for all events to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Display metrics
    console.log('\n📊 Event Bus Metrics:');
    const metrics = this.eventBus.getMetrics();
    console.log(`   Total Events: ${metrics.totalEvents}`);
    console.log(`   Events by Type:`, metrics.eventsByType);
    console.log(`   Events by Source:`, metrics.eventsBySource);
    console.log(`   Average Processing Time: ${metrics.averageProcessingTime.toFixed(2)}ms`);
    console.log(`   Error Count: ${metrics.errorCount}`);

    // Display event history
    console.log('\n📜 Event History:');
    const eventStore = this.eventBus['eventStore'] as MemoryEventStore;
    const events = await eventStore.getEvents({ correlationId });
    
    for (const event of events) {
      console.log(`   ${event.timestamp.toISOString()} - ${event.type} from ${event.source}`);
    }

    console.log('\n✅ POS Sale Flow Example Completed!');
  }

  /**
   * Get the event bus instance for external use
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
}

// Export a function to run the example
export async function runPOSSaleFlowExample(): Promise<void> {
  const example = new POSSaleFlowExample();
  await example.runExample();
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPOSSaleFlowExample().catch(console.error);
}
