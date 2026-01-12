import { createClient, SupabaseClient, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import { 
  User, 
  Session, 
  Organization, 
  UserRole, 
  Permission,
  AuthError,
  AuthErrorCode,
  TokenValidationResult,
  PasswordStrengthResult
} from '../types/auth.types';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // We'll manage session in memory only
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Session management utilities
export class SessionManager {
  private static instance: SessionManager;
  private currentSession: Session | null = null;
  private currentOrganization: Organization | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Convert Supabase session to our Session type
  private async convertSupabaseSession(supabaseSession: SupabaseSession | null): Promise<Session | null> {
    if (!supabaseSession) return null;

    return {
      access_token: supabaseSession.access_token,
      refresh_token: supabaseSession.refresh_token || '',
      expires_at: supabaseSession.expires_at || Date.now() + 3600000, // Default 1 hour
      user: await this.convertSupabaseUser(supabaseSession.user)
    };
  }

  // Convert Supabase user to our User type
  async convertSupabaseUser(supabaseUser: SupabaseUser | null): Promise<User> {
    if (!supabaseUser) {
      throw new AuthError('User not found', AuthErrorCode.USER_NOT_FOUND);
    }

    // Fetch user profile and role from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles(
          role,
          permissions
        )
      `)
      .eq('user_id', supabaseUser.id)
      .single();

    if (profileError || !profile) {
      throw new AuthError('User profile not found', AuthErrorCode.USER_NOT_FOUND);
    }

    const userRole = profile.user_roles?.[0]?.role || UserRole.VIEWER;
    const permissions = profile.user_roles?.[0]?.permissions || [];

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: `${profile.first_name} ${profile.last_name}`,
      avatar_url: profile.avatar_url,
      role: userRole,
      permissions,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at,
      last_sign_in_at: supabaseUser.last_sign_in_at
    };
  }

  // Set current session
  async setSession(supabaseSession: SupabaseSession | null): Promise<void> {
    this.currentSession = await this.convertSupabaseSession(supabaseSession);
    
    if (this.currentSession) {
      this.scheduleTokenRefresh();
    } else {
      this.clearTokenRefresh();
    }
  }

  // Get current session
  getSession(): Session | null {
    return this.currentSession;
  }

  // Get current user
  getUser(): User | null {
    return this.currentSession?.user || null;
  }

  // Set current organization
  setOrganization(organization: Organization | null): void {
    this.currentOrganization = organization;
  }

  // Get current organization
  getOrganization(): Organization | null {
    return this.currentOrganization;
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (!this.currentSession) return;

    const now = Date.now();
    const expiresAt = this.currentSession.expires_at;
    const refreshTime = expiresAt - (5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > now) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime - now);
    }
  }

  // Clear token refresh timer
  private clearTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  // Refresh token
  async refreshToken(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new AuthError(error.message, AuthErrorCode.TOKEN_EXPIRED);
      }

      this.setSession(data.session);
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      throw error;
    }
  }

  // Clear session
  clearSession(): void {
    this.currentSession = null;
    this.currentOrganization = null;
    this.clearTokenRefresh();
  }

  // Validate token
  validateToken(): TokenValidationResult {
    if (!this.currentSession) {
      return {
        isValid: false,
        isExpired: true,
        willExpireSoon: false,
        error: 'No session found'
      };
    }

    const now = Date.now();
    const expiresAt = this.currentSession.expires_at;
    const isExpired = now >= expiresAt;
    const willExpireSoon = now >= (expiresAt - (5 * 60 * 1000)); // Within 5 minutes

    return {
      isValid: !isExpired,
      isExpired,
      willExpireSoon,
      expiresAt
    };
  }
}

// Authentication utilities
export class AuthUtils {
  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check password strength
  static checkPasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score++;
    } else {
      feedback.push('Password should be at least 8 characters long');
      suggestions.push('Use at least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push('Include uppercase letters');
      suggestions.push('Add uppercase letters (A-Z)');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push('Include lowercase letters');
      suggestions.push('Add lowercase letters (a-z)');
    }

    // Numbers check
    if (/\d/.test(password)) {
      score++;
    } else {
      feedback.push('Include numbers');
      suggestions.push('Add numbers (0-9)');
    }

    // Special characters check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score++;
    } else {
      feedback.push('Include special characters');
      suggestions.push('Add special characters (!@#$%^&*())');
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
      suggestions
    };
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      throw new AuthError(error.message, AuthErrorCode.UNKNOWN_ERROR);
    }
  }

  // Confirm password reset
  static async confirmPasswordReset(token: string, password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      throw new AuthError(error.message, AuthErrorCode.UNKNOWN_ERROR);
    }
  }

  // Get user organizations
  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        organizations(*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new AuthError(error.message, AuthErrorCode.UNKNOWN_ERROR);
    }

    return (data?.map((uo: any) => uo.organizations).filter(Boolean) || []) as Organization[];
  }

  // Switch organization
  static async switchOrganization(userId: string, organizationId: string): Promise<Organization> {
    // Verify user has access to organization
    const { data: userOrg, error: accessError } = await supabase
      .from('user_organizations')
      .select('organizations(*)')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (accessError || !userOrg) {
      throw new AuthError('Organization not found or access denied', AuthErrorCode.ORGANIZATION_NOT_FOUND);
    }

    // Update user's current organization
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ current_organization_id: organizationId })
      .eq('user_id', userId);

    if (updateError) {
      throw new AuthError(updateError.message, AuthErrorCode.UNKNOWN_ERROR);
    }

    return userOrg.organizations as unknown as Organization;
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<any>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      throw new AuthError(error.message, AuthErrorCode.UNKNOWN_ERROR);
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Get current user to retrieve email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.email) {
      throw new AuthError('Unable to retrieve user information', AuthErrorCode.UNKNOWN_ERROR);
    }

    // First verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signInError) {
      throw new AuthError('Current password is incorrect', AuthErrorCode.INVALID_CREDENTIALS);
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw new AuthError(updateError.message, AuthErrorCode.UNKNOWN_ERROR);
    }
  }
}

// Permission utilities
export class PermissionUtils {
  // Check if user has specific permission
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    return user.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    return permissions.some(permission => user.permissions.includes(permission));
  }

  // Check if user has all specified permissions
  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    return permissions.every(permission => user.permissions.includes(permission));
  }

  // Check if user has specific role
  static hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    
    // Super admin has all roles
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    return user.role === role;
  }

  // Check if user has any of the specified roles
  static hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;
    
    // Super admin has all roles
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    return roles.includes(user.role);
  }

  // Get permissions for role
  static getPermissionsForRole(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return Object.values(Permission);
      
      case UserRole.TENANT_ADMIN:
        return [
          Permission.USER_READ,
          Permission.USER_WRITE,
          Permission.ORG_READ,
          Permission.ORG_WRITE,
          Permission.INVENTORY_READ,
          Permission.INVENTORY_WRITE,
          Permission.INVENTORY_DELETE,
          Permission.SALES_READ,
          Permission.SALES_WRITE,
          Permission.SALES_DELETE,
          Permission.SALES_REFUND,
          Permission.CUSTOMER_READ,
          Permission.CUSTOMER_WRITE,
          Permission.CUSTOMER_DELETE,
          Permission.EMPLOYEE_READ,
          Permission.EMPLOYEE_WRITE,
          Permission.PAYROLL_READ,
          Permission.ACCOUNTING_READ,
          Permission.ACCOUNTING_WRITE,
          Permission.REPORTS_READ,
          Permission.ANALYTICS_READ
        ];
      
      case UserRole.MANAGER:
        return [
          Permission.USER_READ,
          Permission.ORG_READ,
          Permission.INVENTORY_READ,
          Permission.INVENTORY_WRITE,
          Permission.SALES_READ,
          Permission.SALES_WRITE,
          Permission.CUSTOMER_READ,
          Permission.CUSTOMER_WRITE,
          Permission.EMPLOYEE_READ,
          Permission.ACCOUNTING_READ,
          Permission.REPORTS_READ,
          Permission.ANALYTICS_READ
        ];
      
      case UserRole.EMPLOYEE:
        return [
          Permission.INVENTORY_READ,
          Permission.SALES_READ,
          Permission.SALES_WRITE,
          Permission.CUSTOMER_READ,
          Permission.CUSTOMER_WRITE,
          Permission.ANALYTICS_READ
        ];
      
      case UserRole.VIEWER:
        return [
          Permission.INVENTORY_READ,
          Permission.SALES_READ,
          Permission.CUSTOMER_READ,
          Permission.ANALYTICS_READ
        ];
      
      default:
        return [];
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
