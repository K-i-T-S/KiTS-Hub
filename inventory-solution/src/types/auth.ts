/**
 * Permission and Authentication Types
 * TypeScript interfaces for RBAC and permission management
 */

// User and Role Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Permission Check Types
export interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface PermissionResult {
  granted: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  type: 'field' | 'data' | 'context';
  field?: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

// RBAC Hook Types
export interface UsePermissionsReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  can: (resource: string, action: string, context?: any) => boolean;
  refresh: () => Promise<void>;
}

export interface UseRoleGuardReturn {
  canAccess: boolean;
  loading: boolean;
  error: string | null;
}

// Component Props Types
export interface RoleGuardProps {
  roles?: string[];
  permissions?: string[];
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean;
}

export interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface ConditionalRenderProps {
  condition: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Service Types
export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  hasPermission(userId: string, permission: string): Promise<boolean>;
  hasRole(userId: string, role: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<Permission[]>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  can: (resource: string, action: string, context?: any) => boolean;
}

// Error Types
export class AuthenticationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public requiredPermission: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Event Types
export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  timestamp: string;
  data?: Record<string, any>;
}

export enum AuthEventType {
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  TOKEN_REFRESHED = 'auth.token_refreshed',
  PERMISSION_GRANTED = 'auth.permission_granted',
  PERMISSION_REVOKED = 'auth.permission_revoked',
  ROLE_ASSIGNED = 'auth.role_assigned',
  ROLE_REVOKED = 'auth.role_revoked'
}
