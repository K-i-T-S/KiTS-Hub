import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  tenant: {
    id: string;
    name: string;
    plan: 'standard' | 'premium' | 'enterprise';
  } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  switchTenant: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<AuthContextType['tenant']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    const checkAuth = async () => {
      try {
        // In production, this would check with your auth service
        const mockUser: User = {
          id: 'user-1',
          email: 'admin@kits-hub.com',
          name: 'Demo User',
          role: 'admin',
          tenantId: 'tenant-1',
        };
        
        const mockTenant = {
          id: 'tenant-1',
          name: 'Demo Organization',
          plan: 'enterprise' as const,
        };
        
        setUser(mockUser);
        setTenant(mockTenant);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // Mock sign in - in production, call your auth service
      const mockUser: User = {
        id: 'user-1',
        email,
        name: 'Demo User',
        role: 'admin',
        tenantId: 'tenant-1',
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setTenant(null);
  };

  const switchTenant = (tenantId: string) => {
    // Mock tenant switching - in production, call your auth service
    const mockTenant = {
      id: tenantId,
      name: `Organization ${tenantId}`,
      plan: 'premium' as const,
    };
    setTenant(mockTenant);
  };

  const value: AuthContextType = {
    user,
    tenant,
    isLoading,
    signIn,
    signOut,
    switchTenant,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
