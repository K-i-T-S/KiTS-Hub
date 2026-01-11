import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockProducts = [
      {
        id: '1',
        name: 'Laptop Pro 15"',
        sku: 'LAPTOP-001',
        category: 'Electronics',
        price: 1299.99,
        cost: 899.99,
        current_stock: 25,
        low_stock: false,
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Wireless Mouse',
        sku: 'MOUSE-001',
        category: 'Electronics',
        price: 29.99,
        cost: 15.99,
        current_stock: 150,
        low_stock: false,
        is_active: true,
        created_at: '2024-01-10T09:30:00Z',
        updated_at: '2024-01-10T09:30:00Z'
      },
      {
        id: '3',
        name: 'Office Chair',
        sku: 'CHAIR-001',
        category: 'Furniture',
        price: 199.99,
        cost: 149.99,
        current_stock: 8,
        low_stock: true,
        is_active: true,
        created_at: '2024-01-05T14:20:00Z',
        updated_at: '2024-01-05T14:20:00Z'
      }
    ];
    setProducts(mockProducts);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="kits-input pl-10 pr-4 py-2"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="kits-input px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="kits-button kits-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
            <button className="kits-button kits-button-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="kits-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                <p className="text-2xl font-bold text-kits-primary">${product.price.toFixed(2)}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`text-sm font-medium ${
                    product.current_stock === 0 ? 'text-kits-error' : 
                    product.low_stock ? 'text-kits-warning' : 'text-kits-success'
                  }`}>
                    Stock: {product.current_stock}
                  </span>
                  {product.low_stock && (
                    <span className="text-xs text-kits-warning ml-2">Low Stock</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-kits-primary hover:text-kits-primary-hover">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchQuery || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first product.'}
          </p>
          <button className="kits-button kits-button-primary mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      )}
    </div>
  );
}
