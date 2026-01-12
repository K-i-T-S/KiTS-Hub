import { useContext, useCallback } from 'react';
import { useAuthContext } from '../AuthProvider';
import { 
  UseAuthReturn, 
  LoginCredentials, 
  RegisterCredentials, 
  PasswordResetRequest, 
  PasswordResetConfirm 
} from '../types/auth.types';
import { sessionManager, AuthUtils, supabase } from '../utils/session';

// Extended context type with internal setters
type ExtendedAuthContext = ReturnType<typeof useAuthContext> & {
  setLoading: (loading: boolean) => void;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setOrganization: (organization: any) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

/**
 * Hook for authentication functionality
 * Provides access to authentication state and actions
 */
export function useAuth(): UseAuthReturn {
  const context = useAuthContext() as ExtendedAuthContext;
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      context.setLoading(true);
      context.clearError();

      // Validate credentials
      if (!AuthUtils.validateEmail(credentials.email)) {
        throw new Error('Invalid email format');
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('No session returned from authentication');
      }

      // Set session in session manager
      await sessionManager.setSession(data.session);

      // Update context
      const user = sessionManager.getUser();
      const session = sessionManager.getSession();
      
      context.setUser(user);
      context.setSession(session);
      context.setIsAuthenticated(true);

      // Load user organizations
      if (user) {
        try {
          const organizations = await AuthUtils.getUserOrganizations(user.id);
          if (organizations.length > 0) {
            // Set first organization as default if none specified
            const orgId = credentials.organization_id || organizations[0].id;
            const organization = await AuthUtils.switchOrganization(user.id, orgId);
            context.setOrganization(organization);
            sessionManager.setOrganization(organization);
          }
        } catch (orgError) {
          console.warn('Failed to load organizations:', orgError);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      context.setError(errorMessage);
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const signUp = useCallback(async (credentials: RegisterCredentials): Promise<void> => {
    try {
      context.setLoading(true);
      context.clearError();

      // Validate credentials
      if (!AuthUtils.validateEmail(credentials.email)) {
        throw new Error('Invalid email format');
      }

      const passwordStrength = AuthUtils.checkPasswordStrength(credentials.password);
      if (!passwordStrength.isStrong) {
        throw new Error('Password is not strong enough: ' + passwordStrength.feedback.join(', '));
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            phone: credentials.phone
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        // Email confirmation required
        context.setError('Please check your email to confirm your account');
        return;
      }

      // Set session in session manager
      await sessionManager.setSession(data.session);

      // Update context
      const user = sessionManager.getUser();
      const session = sessionManager.getSession();
      
      context.setUser(user);
      context.setSession(session);
      context.setIsAuthenticated(true);

      // Create organization if provided
      if (credentials.organization_name && user) {
        try {
          // This would typically create an organization in your database
          // For now, we'll just set a basic organization structure
          const organization = {
            id: 'temp-org-id',
            name: credentials.organization_name,
            slug: credentials.organization_name.toLowerCase().replace(/\s+/g, '-'),
            settings: {
              timezone: 'UTC',
              currency: 'USD',
              date_format: 'MM/DD/YYYY',
              language: 'en',
              enable_multi_currency: false,
              custom_fields: {}
            },
            subscription_plan: 'starter' as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          context.setOrganization(organization);
          sessionManager.setOrganization(organization);
        } catch (orgError) {
          console.warn('Failed to create organization:', orgError);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      context.setError(errorMessage);
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      context.setLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear session manager
      sessionManager.clearSession();
      
      // Clear context
      context.setUser(null);
      context.setSession(null);
      context.setOrganization(null);
      context.setIsAuthenticated(false);
      context.clearError();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      context.setError(errorMessage);
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const resetPassword = useCallback(async (request: PasswordResetRequest): Promise<void> => {
    try {
      context.setLoading(true);
      context.clearError();

      if (!AuthUtils.validateEmail(request.email)) {
        throw new Error('Invalid email format');
      }

      await AuthUtils.generatePasswordResetToken(request.email);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      context.setError(errorMessage);
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const confirmPasswordReset = useCallback(async (confirm: PasswordResetConfirm): Promise<void> => {
    try {
      context.setLoading(true);
      context.clearError();

      const passwordStrength = AuthUtils.checkPasswordStrength(confirm.password);
      if (!passwordStrength.isStrong) {
        throw new Error('Password is not strong enough: ' + passwordStrength.feedback.join(', '));
      }

      await AuthUtils.confirmPasswordReset(confirm.token, confirm.password);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset confirmation failed';
      context.setError(errorMessage);
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      await sessionManager.refreshToken();
      
      const user = sessionManager.getUser();
      const session = sessionManager.getSession();
      
      context.setUser(user);
      context.setSession(session);
      context.setIsAuthenticated(!!user);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
      context.setError(errorMessage);
      
      // If refresh fails, sign out user
      await signOut();
    }
  }, [context, signOut]);

  const clearError = useCallback(() => {
    context.clearError();
  }, [context]);

  return {
    user: context.user,
    organization: context.organization,
    session: context.session,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    error: context.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    confirmPasswordReset,
    refreshSession,
    clearError
  };
}
