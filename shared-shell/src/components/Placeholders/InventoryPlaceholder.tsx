import React from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';

const InventoryPlaceholder: React.FC = () => {
  return (
    <div className="p-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage your products, stock levels, and inventory</p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="shell-search block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="shell-button flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
          <button className="shell-button flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="shell-stats-card primary">
            <div className="flex items-center">
              <div className="icon">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
              </div>
            </div>
          </div>
          <div className="shell-stats-card success">
            <div className="flex items-center">
              <div className="icon">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-semibold text-gray-900">987</p>
              </div>
            </div>
          </div>
          <div className="shell-stats-card warning">
            <div className="flex items-center">
              <div className="icon">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">23</p>
              </div>
            </div>
          </div>
          <div className="shell-stats-card error">
            <div className="flex items-center">
              <div className="icon">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Table */}
        <div className="shell-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
          </div>
          <div className="p-6">
            <div className="shell-placeholder">
              <Package className="shell-placeholder-icon" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600 mb-4">
                This is a placeholder for the Inventory Management system.
              </p>
              <p className="text-sm text-gray-500">
                The full inventory management micro-frontend will be available when the remote service is running.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPlaceholder;
