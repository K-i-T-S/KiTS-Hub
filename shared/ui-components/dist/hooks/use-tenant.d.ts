import { ReactNode } from 'react';
export interface Tenant {
    id: string;
    name: string;
    domain: string;
    settings: {
        theme: 'light' | 'dark' | 'auto';
        currency: string;
        timezone: string;
        locale: string;
    };
    subscription: {
        plan: 'free' | 'basic' | 'premium' | 'enterprise';
        status: 'active' | 'inactive' | 'suspended';
        expiresAt?: string;
    };
}
export interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
    error: string | null;
    switchTenant: (tenantId: string) => Promise<void>;
    updateSettings: (settings: Partial<Tenant['settings']>) => Promise<void>;
}
export declare function TenantProvider({ children }: {
    children: ReactNode;
}): import("react").FunctionComponentElement<import("react").ProviderProps<TenantContextType | undefined>>;
export declare function useTenant(): TenantContextType;
//# sourceMappingURL=use-tenant.d.ts.map