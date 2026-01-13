/**
 * Authentication and Authorization Context
 * Provides user authentication and permission management
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { User, Role, Permission, AuthContextType, LoginCredentials } from '../types/auth';
import { AuthenticationError, AuthorizationError } from '../types/auth';

// State interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  can: (resource: string, action: string, context?: any) => boolean;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload,
        isAuthenticated: true
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        isAuthenticated: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Mock service for demonstration
const mockAuthService = {
  async login(credentials: LoginCredentials) {
    // Mock authentication logic
    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: [
          {
            id: '1',
            name: 'Administrator',
            description: 'Full system access',
            permissions: [
              { id: '1', name: 'products:read', resource: 'products', action: 'read', description: 'Read products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '2', name: 'products:create', resource: 'products', action: 'create', description: 'Create products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '3', name: 'products:update', resource: 'products', action: 'update', description: 'Update products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '4', name: 'products:delete', resource: 'products', action: 'delete', description: 'Delete products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '5', name: 'products:manage_variants', resource: 'products', action: 'manage_variants', description: 'Manage product variants', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '6', name: 'products:manage_suppliers', resource: 'products', action: 'manage_suppliers', description: 'Manage suppliers', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '7', name: 'products:bulk_operations', resource: 'products', action: 'bulk_operations', description: 'Bulk operations', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '8', name: 'products:export', resource: 'products', action: 'export', description: 'Export products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
              { id: '9', name: 'products:import', resource: 'products', action: 'import', description: 'Import products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
            ],
            isSystem: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        permissions: [
          { id: '1', name: 'products:read', resource: 'products', action: 'read', description: 'Read products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '2', name: 'products:create', resource: 'products', action: 'create', description: 'Create products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '3', name: 'products:update', resource: 'products', action: 'update', description: 'Update products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '4', name: 'products:delete', resource: 'products', action: 'delete', description: 'Delete products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ],
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      return {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      };
    } else if (credentials.email === 'user@example.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: '2',
        email: 'user@example.com',
        name: 'Regular User',
        roles: [
          {
            id: '2',
            name: 'User',
            description: 'Basic user access',
            permissions: [
              { id: '1', name: 'products:read', resource: 'products', action: 'read', description: 'Read products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
            ],
            isSystem: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        permissions: [
          { id: '1', name: 'products:read', resource: 'products', action: 'read', description: 'Read products', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ],
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      return {
        user: mockUser,
        token: 'mock-jwt-token-user',
        refreshToken: 'mock-refresh-token-user',
        expiresIn: 3600
      };
    } else {
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }
  },

  async logout() {
    // Mock logout
    return Promise.resolve();
  },

  async refreshToken(): Promise<void> {
    // Mock token refresh
    const newToken = 'mock-refreshed-token';
    localStorage.setItem('auth_token', newToken);
  },

  async hasPermission(userId: string, permission: string) {
    // Mock permission check
    return true; // For demo purposes
  },

  async hasRole(userId: string, role: string) {
    // Mock role check
    return true; // For demo purposes
  },

  async getUserPermissions(userId: string) {
    // Mock get user permissions
    return [];
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Mock: validate token and get user
          // In real app, this would validate the token with the backend
          const mockUser = {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            roles: [],
            permissions: [],
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          };
          
          dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await mockAuthService.login(credentials);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('refresh_token', result.refreshToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: result.user });
    } catch (error) {
      const errorMessage = error instanceof AuthenticationError ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await mockAuthService.logout();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const newToken = await mockAuthService.refreshToken();
      localStorage.setItem('auth_token', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    // Check direct permissions
    const hasDirectPermission = state.user.permissions.some(p => p.name === permission);
    if (hasDirectPermission) return true;
    
    // Check role permissions
    return state.user.roles.some(role => 
      role.permissions.some(p => p.name === permission)
    );
  };

  const can = (resource: string, action: string, context?: any): boolean => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    refreshToken,
    hasPermission,
    can
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Permission checking hook
export const usePermissions = () => {
  const { user, hasPermission, can } = useAuth();

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some(role => role.name === roleName);
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  return {
    user,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAllRoles,
    hasAnyRole,
    can,
    loading: !!user
  };
};

export default AuthContext;
