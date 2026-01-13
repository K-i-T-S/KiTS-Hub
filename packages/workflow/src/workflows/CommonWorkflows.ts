import {
  WorkflowDefinition,
  WorkflowStepDefinition,
  StepType,
} from '../types';

// Sale Processing Workflow
export const SALE_PROCESSING_WORKFLOW: WorkflowDefinition = {
  id: 'sale-processing',
  name: 'Sale Processing Workflow',
  version: '1.0.0',
  description: 'Complete sale processing from POS to accounting',
  compensationStrategy: 'sequential',
  retryPolicy: {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
  },
  steps: [
    {
      id: 'validate-sale',
      name: 'validate-sale-data',
      type: StepType.TASK,
      description: 'Validate sale data and customer information',
      compensation: {
        id: 'rollback-validation',
        action: 'cleanup-sale-validation',
      },
      retryPolicy: {
        maxAttempts: 2,
        delay: 500,
        backoffMultiplier: 2,
      },
    },
    {
      id: 'process-payment',
      name: 'process-payment',
      type: StepType.TASK,
      description: 'Process payment through payment gateway',
      compensation: {
        id: 'refund-payment',
        action: 'refund-payment',
      },
      retryPolicy: {
        maxAttempts: 3,
        delay: 2000,
        backoffMultiplier: 2,
      },
    },
    {
      id: 'update-inventory',
      name: 'update-inventory-stock',
      type: StepType.TASK,
      description: 'Update inventory stock levels',
      compensation: {
        id: 'restore-inventory',
        action: 'restore-inventory-stock',
      },
    },
    {
      id: 'create-accounting-entry',
      name: 'create-accounting-transaction',
      type: StepType.TASK,
      description: 'Create accounting transaction entries',
      compensation: {
        id: 'reverse-accounting',
        action: 'reverse-accounting-transaction',
      },
    },
    {
      id: 'generate-receipt',
      name: 'generate-receipt',
      type: StepType.TASK,
      description: 'Generate customer receipt',
      compensation: {
        id: 'cancel-receipt',
        action: 'cancel-receipt',
      },
    },
    {
      id: 'update-loyalty',
      name: 'update-loyalty-points',
      type: StepType.TASK,
      description: 'Update customer loyalty points',
      compensation: {
        id: 'reverse-loyalty',
        action: 'reverse-loyalty-points',
      },
    },
  ],
};

// Inventory Management Workflow
export const INVENTORY_MANAGEMENT_WORKFLOW: WorkflowDefinition = {
  id: 'inventory-management',
  name: 'Inventory Management Workflow',
  version: '1.0.0',
  description: 'Complete inventory management workflow',
  compensationStrategy: 'parallel',
  steps: [
    {
      id: 'check-stock-levels',
      name: 'check-current-stock',
      type: StepType.TASK,
      description: 'Check current stock levels',
    },
    {
      id: 'update-inventory',
      name: 'update-inventory-records',
      type: StepType.PARALLEL,
      description: 'Update inventory records in parallel',
      parallelSteps: [
        {
          id: 'update-main-database',
          name: 'update-main-inventory-db',
          type: StepType.TASK,
          description: 'Update main inventory database',
          compensation: {
            id: 'rollback-main-db',
            action: 'rollback-main-inventory-db',
          },
        },
        {
          id: 'update-cache',
          name: 'update-inventory-cache',
          type: StepType.TASK,
          description: 'Update inventory cache',
          compensation: {
            id: 'clear-cache',
            action: 'clear-inventory-cache',
          },
        },
        {
          id: 'update-analytics',
          name: 'update-analytics-data',
          type: StepType.TASK,
          description: 'Update analytics data',
          compensation: {
            id: 'rollback-analytics',
            action: 'rollback-analytics-data',
          },
        },
      ],
    },
    {
      id: 'check-low-stock',
      name: 'check-low-stock-alerts',
      type: StepType.TASK,
      description: 'Check and trigger low stock alerts',
    },
    {
      id: 'notify-stakeholders',
      name: 'notify-inventory-stakeholders',
      type: StepType.PARALLEL,
      description: 'Notify relevant stakeholders',
      parallelSteps: [
        {
          id: 'notify-purchasing',
          name: 'notify-purchasing-department',
          type: StepType.TASK,
          description: 'Notify purchasing department',
        },
        {
          id: 'notify-warehouse',
          name: 'notify-warehouse-staff',
          type: StepType.TASK,
          description: 'Notify warehouse staff',
        },
        {
          id: 'notify-management',
          name: 'notify-management',
          type: StepType.TASK,
          description: 'Notify management team',
        },
      ],
    },
  ],
};

// Order Fulfillment Workflow
export const ORDER_FULFILLMENT_WORKFLOW: WorkflowDefinition = {
  id: 'order-fulfillment',
  name: 'Order Fulfillment Workflow',
  version: '1.0.0',
  description: 'Complete order fulfillment process',
  compensationStrategy: 'sequential',
  steps: [
    {
      id: 'validate-order',
      name: 'validate-order-details',
      type: StepType.TASK,
      description: 'Validate order details and customer information',
      compensation: {
        id: 'cancel-order-validation',
        action: 'cancel-order-validation',
      },
    },
    {
      id: 'reserve-inventory',
      name: 'reserve-inventory-items',
      type: StepType.TASK,
      description: 'Reserve inventory items for order',
      compensation: {
        id: 'release-inventory',
        action: 'release-inventory-reservation',
      },
    },
    {
      id: 'process-payment',
      name: 'process-order-payment',
      type: StepType.TASK,
      description: 'Process payment for order',
      compensation: {
        id: 'refund-order-payment',
        action: 'refund-order-payment',
      },
    },
    {
      id: 'allocate-warehouse',
      name: 'allocate-warehouse-resources',
      type: StepType.TASK,
      description: 'Allocate warehouse resources for picking and packing',
      compensation: {
        id: 'deallocate-warehouse',
        action: 'deallocate-warehouse-resources',
      },
    },
    {
      id: 'pick-and-pack',
      name: 'pick-and-pack-items',
      type: StepType.SEQUENCE,
      description: 'Pick and pack order items',
      sequenceSteps: [
        {
          id: 'pick-items',
          name: 'pick-order-items',
          type: StepType.TASK,
          description: 'Pick items from warehouse',
          compensation: {
            id: 'return-items',
            action: 'return-items-to-shelf',
          },
        },
        {
          id: 'pack-items',
          name: 'pack-order-items',
          type: StepType.TASK,
          description: 'Pack items for shipping',
          compensation: {
            id: 'unpack-items',
            action: 'unpack-order-items',
          },
        },
        {
          id: 'generate-shipping-label',
          name: 'generate-shipping-label',
          type: StepType.TASK,
          description: 'Generate shipping label',
          compensation: {
            id: 'cancel-shipping-label',
            action: 'cancel-shipping-label',
          },
        },
      ],
    },
    {
      id: 'schedule-shipping',
      name: 'schedule-shipping-pickup',
      type: StepType.TASK,
      description: 'Schedule shipping pickup',
      compensation: {
        id: 'cancel-shipping',
        action: 'cancel-shipping-pickup',
      },
    },
    {
      id: 'update-customer',
      name: 'update-customer-status',
      type: StepType.TASK,
      description: 'Update customer with order status',
      compensation: {
        id: 'revert-customer-notification',
        action: 'revert-customer-notification',
      },
    },
  ],
};

// Employee Onboarding Workflow
export const EMPLOYEE_ONBOARDING_WORKFLOW: WorkflowDefinition = {
  id: 'employee-onboarding',
  name: 'Employee Onboarding Workflow',
  version: '1.0.0',
  description: 'Complete employee onboarding process',
  compensationStrategy: 'sequential',
  steps: [
    {
      id: 'validate-employee-data',
      name: 'validate-employee-information',
      type: StepType.TASK,
      description: 'Validate employee information and documents',
      compensation: {
        id: 'cleanup-employee-data',
        action: 'cleanup-employee-data',
      },
    },
    {
      id: 'create-employee-record',
      name: 'create-employee-record',
      type: StepType.TASK,
      description: 'Create employee record in HR system',
      compensation: {
        id: 'delete-employee-record',
        action: 'delete-employee-record',
      },
    },
    {
      id: 'setup-payroll',
      name: 'setup-payroll-information',
      type: StepType.TASK,
      description: 'Setup payroll information',
      compensation: {
        id: 'cancel-payroll-setup',
        action: 'cancel-payroll-setup',
      },
    },
    {
      id: 'provision-systems',
      name: 'provision-system-access',
      type: StepType.PARALLEL,
      description: 'Provision access to various systems',
      parallelSteps: [
        {
          id: 'setup-email',
          name: 'setup-email-account',
          type: StepType.TASK,
          description: 'Setup email account',
          compensation: {
            id: 'disable-email',
            action: 'disable-email-account',
          },
        },
        {
          id: 'setup-network-access',
          name: 'setup-network-access',
          type: StepType.TASK,
          description: 'Setup network access',
          compensation: {
            id: 'revoke-network-access',
            action: 'revoke-network-access',
          },
        },
        {
          id: 'setup-software-access',
          name: 'setup-software-access',
          type: StepType.TASK,
          description: 'Setup software access',
          compensation: {
            id: 'revoke-software-access',
            action: 'revoke-software-access',
          },
        },
      ],
    },
    {
      id: 'schedule-training',
      name: 'schedule-onboarding-training',
      type: StepType.TASK,
      description: 'Schedule onboarding training sessions',
      compensation: {
        id: 'cancel-training',
        action: 'cancel-training-sessions',
      },
    },
    {
      id: 'assign-equipment',
      name: 'assign-equipment',
      type: StepType.TASK,
      description: 'Assign necessary equipment',
      compensation: {
        id: 'reclaim-equipment',
        action: 'reclaim-assigned-equipment',
      },
    },
    {
      id: 'notify-stakeholders',
      name: 'notify-onboarding-stakeholders',
      type: StepType.PARALLEL,
      description: 'Notify relevant stakeholders',
      parallelSteps: [
        {
          id: 'notify-manager',
          name: 'notify-hiring-manager',
          type: StepType.TASK,
          description: 'Notify hiring manager',
        },
        {
          id: 'notify-it',
          name: 'notify-it-department',
          type: StepType.TASK,
          description: 'Notify IT department',
        },
        {
          id: 'notify-facilities',
          name: 'notify-facilities',
          type: StepType.TASK,
          description: 'Notify facilities team',
        },
      ],
    },
  ],
};

// Financial Reporting Workflow
export const FINANCIAL_REPORTING_WORKFLOW: WorkflowDefinition = {
  id: 'financial-reporting',
  name: 'Financial Reporting Workflow',
  version: '1.0.0',
  description: 'Generate and distribute financial reports',
  compensationStrategy: 'sequential',
  steps: [
    {
      id: 'extract-financial-data',
      name: 'extract-financial-data',
      type: StepType.TASK,
      description: 'Extract financial data from various sources',
      compensation: {
        id: 'cleanup-extracted-data',
        action: 'cleanup-extracted-financial-data',
      },
    },
    {
      id: 'validate-data',
      name: 'validate-financial-data',
      type: StepType.TASK,
      description: 'Validate financial data integrity',
      compensation: {
        id: 'rollback-validation',
        action: 'rollback-financial-data-validation',
      },
    },
    {
      id: 'generate-reports',
      name: 'generate-financial-reports',
      type: StepType.PARALLEL,
      description: 'Generate various financial reports',
      parallelSteps: [
        {
          id: 'generate-income-statement',
          name: 'generate-income-statement',
          type: StepType.TASK,
          description: 'Generate income statement',
          compensation: {
            id: 'delete-income-statement',
            action: 'delete-income-statement',
          },
        },
        {
          id: 'generate-balance-sheet',
          name: 'generate-balance-sheet',
          type: StepType.TASK,
          description: 'Generate balance sheet',
          compensation: {
            id: 'delete-balance-sheet',
            action: 'delete-balance-sheet',
          },
        },
        {
          id: 'generate-cash-flow',
          name: 'generate-cash-flow-statement',
          type: StepType.TASK,
          description: 'Generate cash flow statement',
          compensation: {
            id: 'delete-cash-flow',
            action: 'delete-cash-flow-statement',
          },
        },
      ],
    },
    {
      id: 'review-approvals',
      name: 'management-review-approvals',
      type: StepType.TASK,
      description: 'Get management review and approvals',
      compensation: {
        id: 'withdraw-approvals',
        action: 'withdraw-management-approvals',
      },
    },
    {
      id: 'distribute-reports',
      name: 'distribute-financial-reports',
      type: StepType.PARALLEL,
      description: 'Distribute reports to stakeholders',
      parallelSteps: [
        {
          id: 'email-stakeholders',
          name: 'email-financial-reports',
          type: StepType.TASK,
          description: 'Email reports to stakeholders',
          compensation: {
            id: 'recall-emails',
            action: 'recall-report-emails',
          },
        },
        {
          id: 'upload-portal',
          name: 'upload-to-portal',
          type: StepType.TASK,
          description: 'Upload reports to portal',
          compensation: {
            id: 'remove-from-portal',
            action: 'remove-reports-from-portal',
          },
        },
        {
          id: 'archive-reports',
          name: 'archive-financial-reports',
          type: StepType.TASK,
          description: 'Archive reports for compliance',
          compensation: {
            id: 'delete-archive',
            action: 'delete-report-archive',
          },
        },
      ],
    },
  ],
};

// Customer Support Workflow
export const CUSTOMER_SUPPORT_WORKFLOW: WorkflowDefinition = {
  id: 'customer-support',
  name: 'Customer Support Workflow',
  version: '1.0.0',
  description: 'Handle customer support requests',
  compensationStrategy: 'sequential',
  steps: [
    {
      id: 'receive-request',
      name: 'receive-support-request',
      type: StepType.TASK,
      description: 'Receive and categorize support request',
      compensation: {
        id: 'cancel-request',
        action: 'cancel-support-request',
      },
    },
    {
      id: 'assess-priority',
      name: 'assess-request-priority',
      type: StepType.TASK,
      description: 'Assess request priority and urgency',
    },
    {
      id: 'assign-agent',
      name: 'assign-support-agent',
      type: StepType.TASK,
      description: 'Assign appropriate support agent',
      compensation: {
        id: 'unassign-agent',
        action: 'unassign-support-agent',
      },
    },
    {
      id: 'investigate-issue',
      name: 'investigate-customer-issue',
      type: StepType.TASK,
      description: 'Investigate customer issue',
      compensation: {
        id: 'close-investigation',
        action: 'close-issue-investigation',
      },
    },
    {
      id: 'provide-solution',
      name: 'provide-solution',
      type: StepType.TASK,
      description: 'Provide solution to customer',
      compensation: {
        id: 'retract-solution',
        action: 'retract-provided-solution',
      },
    },
    {
      id: 'follow-up',
      name: 'customer-follow-up',
      type: StepType.TASK,
      description: 'Follow up with customer',
    },
    {
      id: 'close-ticket',
      name: 'close-support-ticket',
      type: StepType.TASK,
      description: 'Close support ticket',
      compensation: {
        id: 'reopen-ticket',
        action: 'reopen-support-ticket',
      },
    },
  ],
};

// Export all workflows as a collection
export const COMMON_WORKFLOWS: WorkflowDefinition[] = [
  SALE_PROCESSING_WORKFLOW,
  INVENTORY_MANAGEMENT_WORKFLOW,
  ORDER_FULFILLMENT_WORKFLOW,
  EMPLOYEE_ONBOARDING_WORKFLOW,
  FINANCIAL_REPORTING_WORKFLOW,
  CUSTOMER_SUPPORT_WORKFLOW,
];

// Helper function to get workflow by ID
export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return COMMON_WORKFLOWS.find(workflow => workflow.id === id);
}

// Helper function to get workflows by category
export function getWorkflowsByCategory(category: string): WorkflowDefinition[] {
  const categoryMap: Record<string, string[]> = {
    sales: ['sale-processing'],
    inventory: ['inventory-management'],
    operations: ['order-fulfillment'],
    hr: ['employee-onboarding'],
    finance: ['financial-reporting'],
    support: ['customer-support'],
  };

  const workflowIds = categoryMap[category] || [];
  return workflowIds.map(id => getWorkflowById(id)).filter(Boolean) as WorkflowDefinition[];
}
