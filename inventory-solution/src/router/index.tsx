/**
 * React Router Configuration
 * Routing setup for the inventory management solution
 */

import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProductList } from '../components/ProductList';
import { ProductForm } from '../components/ProductForm';
import { ProductDetails } from '../components/ProductDetails';
import { PermissionGuard } from '../components/PermissionGuard';
import { ProductPermission } from '../types/product';
import { Dashboard, Reports, Settings, Login } from '../pages';

// Mock product for demo
const mockProduct = {
  id: '1',
  name: 'Sample Product',
  barcode: '1234567890123',
  sku: 'SAMPLE-001',
  category: 'electronics' as any,
  supplier: {
    id: '1',
    name: 'Sample Supplier',
    contactPerson: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA'
    },
    paymentTerms: 'net_30' as any,
    status: 'active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  variants: [],
  tags: [],
  status: 'active' as any,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: '1',
  updatedBy: '1'
};

// Error boundary component
const ErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-4">
          An error occurred while loading this page. Please try refreshing the page or contact support if the problem persists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  permission?: string;
}> = ({ children, permission }) => {
  // Mock authentication check - replace with actual auth logic
  const isAuthenticated = true; // Mock: always authenticated for demo
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={<Navigate to="/unauthorized" replace />}>
        {children}
      </PermissionGuard>
    );
  }

  return <>{children}</>;
};

// Route definitions
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute permission={ProductPermission.READ}>
                <ProductList
                  products={[]}
                  filter={{}}
                  onFilterChange={() => {}}
                  onProductSelect={() => {}}
                  onProductEdit={() => {}}
                  onProductDelete={() => {}}
                  onProductCreate={() => {}}
                  permissions={[ProductPermission.READ]}
                />
              </ProtectedRoute>
            )
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute permission={ProductPermission.CREATE}>
                <ProductForm
                  mode="create"
                  onSubmit={async () => {}}
                  onCancel={() => {}}
                  permissions={[ProductPermission.CREATE]}
                  suppliers={[]}
                />
              </ProtectedRoute>
            )
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute permission={ProductPermission.READ}>
                <ProductDetails
                  product={mockProduct} // Mock product for demo
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onVariantUpdate={() => {}}
                  permissions={[ProductPermission.READ]}
                />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute permission={ProductPermission.UPDATE}>
                <ProductForm
                  mode="edit"
                  product={mockProduct} // Mock product for demo
                  onSubmit={async () => {}}
                  onCancel={() => {}}
                  permissions={[ProductPermission.UPDATE]}
                  suppliers={[]}
                />
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: 'reports',
        element: <Reports />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'unauthorized',
        element: (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);

// Route loaders for data fetching
export const routeLoaders = {
  productDetail: async ({ params }: { params: { id: string } }) => {
    // Mock loader - replace with actual data fetching
    const response = await fetch(`/api/products/${params.id}`);
    if (!response.ok) {
      throw new Response('Product not found', { status: 404 });
    }
    return response.json();
  },
  
  productEdit: async ({ params }: { params: { id: string } }) => {
    // Mock loader - replace with actual data fetching
    const [productResponse, suppliersResponse] = await Promise.all([
      fetch(`/api/products/${params.id}`),
      fetch('/api/suppliers')
    ]);
    
    if (!productResponse.ok) {
      throw new Response('Product not found', { status: 404 });
    }
    
    const product = await productResponse.json();
    const suppliers = await suppliersResponse.json();
    
    return { product, suppliers };
  },
  
  productList: async ({ request }: { request: Request }) => {
    // Mock loader - replace with actual data fetching
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const filter = {
      search,
      category: category === 'all' ? undefined : category,
      page,
      limit
    };
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter })
    });
    
    return response.json();
  }
};

// Custom hook for navigation with permissions
export const useNavigationWithPermissions = () => {
  // Mock implementation - replace with actual permission checking
  const hasPermission = (permission: string): boolean => {
    // Mock: always return true for demo
    return true;
  };

  const canNavigateTo = (path: string): boolean => {
    const permissionMap: Record<string, string> = {
      '/products': ProductPermission.READ,
      '/products/new': ProductPermission.CREATE,
      '/reports': 'reports:read',
      '/settings': 'settings:read'
    };

    const requiredPermission = permissionMap[path];
    return requiredPermission ? hasPermission(requiredPermission) : true;
  };

  return {
    hasPermission,
    canNavigateTo
  };
};

// Route configuration export
export const routeConfig = {
  basePath: '/',
  defaultRoute: '/dashboard',
  loginRoute: '/login',
  unauthorizedRoute: '/unauthorized',
  
  // Route groups for navigation
  navigationGroups: [
    {
      name: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { path: '/products', label: 'Products', icon: 'Package', permission: ProductPermission.READ },
        { path: '/reports', label: 'Reports', icon: 'BarChart3', permission: 'reports:read' },
        { path: '/settings', label: 'Settings', icon: 'Settings', permission: 'settings:read' }
      ]
    }
  ]
};

// Router provider component
export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default AppRouter;
