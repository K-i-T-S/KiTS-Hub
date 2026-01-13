# @kits-hub/workflow

A comprehensive workflow orchestration system for the KiTS Hub ecosystem, providing multi-solution business workflows with compensation, monitoring, and rollback capabilities.

## Features

- **Multi-Solution Workflows**: Coordinate business processes across POS, Inventory, Accounting, CRM, HR, and Analytics
- **Flexible Execution**: Support for sequential, parallel, and conditional step execution
- **Compensation & Rollback**: Automatic compensation strategies for failed workflows
- **Real-time Monitoring**: Comprehensive metrics, health monitoring, and alerting
- **Type Safety**: Full TypeScript support with runtime validation
- **Event-Driven**: Integration with the KiTS Hub event bus system
- **Extensible**: Plugin architecture for custom actions and middleware

## Installation

```bash
npm install @kits-hub/workflow
```

## Quick Start

```typescript
import { 
  WorkflowEngine, 
  WorkflowRegistry, 
  MemoryWorkflowStore,
  SALE_PROCESSING_WORKFLOW,
  createAsyncAction
} from '@kits-hub/workflow';

// Setup infrastructure
const store = new MemoryWorkflowStore();
const registry = new WorkflowRegistry();
const engine = new WorkflowEngine(store, registry);

// Register a workflow
registry.registerWorkflow(SALE_PROCESSING_WORKFLOW);

// Register actions
registry.registerAction('process-payment', createAsyncAction(
  'process-payment',
  async (input, context) => {
    // Process payment logic
    return { paymentId: 'pay_123', status: 'completed' };
  },
  async (input, context) => {
    // Refund payment logic
    console.log('Refunding payment...');
  }
));

// Execute workflow
const execution = await engine.executeWorkflow('sale-processing', {
  customerId: 'cust_456',
  items: [{ id: 'item_1', quantity: 2 }],
  total: 99.99
});

console.log('Workflow completed:', execution.status);
```

## Core Concepts

### Workflows

A workflow is a defined sequence of steps that accomplish a business process:

```typescript
const workflow: WorkflowDefinition = {
  id: 'order-fulfillment',
  name: 'Order Fulfillment Workflow',
  version: '1.0.0',
  steps: [
    {
      id: 'validate-order',
      name: 'validate-order-details',
      type: StepType.TASK,
      compensation: {
        id: 'cancel-validation',
        action: 'cancel-order-validation'
      }
    },
    {
      id: 'process-payment',
      name: 'process-payment',
      type: StepType.TASK,
      compensation: {
        id: 'refund-payment',
        action: 'refund-payment'
      }
    }
  ],
  compensationStrategy: 'sequential'
};
```

### Steps

Steps are the building blocks of workflows:

- **Task Steps**: Execute a single action
- **Parallel Steps**: Execute multiple steps simultaneously
- **Sequence Steps**: Execute steps in order
- **Condition Steps**: Branch based on conditions

### Actions

Actions implement the business logic for task steps:

```typescript
const paymentAction: WorkflowAction = {
  execute: async (input, context) => {
    // Process payment
    return { paymentId: 'pay_123', status: 'completed' };
  },
  compensate: async (input, context) => {
    // Refund payment
  },
  validate: (input) => {
    // Validate input
    return input.amount > 0;
  }
};
```

### Compensation

Compensation provides rollback capabilities for failed workflows:

```typescript
// Sequential compensation (default)
workflow.compensationStrategy = 'sequential';

// Parallel compensation
workflow.compensationStrategy = 'parallel';

// Custom compensation strategy
workflow.compensationStrategy = 'custom';
```

## Monitoring

The workflow monitor provides real-time metrics and alerting:

```typescript
import { WorkflowMonitor } from '@kits-hub/workflow';

const monitor = new WorkflowMonitor(store);

// Start monitoring
monitor.startMonitoring(5000); // Update every 5 seconds

// Listen for events
monitor.on('metrics.updated', (metrics) => {
  console.log('Workflow metrics updated:', metrics);
});

monitor.on('alert.triggered', (alert) => {
  console.log('Alert triggered:', alert.message);
});

// Add custom alert rules
monitor.addAlertRule({
  id: 'high-failure-rate',
  name: 'High Failure Rate',
  condition: (metrics) => metrics.failedSteps > 5,
  severity: 'error',
  message: 'Workflow has high failure rate',
  enabled: true
});
```

## Predefined Workflows

The package includes several common workflows:

### Sale Processing Workflow
- Validates sale data
- Processes payment
- Updates inventory
- Creates accounting entries
- Generates receipt
- Updates loyalty points

### Inventory Management Workflow
- Checks stock levels
- Updates inventory records
- Triggers low stock alerts
- Notifies stakeholders

### Order Fulfillment Workflow
- Validates order
- Reserves inventory
- Processes payment
- Allocates warehouse resources
- Picks and packs items
- Schedules shipping

### Employee Onboarding Workflow
- Validates employee data
- Creates employee record
- Sets up payroll
- Provisions system access
- Schedules training
- Assigns equipment

### Financial Reporting Workflow
- Extracts financial data
- Validates data integrity
- Generates reports
- Gets management approvals
- Distributes reports

### Customer Support Workflow
- Receives support request
- Assesses priority
- Assigns agent
- Investigates issue
- Provides solution
- Follows up with customer

## Advanced Usage

### Custom Middleware

Add middleware to workflow execution:

```typescript
const loggingMiddleware: WorkflowMiddleware = {
  name: 'logging',
  beforeStep: async (step, context) => {
    console.log(`Starting step: ${step.name}`);
  },
  afterStep: async (step, output, context) => {
    console.log(`Completed step: ${step.name}`, output);
  },
  onError: async (error, step, context) => {
    console.error(`Step failed: ${step.name}`, error);
  }
};

engine.addMiddleware(loggingMiddleware);
```

### Custom Compensation Strategies

```typescript
import { CompensationManager } from '@kits-hub/workflow';

const compensationManager = new CompensationManager(store, registry);

// Register custom strategy
compensationManager.registerStrategy({
  name: 'exponential-backoff',
  execute: async (plan, context) => {
    for (const action of plan.actions) {
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          await compensationManager.executeCompensationAction(action, context);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) throw error;
          
          // Exponential backoff
          const delay = Math.pow(2, attempts) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
});
```

### Utility Functions

```typescript
import {
  createAsyncAction,
  createWorkflowContext,
  getWorkflowDuration,
  formatDuration,
  calculateSuccessRate
} from '@kits-hub/workflow';

// Create async action
const action = createAsyncAction(
  'send-email',
  async (input, context) => {
    // Send email logic
    return { messageId: 'msg_123' };
  }
);

// Create workflow context
const context = createWorkflowContext({
  userId: 'user_456',
  sessionId: 'sess_789'
});

// Calculate metrics
const duration = getWorkflowDuration(execution);
const formattedDuration = formatDuration(duration);
const successRate = calculateSuccessRate(metrics);
```

## API Reference

### Core Classes

- **WorkflowEngine**: Main workflow execution engine
- **WorkflowRegistry**: Registry for workflows and actions
- **MemoryWorkflowStore**: In-memory workflow store
- **WorkflowMonitor**: Real-time monitoring and alerting
- **CompensationManager**: Compensation and rollback management

### Types

- **WorkflowDefinition**: Workflow definition structure
- **WorkflowExecution**: Runtime workflow execution
- **StepExecution**: Runtime step execution
- **WorkflowAction**: Action implementation interface
- **WorkflowMetrics**: Workflow execution metrics
- **WorkflowHealth**: Overall system health

### Enums

- **WorkflowStatus**: Workflow execution status
- **StepStatus**: Step execution status
- **StepType**: Step execution type

## Integration with KiTS Hub

The workflow system integrates seamlessly with other KiTS Hub packages:

### Event Bus Integration

```typescript
import { EventBus } from '@kits-hub/event-bus';

const eventBus = new EventBus();

// Listen for workflow events
engine.on('workflow.completed', (event) => {
  eventBus.publish('workflow.completed', {
    workflowId: event.data.execution.workflowId,
    executionId: event.data.execution.id,
    status: event.data.execution.status
  });
});
```

### Sync Integration

```typescript
import { SyncProvider } from '@kits-hub/sync';

// Sync workflow state across clients
const syncProvider = new SyncProvider(supabase, {
  workflows: {
    table: 'workflow_executions',
    realtime: true
  }
});
```

## Error Handling

The workflow system provides comprehensive error handling:

```typescript
try {
  const execution = await engine.executeWorkflow('sale-processing', context);
} catch (error) {
  if (error.message.includes('payment failed')) {
    // Handle payment failure
    await compensationManager.executeCompensation(execution.id);
  } else {
    // Handle other errors
    console.error('Workflow failed:', error);
  }
}
```

## Testing

```typescript
import { WorkflowEngine, WorkflowRegistry, MemoryWorkflowStore } from '@kits-hub/workflow';

describe('Sale Processing Workflow', () => {
  let engine: WorkflowEngine;
  let registry: WorkflowRegistry;
  let store: MemoryWorkflowStore;

  beforeEach(() => {
    store = new MemoryWorkflowStore();
    registry = new WorkflowRegistry();
    engine = new WorkflowEngine(store, registry);
  });

  it('should process a sale successfully', async () => {
    // Setup test
    registry.registerWorkflow(SALE_PROCESSING_WORKFLOW);
    registry.registerAction('process-payment', mockPaymentAction);
    
    // Execute
    const execution = await engine.executeWorkflow('sale-processing', {
      customerId: 'test-customer',
      amount: 100
    });

    // Assert
    expect(execution.status).toBe('completed');
    expect(execution.context.paymentId).toBeDefined();
  });
});
```

## Performance Considerations

- **Parallel Execution**: Use parallel steps for independent operations
- **Timeouts**: Set appropriate timeouts for long-running operations
- **Retry Logic**: Configure retry policies for transient failures
- **Monitoring**: Monitor workflow performance and set up alerts
- **Resource Management**: Clean up resources and avoid memory leaks

## Best Practices

1. **Design for Compensation**: Always consider rollback scenarios
2. **Idempotent Actions**: Make actions idempotent where possible
3. **Timeout Management**: Set reasonable timeouts for all operations
4. **Error Handling**: Implement comprehensive error handling
5. **Monitoring**: Set up monitoring and alerting for production use
6. **Testing**: Test both success and failure scenarios
7. **Documentation**: Document workflow logic and compensation strategies

## License

MIT © KiTS Hub Team
