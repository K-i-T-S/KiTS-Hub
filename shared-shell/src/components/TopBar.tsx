import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu,
  Bell,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../hooks/useLayout';

const TopBar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toggle } = useSidebar();

  const navigationItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      description: 'Business overview and metrics'
    },
    { 
      path: '/inventory', 
      label: 'Inventory', 
      description: 'Product and stock management'
    },
    { 
      path: '/pos', 
      label: 'Point of Sale', 
      description: 'Sales processing and checkout'
    },
    { 
      path: '/crm', 
      label: 'CRM', 
      description: 'Customer relationship management'
    },
    { 
      path: '/hr', 
      label: 'HR Management', 
      description: 'Employee and payroll management'
    },
    { 
      path: '/accounting', 
      label: 'Accounting', 
      description: 'Financial management and reporting'
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      description: 'Business intelligence and insights'
    },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const currentSolution = navigationItems.find(item => isActivePath(item.path) && item.path !== '/');

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40" data-testid="top-bar">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle}
            data-testid="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          {/* Current Solution Indicator */}
          {currentSolution && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">{currentSolution.label}</span>
              {currentSolution.path === '/analytics' && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="w-4 h-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User className="w-4 h-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="px-2 py-1.5 text-sm font-medium">
                {user?.name || 'Demo User'}
              </div>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {user?.email || 'admin@kits-hub.com'}
              </div>
              <div className="border-t my-1"></div>
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <div className="border-t my-1"></div>
              <DropdownMenuItem className="text-red-600" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
