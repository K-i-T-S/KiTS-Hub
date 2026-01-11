import { supabase } from '@/lib/supabase';
import { 
  Product,
  Customer,
  Sale,
  SaleItem,
  SalePayment,
  POSStats,
  POSFilters,
  CreateSaleForm,
  CreateCustomerForm,
  UpdateCustomerForm,
  POSIntegrationAPI,
  POSSettings
} from '@/types/pos';

class POSService implements POSIntegrationAPI {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Product Management
  async getProducts(filters?: { category?: string; in_stock_only?: boolean }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.in_stock_only) {
      query = query.gt('current_stock', 0);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data || [];
  }

  // Customer Management
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCustomer(customer: CreateCustomerForm): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customer,
        tenant_id: this.tenantId,
        is_active: true,
        total_spent: 0,
        visit_count: 0,
        loyalty_points: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomer(id: string, updates: UpdateCustomerForm): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Sales Management
  async createSale(sale: CreateSaleForm): Promise<Sale> {
    // Generate sale number
    const saleNumber = await this.generateSaleNumber();

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const saleItems = sale.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      discount: item.discount || 0
    }));

    // Get product details for pricing
    const productIds = saleItems.map(item => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, price, tax_rate')
      .in('id', productIds);

    if (!products) throw new Error('Products not found');

    const saleItemsWithDetails = saleItems.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      
      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;
      const discountAmount = totalPrice * (item.discount / 100);
      const finalPrice = totalPrice - discountAmount;
      const itemTax = finalPrice * (product.tax_rate / 100);

      subtotal += finalPrice;
      taxAmount += itemTax;

      return {
        product_id: item.product_id,
        product_name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: finalPrice,
        discount_amount: discountAmount,
        tax_amount: itemTax
      };
    });

    const totalAmount = subtotal + taxAmount;

    // Create sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        tenant_id: this.tenantId,
        sale_number: saleNumber,
        customer_id: sale.customer_id,
        status: 'completed',
        payment_status: 'paid',
        subtotal,
        tax_amount: taxAmount,
        discount_amount: saleItems.reduce((sum, item) => sum + (item.discount || 0), 0),
        total_amount: totalAmount,
        paid_amount: totalAmount,
        change_amount: 0,
        payment_method: ['cash'],
        sale_date: new Date().toISOString(),
        notes: sale.notes
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Create sale items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(
        saleItemsWithDetails.map(item => ({
          ...item,
          sale_id: saleData.id
        }))
      );

    if (itemsError) throw itemsError;

    // Update customer stats if customer exists
    if (sale.customer_id) {
      await supabase.rpc('update_customer_stats', {
        p_customer_id: sale.customer_id,
        p_amount: totalAmount
      });
    }

    // Update inventory
    await this.updateInventoryFromSale(saleItems);

    return saleData;
  }

  async getSales(filters?: POSFilters): Promise<Sale[]> {
    let query = supabase
      .from('sales')
      .select(`
        *,
        customer:customers(name),
        items:sale_items(*),
        payments:sale_payments(*)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    if (filters?.payment_method) {
      query = query.contains('payment_method', [filters.payment_method]);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.date_range) {
      query = query
        .gte('sale_date', filters.date_range.start)
        .lte('sale_date', filters.date_range.end);
    }

    if (filters?.search) {
      query = query.or(`sale_number.ilike.%${filters.search}%,customer.name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('sale_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Analytics
  async getPOSStats(dateRange?: { start: string; end: string }): Promise<POSStats> {
    const { data, error } = await supabase.rpc('get_pos_stats', {
      p_tenant_id: this.tenantId,
      p_start_date: dateRange?.start,
      p_end_date: dateRange?.end
    });

    if (error) throw error;
    
    return data[0] || {
      total_sales: 0,
      total_revenue: 0,
      total_customers: 0,
      total_products: 0,
      today_sales: 0,
      today_revenue: 0,
      top_products: [],
      recent_sales: []
    };
  }

  // Settings
  async getPOSSettings(): Promise<POSSettings | null> {
    const { data, error } = await supabase
      .from('pos_settings')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updatePOSSettings(settings: Partial<POSSettings>): Promise<POSSettings> {
    const { data, error } = await supabase
      .from('pos_settings')
      .upsert({
        ...settings,
        tenant_id: this.tenantId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Utility methods
  private async generateSaleNumber(): Promise<string> {
    const { data, error } = await supabase
      .from('sale_numbers')
      .select('next_number')
      .single();

    if (error || !data) {
      await supabase
        .from('sale_numbers')
        .insert({ next_number: 2 });
      return 'SALE000001';
    }

    const saleNumber = `SALE${String(data.next_number).padStart(6, '0')}`;
    
    await supabase
      .from('sale_numbers')
      .update({ next_number: data.next_number + 1 });

    return saleNumber;
  }

  private async updateInventoryFromSale(items: Array<{ product_id: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      // Create stock movement
      await supabase
        .from('stock_movements')
        .insert({
          tenant_id: this.tenantId,
          product_id: item.product_id,
          movement_type: 'sale',
          quantity: -item.quantity,
          reference_type: 'sale'
        });

      // Update product stock
      await supabase.rpc('update_product_stock', {
        p_product_id: item.product_id,
        p_quantity: -item.quantity
      });
    }
  }

  // Integration API Methods
  async getProductAvailability(productIds: string[]): Promise<{ product_id: string; available: boolean; stock: number }[]> {
    const { data, error } = await supabase
      .from('products')
      .select('id, current_stock')
      .eq('tenant_id', this.tenantId)
      .in('id', productIds);

    if (error) throw error;

    return (data || []).map(product => ({
      product_id: product.id,
      available: product.current_stock > 0,
      stock: product.current_stock
    }));
  }

  async reserveStockForSale(saleItems: { product_id: string; quantity: number }[]): Promise<void> {
    for (const item of saleItems) {
      await supabase.rpc('reserve_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
    }
  }

  async releaseReservedStock(saleItems: { product_id: string; quantity: number }[]): Promise<void> {
    for (const item of saleItems) {
      await supabase.rpc('release_reserved_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
    }
  }
}

export default POSService;
