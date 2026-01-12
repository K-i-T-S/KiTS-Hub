import { 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  Calculator, 
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      icon: Package,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Sales Today',
      value: '$8,542',
      icon: ShoppingCart,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Active Customers',
      value: '892',
      icon: Users,
      change: '+4%',
      changeType: 'positive'
    },
    {
      title: 'Employees',
      value: '45',
      icon: UserCheck,
      change: '0%',
      changeType: 'neutral'
    },
    {
      title: 'Revenue MTD',
      value: '$124,563',
      icon: DollarSign,
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Growth Rate',
      value: '23%',
      icon: TrendingUp,
      change: '+2%',
      changeType: 'positive'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'New order received', time: '2 minutes ago', icon: ShoppingCart },
    { id: 2, action: 'Product updated', time: '15 minutes ago', icon: Package },
    { id: 3, action: 'Customer registered', time: '1 hour ago', icon: Users },
    { id: 4, action: 'Payment processed', time: '2 hours ago', icon: DollarSign },
    { id: 5, action: 'Report generated', time: '3 hours ago', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to KiTS Hub - Your Business Command Center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">Add Product</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">New Sale</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">Add Customer</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">Manage Staff</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">Generate Invoice</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">View Reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
