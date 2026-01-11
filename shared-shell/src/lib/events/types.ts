// Event types for cross-solution communication
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  tenantId: string;
  userId: string;
  data: any;
}

// Inventory Events
export interface StockUpdatedEvent extends BaseEvent {
  type: 'stock_updated';
  data: {
    productId: string;
    previousStock: number;
    newStock: number;
    location: string;
    reason: 'sale' | 'adjustment' | 'purchase' | 'return';
  };
}

export interface LowStockAlertEvent extends BaseEvent {
  type: 'low_stock_alert';
  data: {
    productId: string;
    currentStock: number;
    threshold: number;
    productName: string;
    location: string;
  };
}

// Customer Events
export interface CustomerCreatedEvent extends BaseEvent {
  type: 'customer_created';
  data: {
    customerId: string;
    customerData: {
      name: string;
      email: string;
      phone: string;
      address?: string;
    };
    source: 'pos' | 'crm' | 'web' | 'database';
  };
}

export interface CustomerUpdatedEvent extends BaseEvent {
  type: 'customer_updated';
  data: {
    customerId: string;
    previousData: any;
    newData: any;
    changedFields: string[];
  };
}

// Sales Events
export interface SaleProcessedEvent extends BaseEvent {
  type: 'sale_processed';
  data: {
    saleId: string;
    customerId?: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount: number;
    paymentMethod: string;
    location: string;
    cashierId: string;
  };
}

// Financial Events
export interface TransactionRecordedEvent extends BaseEvent {
  type: 'transaction_recorded';
  data: {
    transactionId: string;
    type: 'sale' | 'purchase' | 'refund' | 'expense';
    amount: number;
    accountId: string;
    categoryId: string;
    description: string;
    referenceId?: string;
    referenceType?: 'sale' | 'purchase' | 'other';
  };
}

// Employee Events
export interface EmployeePerformanceUpdatedEvent extends BaseEvent {
  type: 'employee_performance_updated';
  data: {
    employeeId: string;
    metrics: {
      salesTotal?: number;
      salesCount?: number;
      customerSatisfaction?: number;
      attendanceRate?: number;
      productivityScore?: number;
    };
    period: 'daily' | 'weekly' | 'monthly';
  };
}

// Notification Events
export interface NotificationEvent extends BaseEvent {
  type: 'notification';
  data: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    category: 'system' | 'inventory' | 'sales' | 'customer' | 'financial' | 'hr';
    actionUrl?: string;
    requiresAction: boolean;
    targetUsers?: string[];
    targetRoles?: string[];
  };
}

// System Events
export interface SystemHealthEvent extends BaseEvent {
  type: 'system_health';
  data: {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    metrics?: Record<string, any>;
    error?: string;
    originalEventType?: string;
  };
}

// Union type for all events
export type CrossSolutionEvent = 
  | StockUpdatedEvent
  | LowStockAlertEvent
  | CustomerCreatedEvent
  | CustomerUpdatedEvent
  | SaleProcessedEvent
  | TransactionRecordedEvent
  | EmployeePerformanceUpdatedEvent
  | NotificationEvent
  | SystemHealthEvent;

// Event handler type
export type EventHandler<T = CrossSolutionEvent> = (event: T) => void | Promise<void>;

// Event subscription configuration
export interface EventSubscription {
  eventType: string;
  handler: EventHandler;
  source?: string;
  tenantId?: string;
  once?: boolean;
}

// Event bus configuration
export interface EventBusConfig {
  maxEvents?: number;
  enablePersistence?: boolean;
  enableMetrics?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}
