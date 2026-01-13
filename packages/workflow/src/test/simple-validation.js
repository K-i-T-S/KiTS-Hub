import { 
  WorkflowEngine, 
  WorkflowRegistry, 
  MemoryWorkflowStore,
  SALE_PROCESSING_WORKFLOW,
  createAsyncAction
} from '../index.js';

// Mock implementations
const mockValidateSale = async (input, context) => {
  console.log('Validating sale:', input);
  return { 
    isValid: true, 
    customerId: input.customerId,
    validatedAt: new Date().toISOString()
  };
};

const mockProcessPayment = async (input, context) => {
  console.log('Processing payment:', input);
  return { 
    paymentId: `pay_${Date.now()}`,
    status: 'completed',
    amount: input.total,
    processedAt: new Date().toISOString()
  };
};

const mockUpdateInventory = async (input, context) => {
  console.log('Updating inventory:', input);
  return { 
    itemsUpdated: input.items?.length || 0,
    stockLevels: 'updated',
    updatedAt: new Date().toISOString()
  };
};

const mockCreateAccountingEntry = async (input, context) => {
  console.log('Creating accounting entry:', input);
  return { 
    transactionId: `txn_${Date.now()}`,
    entries: ['debit', 'credit'],
    postedAt: new Date().toISOString()
  };
};

const mockGenerateReceipt = async (input, context) => {
  console.log('Generating receipt:', input);
  return { 
    receiptId: `rcpt_${Date.now()}`,
    receiptUrl: 'https://receipt.example.com/rcpt_123',
    generatedAt: new Date().toISOString()
  };
};

const mockUpdateLoyalty = async (input, context) => {
  console.log('Updating loyalty points:', input);
  return { 
    pointsEarned: Math.floor(input.total * 0.01),
    totalPoints: 1000,
    updatedAt: new Date().toISOString()
  };
};

async function runValidation() {
  console.log('🚀 Starting Sale Workflow Validation');
  
  try {
    // Setup infrastructure
    const store = new MemoryWorkflowStore();
    const registry = new WorkflowRegistry();
    const engine = new WorkflowEngine(store, registry);

    // Register actions
    registry.registerAction('validate-sale-data', createAsyncAction(
      'validate-sale-data',
      mockValidateSale
    ));

    registry.registerAction('process-payment', createAsyncAction(
      'process-payment',
      mockProcessPayment
    ));

    registry.registerAction('update-inventory-stock', createAsyncAction(
      'update-inventory-stock',
      mockUpdateInventory
    ));

    registry.registerAction('create-accounting-transaction', createAsyncAction(
      'create-accounting-transaction',
      mockCreateAccountingEntry
    ));

    registry.registerAction('generate-receipt', createAsyncAction(
      'generate-receipt',
      mockGenerateReceipt
    ));

    registry.registerAction('update-loyalty-points', createAsyncAction(
      'update-loyalty-points',
      mockUpdateLoyalty
    ));

    // Register compensation actions
    registry.registerAction('cleanup-sale-validation', createAsyncAction(
      'cleanup-sale-validation',
      async (input, context) => {
        console.log('Cleaning up validation');
        return { cleaned: true };
      }
    ));

    registry.registerAction('refund-payment', createAsyncAction(
      'refund-payment',
      async (input, context) => {
        console.log('Refunding payment');
        return { refunded: true };
      }
    ));

    registry.registerAction('restore-inventory-stock', createAsyncAction(
      'restore-inventory-stock',
      async (input, context) => {
        console.log('Restoring inventory');
        return { restored: true };
      }
    ));

    registry.registerAction('reverse-accounting-transaction', createAsyncAction(
      'reverse-accounting-transaction',
      async (input, context) => {
        console.log('Reversing accounting transaction');
        return { reversed: true };
      }
    ));

    registry.registerAction('cancel-receipt', createAsyncAction(
      'cancel-receipt',
      async (input, context) => {
        console.log('Cancelling receipt');
        return { cancelled: true };
      }
    ));

    registry.registerAction('reverse-loyalty-points', createAsyncAction(
      'reverse-loyalty-points',
      async (input, context) => {
        console.log('Reversing loyalty points');
        return { reversed: true };
      }
    ));

    // Register workflow
    registry.registerWorkflow(SALE_PROCESSING_WORKFLOW);

    // Prepare sale context
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

    console.log('📦 Sale Context:', JSON.stringify(saleContext, null, 2));

    // Execute workflow
    console.log('⚡ Executing sale processing workflow...');
    const execution = await engine.executeWorkflow('sale-processing', saleContext);

    console.log('✅ Workflow completed successfully!');
    console.log('📊 Execution Results:');
    console.log(`  - ID: ${execution.id}`);
    console.log(`  - Status: ${execution.status}`);
    console.log(`  - Duration: ${execution.endTime ? execution.endTime.getTime() - execution.startTime.getTime() : 0}ms`);
    console.log(`  - Context Keys: ${Object.keys(execution.context)}`);

    // Verify context was updated
    console.log('🔍 Context Validation:');
    console.log(`  - isValid: ${execution.context.isValid}`);
    console.log(`  - paymentId: ${execution.context.paymentId}`);
    console.log(`  - itemsUpdated: ${execution.context.itemsUpdated}`);
    console.log(`  - transactionId: ${execution.context.transactionId}`);
    console.log(`  - receiptId: ${execution.context.receiptId}`);
    console.log(`  - pointsEarned: ${execution.context.pointsEarned}`);

    // Get step executions
    const stepExecutions = await store.getStepExecutions(execution.id);
    console.log('📋 Step Executions:');
    stepExecutions.forEach(step => {
      console.log(`  - ${step.stepId}: ${step.status} (${step.endTime ? step.endTime.getTime() - step.startTime.getTime() : 0}ms)`);
      if (step.output) {
        console.log(`    Output: ${JSON.stringify(step.output)}`);
      }
    });

    // Validation checks
    const validations = {
      workflowCompleted: execution.status === 'completed',
      hasValidation: execution.context.isValid === true,
      hasPaymentId: !!execution.context.paymentId,
      hasItemsUpdated: execution.context.itemsUpdated === 2,
      hasTransactionId: !!execution.context.transactionId,
      hasReceiptId: !!execution.context.receiptId,
      hasPointsEarned: typeof execution.context.pointsEarned === 'number',
      allStepsCompleted: stepExecutions.every(s => s.status === 'completed')
    };

    console.log('✅ Validation Results:');
    Object.entries(validations).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value ? '✅ PASS' : '❌ FAIL'}`);
    });

    const allPassed = Object.values(validations).every(v => v === true);
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (allPassed) {
      console.log('\n🎉 Sale workflow validation completed successfully!');
      console.log('🚀 The complete sale workflow is working as expected.');
    } else {
      console.log('\n⚠️  Some validation checks failed. Please review the implementation.');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the validation
runValidation();
