# KiTS Hub Event Bus

A comprehensive event-driven communication system for the KiTS Hub ecosystem, enabling cross-solution communication through publish/subscribe patterns.

## Features

- **Event-Driven Architecture**: Decoupled communication between solutions
- **Type-Safe Events**: Full TypeScript support with Zod validation
- **Middleware Pipeline**: Extensible middleware for logging, validation, and transformation
- **Event Persistence**: Optional event storage with memory and database implementations
- **Cross-Solution Integration**: Seamless communication between POS, Inventory, Accounting, CRM, HR, and Analytics
- **Metrics & Monitoring**: Built-in performance tracking and error handling
- **Correlation Tracking**: Trace related events across the system

## Installation

```bash
npm install @kits-hub/event-bus
```

## Quick Start

```typescript
import { EventBus, EventTypes, POSHandlers } from '@kits-hub/event-bus';

// Create event bus
const eventBus = new EventBus({
  enablePersistence: true,
  enableMetrics: true,
});

// Subscribe to events
eventBus.subscribe(EventTypes.POS_SALE_CREATED, POSHandlers.handleSaleCreated);

// Publish an event
await eventBus.publish({
  id: 'sale-123',
  type: EventTypes.POS_SALE_CREATED,
  source: 'pos-system',
  timestamp: new Date(),
  version: '1.0',
  metadata: {
    saleData: {
      saleId: 'SALE_001',
      totalAmount: 109.97,
      items: [/* ... */],
    },
  },
});
```

## Core Concepts

### Events

Events are immutable objects that represent something that happened in the system. All events extend the `BaseEvent` interface:

```typescript
interface BaseEvent {
  id: string;           // Unique identifier
  type: string;         // Event type
  source: string;       // Source system
  timestamp: Date;      // When the event occurred
  version: string;      // Event schema version
  correlationId?: string;  // Related events
  causationId?: string;    // Causal relationship
  metadata?: any;       // Event data
}
```

### Event Types

The system defines comprehensive event types for each solution:

- **POS Events**: Sales, payments, refunds, cancellations
- **Inventory Events**: Stock movements, low stock alerts, item updates
- **Accounting Events**: Transactions, invoices, payments, journal entries
- **CRM Events**: Customer updates, opportunities, lead conversions
- **HR Events**: Employee changes, payroll, leave requests
- **Analytics Events**: Reports, metrics, dashboard views

### Handlers

Event handlers process specific event types:

```typescript
const handler: EventHandler = async (event: BaseEvent) => {
  console.log(`Processing ${event.type} from ${event.source}`);
  // Handle the event
};

eventBus.subscribe(EventTypes.POS_SALE_CREATED, handler);
```

### Middleware

Middleware processes events before they reach handlers:

```typescript
// Logging middleware
eventBus.use(LoggingMiddleware.logger());

// Validation middleware
eventBus.use(ValidationMiddleware.baseValidator());

// Transformation middleware
eventBus.use(TransformationMiddleware.normalizer());
```

## Advanced Usage

### Cross-Solution Event Flow

The event bus enables complex cross-solution workflows. Here's a POS sale flow:

```typescript
import { POSSaleFlowExample } from '@kits-hub/event-bus';

const example = new POSSaleFlowExample();
await example.runExample();
```

This flow demonstrates:
1. POS sale created → Inventory stock updated → Accounting transaction created
2. Low stock alerts when inventory runs low
3. Analytics metrics calculation
4. Event correlation and causation tracking

### Event Persistence

Configure event storage for audit trails and replay:

```typescript
import { MemoryEventStore, DatabaseEventStore } from '@kits-hub/event-bus';

// In-memory store (for development/testing)
const memoryStore = new MemoryEventStore();
eventBus.setEventStore(memoryStore);

// Database store (for production)
const dbStore = new DatabaseEventStore({
  host: 'localhost',
  port: 5432,
  database: 'kits_events',
  username: 'user',
  password: 'password',
});
eventBus.setEventStore(dbStore);
```

### Custom Middleware

Create custom middleware for your specific needs:

```typescript
const customMiddleware: EventMiddleware = async (event, next) => {
  // Pre-processing
  console.log(`Processing ${event.type}`);
  
  await next();
  
  // Post-processing
  console.log(`Finished processing ${event.type}`);
};

eventBus.use(customMiddleware);
```

### Event Validation

Leverage Zod schemas for robust event validation:

```typescript
import { POSSaleEventSchema } from '@kits-hub/event-bus';

const event = POSSaleEventSchema.parse(rawEvent);
// Type-safe event handling
```

## Configuration

```typescript
const eventBus = new EventBus({
  enablePersistence: true,    // Enable event storage
  enableMetrics: true,        // Track performance metrics
  maxRetries: 3,             // Retry failed publishes
  retryDelay: 1000,          // Delay between retries (ms)
  middleware: [              // Default middleware
    LoggingMiddleware.logger(),
    ValidationMiddleware.baseValidator(),
  ],
});
```

## Monitoring

### Metrics

Track event processing performance:

```typescript
const metrics = eventBus.getMetrics();
console.log(`Total events: ${metrics.totalEvents}`);
console.log(`Average processing time: ${metrics.averageProcessingTime}ms`);
console.log(`Error count: ${metrics.errorCount}`);
```

### Event History

Query past events:

```typescript
// Get all events
const allEvents = await eventBus.getEventHistory();

// Filter by type
const salesEvents = await eventBus.getEventHistory({
  type: EventTypes.POS_SALE_CREATED,
});

// Filter by correlation ID
const flowEvents = await eventBus.getEventHistory({
  correlationId: 'corr_123',
});

// Filter by date range
const recentEvents = await eventBus.getEventHistory({
  fromDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
});
```

## Best Practices

### 1. Event Design

- Use descriptive event types (e.g., `pos.sale.created`)
- Include all necessary data in the event
- Keep events immutable
- Use correlation IDs for related events

### 2. Handler Implementation

- Keep handlers focused and single-purpose
- Handle errors gracefully
- Avoid side effects in handlers
- Use async/await for async operations

### 3. Middleware Usage

- Order middleware correctly (validation → transformation → logging)
- Keep middleware lightweight
- Use middleware for cross-cutting concerns
- Avoid business logic in middleware

### 4. Error Handling

- Implement retry logic for transient failures
- Log errors with sufficient context
- Use circuit breakers for external dependencies
- Monitor error rates and patterns

### 5. Performance

- Use event persistence selectively
- Monitor processing times
- Implement event batching for high-volume scenarios
- Consider event partitioning for scalability

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   POS System    │    │  Inventory      │    │   Accounting    │
│                 │    │  System         │    │   System        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Event Bus            │
                    │  ┌─────────────────────┐   │
                    │  │   Middleware        │   │
                    │  │  - Logging          │   │
                    │  │  - Validation       │   │
                    │  │  - Transformation   │   │
                    │  └─────────────────────┘   │
                    │  ┌─────────────────────┐   │
                    │  │   Event Store       │   │
                    │  │  - Memory           │   │
                    │  │  - Database         │   │
                    │  └─────────────────────┘   │
                    └───────────────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions and support, please open an issue in the repository.
