// KiTS Inventory Management Types
// Standalone SaaS solution with integration capabilities

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  unit?: string;
  cost: number;
  price: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  tags?: string[];
  is_active: boolean;
  track_inventory: boolean;
  track_batches: boolean;
  allow_partial_sales: boolean;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  reorder_quantity: number;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  supplier_name?: string;
  current_stock?: number;
  stock_value?: number;
  low_stock?: boolean;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  barcode?: string;
  attributes: Record<string, string>;
  cost: number;
  price: number;
  weight?: number;
  stock: number;
  reorder_level: number;
  cost_history: CostHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface CostHistoryEntry {
  date: string;
  cost: number;
  quantity: number;
  supplier?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  lead_time_days?: number;
  min_order_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  location_type?: 'warehouse' | 'store' | 'storage';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  tenant_id: string;
  product_id: string;
  variant_id?: string;
  location_id?: string;
  batch_id?: string;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer_in' | 'transfer_out';
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  // Joined fields
  product_name?: string;
  location_name?: string;
  batch_number?: string;
}

export interface ProductBatch {
  id: string;
  tenant_id: string;
  product_id: string;
  location_id: string;
  batch_number: string;
  supplier_id?: string;
  quantity: number;
  quantity_reserved: number;
  quantity_available: number;
  unit_cost: number;
  manufacture_date?: string;
  expiration_date?: string;
  received_date: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  product_name?: string;
  location_name?: string;
  supplier_name?: string;
}

export interface PurchaseOrder {
  id: string;
  tenant_id: string;
  supplier_id: string;
  location_id?: string;
  order_number: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  order_date: string;
  expected_date?: string;
  received_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_terms?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  supplier_name?: string;
  location_name?: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  batch_number?: string;
  manufacture_date?: string;
  expiration_date?: string;
  notes?: string;
  created_at: string;
  // Joined fields
  product_name?: string;
  product_sku?: string;
}

export interface StockTransfer {
  id: string;
  tenant_id: string;
  transfer_number: string;
  from_location_id: string;
  to_location_id: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  transfer_date: string;
  completed_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  from_location_name?: string;
  to_location_name?: string;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  stock_transfer_id: string;
  product_id: string;
  batch_id?: string;
  quantity: number;
  notes?: string;
  created_at: string;
  // Joined fields
  product_name?: string;
  product_sku?: string;
  batch_number?: string;
}

export interface InventorySettings {
  id: string;
  tenant_id: string;
  track_batches: boolean;
  track_expiration: boolean;
  default_location_id?: string;
  auto_reserve_stock: boolean;
  allow_partial_sales: boolean;
  enforce_fifo: boolean;
  expiration_warning_days: number;
  low_stock_alert_enabled: boolean;
  reorder_alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryAlert {
  id: string;
  tenant_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired';
  product_id: string;
  location_id?: string;
  batch_id?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_read: boolean;
  created_at: string;
  // Joined fields
  product_name?: string;
  location_name?: string;
  batch_number?: string;
}

export interface InventoryStats {
  total_products: number;
  total_variants: number;
  total_stock_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  expiring_items: number;
  expired_items: number;
  pending_purchase_orders: number;
  pending_transfers: number;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  supplier_id?: string;
  location_id?: string;
  low_stock_only?: boolean;
  out_of_stock_only?: boolean;
  expiring_only?: boolean;
  track_batches_only?: boolean;
  is_active?: boolean;
}

export interface CreateProductForm {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  unit?: string;
  cost: number;
  price: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  track_inventory: boolean;
  track_batches: boolean;
  allow_partial_sales: boolean;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  reorder_quantity: number;
  supplier_id?: string;
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateProductForm extends Partial<CreateProductForm> {
  id: string;
}

export interface CreateSupplierForm {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  lead_time_days?: number;
  min_order_amount?: number;
}

export interface CreateLocationForm {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  location_type?: 'warehouse' | 'store' | 'storage';
}

export interface CreatePurchaseOrderForm {
  supplier_id: string;
  location_id?: string;
  expected_date?: string;
  payment_terms?: string;
  notes?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'created_at'>[];
}

export interface CreateStockTransferForm {
  from_location_id: string;
  to_location_id: string;
  notes?: string;
  items: Omit<StockTransferItem, 'id' | 'stock_transfer_id' | 'created_at'>[];
}

export interface StockAdjustmentForm {
  product_id: string;
  variant_id?: string;
  location_id?: string;
  batch_id?: string;
  adjustment_type: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  notes?: string;
}

// Integration API types for cross-solution communication
export interface InventoryIntegrationAPI {
  // POS Integration
  getProductsForPOS: (filters?: { category?: string; in_stock_only?: boolean }) => Promise<Product[]>;
  updateStockFromSale: (saleItems: { product_id: string; variant_id?: string; quantity: number }[]) => Promise<void>;
  reserveStockForOrder: (orderItems: { product_id: string; variant_id?: string; quantity: number }[]) => Promise<void>;
  releaseReservedStock: (orderItems: { product_id: string; variant_id?: string; quantity: number }[]) => Promise<void>;
  
  // Analytics Integration
  getInventoryAnalytics: (dateRange?: { start: string; end: string }) => Promise<{
    totalValue: number;
    lowStockItems: number;
    stockTurnover: number;
    categoryBreakdown: { category: string; value: number; percentage: number }[];
  }>;
  
  // CRM Integration
  getProductRecommendations: (customerId?: string) => Promise<Product[]>;
  getProductAvailability: (productIds: string[]) => Promise<{ product_id: string; available: boolean; stock: number }[]>;
}

export interface InventoryWebhookPayload {
  event: 'product.created' | 'product.updated' | 'product.deleted' | 'stock.updated' | 'low_stock' | 'out_of_stock';
  data: any;
  tenant_id: string;
  timestamp: string;
}

export interface InventoryExportData {
  products: Product[];
  categories: string[];
  suppliers: Supplier[];
  locations: Location[];
  export_date: string;
  exported_by: string;
}
