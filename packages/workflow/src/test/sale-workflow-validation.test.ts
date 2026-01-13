import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WorkflowEngine,
  WorkflowRegistry,
  MemoryWorkflowStore,
  SALE_PROCESSING_WORKFLOW,
  createAsyncAction,
  WorkflowStatus,
  StepStatus,
  CompensationManager,
  WorkflowMonitor,
} from '../index';

describe('Sale Processing Workflow Validation', () => {
  let engine: WorkflowEngine;
  let registry: WorkflowRegistry;
  let store: MemoryWorkflowStore;
  let monitor: WorkflowMonitor;
  let compensationManager: CompensationManager;

  // Mock action implementations
  const mockValidateSale = vi.fn();
  const mockProcessPayment = vi.fn();
  const mockUpdateInventory = vi.fn();
  const mockCreateAccountingEntry = vi.fn();
  const mockGenerateReceipt = vi.fn();
  const mockUpdateLoyalty = vi.fn();

  // Mock compensation implementations
  const mockCleanupValidation = vi.fn();
  const mockRefundPayment = vi.fn();
  const mockRestoreInventory = vi.fn();
  const mockReverseAccounting = vi.fn();
  const mockCancelReceipt = vi.fn();
  const mockReverseLoyalty = vi.fn();

  beforeEach(() => {
    // Setup infrastructure
    store = new MemoryWorkflowStore();
    registry = new WorkflowRegistry();
    engine = new WorkflowEngine(store, registry);
    monitor = new WorkflowMonitor(store);
    compensationManager = new CompensationManager(store, registry);

    // Reset mocks
    vi.clearAllMocks();

    // Register mock actions FIRST (before workflow)
    registry.registerAction('validate-sale-data', createAsyncAction(
      'validate-sale-data',
      async (input, context) => {
        mockValidateSale(input, context);
        return { 
          isValid: true, 
          customerId: input.customerId,
          validatedAt: new Date().toISOString()
        };
      },
      async (input, context) => {
        mockCleanupValidation(input, context);
      }
    ));

    registry.registerAction('process-payment', createAsyncAction(
      'process-payment',
      async (input, context) => {
        mockProcessPayment(input, context);
        return { 
          paymentId: `pay_${Date.now()}`,
          status: 'completed',
          amount: input.total,
          processedAt: new Date().toISOString()
        };
      },
      async (input, context) => {
        mockRefundPayment(input, context);
      }
    ));

    registry.registerAction('update-inventory-stock', createAsyncAction(
      'update-inventory-stock',
      async (input, context) => {
        mockUpdateInventory(input, context);
        return { 
          itemsUpdated: input.items?.length || 0,
          stockLevels: 'updated',
          updatedAt: new Date().toISOString()
        };
      },
      async (input, context) => {
        mockRestoreInventory(input, context);
      }
    ));

    registry.registerAction('create-accounting-transaction', createAsyncAction(
      'create-accounting-transaction',
      async (input, context) => {
        mockCreateAccountingEntry(input, context);
        return { 
          transactionId: `txn_${Date.now()}`,
          entries: ['debit', 'credit'],
          postedAt: new Date().toISOString()
        };
      },
      async (input, context) => {
        mockReverseAccounting(input, context);
      }
    ));

    registry.registerAction('generate-receipt', createAsyncAction(
      'generate-receipt',
      async (input, context) => {
        mockGenerateReceipt(input, context);
        return { 
          receiptId: `rcpt_${Date.now()}`,
          receiptUrl: 'https://receipt.example.com/rcpt_123',
          generatedAt: new Date().toISOString()
        };
      },
      async (input, context) => {
        mockCancelReceipt(input, context);
      }
    ));

    registry.registerAction('update-loyalty-points', createAsyncAction(
      'update-loyalty-points',
      async (input, context) => {
        mockUpdateLoyalty(input, context);
        return { 
          pointsEarned: Math.floor(input.total * 0.01), // 1% of total
          totalPoints: 1000,
          updatedAt: new Date().toISOString()
        };
      },
      async (input, context) => {
        mockReverseLoyalty(input, context);
      }
    ));

    // Register compensation actions
    registry.registerAction('cleanup-sale-validation', createAsyncAction(
      'cleanup-sale-validation',
      async (input, context) => {
        mockCleanupValidation(input, context);
        return { cleaned: true };
      }
    ));

    registry.registerAction('refund-payment', createAsyncAction(
      'refund-payment',
      async (input, context) => {
        mockRefundPayment(input, context);
        return { refunded: true };
      }
    ));

    registry.registerAction('restore-inventory-stock', createAsyncAction(
      'restore-inventory-stock',
      async (input, context) => {
        mockRestoreInventory(input, context);
        return { restored: true };
      }
    ));

    registry.registerAction('reverse-accounting-transaction', createAsyncAction(
      'reverse-accounting-transaction',
      async (input, context) => {
        mockReverseAccounting(input, context);
        return { reversed: true };
      }
    ));

    registry.registerAction('cancel-receipt', createAsyncAction(
      'cancel-receipt',
      async (input, context) => {
        mockCancelReceipt(input, context);
        return { cancelled: true };
      }
    ));

    registry.registerAction('reverse-loyalty-points', createAsyncAction(
      'reverse-loyalty-points',
      async (input, context) => {
        mockReverseLoyalty(input, context);
        return { reversed: true };
      }
    ));

    // Register the sale processing workflow AFTER actions
    registry.registerWorkflow(SALE_PROCESSING_WORKFLOW);
  });

  it('should execute complete sale workflow successfully', async () => {
    // Arrange
    const saleContext = {
      customerId: 'cust_12345',
      items: [
        { id: 'item_001', quantity: 2, price: 25.00 },
        { id: 'item_002', quantity: 1, price: 49.99 }
      ],
      total: 99.99,
      paymentMethod: 'credit_card',
      storeId: 'store_001'
    };

    // Act
    const execution = await engine.executeWorkflow('sale-processing', saleContext);

    // Assert workflow execution
    expect(execution.status).toBe(WorkflowStatus.COMPLETED);
    expect(execution.workflowId).toBe('sale-processing');
    expect(execution.endTime).toBeDefined();
    expect(execution.error).toBeUndefined();

    // Assert all steps were executed
    const stepExecutions = await store.getStepExecutions(execution.id);
    expect(stepExecutions).toHaveLength(6);

    // Verify each step completed successfully
    const completedSteps = stepExecutions.filter(s => s.status === StepStatus.COMPLETED);
    expect(completedSteps).toHaveLength(6);

    // Verify step order
    const stepOrder = stepExecutions.map(s => s.stepId);
    expect(stepOrder).toEqual([
      'validate-sale',
      'process-payment',
      'update-inventory',
      'create-accounting-entry',
      'generate-receipt',
      'update-loyalty'
    ]);

    // Verify all actions were called
    expect(mockValidateSale).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'cust_12345', total: 99.99 }),
      expect.any(Object)
    );
    expect(mockProcessPayment).toHaveBeenCalled();
    expect(mockUpdateInventory).toHaveBeenCalled();
    expect(mockCreateAccountingEntry).toHaveBeenCalled();
    expect(mockGenerateReceipt).toHaveBeenCalled();
    expect(mockUpdateLoyalty).toHaveBeenCalled();

    // Verify context was updated with step outputs
    expect(execution.context).toHaveProperty('isValid', true);
    expect(execution.context).toHaveProperty('paymentId');
    expect(execution.context).toHaveProperty('itemsUpdated', 2);
    expect(execution.context).toHaveProperty('transactionId');
    expect(execution.context).toHaveProperty('receiptId');
    expect(execution.context).toHaveProperty('pointsEarned');
  });

  it('should handle payment failure and trigger compensation', async () => {
    // Arrange - make payment fail
    mockProcessPayment.mockRejectedValueOnce(new Error('Payment declined'));

    const saleContext = {
      customerId: 'cust_12345',
      items: [{ id: 'item_001', quantity: 1, price: 50.00 }],
      total: 50.00,
      paymentMethod: 'credit_card'
    };

    // Act & Assert
    await expect(engine.executeWorkflow('sale-processing', saleContext))
      .rejects.toThrow('Payment declined');

    // Verify compensation was triggered for completed steps
    expect(mockCleanupValidation).toHaveBeenCalled();
    expect(mockRefundPayment).not.toHaveBeenCalled(); // Payment failed, so no refund
    expect(mockRestoreInventory).not.toHaveBeenCalled(); // Inventory not updated
  });

  it('should execute compensation when workflow fails mid-execution', async () => {
    // Arrange - make accounting step fail
    mockCreateAccountingEntry.mockRejectedValueOnce(new Error('Accounting system down'));

    const saleContext = {
      customerId: 'cust_12345',
      items: [{ id: 'item_001', quantity: 1, price: 50.00 }],
      total: 50.00,
      paymentMethod: 'credit_card'
    };

    // Act
    let execution;
    try {
      execution = await engine.executeWorkflow('sale-processing', saleContext);
    } catch (error) {
      // Expected to fail
    }

    // Get the failed execution
    const executions = store.getAllExecutions();
    const failedExecution = executions.find(e => e.status === WorkflowStatus.FAILED);
    expect(failedExecution).toBeDefined();

    // Execute compensation
    await compensationManager.executeCompensation(failedExecution!.id);

    // Assert compensation was executed in reverse order
    expect(mockRefundPayment).toHaveBeenCalled();
    expect(mockRestoreInventory).toHaveBeenCalled();
    expect(mockCleanupValidation).toHaveBeenCalled();
    expect(mockReverseAccounting).not.toHaveBeenCalled(); // Accounting step failed
    expect(mockCancelReceipt).not.toHaveBeenCalled(); // Receipt not generated
    expect(mockReverseLoyalty).not.toHaveBeenCalled(); // Loyalty not updated
  });

  it('should track workflow metrics during execution', async () => {
    // Arrange
    monitor.startMonitoring(100); // Update every 100ms

    const saleContext = {
      customerId: 'cust_12345',
      items: [{ id: 'item_001', quantity: 1, price: 50.00 }],
      total: 50.00,
      paymentMethod: 'credit_card'
    };

    // Act
    const execution = await engine.executeWorkflow('sale-processing', saleContext);
    
    // Track the actual execution
    monitor.trackWorkflow(execution.id);

    // Wait for monitoring to update
    await new Promise(resolve => setTimeout(resolve, 200));

    // Assert
    const metrics = monitor.getMetrics(execution.id);
    expect(metrics).toBeDefined();
    expect(metrics!.totalSteps).toBe(6);
    expect(metrics!.completedSteps).toBe(6);
    expect(metrics!.failedSteps).toBe(0);
    expect(metrics!.duration).toBeGreaterThan(0);
    expect(metrics!.retryCount).toBe(0);
    expect(metrics!.compensationCount).toBe(0);

    monitor.stopMonitoring();
  });

  it('should handle retry logic for transient failures', async () => {
    // Arrange - make payment fail twice then succeed
    mockProcessPayment
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockRejectedValueOnce(new Error('Payment gateway busy'))
      .mockResolvedValueOnce({ 
        paymentId: `pay_${Date.now()}`,
        status: 'completed',
        amount: 50.00
      });

    const saleContext = {
      customerId: 'cust_12345',
      items: [{ id: 'item_001', quantity: 1, price: 50.00 }],
      total: 50.00,
      paymentMethod: 'credit_card'
    };

    // Act
    const execution = await engine.executeWorkflow('sale-processing', saleContext);

    // Assert
    expect(execution.status).toBe(WorkflowStatus.COMPLETED);
    expect(mockProcessPayment).toHaveBeenCalledTimes(3); // 2 failures + 1 success

    // Verify step execution shows retry attempts
    const stepExecutions = await store.getStepExecutions(execution.id);
    const paymentStep = stepExecutions.find(s => s.stepId === 'process-payment');
    expect(paymentStep?.attempts).toBe(3);
  });

  it('should validate workflow definition integrity', async () => {
    // Get the workflow definition
    const workflow = registry.getWorkflow('sale-processing');
    expect(workflow).toBeDefined();

    // Verify workflow structure
    expect(workflow!.id).toBe('sale-processing');
    expect(workflow!.name).toBe('Sale Processing Workflow');
    expect(workflow!.version).toBe('1.0.0');
    expect(workflow!.steps).toHaveLength(6);
    expect(workflow!.compensationStrategy).toBe('sequential');

    // Verify each step has compensation defined
    workflow!.steps.forEach(step => {
      expect(step.compensation).toBeDefined();
      expect(step.compensation!.id).toBeDefined();
      expect(step.compensation!.action).toBeDefined();
    });

    // Verify retry policies are defined where appropriate
    const validateStep = workflow!.steps.find(s => s.id === 'validate-sale');
    expect(validateStep?.retryPolicy).toBeDefined();
    expect(validateStep?.retryPolicy?.maxAttempts).toBe(2);

    const paymentStep = workflow!.steps.find(s => s.id === 'process-payment');
    expect(paymentStep?.retryPolicy).toBeDefined();
    expect(paymentStep?.retryPolicy?.maxAttempts).toBe(3);
  });

  it('should maintain workflow execution history', async () => {
    // Arrange
    const saleContext = {
      customerId: 'cust_12345',
      items: [{ id: 'item_001', quantity: 1, price: 50.00 }],
      total: 50.00,
      paymentMethod: 'credit_card'
    };

    // Act - execute multiple workflows
    const execution1 = await engine.executeWorkflow('sale-processing', saleContext);
    const execution2 = await engine.executeWorkflow('sale-processing', { ...saleContext, customerId: 'cust_67890' });

    // Assert execution history
    const allExecutions = store.getAllExecutions();
    expect(allExecutions).toHaveLength(2);

    const completedExecutions = allExecutions.filter(e => e.status === WorkflowStatus.COMPLETED);
    expect(completedExecutions).toHaveLength(2);

    // Verify step execution history
    const steps1 = await store.getStepExecutions(execution1.id);
    const steps2 = await store.getStepExecutions(execution2.id);
    expect(steps1).toHaveLength(6);
    expect(steps2).toHaveLength(6);

    // Verify event history
    const events1 = await store.getEvents(execution1.id);
    const events2 = await store.getEvents(execution2.id);
    expect(events1.length).toBeGreaterThan(0);
    expect(events2.length).toBeGreaterThan(0);

    // Verify workflow events
    const workflowEvents1 = events1.filter(e => e.type.includes('workflow'));
    const workflowEvents2 = events2.filter(e => e.type.includes('workflow'));
    expect(workflowEvents1.length).toBeGreaterThan(0);
    expect(workflowEvents2.length).toBeGreaterThan(0);
  });

  it('should handle concurrent workflow executions', async () => {
    // Arrange
    const saleContext = {
      customerId: 'cust_12345',
      items: [{ id: 'item_001', quantity: 1, price: 50.00 }],
      total: 50.00,
      paymentMethod: 'credit_card'
    };

    // Act - execute multiple workflows concurrently
    const executions = await Promise.all([
      engine.executeWorkflow('sale-processing', { ...saleContext, customerId: 'cust_001' }),
      engine.executeWorkflow('sale-processing', { ...saleContext, customerId: 'cust_002' }),
      engine.executeWorkflow('sale-processing', { ...saleContext, customerId: 'cust_003' }),
    ]);

    // Assert
    expect(executions).toHaveLength(3);
    executions.forEach(execution => {
      expect(execution.status).toBe(WorkflowStatus.COMPLETED);
      expect(execution.context.customerId).toBeDefined();
    });

    // Verify all steps were executed for each workflow
    for (const execution of executions) {
      const steps = await store.getStepExecutions(execution.id);
      expect(steps).toHaveLength(6);
      const completedSteps = steps.filter(s => s.status === StepStatus.COMPLETED);
      expect(completedSteps).toHaveLength(6);
    }
  });

  it('should validate business logic consistency', async () => {
    // Arrange
    const saleContext = {
      customerId: 'cust_12345',
      items: [
        { id: 'item_001', quantity: 2, price: 25.00 },
        { id: 'item_002', quantity: 1, price: 49.99 }
      ],
      total: 99.99,
      paymentMethod: 'credit_card'
    };

    // Act
    const execution = await engine.executeWorkflow('sale-processing', saleContext);

    // Assert business logic consistency
    expect(execution.context.isValid).toBe(true);
    expect(execution.context.paymentId).toMatch(/^pay_\d+$/);
    expect(execution.context.itemsUpdated).toBe(2); // Number of unique items
    expect(execution.context.transactionId).toMatch(/^txn_\d+$/);
    expect(execution.context.receiptId).toMatch(/^rcpt_\d+$/);
    expect(execution.context.pointsEarned).toBe(Math.floor(99.99 * 0.01)); // 1% of total
    expect(execution.context.pointsEarned).toBe(0); // Math.floor(0.9999) = 0

    // Verify payment amount matches total
    expect(mockProcessPayment).toHaveBeenCalledWith(
      expect.objectContaining({ total: 99.99 }),
      expect.any(Object)
    );

    // Verify loyalty points calculation
    expect(mockUpdateLoyalty).toHaveBeenCalledWith(
      expect.objectContaining({ total: 99.99 }),
      expect.any(Object)
    );
  });
});
