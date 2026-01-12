import { useState, useEffect, createContext, useContext } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [state, setState] = useState({
        user: null,
        token: null,
        loading: true,
        error: null,
    });
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('auth_user');
        if (token && user) {
            try {
                setState({
                    user: JSON.parse(user),
                    token,
                    loading: false,
                    error: null,
                });
            }
            catch (error) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setState(prev => ({ ...prev, loading: false }));
            }
        }
        else {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);
    const login = async (email, password) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await mockAuthApi.login(email, password);
            setState({
                user: response.user,
                token: response.token,
                loading: false,
                error: null,
            });
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
        }
    };
    const logout = () => {
        setState({
            user: null,
            token: null,
            loading: false,
            error: null,
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };
    const refreshToken = async () => {
        if (!state.token)
            return;
        try {
            const response = await mockAuthApi.refreshToken(state.token);
            setState(prev => ({
                ...prev,
                token: response.token,
            }));
            localStorage.setItem('auth_token', response.token);
        }
        catch (error) {
            logout();
        }
    };
    const hasPermission = (permission) => {
        if (!state.user?.permissions)
            return false;
        return state.user.permissions.includes(permission);
    };
    const contextValue = {
        ...state,
        login,
        logout,
        refreshToken,
        hasPermission,
    };
    return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
const mockAuthApi = {
    login: async (email, password) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (email === 'demo@kits-hub.com' && password === 'password') {
            return {
                user: {
                    id: '1',
                    email: 'demo@kits-hub.com',
                    name: 'Demo User',
                    role: 'admin',
                    tenantId: 'demo-tenant',
                    permissions: ['read', 'write', 'delete'],
                },
                token: 'mock-jwt-token',
            };
        }
        throw new Error('Invalid credentials');
    },
    refreshToken: async (token) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { token: 'new-mock-jwt-token' };
    },
};
//# sourceMappingURL=use-auth.js.map