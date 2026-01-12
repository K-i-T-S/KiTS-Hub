import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  AuthContextType, 
  AuthState, 
  User, 
  Organization, 
  Session,
  AuthEvent 
} from './types/auth.types';
import { sessionManager, supabase } from './utils/session';

// Initial auth state
const initialState: AuthState = {
  user: null,
  organization: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
};

// Auth action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };
    
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RESET_STATE':
      return { ...initialState, isLoading: false };
    
    default:
      return state;
  }
}

// Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
  onAuthEvent?: (event: AuthEvent) => void;
}

/**
 * AuthProvider component that manages authentication state
 * Provides authentication context to all child components
 */
export function AuthProvider({ children, onAuthEvent }: AuthProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auth event emitter
  const emitAuthEvent = (type: AuthEvent['type'], payload?: any): void => {
    const event: AuthEvent = {
      type,
      payload,
      timestamp: Date.now()
    };
    
    onAuthEvent?.(event);
    
    // Also emit to window for cross-component communication
    window.dispatchEvent(new CustomEvent('auth:event', { detail: event }));
  };

  // Action creators
  const setLoading = (loading: boolean): void => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setUser = (user: User | null): void => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setOrganization = (organization: Organization | null): void => {
    dispatch({ type: 'SET_ORGANIZATION', payload: organization });
  };

  const setSession = (session: Session | null): void => {
    dispatch({ type: 'SET_SESSION', payload: session });
  };

  const setIsAuthenticated = (isAuthenticated: boolean): void => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
  };

  const setError = (error: string | null): void => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        setLoading(true);
        clearError();

        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Set session in session manager
          await sessionManager.setSession(session);
          
          const user = sessionManager.getUser();
          const userSession = sessionManager.getSession();
          
          setUser(user);
          setSession(userSession);
          setIsAuthenticated(true);
          
          // Load user's current organization
          if (user) {
            try {
              const organizations = await supabase
                .from('user_organizations')
                .select(`
                  organizations(*)
                `)
                .eq('user_id', user.id)
                .eq('is_active', true);

              if (organizations.data && organizations.data.length > 0) {
                const currentOrg = organizations.data[0].organizations as unknown as Organization;
                setOrganization(currentOrg);
                sessionManager.setOrganization(currentOrg);
              }
            } catch (orgError) {
              console.warn('Failed to load organization:', orgError);
            }
          }
          
          emitAuthEvent('SIGN_IN', { user });
        } else {
          // No session found
          setIsAuthenticated(false);
          emitAuthEvent('SIGN_OUT');
        }
        
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Authentication initialization failed');
        setIsAuthenticated(false);
        emitAuthEvent('ERROR', { error });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          switch (event) {
            case 'SIGNED_IN':
              if (session) {
                await sessionManager.setSession(session);
                const user = sessionManager.getUser();
                const userSession = sessionManager.getSession();
                
                setUser(user);
                setSession(userSession);
                setIsAuthenticated(true);
                clearError();
                
                emitAuthEvent('SIGN_IN', { user });
              }
              break;
              
            case 'SIGNED_OUT':
              sessionManager.clearSession();
              setUser(null);
              setSession(null);
              setOrganization(null);
              setIsAuthenticated(false);
              clearError();
              
              emitAuthEvent('SIGN_OUT');
              break;
              
            case 'TOKEN_REFRESHED':
              if (session) {
                await sessionManager.setSession(session);
                const userSession = sessionManager.getSession();
                setSession(userSession);
                
                emitAuthEvent('TOKEN_REFRESHED', { session });
              }
              break;
              
            default:
              break;
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setError(error instanceof Error ? error.message : 'Authentication error');
          emitAuthEvent('ERROR', { error });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Periodic session validation
  useEffect(() => {
    if (!state.isAuthenticated || !state.session) return;

    const interval = setInterval(async () => {
      try {
        const validation = sessionManager.validateToken();
        
        if (validation.isExpired) {
          // Force sign out if token is expired
          await supabase.auth.signOut();
          return;
        }
        
        if (validation.willExpireSoon) {
          // Try to refresh token
          await sessionManager.refreshToken();
          const refreshedSession = sessionManager.getSession();
          setSession(refreshedSession);
        }
      } catch (error) {
        console.error('Session validation error:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.session]);

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    organization: state.organization,
    session: state.session,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Actions
    signIn: async () => {}, // These will be implemented in useAuth hook
    signUp: async () => {},
    signOut: async () => {},
    resetPassword: async () => {},
    confirmPasswordReset: async () => {},
    switchOrganization: async () => {},
    updateOrganization: async () => {},
    updateProfile: async () => {},
    changePassword: async () => {},
    refreshSession: async () => {},
    clearError,
    
    // Internal setters for useAuth hook (not exposed in AuthContextType)
    setLoading,
    setUser,
    setOrganization,
    setSession,
    setIsAuthenticated,
    setError
  } as AuthContextType & {
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setOrganization: (organization: Organization | null) => void;
    setSession: (session: Session | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setError: (error: string | null) => void;
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component that provides auth context
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { authContext?: AuthContextType }> {
  return function WithAuthComponent(props: P) {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    );
  };
}
