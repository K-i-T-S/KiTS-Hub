import { z } from 'zod';
export declare const BaseEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    source: z.ZodString;
    timestamp: z.ZodDate;
    version: z.ZodDefault<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    causationId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    data: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    source: string;
    timestamp: Date;
    version: string;
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    data?: any;
}, {
    id: string;
    type: string;
    source: string;
    timestamp: Date;
    version?: string | undefined;
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    data?: any;
}>;
export type BaseEvent = z.infer<typeof BaseEventSchema>;
export declare enum EventTypes {
    POS_SALE_CREATED = "pos.sale.created",
    POS_SALE_COMPLETED = "pos.sale.completed",
    POS_SALE_CANCELLED = "pos.sale.cancelled",
    POS_PAYMENT_RECEIVED = "pos.payment.received",
    POS_REFUND_PROCESSED = "pos.refund.processed",
    INVENTORY_ITEM_CREATED = "inventory.item.created",
    INVENTORY_ITEM_UPDATED = "inventory.item.updated",
    INVENTORY_ITEM_DELETED = "inventory.item.deleted",
    INVENTORY_STOCK_ADDED = "inventory.stock.added",
    INVENTORY_STOCK_REMOVED = "inventory.stock.removed",
    INVENTORY_STOCK_ADJUSTED = "inventory.stock.adjusted",
    INVENTORY_LOW_STOCK_ALERT = "inventory.low_stock.alert",
    INVENTORY_STOCK_TRANSFERRED = "inventory.stock.transferred",
    ACCOUNTING_TRANSACTION_CREATED = "accounting.transaction.created",
    ACCOUNTING_TRANSACTION_UPDATED = "accounting.transaction.updated",
    ACCOUNTING_INVOICE_CREATED = "accounting.invoice.created",
    ACCOUNTING_INVOICE_PAID = "accounting.invoice.paid",
    ACCOUNTING_PAYMENT_RECORDED = "accounting.payment.recorded",
    ACCOUNTING_JOURNAL_ENTRY_CREATED = "accounting.journal_entry.created",
    CRM_CUSTOMER_CREATED = "crm.customer.created",
    CRM_CUSTOMER_UPDATED = "crm.customer.updated",
    CRM_CONTACT_CREATED = "crm.contact.created",
    CRM_OPPORTUNITY_CREATED = "crm.opportunity.created",
    CRM_LEAD_CONVERTED = "crm.lead.converted",
    HR_EMPLOYEE_CREATED = "hr.employee.created",
    HR_EMPLOYEE_UPDATED = "hr.employee.updated",
    HR_PAYROLL_PROCESSED = "hr.payroll.processed",
    HR_LEAVE_REQUESTED = "hr.leave.requested",
    HR_LEAVE_APPROVED = "hr.leave.approved",
    ANALYTICS_REPORT_GENERATED = "analytics.report.generated",
    ANALYTICS_DASHBOARD_VIEWED = "analytics.dashboard.viewed",
    ANALYTICS_METRIC_CALCULATED = "analytics.metric.calculated",
    SYSTEM_USER_CREATED = "system.user.created",
    SYSTEM_USER_UPDATED = "system.user.updated",
    SYSTEM_TENANT_CREATED = "system.tenant.created",
    SYSTEM_AUDIT_LOG_CREATED = "system.audit_log.created"
}
export declare const POSSaleEventSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    timestamp: z.ZodDate;
    version: z.ZodDefault<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    causationId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
} & {
    type: z.ZodLiteral<EventTypes.POS_SALE_CREATED>;
    data: z.ZodObject<{
        saleId: z.ZodString;
        customerId: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            totalPrice: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }, {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }>, "many">;
        totalAmount: z.ZodNumber;
        taxAmount: z.ZodNumber;
        discountAmount: z.ZodDefault<z.ZodNumber>;
        paymentMethod: z.ZodString;
        locationId: z.ZodString;
        employeeId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        saleId: string;
        items: {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        totalAmount: number;
        taxAmount: number;
        discountAmount: number;
        paymentMethod: string;
        locationId: string;
        employeeId: string;
        customerId?: string | undefined;
    }, {
        saleId: string;
        items: {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        totalAmount: number;
        taxAmount: number;
        paymentMethod: string;
        locationId: string;
        employeeId: string;
        customerId?: string | undefined;
        discountAmount?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: EventTypes.POS_SALE_CREATED;
    source: string;
    timestamp: Date;
    version: string;
    data: {
        saleId: string;
        items: {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        totalAmount: number;
        taxAmount: number;
        discountAmount: number;
        paymentMethod: string;
        locationId: string;
        employeeId: string;
        customerId?: string | undefined;
    };
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    type: EventTypes.POS_SALE_CREATED;
    source: string;
    timestamp: Date;
    data: {
        saleId: string;
        items: {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        totalAmount: number;
        taxAmount: number;
        paymentMethod: string;
        locationId: string;
        employeeId: string;
        customerId?: string | undefined;
        discountAmount?: number | undefined;
    };
    version?: string | undefined;
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const InventoryStockEventSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    timestamp: z.ZodDate;
    version: z.ZodDefault<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    causationId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
} & {
    type: z.ZodLiteral<EventTypes.INVENTORY_STOCK_REMOVED>;
    data: z.ZodObject<{
        productId: z.ZodString;
        locationId: z.ZodString;
        quantity: z.ZodNumber;
        reason: z.ZodString;
        previousStock: z.ZodNumber;
        newStock: z.ZodNumber;
        referenceId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        locationId: string;
        reason: string;
        previousStock: number;
        newStock: number;
        referenceId?: string | undefined;
    }, {
        productId: string;
        quantity: number;
        locationId: string;
        reason: string;
        previousStock: number;
        newStock: number;
        referenceId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: EventTypes.INVENTORY_STOCK_REMOVED;
    source: string;
    timestamp: Date;
    version: string;
    data: {
        productId: string;
        quantity: number;
        locationId: string;
        reason: string;
        previousStock: number;
        newStock: number;
        referenceId?: string | undefined;
    };
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    type: EventTypes.INVENTORY_STOCK_REMOVED;
    source: string;
    timestamp: Date;
    data: {
        productId: string;
        quantity: number;
        locationId: string;
        reason: string;
        previousStock: number;
        newStock: number;
        referenceId?: string | undefined;
    };
    version?: string | undefined;
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const AccountingTransactionEventSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    timestamp: z.ZodDate;
    version: z.ZodDefault<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    causationId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
} & {
    type: z.ZodLiteral<EventTypes.ACCOUNTING_TRANSACTION_CREATED>;
    data: z.ZodObject<{
        transactionId: z.ZodString;
        transactionType: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        description: z.ZodString;
        entries: z.ZodArray<z.ZodObject<{
            accountId: z.ZodString;
            debitAmount: z.ZodDefault<z.ZodNumber>;
            creditAmount: z.ZodDefault<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            accountId: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
        }, {
            accountId: string;
            description?: string | undefined;
            debitAmount?: number | undefined;
            creditAmount?: number | undefined;
        }>, "many">;
        referenceId: z.ZodOptional<z.ZodString>;
        referenceType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        entries: {
            accountId: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
        }[];
        transactionId: string;
        transactionType: string;
        amount: number;
        currency: string;
        description: string;
        referenceId?: string | undefined;
        referenceType?: string | undefined;
    }, {
        entries: {
            accountId: string;
            description?: string | undefined;
            debitAmount?: number | undefined;
            creditAmount?: number | undefined;
        }[];
        transactionId: string;
        transactionType: string;
        amount: number;
        description: string;
        referenceId?: string | undefined;
        currency?: string | undefined;
        referenceType?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: EventTypes.ACCOUNTING_TRANSACTION_CREATED;
    source: string;
    timestamp: Date;
    version: string;
    data: {
        entries: {
            accountId: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
        }[];
        transactionId: string;
        transactionType: string;
        amount: number;
        currency: string;
        description: string;
        referenceId?: string | undefined;
        referenceType?: string | undefined;
    };
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    type: EventTypes.ACCOUNTING_TRANSACTION_CREATED;
    source: string;
    timestamp: Date;
    data: {
        entries: {
            accountId: string;
            description?: string | undefined;
            debitAmount?: number | undefined;
            creditAmount?: number | undefined;
        }[];
        transactionId: string;
        transactionType: string;
        amount: number;
        description: string;
        referenceId?: string | undefined;
        currency?: string | undefined;
        referenceType?: string | undefined;
    };
    version?: string | undefined;
    correlationId?: string | undefined;
    causationId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export interface EventHandler<T extends BaseEvent = BaseEvent> {
    (event: T): Promise<void> | void;
}
export interface EventMiddleware<T extends BaseEvent = BaseEvent> {
    (event: T, next: () => void | Promise<void>): void | Promise<void>;
}
export interface SubscriptionOptions {
    once?: boolean;
    priority?: number;
    filter?: (event: BaseEvent) => boolean;
}
export interface EventBusConfig {
    enablePersistence?: boolean;
    enableMetrics?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    middleware?: EventMiddleware[];
}
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
export interface EventMetrics {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySource: Record<string, number>;
    averageProcessingTime: number;
    errorCount: number;
}
export declare function isPOSSaleEvent(event: BaseEvent): event is z.infer<typeof POSSaleEventSchema>;
export declare function isInventoryStockEvent(event: BaseEvent): event is z.infer<typeof InventoryStockEventSchema>;
export declare function isAccountingTransactionEvent(event: BaseEvent): event is z.infer<typeof AccountingTransactionEventSchema>;
