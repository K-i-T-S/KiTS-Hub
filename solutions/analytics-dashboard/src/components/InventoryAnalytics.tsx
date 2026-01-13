"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Activity,
  Truck,
  Warehouse,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download
} from "lucide-react"

interface InventoryMetrics {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  turnoverRate: number
  averageDaysInStock: number
  warehouseCapacity: number
  utilizationRate: number
}

interface StockItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  reorderLevel: number
  maxStock: number
  unitPrice: number
  totalValue: number
  status: 'healthy' | 'low' | 'critical' | 'out_of_stock'
  trend: number
  lastUpdated: string
  location: string
}

interface StockMovement {
  id: string
  type: 'in' | 'out' | 'adjustment'
  productId: string
  productName: string
  quantity: number
  reason: string
  timestamp: string
  userId: string
}

interface WarehouseData {
  name: string
  capacity: number
  utilized: number
  available: number
  efficiency: number
  location: string
}

const InventoryAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'stock' | 'movements' | 'warehouses'>('overview')
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null)
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [warehouseData, setWarehouseData] = useState<WarehouseData[]>([])

  useEffect(() => {
    const loadInventoryData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockInventoryMetrics: InventoryMetrics = {
        totalProducts: 1247,
        totalValue: 2847500,
        lowStockItems: 47,
        outOfStockItems: 12,
        turnoverRate: 4.2,
        averageDaysInStock: 45,
        warehouseCapacity: 5000,
        utilizationRate: 78.5
      }

      const mockStockItems: StockItem[] = [
        {
          id: '1',
          name: 'Premium Laptop',
          sku: 'LP-001',
          category: 'Electronics',
          currentStock: 45,
          reorderLevel: 20,
          maxStock: 100,
          unitPrice: 899.99,
          totalValue: 40499.55,
          status: 'healthy',
          trend: 5,
          lastUpdated: '2024-06-15T10:30:00Z',
          location: 'Warehouse A - Zone 1'
        },
        {
          id: '2',
          name: 'Wireless Mouse',
          sku: 'MS-002',
          category: 'Accessories',
          currentStock: 18,
          reorderLevel: 25,
          maxStock: 150,
          unitPrice: 29.99,
          totalValue: 539.82,
          status: 'low',
          trend: -8,
          lastUpdated: '2024-06-15T09:15:00Z',
          location: 'Warehouse B - Zone 3'
        },
        {
          id: '3',
          name: 'USB-C Hub',
          sku: 'HB-003',
          category: 'Accessories',
          currentStock: 5,
          reorderLevel: 15,
          maxStock: 80,
          unitPrice: 49.99,
          totalValue: 249.95,
          status: 'critical',
          trend: -15,
          lastUpdated: '2024-06-15T11:45:00Z',
          location: 'Warehouse A - Zone 2'
        },
        {
          id: '4',
          name: 'Mechanical Keyboard',
          sku: 'KB-004',
          category: 'Electronics',
          currentStock: 0,
          reorderLevel: 10,
          maxStock: 60,
          unitPrice: 129.99,
          totalValue: 0,
          status: 'out_of_stock',
          trend: -25,
          lastUpdated: '2024-06-15T08:00:00Z',
          location: 'Warehouse C - Zone 1'
        },
        {
          id: '5',
          name: 'Monitor Stand',
          sku: 'ST-005',
          category: 'Accessories',
          currentStock: 67,
          reorderLevel: 30,
          maxStock: 100,
          unitPrice: 39.99,
          totalValue: 2679.33,
          status: 'healthy',
          trend: 12,
          lastUpdated: '2024-06-15T10:00:00Z',
          location: 'Warehouse B - Zone 2'
        }
      ]

      const mockStockMovements: StockMovement[] = [
        {
          id: '1',
          type: 'in',
          productId: '1',
          productName: 'Premium Laptop',
          quantity: 25,
          reason: 'Purchase Order #PO-2024-067',
          timestamp: '2024-06-15T08:30:00Z',
          userId: 'user-001'
        },
        {
          id: '2',
          type: 'out',
          productId: '2',
          productName: 'Wireless Mouse',
          quantity: 12,
          reason: 'Sales Order #SO-2024-1234',
          timestamp: '2024-06-15T09:15:00Z',
          userId: 'user-002'
        },
        {
          id: '3',
          type: 'adjustment',
          productId: '3',
          productName: 'USB-C Hub',
          quantity: -5,
          reason: 'Damage/Loss Adjustment',
          timestamp: '2024-06-15T10:45:00Z',
          userId: 'user-003'
        },
        {
          id: '4',
          type: 'out',
          productId: '4',
          productName: 'Mechanical Keyboard',
          quantity: 8,
          reason: 'Sales Order #SO-2024-1235',
          timestamp: '2024-06-15T11:00:00Z',
          userId: 'user-002'
        },
        {
          id: '5',
          type: 'in',
          productId: '5',
          productName: 'Monitor Stand',
          quantity: 30,
          reason: 'Purchase Order #PO-2024-068',
          timestamp: '2024-06-15T12:00:00Z',
          userId: 'user-001'
        }
      ]

      const mockWarehouseData: WarehouseData[] = [
        {
          name: 'Warehouse A',
          capacity: 2000,
          utilized: 1650,
          available: 350,
          efficiency: 82.5,
          location: 'New York'
        },
        {
          name: 'Warehouse B',
          capacity: 1500,
          utilized: 1180,
          available: 320,
          efficiency: 78.7,
          location: 'Los Angeles'
        },
        {
          name: 'Warehouse C',
          capacity: 1000,
          utilized: 720,
          available: 280,
          efficiency: 72.0,
          location: 'Chicago'
        },
        {
          name: 'Warehouse D',
          capacity: 500,
          utilized: 290,
          available: 210,
          efficiency: 58.0,
          location: 'Houston'
        }
      ]

      setInventoryMetrics(mockInventoryMetrics)
      setStockItems(mockStockItems)
      setStockMovements(mockStockMovements)
      setWarehouseData(mockWarehouseData)
      setIsLoading(false)
    }

    loadInventoryData()
  }, [timeRange])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'low': return 'bg-yellow-500'
      case 'critical': return 'bg-orange-500'
      case 'out_of_stock': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'low':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Low Stock</Badge>
      case 'critical':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Critical</Badge>
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'out': return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case 'adjustment': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type: string): string => {
    switch (type) {
      case 'in': return 'text-green-600'
      case 'out': return 'text-red-600'
      case 'adjustment': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!inventoryMetrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Analytics</h2>
          <p className="text-gray-600">Real-time inventory insights and stock management</p>
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(inventoryMetrics.totalProducts)}</div>
            <p className="text-xs text-gray-500">Across all warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryMetrics.totalValue)}</div>
            <p className="text-xs text-gray-500">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inventoryMetrics.lowStockItems}</div>
            <p className="text-xs text-gray-500">{inventoryMetrics.outOfStockItems} out of stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryMetrics.turnoverRate}x</div>
            <p className="text-xs text-gray-500">{inventoryMetrics.averageDaysInStock} days avg</p>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'stock', label: 'Stock Levels', icon: <Package className="h-4 w-4" /> },
          { id: 'movements', label: 'Movements', icon: <Activity className="h-4 w-4" /> },
          { id: 'warehouses', label: 'Warehouses', icon: <Warehouse className="h-4 w-4" /> }
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
                  <Package className="h-5 w-5 mr-2" />
                  Stock Status Overview
                </CardTitle>
                <CardDescription>Current inventory health status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Healthy Stock</span>
                    </div>
                    <span className="text-sm font-bold">
                      {stockItems.filter(item => item.status === 'healthy').length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Low Stock</span>
                    </div>
                    <span className="text-sm font-bold">
                      {stockItems.filter(item => item.status === 'low').length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Critical</span>
                    </div>
                    <span className="text-sm font-bold">
                      {stockItems.filter(item => item.status === 'critical').length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Out of Stock</span>
                    </div>
                    <span className="text-sm font-bold">
                      {stockItems.filter(item => item.status === 'out_of_stock').length} items
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Warehouse className="h-5 w-5 mr-2" />
                  Warehouse Utilization
                </CardTitle>
                <CardDescription>Storage capacity across facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouseData.map((warehouse) => (
                    <div key={warehouse.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{warehouse.name}</span>
                        <span className="text-gray-500">{warehouse.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${warehouse.efficiency >= 80 ? 'bg-green-500' : warehouse.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded-full`} 
                            style={{ width: `${warehouse.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{warehouse.efficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatNumber(warehouse.utilized)} utilized</span>
                        <span>{formatNumber(warehouse.available)} available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'stock' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Stock Levels
              </CardTitle>
              <CardDescription>Detailed inventory status by product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${getStatusColor(item.status)} rounded-full`}></div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.sku} • {item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(item.status)}
                        {item.trend !== 0 && (
                          <div className={`flex items-center ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="text-xs ml-1">{Math.abs(item.trend)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Current Stock:</span>
                        <p className="font-bold">{item.currentStock}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reorder Level:</span>
                        <p className="font-bold">{item.reorderLevel}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Price:</span>
                        <p className="font-bold">{formatCurrency(item.unitPrice)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value:</span>
                        <p className="font-bold">{formatCurrency(item.totalValue)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{item.location}</span>
                      <span>Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === 'movements' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Stock Movements
              </CardTitle>
              <CardDescription>Latest inventory transactions and adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <h4 className="font-medium text-sm">{movement.productName}</h4>
                        <p className="text-xs text-gray-500">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-sm font-bold ${getMovementColor(movement.type)}`}>
                        {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                        {Math.abs(movement.quantity)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === 'warehouses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Warehouse className="h-5 w-5 mr-2" />
                  Warehouse Performance
                </CardTitle>
                <CardDescription>Key metrics for each facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouseData.map((warehouse) => (
                    <div key={warehouse.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{warehouse.name}</h4>
                          <p className="text-sm text-gray-500">{warehouse.location}</p>
                        </div>
                        <Badge variant={warehouse.efficiency >= 80 ? 'default' : warehouse.efficiency >= 60 ? 'outline' : 'destructive'}>
                          {warehouse.efficiency.toFixed(1)}% efficient
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Capacity:</span>
                          <p className="font-bold">{formatNumber(warehouse.capacity)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Utilized:</span>
                          <p className="font-bold">{formatNumber(warehouse.utilized)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Available:</span>
                          <p className="font-bold">{formatNumber(warehouse.available)}</p>
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
                  <Truck className="h-5 w-5 mr-2" />
                  Warehouse Distribution
                </CardTitle>
                <CardDescription>Inventory distribution across locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Warehouse className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Warehouse distribution chart</p>
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

export default InventoryAnalytics
