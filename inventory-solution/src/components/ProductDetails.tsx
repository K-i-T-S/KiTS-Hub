/**
 * Product Details Component
 * Migrated and refactored with TypeScript best practices
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Tag,
  BarChart3,
  History,
  Image as ImageIcon,
  Plus,
  Minus
} from 'lucide-react';

import type {
  Product,
  ProductDetailsProps,
  ProductVariant,
  CostEntry,
  VariantStatus
} from '../types/product';
import { ProductStatus, ProductPermission } from '../types/product';
import { PermissionGuard } from './PermissionGuard';

// Utility Components
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}> = React.memo(({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-70">{subtitle}</p>
        </div>
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          {trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
          <span className="font-medium">
            {trend === 'stable' ? 'Stable' : `${trend === 'up' ? 'Increasing' : 'Decreasing'}`}
          </span>
        </div>
      )}
    </div>
  );
});

StatCard.displayName = 'StatCard';

const VariantCard: React.FC<{
  variant: ProductVariant;
  onEdit: (variant: ProductVariant) => void;
  permissions: ProductPermission[];
}> = React.memo(({ variant, onEdit, permissions }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'red' };
    if (stock <= reorderLevel) return { status: 'Low Stock', color: 'yellow' };
    return { status: 'In Stock', color: 'green' };
  };

  const stockStatus = getStockStatus(variant.stock, variant.reorderLevel);
  const profitMargin = ((variant.price - variant.cost) / variant.price) * 100;

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Variant Details</h4>
        <PermissionGuard permission={ProductPermission.UPDATE}>
          <button
            onClick={() => onEdit(variant)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
        </PermissionGuard>
      </div>

      {/* Attributes */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Attributes</h5>
        <div className="grid grid-cols-2 gap-2">
          {variant.attributes.map((attr) => (
            <div key={attr.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{attr.name}:</span>
              <span className="font-medium">{attr.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Information */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock Information</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Stock:</span>
              <span className="font-medium">{variant.stock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reorder Level:</span>
              <span className="font-medium">{variant.reorderLevel}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Min Stock:</span>
              <span className="font-medium">{variant.minStockLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max Stock:</span>
              <span className="font-medium">{variant.maxStockLevel}</span>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
            stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {stockStatus.status}
          </span>
        </div>
      </div>

      {/* Financial Information */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Financial Information</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost:</span>
              <span className="font-medium">{formatCurrency(variant.cost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="font-medium">{formatCurrency(variant.price)}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profit:</span>
              <span className={`font-medium ${
                profitMargin >= 20 ? 'text-green-600' : 
                profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatCurrency(variant.price - variant.cost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Margin:</span>
              <span className={`font-medium ${
                profitMargin >= 20 ? 'text-green-600' : 
                profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {variant.images && variant.images.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Images</h5>
          <div className="grid grid-cols-3 gap-2">
            {variant.images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-20 object-cover rounded border border-gray-200"
                />
                {image.isPrimary && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

VariantCard.displayName = 'VariantCard';

const CostHistoryChart: React.FC<{
  costHistory: CostEntry[];
}> = React.memo(({ costHistory }) => {
  const sortedHistory = useMemo(() => 
    [...costHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [costHistory]
  );

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString();

  if (sortedHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No cost history available</p>
      </div>
    );
  }

  const maxCost = Math.max(...sortedHistory.map(entry => entry.cost));
  const minCost = Math.min(...sortedHistory.map(entry => entry.cost));

  return (
    <div className="space-y-4">
      <h5 className="text-sm font-medium text-gray-900">Cost History</h5>
      <div className="space-y-2">
        {sortedHistory.map((entry, index) => {
          const previousCost = index > 0 ? sortedHistory[index - 1].cost : entry.cost;
          const trend = entry.cost > previousCost ? 'up' : entry.cost < previousCost ? 'down' : 'stable';
          
          return (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                  {trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                  {trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{formatCurrency(entry.cost)}</p>
                  <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Qty: {entry.quantity}</p>
                <p className="text-xs text-gray-500">{entry.supplier}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CostHistoryChart.displayName = 'CostHistoryChart';

// Main Component
export const ProductDetails: React.FC<ProductDetailsProps> = React.memo(({
  product,
  loading = false,
  error,
  onEdit,
  onDelete,
  onVariantUpdate,
  permissions
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'variants' | 'history'>('overview');

  // Calculate product statistics
  const productStats = useMemo(() => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const avgCost = product.variants.reduce((sum, variant) => sum + variant.cost, 0) / product.variants.length;
    const avgPrice = product.variants.reduce((sum, variant) => sum + variant.price, 0) / product.variants.length;
    const totalValue = product.variants.reduce((sum, variant) => sum + (variant.stock * variant.price), 0);
    const lowStockVariants = product.variants.filter(variant => variant.stock <= variant.reorderLevel);
    const outOfStockVariants = product.variants.filter(variant => variant.stock === 0);

    return {
      totalStock,
      avgCost,
      avgPrice,
      totalValue,
      lowStockCount: lowStockVariants.length,
      outOfStockCount: outOfStockVariants.length,
      variantCount: product.variants.length
    };
  }, [product]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      onDelete(product.id);
    }
  }, [product.id, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  const handleVariantEdit = useCallback((variant: ProductVariant) => {
    onVariantUpdate(variant);
  }, [onVariantUpdate]);

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
          <AlertTriangle className="h-5 w-5 text-red-400" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">SKU: {product.sku} | Barcode: {product.barcode}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <PermissionGuard permission={ProductPermission.UPDATE}>
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission={ProductPermission.DELETE}>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          product.status === ProductStatus.ACTIVE ? 'bg-green-100 text-green-800' :
          product.status === ProductStatus.INACTIVE ? 'bg-gray-100 text-gray-800' :
          product.status === ProductStatus.DISCONTINUED ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {product.status}
        </span>
        <span className="text-sm text-gray-600">
          Category: {product.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
        <span className="text-sm text-gray-600">
          Supplier: {product.supplier.name}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock"
          value={productStats.totalStock}
          subtitle="Units across all variants"
          icon={Package}
          color={productStats.outOfStockCount > 0 ? 'red' : productStats.lowStockCount > 0 ? 'yellow' : 'green'}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(productStats.totalValue)}
          subtitle="Current inventory value"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Variants"
          value={productStats.variantCount}
          subtitle="Product configurations"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Avg Price"
          value={formatCurrency(productStats.avgPrice)}
          subtitle="Across all variants"
          icon={BarChart3}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Package },
            { key: 'variants', label: 'Variants', icon: Tag },
            { key: 'history', label: 'History', icon: History }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Product Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Name:</dt>
                      <dd className="text-sm font-medium">{product.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Description:</dt>
                      <dd className="text-sm font-medium">{product.description || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Category:</dt>
                      <dd className="text-sm font-medium">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Valid Until:</dt>
                      <dd className="text-sm font-medium">
                        {product.validityDate ? new Date(product.validityDate).toLocaleDateString() : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Supplier Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Supplier:</dt>
                      <dd className="text-sm font-medium">{product.supplier.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Contact:</dt>
                      <dd className="text-sm font-medium">{product.supplier.contactPerson}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Email:</dt>
                      <dd className="text-sm font-medium">{product.supplier.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Phone:</dt>
                      <dd className="text-sm font-medium">{product.supplier.phone}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {product.variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  onEdit={handleVariantEdit}
                  permissions={permissions}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <CostHistoryChart costHistory={product.variants[0]?.costHistory || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductDetails.displayName = 'ProductDetails';

export default ProductDetails;
