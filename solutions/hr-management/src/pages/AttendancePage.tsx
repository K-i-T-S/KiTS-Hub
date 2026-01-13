import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, Plus, Filter } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breakTime: number;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  overtime: number;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: string;
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '18:00',
    breakTime: 60,
    totalHours: 8,
    status: 'present',
    overtime: 0
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    date: '2024-01-15',
    checkIn: '09:15',
    checkOut: '18:30',
    breakTime: 45,
    totalHours: 8.5,
    status: 'late',
    overtime: 0.5
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mike Johnson',
    date: '2024-01-15',
    checkIn: '',
    checkOut: '',
    breakTime: 0,
    totalHours: 0,
    status: 'absent',
    overtime: 0
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Sarah Brown',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '14:00',
    breakTime: 30,
    totalHours: 4.5,
    status: 'half-day',
    overtime: 0
  }
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'annual',
    startDate: '2024-01-20',
    endDate: '2024-01-24',
    days: 5,
    status: 'pending',
    reason: 'Family vacation'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    type: 'sick',
    startDate: '2024-01-16',
    endDate: '2024-01-17',
    days: 2,
    status: 'approved',
    reason: 'Medical appointment',
    approvedBy: 'HR Manager'
  }
];

const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getStatusBadge = (status: string) => {
    const variants = {
      'present': 'bg-green-100 text-green-800',
      'absent': 'bg-red-100 text-red-800',
      'late': 'bg-yellow-100 text-yellow-800',
      'half-day': 'bg-orange-100 text-orange-800',
      'on-leave': 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getLeaveStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleApproveLeave = (id: string) => {
    setLeaveRequests(requests =>
      requests.map(req =>
        req.id === id
          ? { ...req, status: 'approved', approvedBy: 'Current User' }
          : req
      )
    );
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(requests =>
      requests.map(req =>
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const calculateAttendanceStats = () => {
    const today = attendance.filter(record => 
      isSameDay(new Date(record.date), new Date())
    );
    
    const present = today.filter(r => r.status === 'present').length;
    const absent = today.filter(r => r.status === 'absent').length;
    const late = today.filter(r => r.status === 'late').length;
    const onLeave = today.filter(r => r.status === 'on-leave').length;
    
    return { present, absent, late, onLeave, total: today.length };
  };

  const stats = calculateAttendanceStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor employee attendance and manage leave requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
          >
            Previous Week
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
          >
            Next Week
          </Button>
          <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Manual Check-in
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manual Check-in</DialogTitle>
                <DialogDescription>
                  Record attendance for an employee
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">John Doe</SelectItem>
                      <SelectItem value="2">Jane Smith</SelectItem>
                      <SelectItem value="3">Mike Johnson</SelectItem>
                      <SelectItem value="4">Sarah Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check In</Label>
                    <Input id="checkIn" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check Out</Label>
                    <Input id="checkOut" type="time" defaultValue="18:00" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" placeholder="Optional notes" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCheckInDialogOpen(false)}>
                  Record Attendance
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% attendance rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Today</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.onLeave}</div>
                <p className="text-xs text-muted-foreground">
                  Approved leave
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Real-time attendance for {format(new Date(), 'MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Overtime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .filter(record => isSameDay(new Date(record.date), new Date()))
                    .map((record) => (
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
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{record.totalHours}h</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.overtime > 0 ? `${record.overtime}h` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance</CardTitle>
              <CardDescription>Detailed attendance records by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-auto"
                />
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-[200px]">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .filter(record => 
                      isSameDay(new Date(record.date), selectedDate) &&
                      (selectedEmployee === 'all' || record.employeeId === selectedEmployee)
                    )
                    .map((record) => (
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
                      <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{record.breakTime} min</TableCell>
                      <TableCell>{record.totalHours}h</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly View</CardTitle>
              <CardDescription>
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2">
                <div className="font-medium text-sm">Employee</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="text-center font-medium text-sm">
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-xs text-gray-500">{format(day, 'd')}</div>
                  </div>
                ))}
                
                {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Brown'].map((employee, empIndex) => (
                  <React.Fragment key={employee}>
                    <div className="font-medium text-sm">{employee}</div>
                    {weekDays.map(day => {
                      const dayAttendance = attendance.find(record => 
                        isSameDay(new Date(record.date), day) && 
                        record.employeeName === employee
                      );
                      return (
                        <div key={day.toISOString()} className="text-center p-2">
                          {dayAttendance ? (
                            <div className={`w-3 h-3 rounded-full mx-auto ${
                              dayAttendance.status === 'present' ? 'bg-green-500' :
                              dayAttendance.status === 'absent' ? 'bg-red-500' :
                              dayAttendance.status === 'late' ? 'bg-yellow-500' :
                              dayAttendance.status === 'half-day' ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`} title={dayAttendance.status} />
                          ) : (
                            <div className="w-3 h-3 rounded-full mx-auto bg-gray-300" />
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Manage employee leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {request.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{request.employeeName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{request.type}</TableCell>
                      <TableCell>{format(new Date(request.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(request.endDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{request.days}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{getLeaveStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveLeave(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectLeave(request.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Report</CardTitle>
                <CardDescription>Download detailed attendance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="month">Select Month</Label>
                    <Input id="month" type="month" className="w-full" />
                  </div>
                  <Button className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Report</CardTitle>
                <CardDescription>Employee leave balance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" variant="outline">Export Report</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendancePage;
