import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Download, Plus, Eye, Edit, Trash2, Calendar, Users, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  taxes: number;
  netPay: number;
  status: 'draft' | 'processed' | 'paid' | 'failed';
  paymentDate?: string;
  paymentMethod: 'direct-deposit' | 'check' | 'cash';
  department: string;
}

interface PayrollSettings {
  taxRate: number;
  overtimeRate: number;
  paySchedule: 'weekly' | 'bi-weekly' | 'monthly';
  nextPayDate: string;
}

const mockPayroll: PayrollRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    payPeriod: '2024-01-01 - 2024-01-15',
    baseSalary: 4000,
    overtime: 200,
    bonuses: 500,
    deductions: 300,
    taxes: 850,
    netPay: 3550,
    status: 'paid',
    paymentDate: '2024-01-15',
    paymentMethod: 'direct-deposit',
    department: 'Engineering'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    payPeriod: '2024-01-01 - 2024-01-15',
    baseSalary: 5000,
    overtime: 0,
    bonuses: 1000,
    deductions: 400,
    taxes: 1100,
    netPay: 4500,
    status: 'paid',
    paymentDate: '2024-01-15',
    paymentMethod: 'direct-deposit',
    department: 'Engineering'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mike Johnson',
    payPeriod: '2024-01-01 - 2024-01-15',
    baseSalary: 2750,
    overtime: 150,
    bonuses: 200,
    deductions: 200,
    taxes: 590,
    netPay: 2310,
    status: 'processed',
    paymentMethod: 'direct-deposit',
    department: 'Sales'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Sarah Brown',
    payPeriod: '2024-01-01 - 2024-01-15',
    baseSalary: 3500,
    overtime: 0,
    bonuses: 0,
    deductions: 280,
    taxes: 770,
    netPay: 2450,
    status: 'draft',
    paymentMethod: 'check',
    department: 'Sales'
  }
];

const payrollSettings: PayrollSettings = {
  taxRate: 22,
  overtimeRate: 1.5,
  paySchedule: 'bi-weekly',
  nextPayDate: '2024-01-31'
};

const PayrollPage: React.FC = () => {
  const [payroll, setPayroll] = useState<PayrollRecord[]>(mockPayroll);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01-01 - 2024-01-15');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunPayrollDialogOpen, setIsRunPayrollDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'bg-gray-100 text-gray-800',
      'processed': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const calculatePayrollStats = () => {
    const currentPeriod = payroll.filter(record => record.payPeriod === selectedPeriod);
    const totalPayroll = currentPeriod.reduce((sum, record) => sum + record.netPay, 0);
    const totalTaxes = currentPeriod.reduce((sum, record) => sum + record.taxes, 0);
    const totalOvertime = currentPeriod.reduce((sum, record) => sum + record.overtime, 0);
    const processedCount = currentPeriod.filter(record => record.status === 'processed' || record.status === 'paid').length;
    
    return {
      totalPayroll,
      totalTaxes,
      totalOvertime,
      processedCount,
      totalCount: currentPeriod.length
    };
  };

  const stats = calculatePayrollStats();

  const handleRunPayroll = () => {
    // Implementation for running payroll
    setIsRunPayrollDialogOpen(false);
  };

  const handleProcessPayment = (id: string) => {
    setPayroll(records =>
      records.map(record =>
        record.id === id
          ? { ...record, status: 'processed' as const }
          : record
      )
    );
  };

  const handleMarkAsPaid = (id: string) => {
    setPayroll(records =>
      records.map(record =>
        record.id === id
          ? { ...record, status: 'paid' as const, paymentDate: format(new Date(), 'yyyy-MM-dd') }
          : record
      )
    );
  };

  const filteredPayroll = payroll.filter(record => {
    const matchesPeriod = record.payPeriod === selectedPeriod;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesPeriod && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-2">Process employee salaries and manage compensation</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRunPayrollDialogOpen} onOpenChange={setIsRunPayrollDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Run Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Payroll</DialogTitle>
                <DialogDescription>
                  Process payroll for the selected pay period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payPeriod">Pay Period</Label>
                  <Select defaultValue={selectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01-01 - 2024-01-15">Jan 1-15, 2024</SelectItem>
                      <SelectItem value="2024-01-16 - 2024-01-31">Jan 16-31, 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="processDate">Process Date</Label>
                    <Input id="processDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input id="paymentDate" type="date" defaultValue={payrollSettings.nextPayDate} />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payroll Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Employees to process:</span>
                      <span className="font-medium">{stats.totalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total payroll amount:</span>
                      <span className="font-medium">${stats.totalPayroll.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsRunPayrollDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRunPayroll}>
                  Process Payroll
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalPayroll.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  For {selectedPeriod}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Taxes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalTaxes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Tax withholdings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime Pay</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalOvertime.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Overtime earnings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processedCount}/{stats.totalCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCount > 0 ? Math.round((stats.processedCount / stats.totalCount) * 100) : 0}% complete
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Schedule</CardTitle>
                <CardDescription>Upcoming payroll dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Next Payroll Run</div>
                      <div className="text-sm text-gray-600">{payrollSettings.nextPayDate}</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {payrollSettings.paySchedule}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Following Payroll</div>
                      <div className="text-sm text-gray-600">Feb 15, 2024</div>
                    </div>
                    <Badge variant="outline">
                      Scheduled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common payroll tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bonus Payment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Tax Information
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Pay Stubs
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Tax Forms
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
              <CardDescription>Manage individual payroll entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01-01 - 2024-01-15">Jan 1-15, 2024</SelectItem>
                    <SelectItem value="2024-01-16 - 2024-01-31">Jan 16-31, 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayroll.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {record.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{record.employeeName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                      <TableCell>${record.overtime.toLocaleString()}</TableCell>
                      <TableCell>${record.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">${record.netPay.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="capitalize">
                        {record.paymentMethod.replace('-', ' ')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {record.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayment(record.id)}
                            >
                              Process
                            </Button>
                          )}
                          {record.status === 'processed' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(record.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Paid
                            </Button>
                          )}
                          {record.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleProcessPayment(record.id)}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Settings</CardTitle>
                <CardDescription>Configure payroll parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paySchedule">Pay Schedule</Label>
                    <Select defaultValue={payrollSettings.paySchedule}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" defaultValue={payrollSettings.taxRate} />
                  </div>
                  <div>
                    <Label htmlFor="overtimeRate">Overtime Rate (multiplier)</Label>
                    <Input id="overtimeRate" type="number" step="0.1" defaultValue={payrollSettings.overtimeRate} />
                  </div>
                  <div>
                    <Label htmlFor="nextPayDate">Next Pay Date</Label>
                    <Input id="nextPayDate" type="date" defaultValue={payrollSettings.nextPayDate} />
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>Set up tax withholdings and deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Tax Compliance Notice</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Ensure your tax settings comply with local regulations. Consult with a tax professional for accurate configuration.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Federal Tax</Label>
                      <Input type="number" className="w-24" defaultValue="15" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Label>State Tax</Label>
                      <Input type="number" className="w-24" defaultValue="5" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Label>Social Security</Label>
                      <Input type="number" className="w-24" defaultValue="6.2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Label>Medicare</Label>
                      <Input type="number" className="w-24" defaultValue="1.45" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Monthly and yearly payroll reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="summaryPeriod">Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-month">Current Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="current-quarter">Current Quarter</SelectItem>
                        <SelectItem value="current-year">Current Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Reports</CardTitle>
                <CardDescription>Generate tax forms and summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="taxYear">Tax Year</Label>
                    <Input id="taxYear" type="number" defaultValue="2024" />
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">W-2 Forms</Button>
                    <Button className="w-full" variant="outline">W-3 Forms</Button>
                    <Button className="w-full" variant="outline">941 Forms</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pay Stubs</CardTitle>
                <CardDescription>Employee pay stub documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stubEmployee">Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="1">John Doe</SelectItem>
                        <SelectItem value="2">Jane Smith</SelectItem>
                        <SelectItem value="3">Mike Johnson</SelectItem>
                        <SelectItem value="4">Sarah Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" variant="outline">Generate Pay Stubs</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollPage;
