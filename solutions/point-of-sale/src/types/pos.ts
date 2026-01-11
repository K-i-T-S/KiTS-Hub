// KiTS Point of Sale Types
// Standalone SaaS solution with integration capabilities

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost: number;
  image_url?: string;
  is_active: boolean;
  track_inventory: boolean;
  current_stock?: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  loyalty_points?: number;
  total_spent?: number;
  visit_count?: number;
  last_visit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  tenant_id: string;
  sale_number: string;
  customer_id?: string;
  status: 'draft' | 'completed' | 'refunded' | 'voided';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount?: number;
  payment_method: string[];
  notes?: string;
  sale_date: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  items?: SaleItem[];
  payments?: SalePayment[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  tax_amount: number;
  created_at: string;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method: string;
  amount: number;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface POSStats {
  total_sales: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  today_sales: number;
  today_revenue: number;
  top_products: Array<{
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  recent_sales: Sale[];
}

export interface POSFilters {
  date_range?: {
    start: string;
    end: string;
  };
  customer_id?: string;
  payment_method?: string;
  status?: string;
  search?: string;
}

// Form types
export interface CreateSaleForm {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    discount?: number;
  }>;
  notes?: string;
}

export interface CreateCustomerForm {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateCustomerForm {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Integration API
export interface POSIntegrationAPI {
  getProducts(filters?: { category?: string; in_stock_only?: boolean }): Promise<Product[]>;
  getCustomers(): Promise<Customer[]>;
  createSale(sale: CreateSaleForm): Promise<Sale>;
  getSales(filters?: POSFilters): Promise<Sale[]>;
  getPOSStats(dateRange?: { start: string; end: string }): Promise<POSStats>;
}

export interface POSSettings {
  tax_rates: Array<{
    id: string;
    name: string;
    rate: number;
    is_default: boolean;
  }>;
  payment_methods: Array<{
    id: string;
    name: string;
    is_active: boolean;
    requires_reference: boolean;
  }>;
  receipt_settings: {
    header: string;
    footer: string;
    show_customer_details: boolean;
    show_tax_breakdown: boolean;
  };
  general_settings: {
    currency: string;
    tax_inclusive: boolean;
    allow_partial_payments: boolean;
    require_customer_for_sale: boolean;
  };
}
