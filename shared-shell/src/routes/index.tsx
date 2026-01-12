import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from '../components/Navigation/Sidebar';
import TopBar from '../components/Navigation/TopBar';
import { CreditCard, Users, UserCheck, BarChart3 } from 'lucide-react';

// Local components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Settings = lazy(() => import('../pages/Settings'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const GlobalStateDemo = lazy(() => import('../components/Demo/GlobalStateDemo'));

// Placeholder components for remote applications
const InventoryPage = lazy(() => import('../components/Placeholders/InventoryPlaceholder'));
const POSPage = lazy(() => import('../components/Placeholders/GenericPlaceholder').then(module => ({ 
  default: () => <module.default title="Point of Sale" description="Process sales and manage transactions" icon={<CreditCard />} port="4178" />
})));
const CRMPage = lazy(() => import('../components/Placeholders/GenericPlaceholder').then(module => ({ 
  default: () => <module.default title="CRM System" description="Manage customer relationships and communications" icon={<Users />} port="4179" />
})));
const HRPage = lazy(() => import('../components/Placeholders/GenericPlaceholder').then(module => ({ 
  default: () => <module.default title="HR Management" description="Manage employees, attendance, and payroll" icon={<UserCheck />} port="4180" />
})));
const AccountingPage = lazy(() => import('../components/Placeholders/AccountingPlaceholder'));
const AnalyticsPage = lazy(() => import('../components/Placeholders/GenericPlaceholder').then(module => ({ 
  default: () => <module.default title="Analytics Dashboard" description="View business insights and reports" icon={<BarChart3 />} port="4182" />
})));

// Layout component with navigation
const AppLayout = () => {
  return (
    <div className="shell-layout min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* TopBar */}
          <TopBar />
          
          {/* Page content */}
          <main className="shell-content flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary showRetry={true} showHome={true}>Error loading page</ErrorBoundary>,
    children: [
      // Public routes
      {
        path: 'login',
        element: (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Login />
          </Suspense>
        )
      },
      
      // Protected routes
      {
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
          // Dashboard/Home
          {
            index: true,
            element: (
              <Suspense fallback={<div className="loading">Loading dashboard...</div>}>
                <Dashboard />
              </Suspense>
            )
          },
          
          // Inventory Management routes
          {
            path: 'inventory/*',
            element: (
              <Suspense fallback={<div className="loading">Loading inventory...</div>}>
                <InventoryPage />
              </Suspense>
            )
          },
          
          // Point of Sale routes
          {
            path: 'pos/*',
            element: (
              <Suspense fallback={<div className="loading">Loading POS...</div>}>
                <POSPage />
              </Suspense>
            )
          },
          
          // CRM System routes
          {
            path: 'crm/*',
            element: (
              <Suspense fallback={<div className="loading">Loading CRM...</div>}>
                <CRMPage />
              </Suspense>
            )
          },
          
          // HR Management routes
          {
            path: 'hr/*',
            element: (
              <Suspense fallback={<div className="loading">Loading HR...</div>}>
                <HRPage />
              </Suspense>
            )
          },
          
          // Accounting System routes
          {
            path: 'accounting/*',
            element: (
              <Suspense fallback={<div className="loading">Loading accounting...</div>}>
                <AccountingPage />
              </Suspense>
            )
          },
          
          // Analytics Dashboard routes
          {
            path: 'analytics/*',
            element: (
              <Suspense fallback={<div className="loading">Loading analytics...</div>}>
                <AnalyticsPage />
              </Suspense>
            )
          },
          
          // Settings page
          {
            path: 'settings',
            element: (
              <Suspense fallback={<div className="loading">Loading settings...</div>}>
                <Settings />
              </Suspense>
            )
          },
          
          // User profile
          {
            path: 'profile',
            element: (
              <Suspense fallback={<div className="loading">Loading profile...</div>}>
                <Profile />
              </Suspense>
            )
          },
          
          // Demo route for global state management
          {
            path: 'demo',
            element: (
              <Suspense fallback={<div className="loading">Loading demo...</div>}>
                <GlobalStateDemo />
              </Suspense>
            )
          }
        ]
      },
      
      // Catch all route - redirect to dashboard
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

// Router provider component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

// Export individual route components for testing
export { InventoryPage, POSPage, CRMPage, HRPage, AccountingPage, AnalyticsPage };
