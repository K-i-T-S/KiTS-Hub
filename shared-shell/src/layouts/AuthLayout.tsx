import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDarkMode } from '../hooks/useLayout';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isDark } = useDarkMode();
  const content = children || <Outlet />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg mb-4">
            <span className="text-primary-foreground font-bold text-2xl">K</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            KiTS Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Multi-Tenant Business Management Platform
          </p>
        </div>

        {/* Auth form container */}
        <div className="bg-background/80 backdrop-blur-sm border rounded-2xl shadow-xl p-8">
          {content}
        </div>

        {/* Footer links */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-4">
            <a href="/help" className="hover:text-foreground transition-colors">Help</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="mt-2">
            © 2024 KiTS Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
