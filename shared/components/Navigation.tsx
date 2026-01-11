import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NavigationItem } from '../types';

interface NavigationProps {
  items: NavigationItem[];
  solutionName: string;
}

export function Navigation({ items, solutionName }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const canAccess = (item: NavigationItem) => {
    if (!item.permissions || !user) return true;
    return hasPermission(item.permissions);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const filteredItems = items.filter(canAccess);

  const getIcon = (iconName: string) => {
    // Simple icon rendering - in a real app, you'd use a proper icon library
    return (
      <svg
        className={`mr-3 h-5 w-5 flex-shrink-0 ${
          isActive('/') ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {filteredItems.map((item) => {
        const active = isActive(item.path);
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              {getIcon(item.icon)}
              <span className="truncate">{item.label}</span>
            </div>
            
            {item.badge && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                active
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
      
      {/* Solution Info */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500 font-medium">{solutionName}</p>
          <p className="text-xs text-gray-400 mt-1">KiTS Hub</p>
        </div>
      </div>
    </nav>
  );
}

// Solution-specific navigation configurations
export const navigationConfigs = {
  inventory: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/products', label: 'Products', icon: 'package' },
    { path: '/suppliers', label: 'Suppliers', icon: 'users' },
    { path: '/locations', label: 'Locations', icon: 'map' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ],
  pos: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/sales', label: 'Sales', icon: 'cart' },
    { path: '/products', label: 'Products', icon: 'package' },
    { path: '/customers', label: 'Customers', icon: 'users' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ],
  crm: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/customers', label: 'Customers', icon: 'users' },
    { path: '/leads', label: 'Leads', icon: 'user-plus' },
    { path: '/opportunities', label: 'Opportunities', icon: 'target' },
    { path: '/communications', label: 'Communications', icon: 'mail' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ],
  hr: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/employees', label: 'Employees', icon: 'users' },
    { path: '/payroll', label: 'Payroll', icon: 'dollar' },
    { path: '/performance', label: 'Performance', icon: 'trending' },
    { path: '/attendance', label: 'Attendance', icon: 'clock' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ],
  accounting: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/transactions', label: 'Transactions', icon: 'credit-card' },
    { path: '/accounts', label: 'Accounts', icon: 'calculator' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ],
  analytics: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/kpi', label: 'KPIs', icon: 'pie-chart' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
    { path: '/insights', label: 'Insights', icon: 'trending' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ],
};
