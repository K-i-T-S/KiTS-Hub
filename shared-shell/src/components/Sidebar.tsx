import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  Calculator, 
  BarChart3, 
  Settings,
  Home,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useLayout, useSidebar, useDarkMode } from '../hooks/useLayout';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useLayout();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { close } = useSidebar();

  const navigationItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: Home,
      badge: null,
      description: 'Business overview and metrics'
    },
    { 
      path: '/inventory', 
      label: 'Inventory', 
      icon: Package,
      badge: null,
      description: 'Product and stock management'
    },
    { 
      path: '/pos', 
      label: 'Point of Sale', 
      icon: ShoppingCart,
      badge: null,
      description: 'Sales processing and checkout'
    },
    { 
      path: '/crm', 
      label: 'CRM', 
      icon: Users,
      badge: null,
      description: 'Customer relationship management'
    },
    { 
      path: '/hr', 
      label: 'HR Management', 
      icon: UserCheck,
      badge: null,
      description: 'Employee and payroll management'
    },
    { 
      path: '/accounting', 
      label: 'Accounting', 
      icon: Calculator,
      badge: null,
      description: 'Financial management and reporting'
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      badge: 'New',
      description: 'Business intelligence and insights'
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings,
      badge: null,
      description: 'System configuration'
    },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (_path: string) => {
    if (state.screenSize === 'mobile') {
      close();
    }
  };

  return (
    <div 
      data-testid="sidebar"
      className={`
        h-full bg-background border-r flex flex-col
        ${state.screenSize === 'mobile' ? 'fixed inset-y-0 left-0 z-50 w-64' : ''}
        ${state.screenSize === 'tablet' ? (state.sidebarCollapsed ? 'w-16' : 'w-64') : ''}
        ${state.screenSize === 'desktop' ? (state.sidebarCollapsed ? 'w-16' : 'w-64') : ''}
        transition-all duration-300 ease-in-out
      `}
    >  {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            {(!state.sidebarCollapsed || state.screenSize === 'mobile') && (
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                KiTS Hub
              </span>
            )}
          </Link>
          
          {state.screenSize === 'mobile' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={close}
              data-testid="sidebar-close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
                ${state.sidebarCollapsed && state.screenSize !== 'mobile' ? 'justify-center' : ''}
              `}
              title={state.sidebarCollapsed && state.screenSize !== 'mobile' ? item.label : item.description}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {(!state.sidebarCollapsed || state.screenSize === 'mobile') && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className={`
                  absolute right-2 w-1 h-1 bg-primary rounded-full
                  ${state.sidebarCollapsed && state.screenSize !== 'mobile' ? 'hidden' : ''}
                `}></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className={state.sidebarCollapsed && state.screenSize !== 'mobile' ? 'w-full' : ''}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          data-testid="dark-mode-toggle"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {(!state.sidebarCollapsed || state.screenSize === 'mobile') && (
            <span className="ml-2">{isDark ? 'Light' : 'Dark'}</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
