/**
 * KiTS Hub Integration Core
 * Shared types and interfaces for cross-solution integration
 */

export interface TenantContext {
  tenant_id: string;
  api_key: string;
  timestamp: number;
  signature: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  tenant_id: string;
  timestamp: string;
  signature: string;
  retry_count?: number;
}

export interface IntegrationConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

// Solution-specific data types
export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost?: number;
  category: string;
  current_stock: number;
  reorder_point: number;
  max_stock: number;
  unit: string;
  barcode?: string;
  images?: string[];
  attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  product_id: string;
  quantity: number;
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'return';
  reference_id?: string;
  notes?: string;
  cost_per_unit?: number;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: Address;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Sale {
  id: string;
  tenant_id: string;
  customer_id?: string;
  items: SaleItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'draft' | 'completed' | 'cancelled';
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number;
}

export interface Communication {
  id: string;
  tenant_id: string;
  customer_id: string;
  type: 'email' | 'sms' | 'phone' | 'note';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  metadata?: Record<string, any>;
  created_at: string;
}

// Integration-specific interfaces
export interface ProductFilters {
  category?: string;
  in_stock_only?: boolean;
  price_range?: { min: number; max: number };
  search?: string;
  sort_by?: 'name' | 'price' | 'stock' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface POSFilters extends ProductFilters {
  available_for_sale?: boolean;
}

export interface CustomerFilters {
  search?: string;
  tags?: string[];
  created_after?: string;
  created_before?: string;
}

export interface SaleFilters {
  customer_id?: string;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface StockLevel {
  product_id: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_point: number;
  last_updated: string;
}

export interface StockReservation {
  product_id: string;
  quantity: number;
  expires_at: string;
  reference_id: string;
}

export interface ProductAvailability {
  product_id: string;
  available: boolean;
  stock_level: number;
  next_restock_date?: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors?: Array<{
    product_id: string;
    message: string;
    available_stock?: number;
    requested_quantity?: number;
  }>;
}

export interface PaymentRequest {
  sale_id: string;
  amount: number;
  method: string;
  payment_details: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  payment_id: string;
  transaction_id?: string;
  status: string;
  error?: string;
}

export interface RefundResponse {
  success: boolean;
  refund_id: string;
  amount: number;
  status: string;
  error?: string;
}

// Error codes
export enum IntegrationErrorCode {
  INVALID_TENANT = 'INVALID_TENANT',
  INVALID_API_KEY = 'INVALID_API_KEY',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Event types
export enum WebhookEventType {
  // Product events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  STOCK_UPDATED = 'stock.updated',
  LOW_STOCK_ALERT = 'low_stock.alert',
  OUT_OF_STOCK_ALERT = 'out_of_stock.alert',
  
  // Sale events
  SALE_CREATED = 'sale.created',
  SALE_UPDATED = 'sale.updated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  REFUND_PROCESSED = 'refund.processed',
  
  // Customer events
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  COMMUNICATION_RECORDED = 'communication.recorded',
  PURCHASE_COMPLETED = 'purchase.completed',
  
  // System events
  TENANT_CREATED = 'tenant.created',
  TENANT_UPDATED = 'tenant.updated',
  INTEGRATION_HEALTH_CHECK = 'integration.health_check'
}
