import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Package, BarChart3, Users, Settings, TrendingUp } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Package },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/suppliers', label: 'Suppliers', icon: Users },
    { path: '/locations', label: 'Locations', icon: TrendingUp },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
            isActive(item.path)
              ? 'bg-kits-primary text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
            isActive(item.path) ? 'text-white' : 'text-gray-400'
          }`} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
