// Simple demo of event bus functionality
import { EventBus, EventTypes, POSHandlers, MemoryEventStore } from './src/index.js';

async function runDemo() {
  console.log('🚀 KiTS Hub Event Bus Demo\n');

  // Create event bus
  const eventBus = new EventBus({
    enablePersistence: true,
    enableMetrics: true,
  });

  // Set up event store
  const eventStore = new MemoryEventStore();
  eventBus.setEventStore(eventStore);

  // Subscribe to events
  eventBus.subscribe(EventTypes.POS_SALE_CREATED, POSHandlers.handleSaleCreated);

  // Create and publish a POS sale event
  const saleEvent = {
    id: 'demo-sale-001',
    type: EventTypes.POS_SALE_CREATED,
    source: 'pos-system',
    timestamp: new Date(),
    version: '1.0',
    metadata: {
      saleData: {
        saleId: 'DEMO_SALE_001',
        customerId: 'CUST_DEMO',
        items: [
          {
            productId: 'PROD_DEMO_001',
            quantity: 2,
            unitPrice: 29.99,
            totalPrice: 59.98,
          },
        ],
        totalAmount: 59.98,
        taxAmount: 4.80,
        discountAmount: 0,
        paymentMethod: 'credit_card',
        locationId: 'STORE_DEMO',
        employeeId: 'EMP_DEMO',
      },
    },
  };

  console.log('📋 Publishing POS Sale Event...');
  await eventBus.publish(saleEvent);

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 100));

  // Show metrics
  console.log('\n📊 Event Bus Metrics:');
  const metrics = eventBus.getMetrics();
  console.log(`   Total Events: ${metrics.totalEvents}`);
  console.log(`   Events by Type:`, metrics.eventsByType);
  console.log(`   Average Processing Time: ${metrics.averageProcessingTime.toFixed(2)}ms`);

  console.log('\n✅ Demo completed successfully!');
}

runDemo().catch(console.error);
