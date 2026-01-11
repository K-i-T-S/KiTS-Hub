import { ReactNode } from 'react';
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string;
    permissions?: string[];
}
export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
export interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react").FunctionComponentElement<import("react").ProviderProps<AuthContextType | undefined>>;
export declare function useAuth(): AuthContextType;
//# sourceMappingURL=use-auth.d.ts.map