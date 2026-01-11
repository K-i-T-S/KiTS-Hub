import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/products', label: 'Products' },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/locations', label: 'Locations' },
    { path: '/reports', label: 'Reports' },
    { path: '/settings', label: 'Settings' },
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
          <svg
            className={`mr-3 h-5 w-5 flex-shrink-0 ${
              isActive(item.path) ? 'text-white' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
