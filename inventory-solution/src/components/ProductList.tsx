/**
 * Product List Component
 * Migrated and refactored with TypeScript best practices
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  Upload,
  Layers3,
  Filter,
  MoreVertical,
  Eye,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import type {
  Product,
  ProductFilter,
  ProductListProps,
  ProductWithVariants,
  ProductStats,
  ProductSortField
} from '../types/product';
import { ProductStatus, ProductPermission } from '../types/product';
import type { RoleGuardProps } from '../types/auth';
import { PermissionGuard } from './PermissionGuard';

// Utility Components
const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = React.memo(({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';

const FilterSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
}> = React.memo(({ value, onChange, options, label }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

FilterSelect.displayName = 'FilterSelect';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  critical?: boolean;
}> = React.memo(({ title, value, subtitle, icon: Icon, trend, critical }) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
    critical ? 'border-red-500' : 'border-blue-500'
  }`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${
          critical ? 'text-red-600' : 'text-gray-900'
        }`}>
          {value}
        </p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex-shrink-0">
        <Icon className={`h-8 w-8 ${
          critical ? 'text-red-500' : 'text-blue-500'
        }`} />
      </div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center text-sm">
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
        {trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />}
        <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
          {trend === 'stable' ? 'Stable' : `${trend === 'up' ? 'Increasing' : 'Decreasing'}`}
        </span>
      </div>
    )}
  </div>
));

StatCard.displayName = 'StatCard';

const ProductRow: React.FC<{
  product: ProductWithVariants;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onView: (product: Product) => void;
  permissions: ProductPermission[];
  expanded: boolean;
  onToggleExpand: () => void;
}> = React.memo(({ 
  product, 
  onEdit, 
  onDelete, 
  onView, 
  permissions, 
  expanded, 
  onToggleExpand 
}) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProductStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case ProductStatus.DISCONTINUED:
        return 'bg-red-100 text-red-800';
      case ProductStatus.OUT_OF_STOCK:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">{product.sku}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{product.barcode}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.category}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.variants.length}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {product.isLowStock && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
            <span className={`text-sm font-medium ${
              product.isLowStock ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {product.totalStock}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatCurrency(product.avgPrice)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.supplier.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(product)}
              className="text-blue-600 hover:text-blue-900"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            <PermissionGuard permission={ProductPermission.UPDATE}>
              <button
                onClick={() => onEdit(product)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Edit Product"
              >
                <Edit className="h-4 w-4" />
              </button>
            </PermissionGuard>
            
            <PermissionGuard permission={ProductPermission.DELETE}>
              <button
                onClick={() => onDelete(product.id)}
                className="text-red-600 hover:text-red-900"
                title="Delete Product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </PermissionGuard>
            
            <button
              onClick={onToggleExpand}
              className="text-gray-600 hover:text-gray-900"
              title="Toggle Variants"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </td>
      </tr>
      
      {expanded && (
        <tr>
          <td colSpan={9} className="px-6 py-4 bg-gray-50">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Product Variants</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-medium text-gray-900">Variant</h5>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        variant.stock <= variant.reorderLevel 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {variant.stock <= variant.reorderLevel ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      {variant.attributes.map((attr, index) => (
                        <div key={attr.id} className="flex justify-between">
                          <span className="text-gray-600">{attr.name}:</span>
                          <span className="font-medium">{attr.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">{variant.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">{formatCurrency(variant.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reorder Level:</span>
                        <span className="font-medium">{variant.reorderLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

ProductRow.displayName = 'ProductRow';

// Main Component
export const ProductList: React.FC<ProductListProps> = React.memo(({
  products,
  loading = false,
  error,
  filter,
  onFilterChange,
  onProductSelect,
  onProductEdit,
  onProductDelete,
  onProductCreate,
  permissions,
  stats
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Memoize filtered and processed products
  const processedProducts = useMemo(() => {
    return products.map((product): ProductWithVariants => {
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const avgCost = product.variants.reduce((sum, variant) => sum + variant.cost, 0) / product.variants.length;
      const avgPrice = product.variants.reduce((sum, variant) => sum + variant.price, 0) / product.variants.length;
      const lowStockVariants = product.variants.filter(variant => variant.stock <= variant.reorderLevel);
      const isLowStock = lowStockVariants.length > 0;

      return {
        ...product,
        totalStock,
        avgCost,
        avgPrice,
        lowStockVariants: lowStockVariants.length,
        isLowStock
      };
    });
  }, [products]);

  // Memoize category options
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category)));
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [products]);

  // Memoize sort options
  const sortOptions = useMemo(() => [
    { value: 'name', label: 'Name' },
    { value: 'sku', label: 'SKU' },
    { value: 'category', label: 'Category' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'createdAt', label: 'Created Date' }
  ], []);

  // Handle filter changes
  const handleFilterChange = useCallback((updates: Partial<ProductFilter>) => {
    onFilterChange({ ...filter, ...updates });
  }, [filter, onFilterChange]);

  // Handle product expansion
  const toggleProductExpansion = useCallback((productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  // Handle product actions
  const handleProductView = useCallback((product: Product) => {
    onProductSelect(product);
  }, [onProductSelect]);

  const handleProductEdit = useCallback((product: Product) => {
    onProductEdit(product);
  }, [onProductEdit]);

  const handleProductDelete = useCallback((productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onProductDelete(productId);
    }
  }, [onProductDelete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Active SKUs"
            icon={Package}
          />
          <StatCard
            title="Total Variants"
            value={stats.totalVariants}
            subtitle="Product configurations"
            icon={Layers3}
          />
          <StatCard
            title="Total Stock"
            value={stats.totalStock}
            subtitle="Units available"
            icon={Package}
          />
          <StatCard
            title="Low Stock Alerts"
            value={stats.lowStockAlerts}
            subtitle="Items need restocking"
            icon={AlertTriangle}
            critical={stats.lowStockAlerts > 0}
          />
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 lg:mb-0">Product Inventory</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionGuard permission={ProductPermission.IMPORT}>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
            </PermissionGuard>
            
            <PermissionGuard permission={ProductPermission.EXPORT}>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </PermissionGuard>
            
            <PermissionGuard permission={ProductPermission.CREATE}>
              <button
                onClick={onProductCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchInput
            value={filter.search || ''}
            onChange={(value) => handleFilterChange({ search: value })}
            placeholder="Search products..."
          />
          
          <FilterSelect
            value={filter.category || 'all'}
            onChange={(value) => handleFilterChange({ category: value === 'all' ? undefined : value as any })}
            options={categoryOptions}
            label="Category"
          />
          
          <FilterSelect
            value={filter.sortBy || 'name'}
            onChange={(value) => handleFilterChange({ sortBy: value as ProductSortField })}
            options={sortOptions}
            label="Sort By"
          />
          
          <FilterSelect
            value={filter.sortOrder || 'asc'}
            onChange={(value) => handleFilterChange({ sortOrder: value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' }
            ]}
            label="Order"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleProductEdit}
                  onDelete={handleProductDelete}
                  onView={handleProductView}
                  permissions={permissions}
                  expanded={expandedProducts.has(product.id)}
                  onToggleExpand={() => toggleProductExpansion(product.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {processedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new product or adjusting your filters.
            </p>
            <div className="mt-6">
              <PermissionGuard permission={ProductPermission.CREATE}>
                <button
                  onClick={onProductCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </PermissionGuard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;
