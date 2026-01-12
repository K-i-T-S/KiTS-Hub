import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  Users, 
  UserCheck, 
  Calculator, 
  BarChart3, 
  Settings, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      description: 'Business overview and metrics'
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Package,
      description: 'Product and stock management'
    },
    {
      name: 'Point of Sale',
      path: '/pos',
      icon: CreditCard,
      description: 'Sales and checkout system'
    },
    {
      name: 'CRM',
      path: '/crm',
      icon: Users,
      description: 'Customer relationship management'
    },
    {
      name: 'HR Management',
      path: '/hr',
      icon: UserCheck,
      description: 'Employee and HR operations'
    },
    {
      name: 'Accounting',
      path: '/accounting',
      icon: Calculator,
      description: 'Financial management'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      description: 'Business intelligence'
    }
  ];

  const secondaryNavItems: NavItem[] = [
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      description: 'System configuration'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      description: 'User profile and preferences'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const NavItemComponent: React.FC<{ item: NavItem; isSecondary?: boolean }> = ({ item, isSecondary = false }) => (
    <NavLink
      to={item.path}
      className={() => `
        nav-link group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${isSecondary ? 'mt-1' : ''}
        ${isActivePath(item.path) 
          ? 'active' 
          : ''
        }
      `}
    >
      <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActivePath(item.path) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
      
      <div className="flex-1 min-w-0">
        <span className="truncate">{item.name}</span>
        {item.badge && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {item.badge}
          </span>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {item.description}
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </NavLink>
  );

  return (
    <div className="shell-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">KiTS Hub</h1>
            <p className="text-xs text-gray-500">Business Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200"></div>

        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavItemComponent key={item.path} item={item} isSecondary />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={signOut}
          className="shell-button w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
