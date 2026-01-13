"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  Eye,
  Target,
  Zap,
  Award
} from "lucide-react"

interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  revenueGrowth: number
  orderGrowth: number
  topPerformers: Array<{
    name: string
    revenue: number
    orders: number
    growth: number
    category: string
  }>
  salesByRegion: Array<{
    region: string
    revenue: number
    orders: number
    percentage: number
  }>
  salesTrend: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

interface SalesTarget {
  metric: string
  current: number
  target: number
  percentage: number
  period: string
}

const SalesAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'products' | 'regions' | 'trends'>('overview')
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null)
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([])

  useEffect(() => {
    const loadSalesData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockSalesMetrics: SalesMetrics = {
        totalRevenue: 523180,
        totalOrders: 1842,
        averageOrderValue: 284,
        conversionRate: 3.2,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        topPerformers: [
          { name: "Premium Laptop", revenue: 125000, orders: 45, growth: 15, category: "Electronics" },
          { name: "Wireless Mouse", revenue: 89000, orders: 445, growth: -5, category: "Accessories" },
          { name: "USB-C Hub", revenue: 67000, orders: 335, growth: 8, category: "Accessories" },
          { name: "Mechanical Keyboard", revenue: 54000, orders: 108, growth: 12, category: "Electronics" },
          { name: "Monitor Stand", revenue: 32000, orders: 160, growth: -3, category: "Accessories" }
        ],
        salesByRegion: [
          { region: "North America", revenue: 234000, orders: 823, percentage: 44.7 },
          { region: "Europe", revenue: 156000, orders: 551, percentage: 29.8 },
          { region: "Asia Pacific", revenue: 98000, orders: 345, percentage: 18.7 },
          { region: "Latin America", revenue: 35000, orders: 123, percentage: 6.7 }
        ],
        salesTrend: [
          { date: "2024-01", revenue: 42000, orders: 148 },
          { date: "2024-02", revenue: 48000, orders: 169 },
          { date: "2024-03", revenue: 52000, orders: 183 },
          { date: "2024-04", revenue: 58000, orders: 204 },
          { date: "2024-05", revenue: 55000, orders: 194 },
          { date: "2024-06", revenue: 62000, orders: 218 }
        ]
      }

      const mockSalesTargets: SalesTarget[] = [
        { metric: "Monthly Revenue", current: 523180, target: 500000, percentage: 104.6, period: "June 2024" },
        { metric: "Monthly Orders", current: 1842, target: 2000, percentage: 92.1, period: "June 2024" },
        { metric: "Conversion Rate", current: 3.2, target: 3.5, percentage: 91.4, period: "June 2024" },
        { metric: "Avg Order Value", current: 284, target: 300, percentage: 94.7, period: "June 2024" }
      ]

      setSalesMetrics(mockSalesMetrics)
      setSalesTargets(mockSalesTargets)
      setIsLoading(false)
    }

    loadSalesData()
  }, [timeRange])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getGrowthColor = (growth: number): string => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
  }

  const getTargetColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!salesMetrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600">Comprehensive sales performance and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.totalRevenue)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(salesMetrics.revenueGrowth)}`}>
              {getGrowthIcon(salesMetrics.revenueGrowth)}
              <span className="ml-1">{Math.abs(salesMetrics.revenueGrowth)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(salesMetrics.totalOrders)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(salesMetrics.orderGrowth)}`}>
              {getGrowthIcon(salesMetrics.orderGrowth)}
              <span className="ml-1">{Math.abs(salesMetrics.orderGrowth)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.averageOrderValue)}</div>
            <p className="text-xs text-gray-500">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.conversionRate}%</div>
            <p className="text-xs text-gray-500">Visitors to customers</p>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'products', label: 'Top Products', icon: <Award className="h-4 w-4" /> },
          { id: 'regions', label: 'Regional Sales', icon: <Eye className="h-4 w-4" /> },
          { id: 'trends', label: 'Trends', icon: <TrendingUp className="h-4 w-4" /> }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm ${
              selectedView === view.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {view.icon}
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on selected view */}
      <div className="mt-6">
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Sales Trend
                </CardTitle>
                <CardDescription>Revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sales trend chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Sales Targets
                </CardTitle>
                <CardDescription>Performance against goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesTargets.map((target, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{target.metric}</span>
                        <span className="text-gray-500">{target.period}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${getTargetColor(target.percentage)} h-2 rounded-full`} 
                            style={{ width: `${Math.min(target.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{target.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatCurrency(target.current)}</span>
                        <span>Target: {formatCurrency(target.target)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'products' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Performing Products
              </CardTitle>
              <CardDescription>Best-selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesMetrics.topPerformers.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-gray-500">{product.orders} orders</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {product.growth > 0 ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{product.growth}%
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {product.growth}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === 'regions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Sales by Region
                </CardTitle>
                <CardDescription>Geographic revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesMetrics.salesByRegion.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(region.revenue)}</p>
                          <p className="text-sm text-gray-500">{region.orders} orders</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${region.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{region.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Regional Distribution
                </CardTitle>
                <CardDescription>Visual breakdown by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Regional distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'trends' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Sales Trend Analysis
              </CardTitle>
              <CardDescription>Detailed sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Revenue Trend</h4>
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Revenue trend chart</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Order Volume Trend</h4>
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Order volume chart</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Recent Performance</h4>
                  <div className="space-y-2">
                    {salesMetrics.salesTrend.slice(-3).map((trend, index) => (
                      <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{trend.date}</span>
                        <div className="flex items-center space-x-4">
                          <span className="font-bold">{formatCurrency(trend.revenue)}</span>
                          <span className="text-sm text-gray-500">{trend.orders} orders</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SalesAnalytics
