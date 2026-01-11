import React from 'react';
import { Package, Users, MapPin, BarChart3, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-6 bg-kits-primary">
              <h1 className="text-white text-xl font-bold">KiTS</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <a href="/" className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Package className="text-gray-400 mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a href="/products" className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Package className="text-gray-400 mr-3 h-5 w-5" />
                Products
              </a>
              <a href="/suppliers" className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Users className="text-gray-400 mr-3 h-5 w-5" />
                Suppliers
              </a>
              <a href="/locations" className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <MapPin className="text-gray-400 mr-3 h-5 w-5" />
                Locations
              </a>
              <a href="/reports" className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <BarChart3 className="text-gray-400 mr-3 h-5 w-5" />
                Reports
              </a>
              <a href="/settings" className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Settings className="text-gray-400 mr-3 h-5 w-5" />
                Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
                <div className="flex items-center space-x-4">
                  <button className="bg-kits-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-kits-primary-hover">
                    + Add Product
                  </button>
                  <button className="bg-kits-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-kits-secondary-hover">
                    Import
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-100">
            <div className="py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
