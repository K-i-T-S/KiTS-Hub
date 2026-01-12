import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Permission, UserRole, ProtectedRouteProps } from '../types/auth.types';

/**
 * Component for protecting routes that require authentication
 * Redirects unauthenticated users to specified fallback route
 */
export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  fallback = <Navigate to="/auth/login" />,
  redirectTo 
}: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyPermission, hasAnyRole } = usePermissions();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return redirectTo ? <Navigate to={redirectTo} /> : (fallback as JSX.Element || <Navigate to="/auth/login" />);
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return redirectTo ? <Navigate to={redirectTo} /> : <Navigate to="/unauthorized" />;
  }

  // Check roles if specified
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return redirectTo ? <Navigate to={redirectTo} /> : <Navigate to="/unauthorized" />;
  }

  // User is authenticated and has required permissions/roles
  return <>{children}</>;
}

/**
 * Component for protecting content based on permissions
 * Shows fallback if user doesn't have required permission
 */
interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps): JSX.Element {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback || <></>}</>;
}

/**
 * Component for protecting content based on roles
 * Shows fallback if user doesn't have required role
 */
interface RoleGuardProps {
  children: React.ReactNode;
  role: UserRole;
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, role, fallback = null }: RoleGuardProps): JSX.Element {
  const { hasRole } = usePermissions();

  if (hasRole(role)) {
    return <>{children}</>;
  }

  return <>{fallback || <></>}</>;
}

/**
 * Component for showing content only to authenticated users
 */
interface AuthenticatedGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthenticatedGuard({ children, fallback = null }: AuthenticatedGuardProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <>{fallback || <></>}</>;
}

/**
 * Component for showing content only to unauthenticated users
 */
interface UnauthenticatedGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function UnauthenticatedGuard({ children, fallback = null }: UnauthenticatedGuardProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return <>{fallback || <></>}</>;
}
