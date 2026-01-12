import { BaseRepository } from './base.repository';
import { Product, ProductBatch, Location, Supplier } from '../types/database.types';

/**
 * Repository for Product management operations
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor(tenantId?: string) {
    super('products', tenantId);
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string): Promise<Product[]> {
    return this.findMany({
      filters: { category },
      orderBy: 'name'
    });
  }

  /**
   * Find products by supplier
   */
  async findBySupplier(supplier: string): Promise<Product[]> {
    return this.findMany({
      filters: { supplier },
      orderBy: 'name'
    });
  }

  /**
   * Find low stock products
   */
  async findLowStock(): Promise<Product[]> {
    return this.findMany({
      filters: {
        stock_quantity: { lte: 'min_stock_level' }
      },
      orderBy: 'stock_quantity'
    });
  }

  /**
   * Find products with stock below specified level
   */
  async findStockBelowLevel(level: number): Promise<Product[]> {
    return this.findMany({
      filters: {
        stock_quantity: { lte: level }
      },
      orderBy: 'stock_quantity'
    });
  }

  /**
   * Update stock quantity
   */
  async updateStock(id: string, quantity: number): Promise<Product> {
    return this.update(id, { stock_quantity: quantity });
  }

  /**
   * Adjust stock (increase or decrease)
   */
  async adjustStock(id: string, adjustment: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newQuantity = product.stock_quantity + adjustment;
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    return this.update(id, { stock_quantity: newQuantity });
  }

  /**
   * Search products by name or SKU
   */
  async search(query: string): Promise<Product[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .order('name');

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get product with batches
   */
  async getProductWithBatches(id: string): Promise<Product & { batches: ProductBatch[] }> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select(`
        *,
        (
          SELECT 
            json_agg(
              json_build_object(
                'id', product_batches.id,
                'batch_number', product_batches.batch_number,
                'quantity', product_batches.quantity,
                'quantity_reserved', product_batches.quantity_reserved,
                'quantity_available', product_batches.quantity_available,
                'unit_cost', product_batches.unit_cost,
                'manufacture_date', product_batches.manufacture_date,
                'expiration_date', product_batches.expiration_date
              )
            )
          ) as batches
          FROM product_batches 
          WHERE product_batches.product_id = products.id 
          AND product_batches.is_active = true
        ) as batches
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get product with batches: ${error.message}`);
    }

    return data;
  }

  /**
   * Get products by location
   */
  async findByLocation(locationId: string): Promise<Product[]> {
    return this.findMany({
      filters: { default_location_id: locationId }
    });
  }

  /**
   * Get active products
   */
  async findActive(): Promise<Product[]> {
    return this.findMany({
      filters: { is_active: true },
      orderBy: 'name'
    });
  }

  /**
   * Get products expiring soon
   */
  async findExpiringSoon(days: number = 30): Promise<Product[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .not('validity_date', 'is', null)
      .lte('validity_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('validity_date');

    if (error) {
      throw new Error(`Failed to find expiring products: ${error.message}`);
    }

    return data || [];
  }
}
