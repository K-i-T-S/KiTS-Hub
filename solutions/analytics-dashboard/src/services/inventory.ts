import { supabase } from '@/lib/supabase';
import { 
  Product, 
  ProductVariant, 
  Supplier, 
  Location, 
  StockMovement,
  ProductBatch,
  PurchaseOrder,
  StockTransfer,
  InventorySettings,
  InventoryAlert,
  InventoryStats,
  InventoryFilters,
  CreateProductForm,
  UpdateProductForm,
  CreateSupplierForm,
  CreateLocationForm,
  CreatePurchaseOrderForm,
  CreateStockTransferForm,
  StockAdjustmentForm,
  InventoryIntegrationAPI
} from '@/types/inventory';

class InventoryService implements InventoryIntegrationAPI {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Product Management
  async getProducts(filters?: InventoryFilters): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        supplier:suppliers(name),
        variants:product_variants(*)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }

    if (filters?.location_id) {
      // This would require joining with stock movements or batches
      // For now, we'll filter in the frontend
    }

    if (filters?.low_stock_only) {
      query = query.lt('current_stock', 'reorder_point');
    }

    if (filters?.out_of_stock_only) {
      query = query.eq('current_stock', 0);
    }

    if (filters?.track_batches_only) {
      query = query.eq('track_batches', true);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        supplier:suppliers(name),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async createProduct(product: CreateProductForm): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        tenant_id: this.tenantId,
        current_stock: 0,
        stock_value: 0,
        low_stock: false
      })
      .select()
      .single();

    if (error) throw error;

    // Create variants if provided
    if (product.variants && product.variants.length > 0) {
      const variants = product.variants.map(variant => ({
        ...variant,
        product_id: data.id,
        cost_history: []
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variants);

      if (variantError) throw variantError;
    }

    return data;
  }

  async updateProduct(id: string, updates: UpdateProductForm): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  // Supplier Management
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createSupplier(supplier: CreateSupplierForm): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplier,
        tenant_id: this.tenantId,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Location Management
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createLocation(location: CreateLocationForm): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...location,
        tenant_id: this.tenantId,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Stock Management
  async getStockMovements(productId?: string, dateRange?: { start: string; end: string }): Promise<StockMovement[]> {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(name),
        location:locations(name),
        batch:product_batches(batch_number)
      `)
      .eq('tenant_id', this.tenantId);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async adjustStock(adjustment: StockAdjustmentForm): Promise<void> {
    const movementType = adjustment.adjustment_type === 'increase' ? 'adjustment' : 'adjustment';
    const quantity = adjustment.adjustment_type === 'increase' ? adjustment.quantity : -adjustment.quantity;

    // Create stock movement
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        tenant_id: this.tenantId,
        product_id: adjustment.product_id,
        variant_id: adjustment.variant_id,
        location_id: adjustment.location_id,
        batch_id: adjustment.batch_id,
        movement_type: movementType,
        quantity,
        notes: `${adjustment.reason}: ${adjustment.notes || ''}`
      });

    if (movementError) throw movementError;

    // Update product stock
    const { error: updateError } = await supabase.rpc('update_product_stock', {
      p_product_id: adjustment.product_id,
      p_quantity: quantity
    });

    if (updateError) throw updateError;
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name),
        location:locations(name),
        items:purchase_order_items(*, product:products(name, sku))
      `)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPurchaseOrder(order: CreatePurchaseOrderForm): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({
        ...order,
        tenant_id: this.tenantId,
        order_number: await this.generateOrderNumber('PO'),
        status: 'draft',
        order_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create order items
    if (order.items && order.items.length > 0) {
      const items = order.items.map(item => ({
        ...item,
        purchase_order_id: data.id
      }));

      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .insert(items);

      if (itemError) throw itemError;
    }

    return data;
  }

  // Stock Transfers
  async getStockTransfers(): Promise<StockTransfer[]> {
    const { data, error } = await supabase
      .from('stock_transfers')
      .select(`
        *,
        from_location:locations(name),
        to_location:locations(name),
        items:stock_transfer_items(*, product:products(name, sku))
      `)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createStockTransfer(transfer: CreateStockTransferForm): Promise<StockTransfer> {
    const { data, error } = await supabase
      .from('stock_transfers')
      .insert({
        ...transfer,
        tenant_id: this.tenantId,
        transfer_number: await this.generateOrderNumber('ST'),
        status: 'pending',
        transfer_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create transfer items
    if (transfer.items && transfer.items.length > 0) {
      const items = transfer.items.map(item => ({
        ...item,
        stock_transfer_id: data.id
      }));

      const { error: itemError } = await supabase
        .from('stock_transfer_items')
        .insert(items);

      if (itemError) throw itemError;
    }

    return data;
  }

  // Analytics and Stats
  async getInventoryStats(): Promise<InventoryStats> {
    const { data, error } = await supabase.rpc('get_inventory_stats', {
      p_tenant_id: this.tenantId
    });

    if (error) throw error;
    return data[0] || {
      total_products: 0,
      total_variants: 0,
      total_stock_value: 0,
      low_stock_items: 0,
      out_of_stock_items: 0,
      expiring_items: 0,
      expired_items: 0,
      pending_purchase_orders: 0,
      pending_transfers: 0
    };
  }

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const { data, error } = await supabase
      .from('inventory_alerts')
      .select(`
        *,
        product:products(name),
        location:locations(name),
        batch:product_batches(batch_number)
      `)
      .eq('tenant_id', this.tenantId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Settings
  async getInventorySettings(): Promise<InventorySettings | null> {
    const { data, error } = await supabase
      .from('inventory_settings')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateInventorySettings(settings: Partial<InventorySettings>): Promise<InventorySettings> {
    const { data, error } = await supabase
      .from('inventory_settings')
      .upsert({
        ...settings,
        tenant_id: this.tenantId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Integration API Methods
  async getProductsForPOS(filters?: { category?: string; in_stock_only?: boolean }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .eq('track_inventory', true);

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

  async updateStockFromSale(saleItems: { product_id: string; variant_id?: string; quantity: number }[]): Promise<void> {
    for (const item of saleItems) {
      // Create stock movement
      await supabase
        .from('stock_movements')
        .insert({
          tenant_id: this.tenantId,
          product_id: item.product_id,
          variant_id: item.variant_id,
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

  async reserveStockForOrder(orderItems: { product_id: string; variant_id?: string; quantity: number }[]): Promise<void> {
    // Implementation for stock reservation
    for (const item of orderItems) {
      await supabase.rpc('reserve_stock', {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      });
    }
  }

  async releaseReservedStock(orderItems: { product_id: string; variant_id?: string; quantity: number }[]): Promise<void> {
    // Implementation for releasing reserved stock
    for (const item of orderItems) {
      await supabase.rpc('release_reserved_stock', {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      });
    }
  }

  async getInventoryAnalytics(dateRange?: { start: string; end: string }): Promise<{
    totalValue: number;
    lowStockItems: number;
    stockTurnover: number;
    categoryBreakdown: { category: string; value: number; percentage: number }[];
  }> {
    const { data, error } = await supabase.rpc('get_inventory_analytics', {
      p_tenant_id: this.tenantId,
      p_start_date: dateRange?.start,
      p_end_date: dateRange?.end
    });

    if (error) throw error;
    return data[0] || {
      totalValue: 0,
      lowStockItems: 0,
      stockTurnover: 0,
      categoryBreakdown: []
    };
  }

  async getProductRecommendations(customerId?: string): Promise<Product[]> {
    // Implementation for product recommendations
    // This could integrate with CRM data for personalized recommendations
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .gt('current_stock', 0)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

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

  // Utility methods
  private async generateOrderNumber(prefix: string): Promise<string> {
    const { data, error } = await supabase
      .from('order_numbers')
      .select('next_number')
      .eq('prefix', prefix)
      .single();

    if (error || !data) {
      // Initialize sequence
      await supabase
        .from('order_numbers')
        .insert({ prefix, next_number: 2 });
      return `${prefix}000001`;
    }

    const orderNumber = `${prefix}${String(data.next_number).padStart(6, '0')}`;
    
    await supabase
      .from('order_numbers')
      .update({ next_number: data.next_number + 1 })
      .eq('prefix', prefix);

    return orderNumber;
  }

  async exportInventoryData(): Promise<any> {
    const [products, suppliers, locations] = await Promise.all([
      this.getProducts(),
      this.getSuppliers(),
      this.getLocations()
    ]);

    const categories = [...new Set(products.map(p => p.category))];

    return {
      products,
      categories,
      suppliers,
      locations,
      export_date: new Date().toISOString(),
      exported_by: this.tenantId
    };
  }
}

export default InventoryService;
