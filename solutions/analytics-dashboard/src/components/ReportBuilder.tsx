"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Plus, 
  Download, 
  Calendar, 
  Filter,
  Settings,
  Eye,
  Trash2,
  Copy,
  Edit,
  Save,
  Play,
  Pause,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Target,
  Zap
} from "lucide-react"

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'sales' | 'inventory' | 'customer' | 'financial' | 'custom'
  type: 'summary' | 'detailed' | 'trend' | 'comparison'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand'
  status: 'active' | 'draft' | 'scheduled' | 'paused'
  lastRun?: string
  nextRun?: string
  recipients: number
  metrics: string[]
  filters: ReportFilter[]
  visualizations: Visualization[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface ReportFilter {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between'
  value: any
  label: string
}

interface Visualization {
  type: 'bar' | 'line' | 'pie' | 'table' | 'kpi'
  title: string
  dataSource: string
  config: Record<string, any>
}

interface ScheduledReport {
  id: string
  templateId: string
  templateName: string
  schedule: string
  recipients: string[]
  status: 'active' | 'paused' | 'failed'
  lastExecution?: string
  nextExecution?: string
  format: 'pdf' | 'excel' | 'csv'
}

const ReportBuilder = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'templates' | 'builder' | 'scheduled' | 'history'>('templates')
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)

  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockReportTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Monthly Sales Performance',
          description: 'Comprehensive sales report with revenue, orders, and conversion metrics',
          category: 'sales',
          type: 'detailed',
          frequency: 'monthly',
          status: 'active',
          lastRun: '2024-06-01T09:00:00Z',
          nextRun: '2024-07-01T09:00:00Z',
          recipients: 5,
          metrics: ['total_revenue', 'total_orders', 'conversion_rate', 'avg_order_value'],
          filters: [
            { field: 'date_range', operator: 'between', value: ['2024-06-01', '2024-06-30'], label: 'Date Range' }
          ],
          visualizations: [
            { type: 'bar', title: 'Revenue Trend', dataSource: 'sales_data', config: { xAxis: 'date', yAxis: 'revenue' } },
            { type: 'pie', title: 'Sales by Category', dataSource: 'sales_data', config: { groupBy: 'category' } },
            { type: 'table', title: 'Top Products', dataSource: 'sales_data', config: { sortBy: 'revenue', limit: 10 } }
          ],
          createdBy: 'admin',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-06-01T09:00:00Z'
        },
        {
          id: '2',
          name: 'Inventory Status Report',
          description: 'Real-time inventory levels, stock movements, and warehouse utilization',
          category: 'inventory',
          type: 'summary',
          frequency: 'weekly',
          status: 'active',
          lastRun: '2024-06-15T08:00:00Z',
          nextRun: '2024-06-22T08:00:00Z',
          recipients: 3,
          metrics: ['total_products', 'low_stock_items', 'turnover_rate', 'warehouse_utilization'],
          filters: [
            { field: 'status', operator: 'equals', value: ['low', 'critical'], label: 'Stock Status' }
          ],
          visualizations: [
            { type: 'kpi', title: 'Inventory Health', dataSource: 'inventory_data', config: { metrics: ['total_products', 'low_stock'] } },
            { type: 'bar', title: 'Stock Levels', dataSource: 'inventory_data', config: { groupBy: 'category' } }
          ],
          createdBy: 'warehouse_manager',
          createdAt: '2024-02-20T14:30:00Z',
          updatedAt: '2024-06-15T08:00:00Z'
        },
        {
          id: '3',
          name: 'Customer Analytics Dashboard',
          description: 'Customer segmentation, behavior analysis, and retention metrics',
          category: 'customer',
          type: 'detailed',
          frequency: 'monthly',
          status: 'scheduled',
          lastRun: '2024-06-01T10:00:00Z',
          nextRun: '2024-07-01T10:00:00Z',
          recipients: 8,
          metrics: ['total_customers', 'retention_rate', 'customer_lifetime_value', 'net_promoter_score'],
          filters: [
            { field: 'segment', operator: 'equals', value: ['vip', 'regular'], label: 'Customer Segment' }
          ],
          visualizations: [
            { type: 'pie', title: 'Customer Segments', dataSource: 'customer_data', config: { groupBy: 'segment' } },
            { type: 'line', title: 'Customer Growth', dataSource: 'customer_data', config: { xAxis: 'date', yAxis: 'count' } }
          ],
          createdBy: 'marketing_team',
          createdAt: '2024-03-10T11:15:00Z',
          updatedAt: '2024-06-01T10:00:00Z'
        },
        {
          id: '4',
          name: 'Financial Performance Review',
          description: 'Revenue, expenses, profit margins, and cash flow analysis',
          category: 'financial',
          type: 'detailed',
          frequency: 'quarterly',
          status: 'active',
          lastRun: '2024-04-01T09:00:00Z',
          nextRun: '2024-07-01T09:00:00Z',
          recipients: 12,
          metrics: ['total_revenue', 'net_profit', 'profit_margin', 'cash_flow'],
          filters: [
            { field: 'period', operator: 'equals', value: 'Q2', label: 'Fiscal Period' }
          ],
          visualizations: [
            { type: 'bar', title: 'Revenue vs Expenses', dataSource: 'financial_data', config: { groupBy: 'category' } },
            { type: 'line', title: 'Profit Trend', dataSource: 'financial_data', config: { xAxis: 'period', yAxis: 'profit' } }
          ],
          createdBy: 'finance_team',
          createdAt: '2024-01-05T16:45:00Z',
          updatedAt: '2024-04-01T09:00:00Z'
        },
        {
          id: '5',
          name: 'Custom Executive Summary',
          description: 'Tailored report for executive leadership with key business metrics',
          category: 'custom',
          type: 'summary',
          frequency: 'weekly',
          status: 'draft',
          recipients: 4,
          metrics: ['total_revenue', 'active_customers', 'net_profit', 'conversion_rate'],
          filters: [],
          visualizations: [
            { type: 'kpi', title: 'Executive KPIs', dataSource: 'executive_data', config: { metrics: ['revenue', 'customers', 'profit'] } }
          ],
          createdBy: 'executive_assistant',
          createdAt: '2024-06-10T13:20:00Z',
          updatedAt: '2024-06-10T13:20:00Z'
        }
      ]

      const mockScheduledReports: ScheduledReport[] = [
        {
          id: '1',
          templateId: '1',
          templateName: 'Monthly Sales Performance',
          schedule: 'Every 1st of month at 9:00 AM',
          recipients: ['ceo@company.com', 'sales@company.com', 'finance@company.com'],
          status: 'active',
          lastExecution: '2024-06-01T09:00:00Z',
          nextExecution: '2024-07-01T09:00:00Z',
          format: 'pdf'
        },
        {
          id: '2',
          templateId: '2',
          templateName: 'Inventory Status Report',
          schedule: 'Every Monday at 8:00 AM',
          recipients: ['warehouse@company.com', 'operations@company.com'],
          status: 'active',
          lastExecution: '2024-06-15T08:00:00Z',
          nextExecution: '2024-06-22T08:00:00Z',
          format: 'excel'
        },
        {
          id: '3',
          templateId: '3',
          templateName: 'Customer Analytics Dashboard',
          schedule: 'Every 1st of month at 10:00 AM',
          recipients: ['marketing@company.com', 'sales@company.com', 'support@company.com'],
          status: 'paused',
          lastExecution: '2024-06-01T10:00:00Z',
          nextExecution: '2024-07-01T10:00:00Z',
          format: 'pdf'
        }
      ]

      setReportTemplates(mockReportTemplates)
      setScheduledReports(mockScheduledReports)
      setIsLoading(false)
    }

    loadReportData()
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return <DollarSign className="h-4 w-4" />
      case 'inventory': return <Package className="h-4 w-4" />
      case 'customer': return <Users className="h-4 w-4" />
      case 'financial': return <TrendingUp className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'sales': return 'bg-blue-100 text-blue-800'
      case 'inventory': return 'bg-green-100 text-green-800'
      case 'customer': return 'bg-purple-100 text-purple-800'
      case 'financial': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'draft':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Draft</Badge>
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'paused':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Paused</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFrequencyLabel = (frequency: string): string => {
    switch (frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'quarterly': return 'Quarterly'
      case 'on_demand': return 'On Demand'
      default: return frequency
    }
  }

  const handleCreateReport = () => {
    setSelectedView('builder')
    setIsBuilding(true)
    setSelectedTemplate(null)
  }

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setSelectedView('builder')
    setIsBuilding(true)
  }

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setReportTemplates([newTemplate, ...reportTemplates])
  }

  const handleDeleteTemplate = (templateId: string) => {
    setReportTemplates(reportTemplates.filter(t => t.id !== templateId))
  }

  const handleToggleSchedule = (reportId: string) => {
    setScheduledReports(scheduledReports.map(report => 
      report.id === reportId 
        ? { ...report, status: report.status === 'active' ? 'paused' : 'active' }
        : report
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Report Builder</h2>
          <p className="text-gray-600">Create, schedule, and manage custom analytics reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateReport}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
          { id: 'builder', label: 'Builder', icon: <Edit className="h-4 w-4" /> },
          { id: 'scheduled', label: 'Scheduled', icon: <Clock className="h-4 w-4" /> },
          { id: 'history', label: 'History', icon: <Eye className="h-4 w-4" /> }
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
        {selectedView === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    {getStatusBadge(template.status)}
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Frequency:</span>
                      <span className="font-medium">{getFrequencyLabel(template.frequency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Recipients:</span>
                      <span className="font-medium">{template.recipients}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Metrics:</span>
                      <span className="font-medium">{template.metrics.length}</span>
                    </div>
                    
                    {template.lastRun && (
                      <div className="text-xs text-gray-500">
                        Last run: {new Date(template.lastRun).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedView === 'builder' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Report Builder
                </CardTitle>
                <CardDescription>
                  {isBuilding ? 'Configure your custom report' : 'Select a template to edit or create a new report'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Report Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter report name"
                        defaultValue={selectedTemplate?.name || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="sales">Sales</option>
                        <option value="inventory">Inventory</option>
                        <option value="customer">Customer</option>
                        <option value="financial">Financial</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describe your report"
                      defaultValue={selectedTemplate?.description || ''}
                    />
                  </div>

                  {/* Metrics Selection */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Select Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'revenue', label: 'Total Revenue', icon: <DollarSign className="h-4 w-4" /> },
                        { id: 'orders', label: 'Total Orders', icon: <Package className="h-4 w-4" /> },
                        { id: 'customers', label: 'Total Customers', icon: <Users className="h-4 w-4" /> },
                        { id: 'conversion', label: 'Conversion Rate', icon: <Target className="h-4 w-4" /> },
                        { id: 'profit', label: 'Net Profit', icon: <TrendingUp className="h-4 w-4" /> },
                        { id: 'inventory', label: 'Inventory Levels', icon: <Package className="h-4 w-4" /> },
                        { id: 'retention', label: 'Retention Rate', icon: <Zap className="h-4 w-4" /> },
                        { id: 'satisfaction', label: 'Satisfaction Score', icon: <CheckCircle className="h-4 w-4" /> }
                      ].map((metric) => (
                        <label key={metric.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" className="rounded" />
                          <div className="flex items-center space-x-2">
                            {metric.icon}
                            <span className="text-sm font-medium">{metric.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Visualization Types */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Visualization Types</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { type: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-6 w-6" /> },
                        { type: 'line', label: 'Line Chart', icon: <LineChart className="h-6 w-6" /> },
                        { type: 'pie', label: 'Pie Chart', icon: <PieChart className="h-6 w-6" /> },
                        { type: 'table', label: 'Data Table', icon: <Table className="h-6 w-6" /> }
                      ].map((viz) => (
                        <label key={viz.type} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" className="sr-only" />
                          {viz.icon}
                          <span className="text-sm font-medium mt-2">{viz.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Scheduling</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value="on_demand">On Demand</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter email addresses (comma separated)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4 pt-4">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Report
                    </Button>
                    <Button variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Test Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'scheduled' && (
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{report.templateName}</h4>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.schedule}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Format: {report.format.toUpperCase()}</span>
                        <span>Recipients: {report.recipients.length}</span>
                        {report.lastExecution && (
                          <span>Last: {new Date(report.lastExecution).toLocaleDateString()}</span>
                        )}
                        {report.nextExecution && (
                          <span>Next: {new Date(report.nextExecution).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleSchedule(report.id)}
                      >
                        {report.status === 'active' ? (
                          <><Pause className="h-3 w-3 mr-1" /> Pause</>
                        ) : (
                          <><Play className="h-3 w-3 mr-1" /> Resume</>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedView === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Report Execution History
              </CardTitle>
              <CardDescription>View and download previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Report execution history will appear here</p>
                <p className="text-sm">View, download, and analyze past report runs</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ReportBuilder
