import React, { useState, useEffect } from 'react';
import { CRMService } from '../../services/api/crm-service';
import { PosService } from '../../services/api/pos-service';
import { InventoryService } from '../../services/api/inventory-service';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: number;
  averageOrderValue: number;
  revenueGrowth: number;
  customerGrowth: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  salesByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    churnedCustomersThisMonth: number;
  };
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const crmService = new CRMService();
  const posService = new PosService();
  const inventoryService = new InventoryService();

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data from different services
      const [salesSummary, customerMetrics, inventorySummary] = await Promise.all([
        posService.getSalesSummary(),
        crmService.getCustomerMetrics(),
        inventoryService.getInventorySummary(),
      ]);

      // Mock data for demonstration - in real app, this would come from actual analytics
      const mockMetrics: DashboardMetrics = {
        totalRevenue: salesSummary.totalSales || 125430,
        totalOrders: salesSummary.totalTransactions || 342,
        totalCustomers: customerMetrics.totalCustomers || 1247,
        totalProducts: inventorySummary.totalProducts || 486,
        lowStockItems: inventorySummary.lowStockItems || 23,
        averageOrderValue: salesSummary.averageSaleValue || 367.50,
        revenueGrowth: 12.5,
        customerGrowth: 8.3,
        topProducts: [
          { name: 'Premium Laptop', revenue: 15420, quantity: 12 },
          { name: 'Wireless Mouse', revenue: 8920, quantity: 89 },
          { name: 'USB-C Hub', revenue: 6780, quantity: 56 },
          { name: 'Mechanical Keyboard', revenue: 12450, quantity: 31 },
          { name: 'Monitor Stand', revenue: 4320, quantity: 24 },
        ],
        salesByMonth: [
          { month: 'Jan', revenue: 45230, orders: 123 },
          { month: 'Feb', revenue: 52180, orders: 145 },
          { month: 'Mar', revenue: 48920, orders: 134 },
          { month: 'Apr', revenue: 61340, orders: 167 },
          { month: 'May', revenue: 58760, orders: 158 },
          { month: 'Jun', revenue: 72100, orders: 198 },
        ],
        customerMetrics,
      };

      setMetrics(mockMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthColor = (growth: number): string => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number): string => {
    return growth >= 0 ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadMetrics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={loadMetrics}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className={`flex items-center text-sm ${getGrowthColor(metrics.revenueGrowth)}`}>
                  <span>{getGrowthIcon(metrics.revenueGrowth)}</span>
                  <span className="ml-1">{Math.abs(metrics.revenueGrowth)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metrics.totalOrders)}
                </p>
                <p className="text-sm text-gray-500">
                  Avg: {formatCurrency(metrics.averageOrderValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metrics.totalCustomers)}
                </p>
                <div className={`flex items-center text-sm ${getGrowthColor(metrics.customerGrowth)}`}>
                  <span>{getGrowthIcon(metrics.customerGrowth)}</span>
                  <span className="ml-1">{Math.abs(metrics.customerGrowth)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metrics.totalProducts)}
                </p>
                <p className="text-sm text-red-600">
                  {metrics.lowStockItems} low stock
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">📦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {metrics.salesByMonth.map((month, index) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(month.revenue / Math.max(...metrics.salesByMonth.map(m => m.revenue))) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{month.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="font-semibold">{formatNumber(metrics.customerMetrics.totalCustomers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="font-semibold text-green-600">
                  +{formatNumber(metrics.customerMetrics.newCustomersThisMonth)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Customers</span>
                <span className="font-semibold">{formatNumber(metrics.customerMetrics.activeCustomers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Churned This Month</span>
                <span className="font-semibold text-red-600">
                  {formatNumber(metrics.customerMetrics.churnedCustomersThisMonth)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.topProducts.map((product, index) => (
                  <tr key={product.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(product.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-medium">Generate Report</div>
                  <div className="text-sm text-gray-500">Create detailed analytics report</div>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📧</span>
                <div>
                  <div className="font-medium">Email Report</div>
                  <div className="text-sm text-gray-500">Send analytics via email</div>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <div className="font-medium">Configure Alerts</div>
                  <div className="text-sm text-gray-500">Set up custom alerts</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
