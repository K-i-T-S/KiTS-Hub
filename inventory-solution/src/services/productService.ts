/**
 * Product Service
 * Business logic for product management operations
 */

import type {
  Product,
  ProductFormData,
  ProductFilter,
  ProductListResponse,
  ProductStats,
  ProductService,
  BulkProductUpdate,
  ProductVariant,
  CostEntry,
  Supplier
} from '../types/product';
import { ProductCategory, ProductStatus } from '../types/product';
import { ProductError } from '../types/product';

// Mock data for demonstration - replace with actual API calls
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro 15"',
    description: 'High-performance laptop for professionals',
    barcode: '1234567890123',
    sku: 'LP-PRO-15-001',
    category: ProductCategory.ELECTRONICS,
    supplier: {
      id: '1',
      name: 'TechSupplier Inc',
      contactPerson: 'John Doe',
      email: 'john@techsupplier.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Tech St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA'
      },
      paymentTerms: 'net_30' as any,
      status: 'active' as any,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    variants: [
      {
        id: '1-1',
        productId: '1',
        attributes: [
          { id: '1', name: 'color', value: 'Space Gray', type: 'color' as any },
          { id: '2', name: 'storage', value: '512GB', type: 'capacity' as any }
        ],
        cost: 1200,
        costHistory: [
          {
            id: '1',
            variantId: '1-1',
            cost: 1200,
            quantity: 100,
            supplier: 'TechSupplier Inc',
            date: '2024-01-01T00:00:00Z',
            createdBy: '1'
          }
        ],
        price: 1699,
        stock: 45,
        reorderLevel: 10,
        minStockLevel: 5,
        maxStockLevel: 100,
        status: 'active' as any,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    tags: ['laptop', 'professional', 'high-performance'],
    status: ProductStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: '1',
    updatedBy: '1'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'TechSupplier Inc',
    contactPerson: 'John Doe',
    email: 'john@techsupplier.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Tech St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA'
    },
    paymentTerms: 'net_30' as any,
    status: 'active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Validation utilities
const validateProductData = (data: ProductFormData): void => {
  if (!data.name || data.name.trim().length === 0) {
    throw new ProductError('Product name is required', 'INVALID_NAME', 400);
  }

  if (!data.barcode || data.barcode.length < 8) {
    throw new ProductError('Barcode must be at least 8 characters', 'INVALID_BARCODE', 400);
  }

  if (!data.sku || data.sku.trim().length === 0) {
    throw new ProductError('SKU is required', 'INVALID_SKU', 400);
  }

  if (!data.supplierId) {
    throw new ProductError('Supplier is required', 'INVALID_SUPPLIER', 400);
  }

  if (!data.variants || data.variants.length === 0) {
    throw new ProductError('At least one variant is required', 'NO_VARIANTS', 400);
  }

  // Validate variants
  data.variants.forEach((variant, index) => {
    if (!variant.cost || parseFloat(variant.cost) < 0) {
      throw new ProductError(`Invalid cost for variant ${index + 1}`, 'INVALID_COST', 400);
    }

    if (!variant.price || parseFloat(variant.price) < 0) {
      throw new ProductError(`Invalid price for variant ${index + 1}`, 'INVALID_PRICE', 400);
    }

    if (!variant.stock || parseInt(variant.stock) < 0) {
      throw new ProductError(`Invalid stock for variant ${index + 1}`, 'INVALID_STOCK', 400);
    }

    if (!variant.reorderLevel || parseInt(variant.reorderLevel) < 0) {
      throw new ProductError(`Invalid reorder level for variant ${index + 1}`, 'INVALID_REORDER', 400);
    }
  });
};

// Transform form data to product entity
const transformFormDataToProduct = (data: ProductFormData, existingProduct?: Product): Product => {
  const supplier = mockSuppliers.find(s => s.id === data.supplierId);
  if (!supplier) {
    throw new ProductError('Supplier not found', 'SUPPLIER_NOT_FOUND', 404);
  }

  const now = new Date().toISOString();
  const productId = existingProduct?.id || `product_${Date.now()}`;

  const variants: ProductVariant[] = data.variants.map((variantData, index) => {
    const variantId = existingProduct?.variants[index]?.id || `${productId}_variant_${index}`;
    
    return {
      id: variantId,
      productId,
      attributes: Object.entries(variantData.attributes).map(([key, value]) => ({
        id: `${variantId}_attr_${key}`,
        name: key,
        value,
        type: 'other' as any
      })),
      cost: parseFloat(variantData.cost),
      costHistory: existingProduct?.variants[index]?.costHistory || [
        {
          id: `${variantId}_cost_${Date.now()}`,
          variantId,
          cost: parseFloat(variantData.cost),
          quantity: parseInt(variantData.stock) || 0,
          supplier: supplier.name,
          date: now,
          createdBy: '1'
        }
      ],
      price: parseFloat(variantData.price),
      stock: parseInt(variantData.stock) || 0,
      reorderLevel: parseInt(variantData.reorderLevel) || 0,
      minStockLevel: parseInt(variantData.minStockLevel) || 0,
      maxStockLevel: parseInt(variantData.maxStockLevel) || 100,
      status: 'active' as any,
      createdAt: existingProduct?.variants[index]?.createdAt || now,
      updatedAt: now
    };
  });

  return {
    id: productId,
    name: data.name,
    description: data.description,
    barcode: data.barcode,
    sku: data.sku,
    category: data.category,
    supplier,
    variants,
    tags: data.tags,
    validityDate: data.validityDate,
    status: ProductStatus.ACTIVE,
    createdAt: existingProduct?.createdAt || now,
    updatedAt: now,
    createdBy: existingProduct?.createdBy || '1',
    updatedBy: '1'
  };
};

// Filter products based on criteria
const filterProducts = (products: Product[], filter: ProductFilter): Product[] => {
  return products.filter(product => {
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.barcode.includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filter.category && filter.category !== 'all') {
      if (product.category !== filter.category) return false;
    }

    // Supplier filter
    if (filter.supplier) {
      if (product.supplier.id !== filter.supplier) return false;
    }

    // Status filter
    if (filter.status && filter.status !== 'all') {
      if (product.status !== filter.status) return false;
    }

    // Price range filter
    if (filter.priceRange) {
      const avgPrice = product.variants.reduce((sum, v) => sum + v.price, 0) / product.variants.length;
      if (avgPrice < filter.priceRange.min || avgPrice > filter.priceRange.max) return false;
    }

    // Stock range filter
    if (filter.stockRange) {
      const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      if (totalStock < filter.stockRange.min || totalStock > filter.stockRange.max) return false;
    }

    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      const hasAllTags = filter.tags.every(tag => 
        product.tags?.includes(tag)
      );
      if (!hasAllTags) return false;
    }

    return true;
  });
};

// Sort products
const sortProducts = (products: Product[], sortBy: string, sortOrder: 'asc' | 'desc'): Product[] => {
  return [...products].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'sku':
        aValue = a.sku.toLowerCase();
        bValue = b.sku.toLowerCase();
        break;
      case 'barcode':
        aValue = a.barcode;
        bValue = b.barcode;
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      case 'price':
        aValue = a.variants.reduce((sum, v) => sum + v.price, 0) / a.variants.length;
        bValue = b.variants.reduce((sum, v) => sum + v.price, 0) / b.variants.length;
        break;
      case 'stock':
        aValue = a.variants.reduce((sum, v) => sum + v.stock, 0);
        bValue = b.variants.reduce((sum, v) => sum + v.stock, 0);
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Main service implementation
export class ProductServiceImpl implements ProductService {
  private products: Product[] = [...mockProducts];

  async getProducts(filter?: ProductFilter): Promise<ProductListResponse> {
    try {
      let filteredProducts = this.products;

      if (filter) {
        filteredProducts = filterProducts(this.products, filter);
        
        if (filter.sortBy) {
          filteredProducts = sortProducts(filteredProducts, filter.sortBy, filter.sortOrder || 'asc');
        }
      }

      // Pagination (mock implementation)
      const page = filter?.page || 1;
      const limit = filter?.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        page,
        limit,
        hasNext: endIndex < filteredProducts.length,
        hasPrev: page > 1
      };
    } catch (error) {
      throw new ProductError(
        `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_PRODUCTS_ERROR',
        500
      );
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = this.products.find(p => p.id === id);
      return product || null;
    } catch (error) {
      throw new ProductError(
        `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_PRODUCT_ERROR',
        500
      );
    }
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    try {
      validateProductData(data);

      // Check for duplicate barcode/SKU
      const existingByBarcode = this.products.find(p => p.barcode === data.barcode);
      if (existingByBarcode) {
        throw new ProductError('Product with this barcode already exists', 'DUPLICATE_BARCODE', 409);
      }

      const existingBySku = this.products.find(p => p.sku === data.sku);
      if (existingBySku) {
        throw new ProductError('Product with this SKU already exists', 'DUPLICATE_SKU', 409);
      }

      const newProduct = transformFormDataToProduct(data);
      this.products.push(newProduct);

      return newProduct;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_PRODUCT_ERROR',
        500
      );
    }
  }

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    try {
      const existingProduct = this.products.find(p => p.id === id);
      if (!existingProduct) {
        throw new ProductError('Product not found', 'PRODUCT_NOT_FOUND', 404);
      }

      // For partial updates, we need to merge with existing data
      const mergedData: ProductFormData = {
        name: existingProduct.name,
        description: existingProduct.description || '',
        barcode: existingProduct.barcode,
        sku: existingProduct.sku,
        category: existingProduct.category,
        supplierId: existingProduct.supplier.id,
        tags: existingProduct.tags || [],
        validityDate: existingProduct.validityDate || '',
        variants: existingProduct.variants.map(v => ({
          id: v.id,
          attributes: v.attributes.reduce((acc, attr) => ({
            ...acc,
            [attr.name]: attr.value
          }), {}),
          cost: v.cost.toString(),
          price: v.price.toString(),
          stock: v.stock.toString(),
          reorderLevel: v.reorderLevel.toString(),
          minStockLevel: v.minStockLevel.toString(),
          maxStockLevel: v.maxStockLevel.toString()
        })),
        ...data
      };

      validateProductData(mergedData);

      const updatedProduct = transformFormDataToProduct(mergedData, existingProduct);
      
      const index = this.products.findIndex(p => p.id === id);
      this.products[index] = updatedProduct;

      return updatedProduct;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_PRODUCT_ERROR',
        500
      );
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        throw new ProductError('Product not found', 'PRODUCT_NOT_FOUND', 404);
      }

      this.products.splice(index, 1);
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_PRODUCT_ERROR',
        500
      );
    }
  }

  async bulkUpdateProducts(updates: BulkProductUpdate[]): Promise<Product[]> {
    try {
      const updatedProducts: Product[] = [];

      for (const update of updates) {
        const updatedProduct = await this.updateProduct(update.id, update.updates);
        updatedProducts.push(updatedProduct);
      }

      return updatedProducts;
    } catch (error) {
      throw new ProductError(
        `Failed to bulk update products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BULK_UPDATE_ERROR',
        500
      );
    }
  }

  async exportProducts(filter?: ProductFilter): Promise<Blob> {
    try {
      const response = await this.getProducts(filter);
      
      // Convert to CSV format
      const headers = [
        'ID', 'Name', 'SKU', 'Barcode', 'Category', 'Supplier', 'Status',
        'Total Stock', 'Average Price', 'Created Date'
      ];
      
      const csvData = response.products.map(product => [
        product.id,
        product.name,
        product.sku,
        product.barcode,
        product.category,
        product.supplier.name,
        product.status,
        product.variants.reduce((sum, v) => sum + v.stock, 0),
        (product.variants.reduce((sum, v) => sum + v.price, 0) / product.variants.length).toFixed(2),
        new Date(product.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error) {
      throw new ProductError(
        `Failed to export products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXPORT_PRODUCTS_ERROR',
        500
      );
    }
  }

  async importProducts(file: File): Promise<{ success: number; errors: string[] }> {
    try {
      // Mock implementation - in real app, parse CSV/Excel file
      const errors: string[] = [];
      let success = 0;

      // Simulate processing
      for (let i = 0; i < 10; i++) {
        try {
          // Mock product creation
          success++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { success, errors };
    } catch (error) {
      throw new ProductError(
        `Failed to import products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'IMPORT_PRODUCTS_ERROR',
        500
      );
    }
  }

  async getProductStats(): Promise<ProductStats> {
    try {
      const totalProducts = this.products.length;
      const totalVariants = this.products.reduce((sum, p) => sum + p.variants.length, 0);
      const totalStock = this.products.reduce((sum, p) => 
        sum + p.variants.reduce((variantSum, v) => variantSum + v.stock, 0), 0
      );
      const lowStockAlerts = this.products.reduce((sum, p) => 
        sum + p.variants.filter(v => v.stock <= v.reorderLevel).length, 0
      );
      const outOfStock = this.products.reduce((sum, p) => 
        sum + p.variants.filter(v => v.stock === 0).length, 0
      );

      // Category stats
      const categoryMap = new Map<ProductCategory, { count: number; totalStock: number; lowStock: number }>();
      
      this.products.forEach(product => {
        const current = categoryMap.get(product.category) || { count: 0, totalStock: 0, lowStock: 0 };
        const productStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        const productLowStock = product.variants.filter(v => v.stock <= v.reorderLevel).length;
        
        categoryMap.set(product.category, {
          count: current.count + 1,
          totalStock: current.totalStock + productStock,
          lowStock: current.lowStock + productLowStock
        });
      });

      const categories = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        totalStock: stats.totalStock,
        lowStock: stats.lowStock
      }));

      // Supplier stats
      const supplierMap = new Map<string, { productCount: number; totalValue: number }>();
      
      this.products.forEach(product => {
        const current = supplierMap.get(product.supplier.id) || { productCount: 0, totalValue: 0 };
        const productValue = product.variants.reduce((sum, v) => sum + (v.stock * v.price), 0);
        
        supplierMap.set(product.supplier.id, {
          productCount: current.productCount + 1,
          totalValue: current.totalValue + productValue
        });
      });

      const suppliers = Array.from(supplierMap.entries()).map(([supplierId, stats]) => ({
        supplierId,
        supplierName: this.products.find(p => p.supplier.id === supplierId)?.supplier.name || 'Unknown',
        productCount: stats.productCount,
        totalValue: stats.totalValue
      }));

      return {
        totalProducts,
        totalVariants,
        totalStock,
        lowStockAlerts,
        outOfStock,
        expiringBatches: 0, // Will be calculated from batch service in real implementation
        expiredBatches: 0, // Will be calculated from batch service in real implementation
        pendingReorders: 0, // Will be calculated from reorder service in real implementation
        categories,
        suppliers
      };
    } catch (error) {
      throw new ProductError(
        `Failed to fetch product stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_STATS_ERROR',
        500
      );
    }
  }
}

// Export singleton instance
export const productService = new ProductServiceImpl();
