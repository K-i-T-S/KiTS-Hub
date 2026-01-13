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
// Event types for different solutions
export var EventTypes;
(function (EventTypes) {
    // POS Events
    EventTypes["POS_SALE_CREATED"] = "pos.sale.created";
    EventTypes["POS_SALE_COMPLETED"] = "pos.sale.completed";
    EventTypes["POS_SALE_CANCELLED"] = "pos.sale.cancelled";
    EventTypes["POS_PAYMENT_RECEIVED"] = "pos.payment.received";
    EventTypes["POS_REFUND_PROCESSED"] = "pos.refund.processed";
    // Inventory Events
    EventTypes["INVENTORY_ITEM_CREATED"] = "inventory.item.created";
    EventTypes["INVENTORY_ITEM_UPDATED"] = "inventory.item.updated";
    EventTypes["INVENTORY_ITEM_DELETED"] = "inventory.item.deleted";
    EventTypes["INVENTORY_STOCK_ADDED"] = "inventory.stock.added";
    EventTypes["INVENTORY_STOCK_REMOVED"] = "inventory.stock.removed";
    EventTypes["INVENTORY_STOCK_ADJUSTED"] = "inventory.stock.adjusted";
    EventTypes["INVENTORY_LOW_STOCK_ALERT"] = "inventory.low_stock.alert";
    EventTypes["INVENTORY_STOCK_TRANSFERRED"] = "inventory.stock.transferred";
    // Accounting Events
    EventTypes["ACCOUNTING_TRANSACTION_CREATED"] = "accounting.transaction.created";
    EventTypes["ACCOUNTING_TRANSACTION_UPDATED"] = "accounting.transaction.updated";
    EventTypes["ACCOUNTING_INVOICE_CREATED"] = "accounting.invoice.created";
    EventTypes["ACCOUNTING_INVOICE_PAID"] = "accounting.invoice.paid";
    EventTypes["ACCOUNTING_PAYMENT_RECORDED"] = "accounting.payment.recorded";
    EventTypes["ACCOUNTING_JOURNAL_ENTRY_CREATED"] = "accounting.journal_entry.created";
    // CRM Events
    EventTypes["CRM_CUSTOMER_CREATED"] = "crm.customer.created";
    EventTypes["CRM_CUSTOMER_UPDATED"] = "crm.customer.updated";
    EventTypes["CRM_CONTACT_CREATED"] = "crm.contact.created";
    EventTypes["CRM_OPPORTUNITY_CREATED"] = "crm.opportunity.created";
    EventTypes["CRM_LEAD_CONVERTED"] = "crm.lead.converted";
    // HR Events
    EventTypes["HR_EMPLOYEE_CREATED"] = "hr.employee.created";
    EventTypes["HR_EMPLOYEE_UPDATED"] = "hr.employee.updated";
    EventTypes["HR_PAYROLL_PROCESSED"] = "hr.payroll.processed";
    EventTypes["HR_LEAVE_REQUESTED"] = "hr.leave.requested";
    EventTypes["HR_LEAVE_APPROVED"] = "hr.leave.approved";
    // Analytics Events
    EventTypes["ANALYTICS_REPORT_GENERATED"] = "analytics.report.generated";
    EventTypes["ANALYTICS_DASHBOARD_VIEWED"] = "analytics.dashboard.viewed";
    EventTypes["ANALYTICS_METRIC_CALCULATED"] = "analytics.metric.calculated";
    // System Events
    EventTypes["SYSTEM_USER_CREATED"] = "system.user.created";
    EventTypes["SYSTEM_USER_UPDATED"] = "system.user.updated";
    EventTypes["SYSTEM_TENANT_CREATED"] = "system.tenant.created";
    EventTypes["SYSTEM_AUDIT_LOG_CREATED"] = "system.audit_log.created";
})(EventTypes || (EventTypes = {}));
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
// Type guards
export function isPOSSaleEvent(event) {
    return event.type === EventTypes.POS_SALE_CREATED;
}
export function isInventoryStockEvent(event) {
    return event.type === EventTypes.INVENTORY_STOCK_REMOVED;
}
export function isAccountingTransactionEvent(event) {
    return event.type === EventTypes.ACCOUNTING_TRANSACTION_CREATED;
}
