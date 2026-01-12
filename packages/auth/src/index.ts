// Main exports for @kits-hub/auth package

// Core components
export { AuthProvider, useAuthContext, withAuth } from './AuthProvider';

// Hooks
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';
export { useOrganization } from './hooks/useOrganization';
export { useRequireAuth, useRequirePermission, useRequireRole } from './hooks/useRequireAuth';

// Route protection components
export { 
  ProtectedRoute, 
  PermissionGuard, 
  RoleGuard, 
  AuthenticatedGuard, 
  UnauthenticatedGuard 
} from './components/ProtectedRoute';

// Types and interfaces
export type {
  User,
  UserProfile,
  Organization,
  OrganizationSettings,
  AuthState,
  Session,
  AuthEvent,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthContextType,
  UseAuthReturn,
  UsePermissionsReturn,
  UseOrganizationReturn,
  ProtectedRouteProps,
  PermissionGuardProps,
  RoleGuardProps,
  TokenValidationResult,
  PasswordStrengthResult,
  SessionTimeoutConfig
} from './types/auth.types';

// Enums
export { UserRole, Permission, SubscriptionPlan, AuthErrorCode } from './types/auth.types';

// Utilities
export { sessionManager, supabase, AuthUtils, PermissionUtils } from './utils/session';
export { 
  TokenUtils, 
  PasswordUtils, 
  SessionTimeoutUtils, 
  AuthErrorUtils, 
  SecurityUtils 
} from './utils/auth-utils';

// Error class
export { AuthError } from './types/auth.types';

// Version
export const VERSION = '1.0.0';
