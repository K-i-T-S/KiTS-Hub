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
import { Star, TrendingUp, Award, Plus, Edit, Eye, Calendar, Users, Target, MessageSquare, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: string;
  reviewDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  overallRating: number;
  goals: Goal[];
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'development' | 'behavioral';
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  dueDate: string;
  progress: number;
}

interface Feedback {
  id: string;
  employeeId: string;
  employeeName: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  type: 'peer' | 'manager' | 'self' | 'client';
  rating: number;
  comments: string;
  date: string;
  anonymous: boolean;
}

const mockReviews: PerformanceReview[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    reviewerId: '2',
    reviewerName: 'Jane Smith',
    reviewPeriod: 'Q4 2023',
    reviewDate: '2024-01-15',
    status: 'completed',
    overallRating: 4.2,
    goals: [
      {
        id: '1',
        title: 'Complete React Certification',
        description: 'Obtain React Developer certification',
        category: 'development',
        priority: 'high',
        status: 'completed',
        dueDate: '2023-12-31',
        progress: 100
      },
      {
        id: '2',
        title: 'Improve Code Quality',
        description: 'Reduce code review comments by 30%',
        category: 'performance',
        priority: 'medium',
        status: 'in-progress',
        dueDate: '2024-03-31',
        progress: 65
      }
    ],
    feedback: 'John has shown excellent technical skills and leadership potential. He consistently delivers high-quality work and mentors junior developers effectively.',
    strengths: ['Technical expertise', 'Problem solving', 'Team collaboration'],
    areasForImprovement: ['Time management', 'Documentation'],
    developmentPlan: 'Focus on project management skills and improve technical documentation practices.'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    reviewerId: '3',
    reviewerName: 'Mike Johnson',
    reviewPeriod: 'Q4 2023',
    reviewDate: '2024-01-10',
    status: 'submitted',
    overallRating: 4.5,
    goals: [
      {
        id: '3',
        title: 'Leadership Training',
        description: 'Complete advanced leadership course',
        category: 'development',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2024-02-28',
        progress: 75
      }
    ],
    feedback: 'Jane demonstrates exceptional leadership and strategic thinking. She has successfully managed multiple complex projects and mentored team members effectively.',
    strengths: ['Leadership', 'Strategic planning', 'Communication'],
    areasForImprovement: ['Delegation', 'Work-life balance'],
    developmentPlan: 'Continue developing delegation skills and focus on team empowerment strategies.'
  }
];

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete React Certification',
    description: 'Obtain React Developer certification',
    category: 'development',
    priority: 'high',
    status: 'completed',
    dueDate: '2023-12-31',
    progress: 100
  },
  {
    id: '2',
    title: 'Improve Code Quality',
    description: 'Reduce code review comments by 30%',
    category: 'performance',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2024-03-31',
    progress: 65
  },
  {
    id: '3',
    title: 'Leadership Training',
    description: 'Complete advanced leadership course',
    category: 'development',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2024-02-28',
    progress: 75
  },
  {
    id: '4',
    title: 'Client Communication',
    description: 'Improve client satisfaction scores',
    category: 'behavioral',
    priority: 'medium',
    status: 'not-started',
    dueDate: '2024-04-30',
    progress: 0
  }
];

const mockFeedback: Feedback[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    fromEmployeeId: '2',
    fromEmployeeName: 'Jane Smith',
    type: 'manager',
    rating: 4,
    comments: 'Excellent technical skills and problem-solving abilities. Consistently delivers high-quality work.',
    date: '2024-01-10',
    anonymous: false
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'John Doe',
    fromEmployeeId: '3',
    fromEmployeeName: 'Mike Johnson',
    type: 'peer',
    rating: 5,
    comments: 'Great team player! Always willing to help and share knowledge.',
    date: '2024-01-08',
    anonymous: true
  }
];

const PerformancePage: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>(mockReviews);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [feedback, setFeedback] = useState<Feedback[]>(mockFeedback);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('Q4 2023');
  const [activeTab, setActiveTab] = useState('overview');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'approved': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'not-started': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const calculatePerformanceStats = () => {
    const completedReviews = reviews.filter(r => r.status === 'completed');
    const avgRating = completedReviews.length > 0 
      ? completedReviews.reduce((sum, r) => sum + r.overallRating, 0) / completedReviews.length 
      : 0;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'in-progress').length;
    
    return {
      avgRating,
      totalReviews: completedReviews.length,
      completedGoals,
      inProgressGoals,
      totalGoals: goals.length
    };
  };

  const stats = calculatePerformanceStats();

  const handleCreateReview = () => {
    // Implementation for creating review
    setIsReviewDialogOpen(false);
  };

  const handleCreateGoal = () => {
    // Implementation for creating goal
    setIsGoalDialogOpen(false);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesEmployee = selectedEmployee === 'all' || review.employeeId === selectedEmployee;
    const matchesPeriod = selectedPeriod === 'all' || review.reviewPeriod === selectedPeriod;
    return matchesEmployee && matchesPeriod;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-2">Track employee performance and manage development goals</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Performance Review</DialogTitle>
                <DialogDescription>
                  Start a new performance review for an employee
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
                    <Label htmlFor="reviewer">Reviewer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Jane Smith</SelectItem>
                        <SelectItem value="3">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="period">Review Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                      <SelectItem value="Q4 2023">Q4 2023</SelectItem>
                      <SelectItem value="Q3 2023">Q3 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reviewDate">Review Date</Label>
                  <Input id="reviewDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReview}>
                  Create Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Development Goal</DialogTitle>
                <DialogDescription>
                  Set a new performance or development goal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalEmployee">Employee</Label>
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
                  <Label htmlFor="goalTitle">Goal Title</Label>
                  <Input id="goalTitle" placeholder="Enter goal title" />
                </div>
                <div>
                  <Label htmlFor="goalDescription">Description</Label>
                  <Input id="goalDescription" placeholder="Describe the goal" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">360° Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats.totalReviews} reviews
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedGoals}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressGoals}</div>
                <p className="text-xs text-muted-foreground">
                  Active goals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
                <p className="text-xs text-muted-foreground">
                  Completed reviews
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest performance evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {review.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.employeeName}</div>
                          <div className="text-sm text-gray-500">{review.reviewPeriod}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(review.overallRating)}
                        <div className="text-sm text-gray-500">{review.reviewDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Goals</CardTitle>
                <CardDescription>Goals approaching deadline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals
                    .filter(goal => goal.status === 'in-progress')
                    .slice(0, 3)
                    .map((goal) => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{goal.title}</div>
                        {getPriorityBadge(goal.priority)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{goal.description}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Due: {format(new Date(goal.dueDate), 'MMM d, yyyy')}</div>
                        <div className="text-sm font-medium">{goal.progress}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Manage employee performance evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
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
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                    <SelectItem value="Q4 2023">Q4 2023</SelectItem>
                    <SelectItem value="Q3 2023">Q3 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {review.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{review.employeeName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{review.reviewerName}</TableCell>
                      <TableCell>{review.reviewPeriod}</TableCell>
                      <TableCell>{renderStars(review.overallRating)}</TableCell>
                      <TableCell>{format(new Date(review.reviewDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
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

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Development Goals</CardTitle>
              <CardDescription>Track employee goals and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{goal.title}</div>
                          <div className="text-sm text-gray-500">{goal.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{goal.category}</TableCell>
                      <TableCell>{getPriorityBadge(goal.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-sm">{goal.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(goal.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
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

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>360° Feedback</CardTitle>
              <CardDescription>Peer and manager feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {item.fromEmployeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {item.anonymous ? 'Anonymous' : item.fromEmployeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.type} feedback for {item.employeeName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(item.rating)}
                        <div className="text-sm text-gray-500">{format(new Date(item.date), 'MMM d, yyyy')}</div>
                      </div>
                    </div>
                    <p className="text-gray-700">{item.comments}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Rating trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
                  <p className="text-gray-500">Interactive charts and trends coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Completion</CardTitle>
                <CardDescription>Goal achievement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Performance Goals</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Development Goals</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Behavioral Goals</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformancePage;
