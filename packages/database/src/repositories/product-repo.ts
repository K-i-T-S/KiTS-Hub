import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { SupabaseDatabaseClient } from '../supabase-client-fixed';

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  stock_quantity: number;
  min_stock_level: number;
  track_batches: boolean;
  track_expiration: boolean;
  variants: any;
  supplier: string | null;
  validity_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  track_batches?: boolean;
  track_expiration?: boolean;
  variants?: any;
  supplier?: string;
  validity_date?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  track_batches?: boolean;
  track_expiration?: boolean;
  variants?: any;
  supplier?: string;
  validity_date?: string;
  is_active?: boolean;
}

/**
 * Repository for product management
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor(dbClient: SupabaseDatabaseClient) {
    super(dbClient, 'products');
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductData): Promise<{ data: Product | null; error: any }> {
    const productData = {
      ...data,
      tenant_id: this.dbClient.getTenantContext()?.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await this.create(productData);
  }

  /**
   * Find products by tenant
   */
  async findByTenant(tenantId?: string): Promise<{ data: Product[] | null; error: any }> {
    const targetTenantId = tenantId || this.dbClient.getTenantContext()?.tenantId;
    
    return await this.findMany(
      { tenant_id: targetTenantId, is_active: true },
      {
        orderBy: [{ column: 'name', ascending: true }]
      }
    );
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.findMany(
      { 
        tenant_id: tenantId,
        category,
        is_active: true 
      },
      {
        orderBy: [{ column: 'name', ascending: true }]
      }
    );
  }

  /**
   * Find products by supplier
   */
  async findBySupplier(supplier: string): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.findMany(
      { 
        tenant_id: tenantId,
        supplier,
        is_active: true 
      },
      {
        orderBy: [{ column: 'name', ascending: true }]
      }
    );
  }

  /**
   * Search products by name or SKU
   */
  async searchProducts(query: string): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.client
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .orderBy('name', { ascending: true })
      .limit(50);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.client
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .lt('stock_quantity', 'min_stock_level')
      .orderBy('stock_quantity', { ascending: true })
      .limit(20);
  }

  /**
   * Get products with stock tracking enabled
   */
  async getBatchTrackedProducts(): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.findMany(
      { 
        tenant_id: tenantId,
        track_batches: true,
        is_active: true 
      }
    );
  }

  /**
   * Get products with expiration tracking
   */
  async getExpirationTrackedProducts(): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.findMany(
      { 
        tenant_id: tenantId,
        track_expiration: true,
        is_active: true 
      }
    );
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number): Promise<{ data: Product | null; error: any }> {
    return await this.updateById(productId, {
      stock_quantity: quantity,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    data: UpdateProductData
  ): Promise<{ data: Product | null; error: any }> {
    return await this.updateById(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Deactivate product
   */
  async deactivateProduct(id: string): Promise<{ error: any }> {
    return await this.updateById(id, {
      is_active: false,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get product with inventory details
   */
  async getProductWithInventory(productId: string): Promise<{ data: any; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.client
      .from(this.tableName)
      .select(`
        *,
        inventory_by_location!inner(
          quantity_on_hand,
          quantity_reserved,
          quantity_available
        )
      `)
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .single();
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(tenantId?: string): Promise<{ data: any; error: any }> {
    const targetTenantId = tenantId || this.dbClient.getTenantContext()?.tenantId;
    
    // Get total products
    const { data: totalProducts } = await this.count({ 
      tenant_id: targetTenantId,
      is_active: true 
    });

    // Get low stock products
    const { data: lowStockProducts } = await this.count({
      tenant_id: targetTenantId,
      is_active: true
    }).lt('stock_quantity', 'min_stock_level');

    // Get out of stock products
    const { data: outOfStockProducts } = await this.count({
      tenant_id: targetTenantId,
      is_active: true
    }).eq('stock_quantity', 0);

    // Get products by category
    const { data: categoryStats } = await this.client
      .from(this.tableName)
      .select('category', { count: 'exact' })
      .eq('tenant_id', targetTenantId)
      .eq('is_active', true)
      .group('category');

    return {
      data: {
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        outOfStockProducts: outOfStockProducts || 0,
        categoryBreakdown: categoryStats || []
      }
    };
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(updates: Array<{ id: string; data: UpdateProductData }>): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.dbClient.executeTransaction(async (client) => {
      const results = [];
      
      for (const update of updates) {
        const { data: result } = await client
          .from(this.tableName)
          .update({
            ...update.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id)
          .eq('tenant_id', tenantId)
          .select()
          .single();
          
        results.push(result);
      }
      
      return results;
    });
  }

  /**
   * Check if SKU exists
   */
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    let query = this.client
      .from(this.tableName)
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('sku', sku);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query.single();
    return !!data;
  }

  /**
   * Get products for dropdown
   */
  async getProductsForDropdown(limit: number = 100): Promise<{ data: Product[] | null; error: any }> {
    const tenantId = this.dbClient.getTenantContext()?.tenantId;
    
    return await this.findMany(
      { 
        tenant_id: tenantId,
        is_active: true 
      },
      {
        select: 'id, name, sku, price, stock_quantity',
        orderBy: [{ column: 'name', ascending: true }],
        limit
      }
    );
  }
}
