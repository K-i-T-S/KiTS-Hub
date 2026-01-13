import { z } from 'zod';

// Base event schema
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  source: z.string(),
  timestamp: z.date(),
  version: z.string().default('1.0'),
  correlationId: z.string().uuid().optional(),
  causationId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  data: z.any().optional(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;

// Event types for different solutions
export enum EventTypes {
  // POS Events
  POS_SALE_CREATED = 'pos.sale.created',
  POS_SALE_COMPLETED = 'pos.sale.completed',
  POS_SALE_CANCELLED = 'pos.sale.cancelled',
  POS_PAYMENT_RECEIVED = 'pos.payment.received',
  POS_REFUND_PROCESSED = 'pos.refund.processed',
  
  // Inventory Events
  INVENTORY_ITEM_CREATED = 'inventory.item.created',
  INVENTORY_ITEM_UPDATED = 'inventory.item.updated',
  INVENTORY_ITEM_DELETED = 'inventory.item.deleted',
  INVENTORY_STOCK_ADDED = 'inventory.stock.added',
  INVENTORY_STOCK_REMOVED = 'inventory.stock.removed',
  INVENTORY_STOCK_ADJUSTED = 'inventory.stock.adjusted',
  INVENTORY_LOW_STOCK_ALERT = 'inventory.low_stock.alert',
  INVENTORY_STOCK_TRANSFERRED = 'inventory.stock.transferred',
  
  // Accounting Events
  ACCOUNTING_TRANSACTION_CREATED = 'accounting.transaction.created',
  ACCOUNTING_TRANSACTION_UPDATED = 'accounting.transaction.updated',
  ACCOUNTING_INVOICE_CREATED = 'accounting.invoice.created',
  ACCOUNTING_INVOICE_PAID = 'accounting.invoice.paid',
  ACCOUNTING_PAYMENT_RECORDED = 'accounting.payment.recorded',
  ACCOUNTING_JOURNAL_ENTRY_CREATED = 'accounting.journal_entry.created',
  
  // CRM Events
  CRM_CUSTOMER_CREATED = 'crm.customer.created',
  CRM_CUSTOMER_UPDATED = 'crm.customer.updated',
  CRM_CONTACT_CREATED = 'crm.contact.created',
  CRM_OPPORTUNITY_CREATED = 'crm.opportunity.created',
  CRM_LEAD_CONVERTED = 'crm.lead.converted',
  
  // HR Events
  HR_EMPLOYEE_CREATED = 'hr.employee.created',
  HR_EMPLOYEE_UPDATED = 'hr.employee.updated',
  HR_PAYROLL_PROCESSED = 'hr.payroll.processed',
  HR_LEAVE_REQUESTED = 'hr.leave.requested',
  HR_LEAVE_APPROVED = 'hr.leave.approved',
  
  // Analytics Events
  ANALYTICS_REPORT_GENERATED = 'analytics.report.generated',
  ANALYTICS_DASHBOARD_VIEWED = 'analytics.dashboard.viewed',
  ANALYTICS_METRIC_CALCULATED = 'analytics.metric.calculated',
  
  // System Events
  SYSTEM_USER_CREATED = 'system.user.created',
  SYSTEM_USER_UPDATED = 'system.user.updated',
  SYSTEM_TENANT_CREATED = 'system.tenant.created',
  SYSTEM_AUDIT_LOG_CREATED = 'system.audit_log.created',
}

// Solution-specific event data schemas
export const POSSaleEventSchema = BaseEventSchema.extend({
  type: z.literal(EventTypes.POS_SALE_CREATED),
  data: z.object({
    saleId: z.string(),
    customerId: z.string().optional(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })),
    totalAmount: z.number(),
    taxAmount: z.number(),
    discountAmount: z.number().default(0),
    paymentMethod: z.string(),
    locationId: z.string(),
    employeeId: z.string(),
  }),
});

export const InventoryStockEventSchema = BaseEventSchema.extend({
  type: z.literal(EventTypes.INVENTORY_STOCK_REMOVED),
  data: z.object({
    productId: z.string(),
    locationId: z.string(),
    quantity: z.number(),
    reason: z.string(),
    previousStock: z.number(),
    newStock: z.number(),
    referenceId: z.string().optional(), // e.g., sale ID
  }),
});

export const AccountingTransactionEventSchema = BaseEventSchema.extend({
  type: z.literal(EventTypes.ACCOUNTING_TRANSACTION_CREATED),
  data: z.object({
    transactionId: z.string(),
    transactionType: z.string(), // 'sale', 'purchase', 'adjustment', etc.
    amount: z.number(),
    currency: z.string().default('USD'),
    description: z.string(),
    entries: z.array(z.object({
      accountId: z.string(),
      debitAmount: z.number().default(0),
      creditAmount: z.number().default(0),
      description: z.string().optional(),
    })),
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
  }),
});

// Event handler interface
export interface EventHandler<T extends BaseEvent = BaseEvent> {
  (event: T): Promise<void> | void;
}

// Event middleware interface
export interface EventMiddleware<T extends BaseEvent = BaseEvent> {
  (event: T, next: () => void | Promise<void>): void | Promise<void>;
}

// Event subscription options
export interface SubscriptionOptions {
  once?: boolean;
  priority?: number;
  filter?: (event: BaseEvent) => boolean;
}

// Event bus configuration
export interface EventBusConfig {
  enablePersistence?: boolean;
  enableMetrics?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  middleware?: EventMiddleware[];
}

// Event store interface for persistence
export interface EventStore {
  save(event: BaseEvent): Promise<void>;
  getEvents(filter?: {
    type?: string;
    source?: string;
    fromDate?: Date;
    toDate?: Date;
    correlationId?: string;
  }): Promise<BaseEvent[]>;
  getEvent(id: string): Promise<BaseEvent | null>;
}

// Event metrics
export interface EventMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySource: Record<string, number>;
  averageProcessingTime: number;
  errorCount: number;
}

// Type guards
export function isPOSSaleEvent(event: BaseEvent): event is z.infer<typeof POSSaleEventSchema> {
  return event.type === EventTypes.POS_SALE_CREATED;
}

export function isInventoryStockEvent(event: BaseEvent): event is z.infer<typeof InventoryStockEventSchema> {
  return event.type === EventTypes.INVENTORY_STOCK_REMOVED;
}

export function isAccountingTransactionEvent(event: BaseEvent): event is z.infer<typeof AccountingTransactionEventSchema> {
  return event.type === EventTypes.ACCOUNTING_TRANSACTION_CREATED;
}
