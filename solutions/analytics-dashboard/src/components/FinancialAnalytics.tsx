"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PiggyBank, 
  BarChart3,
  PieChart,
  LineChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Calculator,
  Banknote,
  TrendingUpIcon
} from "lucide-react"

interface FinancialMetrics {
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  netProfit: number
  profitMargin: number
  operatingExpenses: number
  ebitda: number
  cashFlow: number
  revenueGrowth: number
  profitGrowth: number
}

interface RevenueBreakdown {
  category: string
  amount: number
  percentage: number
  growth: number
  description: string
}

interface ExpenseBreakdown {
  category: string
  amount: number
  percentage: number
  budget: number
  variance: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface CashFlowData {
  period: string
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashFlow: number
}

interface FinancialRatio {
  name: string
  value: number
  benchmark: number
  status: 'good' | 'warning' | 'critical'
  description: string
}

interface BudgetItem {
  department: string
  budgeted: number
  actual: number
  variance: number
  variancePercentage: number
  period: string
}

const FinancialAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'revenue' | 'expenses' | 'cashflow' | 'ratios'>('overview')
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([])
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([])
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([])
  const [financialRatios, setFinancialRatios] = useState<FinancialRatio[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])

  useEffect(() => {
    const loadFinancialData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockFinancialMetrics: FinancialMetrics = {
        totalRevenue: 5231800,
        totalCosts: 2874500,
        grossProfit: 2357300,
        netProfit: 1247800,
        profitMargin: 23.8,
        operatingExpenses: 1567200,
        ebitda: 1894500,
        cashFlow: 892300,
        revenueGrowth: 12.5,
        profitGrowth: 18.2
      }

      const mockRevenueBreakdown: RevenueBreakdown[] = [
        {
          category: 'Product Sales',
          amount: 3245000,
          percentage: 62.0,
          growth: 15.3,
          description: 'Revenue from primary product sales'
        },
        {
          category: 'Services',
          amount: 1247800,
          percentage: 23.8,
          growth: 8.7,
          description: 'Revenue from consulting and support services'
        },
        {
          category: 'Subscriptions',
          amount: 523400,
          percentage: 10.0,
          growth: 25.6,
          description: 'Recurring subscription revenue'
        },
        {
          category: 'Licensing',
          amount: 216000,
          percentage: 4.1,
          growth: 5.2,
          description: 'Software licensing revenue'
        },
        {
          category: 'Other',
          amount: 0,
          percentage: 0.1,
          growth: -2.1,
          description: 'Miscellaneous revenue sources'
        }
      ]

      const mockExpenseBreakdown: ExpenseBreakdown[] = [
        {
          category: 'Cost of Goods Sold',
          amount: 1876500,
          percentage: 65.3,
          budget: 1920000,
          variance: -43500,
          trend: 'decreasing'
        },
        {
          category: 'Salaries & Benefits',
          amount: 892300,
          percentage: 31.1,
          budget: 875000,
          variance: 17300,
          trend: 'increasing'
        },
        {
          category: 'Marketing & Sales',
          amount: 342000,
          percentage: 11.9,
          budget: 350000,
          variance: -8000,
          trend: 'stable'
        },
        {
          category: 'Operations',
          amount: 234000,
          percentage: 8.1,
          budget: 225000,
          variance: 9000,
          trend: 'increasing'
        },
        {
          category: 'R&D',
          amount: 189000,
          percentage: 6.6,
          budget: 200000,
          variance: -11000,
          trend: 'decreasing'
        }
      ]

      const mockCashFlowData: CashFlowData[] = [
        {
          period: '2024-01',
          operatingCashFlow: 423000,
          investingCashFlow: -125000,
          financingCashFlow: 50000,
          netCashFlow: 348000
        },
        {
          period: '2024-02',
          operatingCashFlow: 467000,
          investingCashFlow: -89000,
          financingCashFlow: 25000,
          netCashFlow: 403000
        },
        {
          period: '2024-03',
          operatingCashFlow: 512000,
          investingCashFlow: -156000,
          financingCashFlow: 75000,
          netCashFlow: 431000
        },
        {
          period: '2024-04',
          operatingCashFlow: 489000,
          investingCashFlow: -98000,
          financingCashFlow: 10000,
          netCashFlow: 401000
        },
        {
          period: '2024-05',
          operatingCashFlow: 534000,
          investingCashFlow: -187000,
          financingCashFlow: 125000,
          netCashFlow: 472000
        },
        {
          period: '2024-06',
          operatingCashFlow: 567000,
          investingCashFlow: -234000,
          financingCashFlow: 89000,
          netCashFlow: 422000
        }
      ]

      const mockFinancialRatios: FinancialRatio[] = [
        {
          name: 'Gross Profit Margin',
          value: 45.1,
          benchmark: 40.0,
          status: 'good',
          description: 'Profitability after direct costs'
        },
        {
          name: 'Net Profit Margin',
          value: 23.8,
          benchmark: 15.0,
          status: 'good',
          description: 'Overall profitability ratio'
        },
        {
          name: 'Operating Margin',
          value: 29.9,
          benchmark: 20.0,
          status: 'good',
          description: 'Operating efficiency ratio'
        },
        {
          name: 'Current Ratio',
          value: 2.3,
          benchmark: 2.0,
          status: 'good',
          description: 'Liquidity and short-term obligations'
        },
        {
          name: 'Debt-to-Equity',
          value: 0.8,
          benchmark: 1.0,
          status: 'good',
          description: 'Financial leverage ratio'
        },
        {
          name: 'Return on Assets',
          value: 12.4,
          benchmark: 10.0,
          status: 'good',
          description: 'Asset efficiency ratio'
        }
      ]

      const mockBudgetItems: BudgetItem[] = [
        {
          department: 'Sales',
          budgeted: 350000,
          actual: 342000,
          variance: -8000,
          variancePercentage: -2.3,
          period: 'Q2 2024'
        },
        {
          department: 'Marketing',
          budgeted: 225000,
          actual: 234000,
          variance: 9000,
          variancePercentage: 4.0,
          period: 'Q2 2024'
        },
        {
          department: 'Operations',
          budgeted: 425000,
          actual: 418000,
          variance: -7000,
          variancePercentage: -1.6,
          period: 'Q2 2024'
        },
        {
          department: 'R&D',
          budgeted: 200000,
          actual: 189000,
          variance: -11000,
          variancePercentage: -5.5,
          period: 'Q2 2024'
        },
        {
          department: 'Admin',
          budgeted: 175000,
          actual: 182000,
          variance: 7000,
          variancePercentage: 4.0,
          period: 'Q2 2024'
        }
      ]

      setFinancialMetrics(mockFinancialMetrics)
      setRevenueBreakdown(mockRevenueBreakdown)
      setExpenseBreakdown(mockExpenseBreakdown)
      setCashFlowData(mockCashFlowData)
      setFinancialRatios(mockFinancialRatios)
      setBudgetItems(mockBudgetItems)
      setIsLoading(false)
    }

    loadFinancialData()
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

  const getRatioStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRatioStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getVarianceColor = (variance: number): string => {
    return variance >= 0 ? 'text-red-600' : 'text-green-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!financialMetrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Analytics</h2>
          <p className="text-gray-600">Comprehensive financial performance and insights</p>
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
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.totalRevenue)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(financialMetrics.revenueGrowth)}`}>
              {getGrowthIcon(financialMetrics.revenueGrowth)}
              <span className="ml-1">{Math.abs(financialMetrics.revenueGrowth)}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <PiggyBank className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.netProfit)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(financialMetrics.profitGrowth)}`}>
              {getGrowthIcon(financialMetrics.profitGrowth)}
              <span className="ml-1">{Math.abs(financialMetrics.profitGrowth)}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialMetrics.profitMargin}%</div>
            <p className="text-xs text-gray-500">Net profit margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.cashFlow)}</div>
            <p className="text-xs text-gray-500">Net cash position</p>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
          { id: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" /> },
          { id: 'cashflow', label: 'Cash Flow', icon: <Wallet className="h-4 w-4" /> },
          { id: 'ratios', label: 'Ratios', icon: <Calculator className="h-4 w-4" /> }
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
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Financial Performance
                </CardTitle>
                <CardDescription>Key financial metrics overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialMetrics.totalRevenue)}</div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(financialMetrics.netProfit)}</div>
                      <p className="text-sm text-gray-600">Net Profit</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gross Profit</span>
                      <span className="font-bold">{formatCurrency(financialMetrics.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Operating Expenses</span>
                      <span className="font-bold">{formatCurrency(financialMetrics.operatingExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">EBITDA</span>
                      <span className="font-bold">{formatCurrency(financialMetrics.ebitda)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Budget vs Actual
                </CardTitle>
                <CardDescription>Departmental budget performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgetItems.map((item) => (
                    <div key={item.department} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{item.department}</h4>
                        <p className="text-xs text-gray-500">{item.period}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{formatCurrency(item.actual)}</span>
                          <span className={`text-xs ${getVarianceColor(item.variance)}`}>
                            {item.variance >= 0 ? '+' : ''}{item.variancePercentage}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Budget: {formatCurrency(item.budgeted)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Revenue sources and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBreakdown.map((item) => (
                    <div key={item.category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.category}</h4>
                        <div className="flex items-center space-x-2">
                          {item.growth > 0 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{item.growth}%
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {item.growth}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-bold">{formatCurrency(item.amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Percentage:</span>
                          <p className="font-bold">{item.percentage}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Revenue Distribution
                </CardTitle>
                <CardDescription>Visual breakdown of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Revenue distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Expense Breakdown
                </CardTitle>
                <CardDescription>Cost categories and budget variance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((item) => (
                    <div key={item.category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.category}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={item.trend === 'increasing' ? 'destructive' : item.trend === 'decreasing' ? 'default' : 'outline'}
                            className={item.trend === 'decreasing' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {item.trend}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Actual:</span>
                          <p className="font-bold">{formatCurrency(item.amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <p className="font-bold">{formatCurrency(item.budget)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{item.percentage}%</span>
                        </div>
                        <div className={`text-sm font-bold ${getVarianceColor(item.variance)}`}>
                          {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
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
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Expense Trends
                </CardTitle>
                <CardDescription>Monthly expense patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Expense trends chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'cashflow' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                Cash Flow Analysis
              </CardTitle>
              <CardDescription>Detailed cash flow movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Cash flow trend chart</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {cashFlowData.slice(-3).map((period) => (
                    <div key={period.period} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{period.period}</h4>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(period.netCashFlow)}</p>
                          <p className="text-sm text-gray-500">Net Cash Flow</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Operating:</span>
                          <p className="font-bold text-green-600">{formatCurrency(period.operatingCashFlow)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Investing:</span>
                          <p className="font-bold text-red-600">{formatCurrency(period.investingCashFlow)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Financing:</span>
                          <p className="font-bold text-blue-600">{formatCurrency(period.financingCashFlow)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === 'ratios' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Financial Ratios
              </CardTitle>
              <CardDescription>Key performance indicators and benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialRatios.map((ratio) => (
                  <div key={ratio.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{ratio.name}</h4>
                        {getRatioStatusBadge(ratio.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{ratio.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getRatioStatusColor(ratio.status)}`}>
                        {ratio.name.includes('Ratio') || ratio.name.includes('Margin') ? `${ratio.value}%` : ratio.value}
                      </div>
                      <p className="text-sm text-gray-500">Benchmark: {ratio.benchmark}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FinancialAnalytics
