import React from 'react';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { tenant, user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Tenant and User Info Bar */}
      {(tenant || user) && (
        <div className="bg-muted/30 border-b px-4 py-2">
          <div className="container mx-auto flex items-center justify-between text-sm">
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
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
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
  );
};

export default Layout;
