import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown, DollarSign, CreditCard, FileText } from 'lucide-react';
import { AccountingStats } from '../types/accounting';
import AccountingServiceClass from '../services/accounting';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-components';

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<AccountingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<string>('overview');
  
  const accountingService = new AccountingServiceClass('default-tenant');

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      const data = await accountingService.getAccountingStats(dateRange);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      // Here you would implement report generation functionality
      alert(`${type} report would be generated for ${dateRange.start} to ${dateRange.end}`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const downloadReport = async (type: string, format: string) => {
    try {
      // Here you would implement PDF/Excel export functionality
      alert(`${type} report would be downloaded as ${format}`);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading financial reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => downloadReport('financial-summary', 'PDF')}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => downloadReport('financial-summary', 'Excel')}>
            <Download className="w-4 h-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      <div className="flex space-x-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium mb-1">Start Date</label>
          <input
            id="start_date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="p-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium mb-1">End Date</label>
          <input
            id="end_date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="p-2 border rounded-md"
          />
        </div>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="income-statement">Income Statement</SelectItem>
            <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
            <SelectItem value="cash-flow">Cash Flow</SelectItem>
            <SelectItem value="aged-receivables">Aged Receivables</SelectItem>
            <SelectItem value="aged-payables">Aged Payables</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {stats && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.total_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue for selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.total_expenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Expenses for selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.net_income)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue minus expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.cash_balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current cash on hand
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accounts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.accounts_receivable)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.outstanding_invoices} outstanding invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Accounts Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.accounts_payable)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount owed to vendors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.overdue_invoices}
                </div>
                <p className="text-xs text-muted-foreground">
                  Invoices past due date
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.transaction_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.total_amount)}
                      </div>
                      <Badge className={
                        transaction.status === 'posted' ? 'bg-green-100 text-green-800' : 
                        transaction.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          {stats.overdue_invoices_list.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Overdue Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.overdue_invoices_list.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-500">
                            {invoice.customer_name} • Due {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.balance_due)}
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          {Math.ceil((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Generation Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateReport('income-statement')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Income Statement
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateReport('balance-sheet')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Balance Sheet
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateReport('cash-flow')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Cash Flow
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateReport('aged-receivables')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Aged Receivables
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateReport('aged-payables')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Aged Payables
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateReport('trial-balance')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Trial Balance
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
