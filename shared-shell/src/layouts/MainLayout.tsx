import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useSidebar, useResponsive } from '../hooks/useLayout';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen } = useSidebar();
  const { isMobile } = useResponsive();
  const { tenant, user } = useAuth();

  const content = children || <Outlet />;

  return (
    <div className="flex h-screen bg-background" data-testid="main-layout">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => useSidebar().close()}
          data-testid="mobile-overlay"
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TopBar */}
        <TopBar />

        {/* Tenant and User Info Bar */}
        {(tenant || user) && (
          <div className="bg-muted/30 border-b px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {tenant && (
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{tenant.name}</span>
                    {tenant.plan !== 'standard' && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {user && (
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <span>Logged in as: {user.email}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6" data-testid="main-content">
          <div className="max-w-7xl mx-auto">
            {content}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-4">
          <div className="px-6 text-center text-sm text-muted-foreground">
            <p>© 2024 KiTS Hub - Multi-Tenant Business Management Platform</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <a href="/help" className="hover:text-foreground">Help</a>
              <span>•</span>
              <a href="/docs" className="hover:text-foreground">Documentation</a>
              <span>•</span>
              <a href="/support" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
