import React, { useState } from 'react';
import { Menu, X, Bell, Search, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation, navigationConfigs } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  solutionName: string;
  navigationKey: keyof typeof navigationConfigs;
}

export function Layout({ children, solutionName, navigationKey }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigationItems = navigationConfigs[navigationKey];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-sm h-screen transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 bg-primary">
              <h1 className={`text-white font-bold transition-all duration-300 ${sidebarOpen ? 'text-xl' : 'text-lg'}`}>
                {sidebarOpen ? 'KiTS' : 'K'}
              </h1>
            </div>
            
            {/* Navigation */}
            {sidebarOpen && <Navigation items={navigationItems} solutionName={solutionName} />}
            
            {/* User Actions */}
            <div className="mt-auto p-4 space-y-2">
              <button
                onClick={toggleSearch}
                className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {sidebarOpen && (
                <button
                  onClick={toggleProfile}
                  className="w-full flex items-center justify-between p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    {sidebarOpen && <span className="ml-2 text-sm">{user?.name || 'User'}</span>}
                  </div>
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  
                  <h2 className="text-lg font-semibold text-gray-900">{solutionName}</h2>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  {/* Notifications */}
                  <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium">{user?.name || 'User'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="py-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Search</h3>
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Type to search..."
                autoFocus
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile Dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
          <div className="bg-white rounded-lg shadow-xl w-80">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user?.name || 'User'}</h4>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <Settings className="inline h-4 w-4 mr-3" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="inline h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
