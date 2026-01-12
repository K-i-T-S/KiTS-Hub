// User and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// Role-based access control
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer'
}

export enum Permission {
  // User management
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  
  // Organization management
  ORG_READ = 'org:read',
  ORG_WRITE = 'org:write',
  ORG_DELETE = 'org:delete',
  
  // Inventory management
  INVENTORY_READ = 'inventory:read',
  INVENTORY_WRITE = 'inventory:write',
  INVENTORY_DELETE = 'inventory:delete',
  
  // Sales and POS
  SALES_READ = 'sales:read',
  SALES_WRITE = 'sales:write',
  SALES_DELETE = 'sales:delete',
  SALES_REFUND = 'sales:refund',
  
  // CRM
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_WRITE = 'customer:write',
  CUSTOMER_DELETE = 'customer:delete',
  
  // HR Management
  EMPLOYEE_READ = 'employee:read',
  EMPLOYEE_WRITE = 'employee:write',
  EMPLOYEE_DELETE = 'employee:delete',
  PAYROLL_READ = 'payroll:read',
  PAYROLL_WRITE = 'payroll:write',
  
  // Accounting
  ACCOUNTING_READ = 'accounting:read',
  ACCOUNTING_WRITE = 'accounting:write',
  REPORTS_READ = 'reports:read',
  REPORTS_WRITE = 'reports:write',
  
  // Analytics
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_WRITE = 'analytics:write',
  
  // System
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_CONFIG = 'system:config'
}

// Organization/Tenant types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  settings: OrganizationSettings;
  subscription_plan: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  date_format: string;
  language: string;
  enable_multi_currency: boolean;
  custom_fields: Record<string, any>;
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// Session and authentication state
export interface AuthState {
  user: User | null;
  organization: Organization | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// Authentication events
export interface AuthEvent {
  type: 'SIGN_IN' | 'SIGN_OUT' | 'TOKEN_REFRESHED' | 'ORGANIZATION_CHANGED' | 'ERROR';
  payload?: any;
  timestamp: number;
}

// Login and registration types
export interface LoginCredentials {
  email: string;
  password: string;
  organization_id?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_name?: string;
  phone?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

// Context and provider types
export interface AuthContextType extends AuthState {
  // Authentication actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<void>;
  
  // Organization management
  switchOrganization: (organizationId: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

// Hook return types
export interface UseAuthReturn {
  user: User | null;
  organization: Organization | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  permissions: Permission[];
  role: UserRole | null;
}

export interface UseOrganizationReturn {
  organization: Organization | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Route protection types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export interface RoleGuardProps {
  children: React.ReactNode;
  role: UserRole;
  fallback?: React.ReactNode;
}

// Utility types
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  willExpireSoon: boolean;
  expiresAt?: number;
  error?: string;
}

export interface PasswordStrengthResult {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
  suggestions: string[];
}

export interface SessionTimeoutConfig {
  warningMinutes: number;
  timeoutMinutes: number;
  extendOnActivity: boolean;
}

// Error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
