"use client"

import { useState, useEffect } from 'react'
import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Package,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Settings,
  Bell,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface KPICard {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  description: string
  trend: 'up' | 'down' | 'stable'
}

interface SalesData {
  name: string
  value: number
  change: number
  category: string
}

interface InventoryData {
  name: string
  value: number
  status: 'healthy' | 'low' | 'critical'
  trend: number
}

interface CustomerData {
  segment: string
  count: number
  percentage: number
  growth: number
}

interface FinancialData {
  metric: string
  value: number
  change: number
  type: 'currency' | 'percentage'
}

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')
  const [kpiData, setKpiData] = useState<KPICard[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setKpiData([
        {
          title: "Total Revenue",
          value: "$523,180",
          change: 12.5,
          icon: <DollarSign className="h-4 w-4" />,
          description: "vs last period",
          trend: 'up'
        },
        {
          title: "Active Users",
          value: "1,842",
          change: 8.2,
          icon: <Users className="h-4 w-4" />,
          description: "vs last period",
          trend: 'up'
        },
        {
          title: "Conversion Rate",
          value: "3.2%",
          change: -2.1,
          icon: <TrendingUp className="h-4 w-4" />,
          description: "vs last period",
          trend: 'down'
        },
        {
          title: "Avg. Order Value",
          value: "$284",
          change: 5.7,
          icon: <ShoppingCart className="h-4 w-4" />,
          description: "vs last period",
          trend: 'up'
        }
      ])

      setLastUpdated(new Date())
      setIsLoading(false)
    }

    loadData()

    // Real-time updates simulation
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setKpiData(prev => prev.map(kpi => ({
          ...kpi,
          change: kpi.change + (Math.random() - 0.5) * 0.5
        })))
        setLastUpdated(new Date())
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [timeRange, realTimeEnabled])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    console.log('Exporting dashboard data...')
    // Implementation for export functionality
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'sales', label: 'Sales Analytics', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'inventory', label: 'Inventory Analytics', icon: <Package className="h-4 w-4" /> },
    { id: 'customers', label: 'Customer Analytics', icon: <Users className="h-4 w-4" /> },
    { id: 'financial', label: 'Financial Analytics', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'reports', label: 'Custom Reports', icon: <Eye className="h-4 w-4" /> }
  ]

  const salesData: SalesData[] = [
    { name: "Product A", value: 125000, change: 15, category: "Electronics" },
    { name: "Product B", value: 98000, change: -5, category: "Accessories" },
    { name: "Product C", value: 76000, change: 8, category: "Software" },
    { name: "Product D", value: 54000, change: 12, category: "Services" },
    { name: "Product E", value: 32000, change: -3, category: "Electronics" }
  ]

  const inventoryData: InventoryData[] = [
    { name: "Electronics", value: 450, status: 'healthy', trend: 5 },
    { name: "Clothing", value: 320, status: 'healthy', trend: -2 },
    { name: "Home & Garden", value: 180, status: 'low', trend: -8 },
    { name: "Sports Equipment", value: 95, status: 'critical', trend: -15 }
  ]

  const customerData: CustomerData[] = [
    { segment: "New Customers", count: 342, percentage: 22.8, growth: 15 },
    { segment: "Returning", count: 1250, percentage: 83.3, growth: 8 },
    { segment: "VIP", count: 89, percentage: 5.9, growth: 25 },
    { segment: "Inactive", count: 234, percentage: 15.6, growth: -12 }
  ]

  const financialData: FinancialData[] = [
    { metric: "Revenue", value: 523180, change: 12.5, type: 'currency' },
    { metric: "Costs", value: 287450, change: 8.3, type: 'currency' },
    { metric: "Profit", value: 235730, change: 18.2, type: 'currency' },
    { metric: "Margin", value: 45.1, change: 2.8, type: 'percentage' }
  ]

  const formatValue = (value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    } else if (type === 'percentage') {
      return `${value.toFixed(1)}%`
    }
    return new Intl.NumberFormat('en-US').format(value)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'low': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time business insights and performance metrics</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">Last updated:</span>
            <span className="text-xs text-gray-700">
              {lastUpdated.toLocaleTimeString()}
            </span>
            {realTimeEnabled && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className={realTimeEnabled ? "bg-green-50 border-green-200" : ""}
          >
            <Bell className={`h-4 w-4 mr-2 ${realTimeEnabled ? 'text-green-600' : ''}`} />
            {realTimeEnabled ? 'Live' : 'Paused'}
          </Button>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {kpi.trend === 'up' ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {Math.abs(kpi.change)}%
                  </Badge>
                ) : kpi.trend === 'down' ? (
                  <Badge variant="destructive" className="text-xs">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {Math.abs(kpi.change)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {Math.abs(kpi.change)}%
                  </Badge>
                )}
                <span>{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Sections</CardTitle>
          <CardDescription>Navigate to different analytics modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Business Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Revenue Trend
                      </CardTitle>
                      <CardDescription>Monthly revenue performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Revenue chart visualization</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Sales Distribution
                      </CardTitle>
                      <CardDescription>Revenue by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Category distribution chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sales Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Sales Performance
                      </CardTitle>
                      <CardDescription>Product sales breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salesData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{item.category}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold">{formatValue(item.value, 'currency')}</span>
                              {item.change > 0 ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{item.change}%
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {item.change}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Sales Metrics
                      </CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Sales</span>
                          <span className="font-bold">{formatValue(385000, 'currency')}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Average Deal Size</span>
                          <span className="font-bold">{formatValue(2840, 'currency')}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Sales Cycle Length</span>
                          <span className="font-bold">18 days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Win Rate</span>
                          <span className="font-bold">67.3%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Inventory Levels
                      </CardTitle>
                      <CardDescription>Current stock by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {inventoryData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${getStatusColor(item.status)} h-2 rounded-full`} 
                                  style={{ width: `${(item.value / 500) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold">{item.value}</span>
                              <Badge 
                                variant={item.status === 'critical' ? 'destructive' : item.status === 'low' ? 'outline' : 'default'}
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Stock Movement
                      </CardTitle>
                      <CardDescription>Recent inventory changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Items received today</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">+47</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Items shipped today</span>
                          <Badge variant="destructive">-23</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Low stock alerts</span>
                          <Badge variant="outline">8</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Turnover rate</span>
                          <span className="font-bold">4.2x</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Customer Segments
                      </CardTitle>
                      <CardDescription>Customer distribution by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {customerData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.segment}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold">{item.count}</span>
                              {item.growth > 0 ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{item.growth}%
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {item.growth}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Customer Metrics
                      </CardTitle>
                      <CardDescription>Key customer performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Customer Lifetime Value</span>
                          <span className="font-bold">{formatValue(1247, 'currency')}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Average Purchase Frequency</span>
                          <span className="font-bold">2.3/month</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Customer Retention Rate</span>
                          <span className="font-bold">78.5%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Net Promoter Score</span>
                          <span className="font-bold">42</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Financial Overview
                      </CardTitle>
                      <CardDescription>Revenue, costs, and profitability</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {financialData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold">
                                {formatValue(item.value, item.type)}
                              </span>
                              {item.change > 0 ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{item.change}%
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {item.change}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Cash Flow Analysis
                      </CardTitle>
                      <CardDescription>Monthly cash flow trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Cash flow chart would be rendered here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Custom Report Builder</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>Report Templates</CardTitle>
                    <CardDescription>Create and schedule custom analytics reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex-col">
                          <BarChart3 className="h-6 w-6 mb-2" />
                          Sales Report
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <Users className="h-6 w-6 mb-2" />
                          Customer Report
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <Package className="h-6 w-6 mb-2" />
                          Inventory Report
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <DollarSign className="h-6 w-6 mb-2" />
                          Financial Report
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <TrendingUp className="h-6 w-6 mb-2" />
                          Performance Report
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <Settings className="h-6 w-6 mb-2" />
                          Custom Report
                        </Button>
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        <p>Advanced report builder with drag-and-drop interface</p>
                        <p>Schedule automated reports and export to multiple formats</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
