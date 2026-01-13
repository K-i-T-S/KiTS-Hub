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
import { Calendar, Clock, Users, Plus, Edit, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'absent' | 'late';
  notes?: string;
  breakTime: number;
  overtimeApproved: boolean;
}

interface ShiftTemplate {
  id: string;
  name: string;
  department: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
  startTime: string;
  endTime: string;
  breakTime: number;
  requiredSkills: string[];
  maxEmployees: number;
  minEmployees: number;
}

interface ShiftSwap {
  id: string;
  requesterId: string;
  requesterName: string;
  originalShiftId: string;
  originalShiftDate: string;
  originalShiftTime: string;
  targetEmployeeId?: string;
  targetEmployeeName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  requestedDate: string;
}

const mockShifts: Shift[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    department: 'Engineering',
    position: 'Senior Developer',
    shiftType: 'morning',
    startTime: '09:00',
    endTime: '17:00',
    date: '2024-01-15',
    location: 'Main Office',
    status: 'scheduled',
    breakTime: 60,
    overtimeApproved: false
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    department: 'Engineering',
    position: 'Engineering Manager',
    shiftType: 'morning',
    startTime: '09:00',
    endTime: '17:00',
    date: '2024-01-15',
    location: 'Main Office',
    status: 'in-progress',
    breakTime: 60,
    overtimeApproved: false
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mike Johnson',
    department: 'Sales',
    position: 'Sales Representative',
    shiftType: 'afternoon',
    startTime: '13:00',
    endTime: '21:00',
    date: '2024-01-15',
    location: 'Remote',
    status: 'scheduled',
    breakTime: 45,
    overtimeApproved: true
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Sarah Brown',
    department: 'Sales',
    position: 'Sales Manager',
    shiftType: 'night',
    startTime: '22:00',
    endTime: '06:00',
    date: '2024-01-15',
    location: 'Remote',
    status: 'completed',
    breakTime: 30,
    overtimeApproved: false
  }
];

const mockTemplates: ShiftTemplate[] = [
  {
    id: '1',
    name: 'Morning Shift - Engineering',
    department: 'Engineering',
    shiftType: 'morning',
    startTime: '09:00',
    endTime: '17:00',
    breakTime: 60,
    requiredSkills: ['Technical', 'Communication'],
    maxEmployees: 10,
    minEmployees: 5
  },
  {
    id: '2',
    name: 'Afternoon Shift - Sales',
    department: 'Sales',
    shiftType: 'afternoon',
    startTime: '13:00',
    endTime: '21:00',
    breakTime: 45,
    requiredSkills: ['Sales', 'Customer Service'],
    maxEmployees: 8,
    minEmployees: 3
  }
];

const mockSwaps: ShiftSwap[] = [
  {
    id: '1',
    requesterId: '1',
    requesterName: 'John Doe',
    originalShiftId: '1',
    originalShiftDate: '2024-01-16',
    originalShiftTime: '09:00 - 17:00',
    targetEmployeeId: '3',
    targetEmployeeName: 'Mike Johnson',
    status: 'pending',
    reason: 'Personal appointment',
    requestedDate: '2024-01-14'
  }
];

const ShiftSchedulingPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(mockTemplates);
  const [swaps, setSwaps] = useState<ShiftSwap[]>(mockSwaps);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('schedule');
  const [isCreateShiftDialogOpen, setIsCreateShiftDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getStatusBadge = (status: string) => {
    const variants = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'absent': 'bg-red-100 text-red-800',
      'late': 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getShiftTypeBadge = (shiftType: string) => {
    const variants = {
      'morning': 'bg-yellow-100 text-yellow-800',
      'afternoon': 'bg-blue-100 text-blue-800',
      'night': 'bg-purple-100 text-purple-800',
      'flexible': 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={variants[shiftType as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {shiftType.toUpperCase()}
      </Badge>
    );
  };

  const getSwapStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const calculateScheduleStats = () => {
    const todayShifts = shifts.filter(shift => 
      isSameDay(new Date(shift.date), new Date())
    );
    const scheduled = todayShifts.filter(s => s.status === 'scheduled').length;
    const inProgress = todayShifts.filter(s => s.status === 'in-progress').length;
    const completed = todayShifts.filter(s => s.status === 'completed').length;
    const absent = todayShifts.filter(s => s.status === 'absent').length;
    
    return { scheduled, inProgress, completed, absent, total: todayShifts.length };
  };

  const stats = calculateScheduleStats();

  const handleCreateShift = () => {
    // Implementation for creating shift
    setIsCreateShiftDialogOpen(false);
  };

  const handleCreateTemplate = () => {
    // Implementation for creating template
    setIsTemplateDialogOpen(false);
  };

  const handleApproveSwap = (id: string) => {
    setSwaps(requests =>
      requests.map(req =>
        req.id === id ? { ...req, status: 'approved' as const } : req
      )
    );
  };

  const handleRejectSwap = (id: string) => {
    setSwaps(requests =>
      requests.map(req =>
        req.id === id ? { ...req, status: 'rejected' as const } : req
      )
    );
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesDepartment = selectedDepartment === 'all' || shift.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || shift.status === selectedStatus;
    return matchesDepartment && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Scheduling</h1>
          <p className="text-gray-600 mt-2">Manage employee shifts and work schedules</p>
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
          <Dialog open={isCreateShiftDialogOpen} onOpenChange={setIsCreateShiftDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>
                  Schedule a new shift for an employee
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shiftType">Shift Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Main Office" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shiftDate">Date</Label>
                    <Input id="shiftDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" defaultValue="17:00" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" placeholder="Optional notes for this shift" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateShiftDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateShift}>
                  Create Shift
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Shift Template</DialogTitle>
                <DialogDescription>
                  Create a reusable shift template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input id="templateName" placeholder="Morning Shift Template" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateDepartment">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateShiftType">Shift Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="templateStartTime">Start Time</Label>
                    <Input id="templateStartTime" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="templateEndTime">End Time</Label>
                    <Input id="templateEndTime" type="time" defaultValue="17:00" />
                  </div>
                  <div>
                    <Label htmlFor="breakTime">Break Time (min)</Label>
                    <Input id="breakTime" type="number" defaultValue="60" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="swaps">Shift Swaps</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                <p className="text-xs text-muted-foreground">
                  Upcoming shifts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  Finished today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">
                  No-show today
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Shift Schedule</CardTitle>
              <CardDescription>Manage daily shift assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {shift.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{shift.employeeName}</div>
                            <div className="text-sm text-gray-500">{shift.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{shift.department}</TableCell>
                      <TableCell>{getShiftTypeBadge(shift.shiftType)}</TableCell>
                      <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                      <TableCell>{shift.location}</TableCell>
                      <TableCell>{getStatusBadge(shift.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calendar</CardTitle>
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
                
                {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Brown'].map((employee) => (
                  <React.Fragment key={employee}>
                    <div className="font-medium text-sm">{employee}</div>
                    {weekDays.map(day => {
                      const dayShifts = shifts.filter(shift => 
                        isSameDay(new Date(shift.date), day) && 
                        shift.employeeName === employee
                      );
                      return (
                        <div key={day.toISOString()} className="border rounded p-2 min-h-[60px]">
                          {dayShifts.map((shift, index) => (
                            <div
                              key={shift.id}
                              className={`text-xs p-1 rounded mb-1 ${
                                shift.shiftType === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                                shift.shiftType === 'afternoon' ? 'bg-blue-100 text-blue-800' :
                                shift.shiftType === 'night' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              <div className="font-medium">{shift.startTime}</div>
                              <div className="truncate">{shift.shiftType}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Templates</CardTitle>
              <CardDescription>Reusable shift patterns for quick scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {getShiftTypeBadge(template.shiftType)}
                      </div>
                      <CardDescription>{template.department}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="text-sm font-medium">
                            {template.startTime} - {template.endTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Break:</span>
                          <span className="text-sm font-medium">{template.breakTime} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Staff:</span>
                          <span className="text-sm font-medium">
                            {template.minEmployees}-{template.maxEmployees} employees
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            Use Template
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Swap Requests</CardTitle>
              <CardDescription>Manage employee shift change requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Original Shift</TableHead>
                    <TableHead>Target Employee</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {swaps.map((swap) => (
                    <TableRow key={swap.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {swap.requesterName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{swap.requesterName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{format(new Date(swap.originalShiftDate), 'MMM d, yyyy')}</div>
                          <div className="text-sm text-gray-500">{swap.originalShiftTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>{swap.targetEmployeeName || 'Open for anyone'}</TableCell>
                      <TableCell>{swap.reason}</TableCell>
                      <TableCell>{format(new Date(swap.requestedDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getSwapStatusBadge(swap.status)}</TableCell>
                      <TableCell>
                        {swap.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveSwap(swap.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectSwap(swap.id)}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Shift Coverage</CardTitle>
                <CardDescription>Department-wise shift coverage analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Engineering</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sales</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Marketing</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift Distribution</CardTitle>
                <CardDescription>Shift type distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Shift Analytics</h3>
                  <p className="text-gray-500">Interactive charts and insights coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftSchedulingPage;
