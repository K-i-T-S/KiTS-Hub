import React from 'react';

export default function InventoryDashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to KiTS Hub Inventory Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">1,234</div>
          <div className="text-purple-100">Total Products</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">$45,678</div>
          <div className="text-blue-100">Stock Value</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">56</div>
          <div className="text-yellow-100">Low Stock Items</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">12</div>
          <div className="text-red-100">Out of Stock</div>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Laptop Pro 15"
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  LP-001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  45
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $1,299.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    In Stock
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Wireless Mouse
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  WM-002
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $29.99
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  USB-C Hub
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UH-003
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $49.99
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
