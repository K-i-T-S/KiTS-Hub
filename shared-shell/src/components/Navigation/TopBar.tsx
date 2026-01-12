import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User,
  ChevronDown,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const TopBar: React.FC = () => {
  const { user, tenant } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    if (pathSegments.length > 0) {
      const solutionMap: Record<string, string> = {
        'inventory': 'Inventory Management',
        'pos': 'Point of Sale',
        'crm': 'CRM System',
        'hr': 'HR Management',
        'accounting': 'Accounting System',
        'analytics': 'Analytics Dashboard',
        'settings': 'Settings',
        'profile': 'Profile'
      };

      const firstSegment = pathSegments[0];
      if (firstSegment && solutionMap[firstSegment]) {
        breadcrumbs.push({ 
          label: solutionMap[firstSegment], 
          path: `/${firstSegment}` 
        });
      }

      // Add additional segments for nested routes
      if (pathSegments.length > 1) {
        breadcrumbs.push({ 
          label: pathSegments.slice(1).join(' ').replace(/-/g, ' ') 
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Point of Sale', path: '/pos' },
    { name: 'CRM', path: '/crm' },
    { name: 'HR', path: '/hr' },
    { name: 'Accounting', path: '/accounting' },
    { name: 'Analytics', path: '/analytics' },
  ];

  const getCurrentPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'Dashboard';
    
    const solutionMap: Record<string, string> = {
      'inventory': 'Inventory Management',
      'pos': 'Point of Sale',
      'crm': 'CRM System',
      'hr': 'HR Management',
      'accounting': 'Accounting System',
      'analytics': 'Analytics Dashboard',
      'settings': 'Settings',
      'profile': 'User Profile'
    };

    const firstSegment = pathSegments[0];
    return firstSegment && solutionMap[firstSegment] ? solutionMap[firstSegment] : 'Dashboard';
  };

  return (
    <header className="shell-topbar" style={{ backgroundColor: 'rgb(var(--card))', borderBottom: '1px solid rgb(var(--border))', boxShadow: 'var(--shadow-sm)' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button and breadcrumbs */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden lg:flex items-center space-x-2 ml-4" aria-label="Breadcrumb">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronDown className="h-4 w-4 text-gray-400 rotate-270 mr-2" />
                  )}
                  {item.path ? (
                    <NavLink
                      to={item.path}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile page title */}
            <div className="lg:hidden ml-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {getCurrentPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right side - Search, notifications, user menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="shell-search block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{tenant?.name}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Profile dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Settings
                    </NavLink>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        // Handle sign out
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-2">
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
