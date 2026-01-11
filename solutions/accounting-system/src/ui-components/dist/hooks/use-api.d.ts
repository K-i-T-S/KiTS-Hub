export interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    loading: boolean;
    status?: number;
}
export declare function useApi<T = any>(url: string, options?: ApiOptions): {
    execute: (overrideOptions?: ApiOptions) => Promise<void>;
    refetch: (overrideOptions?: ApiOptions) => Promise<void>;
    data?: T | undefined;
    error?: string;
    loading: boolean;
    status?: number;
};
export declare function useLazyApi<T = any>(url: string, options?: ApiOptions): {
    execute: (overrideOptions?: ApiOptions) => Promise<any>;
    data?: T | undefined;
    error?: string;
    loading: boolean;
    status?: number;
};
//# sourceMappingURL=use-api.d.ts.map