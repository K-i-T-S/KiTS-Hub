"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  UserPlus, 
  UserX, 
  BarChart3,
  PieChart,
  Star,
  Heart,
  ShoppingCart,
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  churnedCustomers: number
  customerGrowthRate: number
  retentionRate: number
  averageLifetimeValue: number
  netPromoterScore: number
}

interface CustomerSegment {
  name: string
  count: number
  percentage: number
  growth: number
  averageValue: number
  characteristics: string[]
}

interface CustomerBehavior {
  metric: string
  value: number
  change: number
  description: string
}

interface TopCustomer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalSpent: number
  ordersCount: number
  avgOrderValue: number
  joinDate: string
  lastPurchase: string
  segment: string
  status: 'active' | 'inactive' | 'vip'
}

interface GeographicData {
  region: string
  customers: number
  percentage: number
  growth: number
  averageValue: number
}

const CustomerAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'segments' | 'behavior' | 'geographic'>('overview')
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null)
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [customerBehavior, setCustomerBehavior] = useState<CustomerBehavior[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [geographicData, setGeographicData] = useState<GeographicData[]>([])

  useEffect(() => {
    const loadCustomerData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockCustomerMetrics: CustomerMetrics = {
        totalCustomers: 12473,
        newCustomers: 342,
        activeCustomers: 8947,
        churnedCustomers: 89,
        customerGrowthRate: 12.5,
        retentionRate: 78.5,
        averageLifetimeValue: 1247.89,
        netPromoterScore: 42
      }

      const mockCustomerSegments: CustomerSegment[] = [
        {
          name: 'VIP Customers',
          count: 234,
          percentage: 1.9,
          growth: 25.3,
          averageValue: 5420.50,
          characteristics: ['High value', 'Frequent purchases', 'Brand loyal']
        },
        {
          name: 'Regular Customers',
          count: 3421,
          percentage: 27.4,
          growth: 8.7,
          averageValue: 892.30,
          characteristics: ['Consistent purchases', 'Medium value', 'Engaged']
        },
        {
          name: 'New Customers',
          count: 342,
          percentage: 2.7,
          growth: 15.2,
          averageValue: 234.80,
          characteristics: ['Recent acquisition', 'First purchases', 'Potential growth']
        },
        {
          name: 'Occasional Buyers',
          count: 5678,
          percentage: 45.5,
          growth: -3.2,
          averageValue: 156.40,
          characteristics: ['Infrequent purchases', 'Low engagement', 'At risk']
        },
        {
          name: 'Inactive Customers',
          count: 2798,
          percentage: 22.4,
          growth: -12.8,
          averageValue: 89.20,
          characteristics: ['No recent activity', 'High churn risk', 'Reactivation needed']
        }
      ]

      const mockCustomerBehavior: CustomerBehavior[] = [
        { metric: 'Average Purchase Frequency', value: 2.3, change: 8.5, description: 'Purchases per month' },
        { metric: 'Average Order Value', value: 284.50, change: 5.7, description: 'Per transaction' },
        { metric: 'Customer Lifetime Value', value: 1247.89, change: 12.3, description: 'Total value per customer' },
        { metric: 'Time to First Purchase', value: 3.2, change: -15.2, description: 'Days from registration' },
        { metric: 'Repeat Purchase Rate', value: 67.8, change: 4.2, description: 'Customers who buy again' },
        { metric: 'Customer Satisfaction Score', value: 4.2, change: 2.1, description: 'Out of 5 stars' }
      ]

      const mockTopCustomers: TopCustomer[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          totalSpent: 12450.80,
          ordersCount: 47,
          avgOrderValue: 265.12,
          joinDate: '2023-01-15',
          lastPurchase: '2024-06-14',
          segment: 'VIP',
          status: 'vip'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+1 (555) 234-5678',
          location: 'Los Angeles, CA',
          totalSpent: 8920.45,
          ordersCount: 35,
          avgOrderValue: 254.87,
          joinDate: '2023-03-22',
          lastPurchase: '2024-06-12',
          segment: 'VIP',
          status: 'vip'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@email.com',
          phone: '+1 (555) 345-6789',
          location: 'Chicago, IL',
          totalSpent: 6780.23,
          ordersCount: 28,
          avgOrderValue: 242.15,
          joinDate: '2023-02-10',
          lastPurchase: '2024-06-10',
          segment: 'Regular',
          status: 'active'
        },
        {
          id: '4',
          name: 'David Kim',
          email: 'david.kim@email.com',
          phone: '+1 (555) 456-7890',
          location: 'Houston, TX',
          totalSpent: 5420.90,
          ordersCount: 23,
          avgOrderValue: 235.69,
          joinDate: '2023-04-05',
          lastPurchase: '2024-06-08',
          segment: 'Regular',
          status: 'active'
        },
        {
          id: '5',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@email.com',
          phone: '+1 (555) 567-8901',
          location: 'Phoenix, AZ',
          totalSpent: 4320.15,
          ordersCount: 19,
          avgOrderValue: 227.38,
          joinDate: '2023-05-18',
          lastPurchase: '2024-06-05',
          segment: 'Regular',
          status: 'active'
        }
      ]

      const mockGeographicData: GeographicData[] = [
        { region: 'North America', customers: 6234, percentage: 49.9, growth: 12.5, averageValue: 892.30 },
        { region: 'Europe', customers: 3742, percentage: 30.0, growth: 8.3, averageValue: 756.80 },
        { region: 'Asia Pacific', customers: 1874, percentage: 15.0, growth: 25.7, averageValue: 654.20 },
        { region: 'Latin America', customers: 623, percentage: 5.0, growth: 15.2, averageValue: 432.10 }
      ]

      setCustomerMetrics(mockCustomerMetrics)
      setCustomerSegments(mockCustomerSegments)
      setCustomerBehavior(mockCustomerBehavior)
      setTopCustomers(mockTopCustomers)
      setGeographicData(mockGeographicData)
      setIsLoading(false)
    }

    loadCustomerData()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">VIP</Badge>
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customerMetrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-gray-600">Comprehensive customer insights and behavior analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(customerMetrics.totalCustomers)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(customerMetrics.customerGrowthRate)}`}>
              {getGrowthIcon(customerMetrics.customerGrowthRate)}
              <span className="ml-1">{Math.abs(customerMetrics.customerGrowthRate)}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(customerMetrics.newCustomers)}</div>
            <p className="text-xs text-gray-500">Acquired this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerMetrics.retentionRate}%</div>
            <p className="text-xs text-gray-500">Customer retention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. LTV</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customerMetrics.averageLifetimeValue)}</div>
            <p className="text-xs text-gray-500">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'segments', label: 'Segments', icon: <Users className="h-4 w-4" /> },
          { id: 'behavior', label: 'Behavior', icon: <ShoppingCart className="h-4 w-4" /> },
          { id: 'geographic', label: 'Geographic', icon: <MapPin className="h-4 w-4" /> }
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
                  <Users className="h-5 w-5 mr-2" />
                  Customer Growth Trend
                </CardTitle>
                <CardDescription>Customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Customer growth chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Customer Satisfaction
                </CardTitle>
                <CardDescription>Net Promoter Score and satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{customerMetrics.netPromoterScore}</div>
                    <p className="text-sm text-gray-500">Net Promoter Score</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">68%</div>
                      <p className="text-xs text-gray-500">Promoters</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">24%</div>
                      <p className="text-xs text-gray-500">Passives</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">8%</div>
                      <p className="text-xs text-gray-500">Detractors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'segments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Customer Segments
                </CardTitle>
                <CardDescription>Distribution by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegments.map((segment) => (
                    <div key={segment.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{segment.name}</h4>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(segment.name.includes('VIP') ? 'vip' : segment.name.includes('Inactive') ? 'inactive' : 'active')}
                          {segment.growth > 0 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{segment.growth}%
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {segment.growth}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Customers:</span>
                          <p className="font-bold">{formatNumber(segment.count)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Value:</span>
                          <p className="font-bold">{formatCurrency(segment.averageValue)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${segment.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{segment.percentage}%</span>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {segment.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Top Customers
                </CardTitle>
                <CardDescription>Highest value customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCustomers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{customer.name}</h4>
                          <p className="text-xs text-gray-500">{customer.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-xs text-gray-500">{customer.ordersCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'behavior' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Customer Behavior Metrics
                </CardTitle>
                <CardDescription>Key behavioral indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerBehavior.map((behavior) => (
                    <div key={behavior.metric} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{behavior.metric}</h4>
                        <p className="text-xs text-gray-500">{behavior.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {behavior.metric.includes('Score') ? behavior.value : 
                           behavior.metric.includes('Time') ? `${behavior.value} days` :
                           behavior.metric.includes('Rate') ? `${behavior.value}%` :
                           behavior.metric.includes('Value') ? formatCurrency(behavior.value) :
                           behavior.value}
                        </p>
                        <div className={`flex items-center text-xs ${getGrowthColor(behavior.change)}`}>
                          {getGrowthIcon(behavior.change)}
                          <span className="ml-1">{Math.abs(behavior.change)}%</span>
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
                  <Target className="h-5 w-5 mr-2" />
                  Purchase Patterns
                </CardTitle>
                <CardDescription>Customer buying behavior analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Purchase patterns chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'geographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Customers by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((region) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold">{formatNumber(region.customers)}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(region.averageValue)} avg</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {region.growth > 0 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{region.growth}%
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {region.growth}%
                            </Badge>
                          )}
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
                    <p className="text-sm">Geographic distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerAnalytics
