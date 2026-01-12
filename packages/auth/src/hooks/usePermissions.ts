import { useCallback } from 'react';
import { useAuthContext } from '../AuthProvider';
import { 
  UsePermissionsReturn, 
  Permission, 
  UserRole 
} from '../types/auth.types';
import { PermissionUtils } from '../utils/session';

/**
 * Hook for permission checking functionality
 * Provides access to permission checking utilities
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuthContext();

  const hasPermission = useCallback((permission: Permission): boolean => {
    return PermissionUtils.hasPermission(user, permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return PermissionUtils.hasAnyPermission(user, permissions);
  }, [user]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return PermissionUtils.hasAllPermissions(user, permissions);
  }, [user]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return PermissionUtils.hasRole(user, role);
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return PermissionUtils.hasAnyRole(user, roles);
  }, [user]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: user?.permissions || [],
    role: user?.role || null
  };
}
