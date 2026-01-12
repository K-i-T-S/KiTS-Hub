import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { useNavigate } from 'react-router-dom';
import { Permission, UserRole } from '../types/auth.types';

/**
 * Hook for protecting routes that require authentication
 * Redirects unauthenticated users to login page
 */
export function useRequireAuth(redirectTo: string = '/auth/login'): void {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);
}

/**
 * Hook for protecting routes that require specific permissions
 * Redirects users without required permissions
 */
export function useRequirePermission(
  permissions: Permission[],
  redirectTo: string = '/unauthorized'
): void {
  const { isLoading } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !hasAnyPermission(permissions)) {
      navigate(redirectTo);
    }
  }, [hasAnyPermission, permissions, isLoading, navigate, redirectTo]);
}

/**
 * Hook for protecting routes that require specific roles
 * Redirects users without required roles
 */
export function useRequireRole(
  roles: UserRole[],
  redirectTo: string = '/unauthorized'
): void {
  const { isLoading } = useAuth();
  const { hasAnyRole } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !hasAnyRole(roles)) {
      navigate(redirectTo);
    }
  }, [hasAnyRole, roles, isLoading, navigate, redirectTo]);
}
