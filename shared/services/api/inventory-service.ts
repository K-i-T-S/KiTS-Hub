import { BaseService } from './base-service';
import { supabase } from '../../lib/supabase';
import { Product, Category, Supplier, Location, ProductStatus } from '../../types';

export class InventoryService extends BaseService {
  constructor() {
    super('products');
  }

  // Product Management
  async getProducts(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: ProductStatus;
      category_id?: string;
      supplier_id?: string;
      location_id?: string;
      search?: string;
    }
  ) {
    const queryFilters: Record<string, any> = {};
    
    if (filters) {
      if (filters.status) queryFilters.status = filters.status;
      if (filters.category_id) queryFilters.category_id = filters.category_id;
      if (filters.supplier_id) queryFilters.supplier_id = filters.supplier_id;
      if (filters.location_id) queryFilters.location_id = filters.location_id;
      if (filters.search) {
        return this.search(filters.search, ['name', 'sku', 'description'], page, perPage);
      }
    }

    return this.getAll<Product>(page, perPage, queryFilters);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.getById<Product>(id);
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    // Generate SKU if not provided
    if (!productData.sku) {
      productData.sku = this.generateSKU();
    }

    return this.create<Product>(productData);
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    // Update stock quantity and check for low stock alerts
    if (productData.stock_quantity !== undefined) {
      const updatedData = { ...productData };
      
      // Auto-update status based on stock
      if (updatedData.stock_quantity === 0) {
        updatedData.status = 'out_of_stock';
      } else if (updatedData.stock_quantity <= (updatedData.min_stock_level || 0)) {
        updatedData.status = 'active'; // Will trigger reorder alert
      } else {
        updatedData.status = 'active';
      }

      return this.update<Product>(id, updatedData);
    }

    return this.update<Product>(id, productData);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete(id);
  }

  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract' = 'add'): Promise<Product> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const currentStock = product.stock_quantity || 0;
    let newStock: number;

    if (operation === 'add') {
      newStock = currentStock + quantity;
    } else {
      newStock = Math.max(0, currentStock - quantity);
    }

    return this.updateProduct(productId, { stock_quantity: newStock });
  }

  // Category Management
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  // Supplier Management
  async getSuppliers(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: string;
      search?: string;
    }
  ) {
    const queryFilters: Record<string, any> = {};
    
    if (filters) {
      if (filters.status) queryFilters.status = filters.status;
      if (filters.search) {
        return this.search(filters.search, ['name', 'contact_person', 'email'], page, perPage);
      }
    }

    return this.getAll<Supplier>(page, perPage, queryFilters, 'suppliers');
  }

  async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier> {
    return this.create<Supplier>(supplierData);
  }

  // Location Management
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    return data || [];
  }

  async createLocation(locationData: Partial<Location>): Promise<Location> {
    return this.create<Location>(locationData);
  }

  // Inventory Reports
  async getInventorySummary(locationId?: string): Promise<{
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  }> {
    let query = supabase.from('products').select('*');
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data: products, error } = await query;

    if (error) {
      throw new Error(`Failed to generate inventory summary: ${error.message}`);
    }

    const totalProducts = products?.length || 0;
    const lowStockItems = products?.filter(p => 
      p.stock_quantity <= (p.min_stock_level || 0) && p.stock_quantity > 0
    ).length || 0;
    const outOfStockItems = products?.filter(p => p.stock_quantity === 0).length || 0;
    const totalValue = products?.reduce((sum, p) => sum + (p.unit_price * p.stock_quantity), 0) || 0;

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
    };
  }

  async getStockMovements(
    productId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    // This would typically query a stock_movements table
    // For now, return a placeholder implementation
    return [];
  }

  // Utility Methods
  private generateSKU(): string {
    const prefix = 'KIT';
    const timestamp = Date.now().toString(36).toUpperCase().slice(0, 8);
    const random = Math.random().toString(36).toUpperCase().slice(2, 6);
    return `${prefix}${timestamp}${random}`;
  }

  async bulkUpdateStock(updates: Array<{ productId: string; quantity: number; operation: 'add' | 'subtract' }>): Promise<void> {
    const results = await Promise.allSettled(
      updates.map(({ productId, quantity, operation }) =>
        this.updateStock(productId, quantity, operation)
      )
    );

    const errors = results.filter(result => result.status === 'rejected');
    if (errors.length > 0) {
      throw new Error(`Failed to update stock for ${errors.length} products`);
    }
  }

  async exportToCSV(locationId?: string): Promise<string> {
    const products = await this.getProducts(1, 10000, { location_id: locationId });
    
    const headers = ['SKU', 'Name', 'Category', 'Supplier', 'Stock', 'Unit Price', 'Total Value'];
    const csvContent = [
      headers.join(','),
      ...products.data.map(product => [
        product.sku,
        product.name,
        product.category_id,
        product.supplier_id,
        product.stock_quantity,
        product.unit_price,
        (product.unit_price * product.stock_quantity).toString()
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}
