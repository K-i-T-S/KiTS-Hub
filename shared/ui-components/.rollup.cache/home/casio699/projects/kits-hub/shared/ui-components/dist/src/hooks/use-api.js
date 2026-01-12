import { useState, useEffect, useCallback } from 'react';
export function useApi(url, options) {
    const [state, setState] = useState({
        loading: false,
    });
    const execute = useCallback(async (overrideOptions) => {
        const opts = { ...options, ...overrideOptions };
        setState(prev => ({ ...prev, loading: true, error: undefined }));
        try {
            const controller = new AbortController();
            const timeoutId = opts.timeout
                ? setTimeout(() => controller.abort(), opts.timeout)
                : null;
            const response = await fetch(url, {
                method: opts.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...opts.headers,
                },
                body: opts.body ? JSON.stringify(opts.body) : undefined,
                signal: controller.signal,
            });
            if (timeoutId)
                clearTimeout(timeoutId);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            setState({
                data,
                loading: false,
                status: response.status,
            });
        }
        catch (error) {
            setState({
                error: error instanceof Error ? error.message : 'Unknown error',
                loading: false,
            });
        }
    }, [url, options]);
    useEffect(() => {
        if (options?.method === 'GET' || !options?.method) {
            execute();
        }
    }, [execute]);
    return {
        ...state,
        execute,
        refetch: execute,
    };
}
export function useLazyApi(url, options) {
    const [state, setState] = useState({
        loading: false,
    });
    const execute = useCallback(async (overrideOptions) => {
        const opts = { ...options, ...overrideOptions };
        setState(prev => ({ ...prev, loading: true, error: undefined }));
        try {
            const controller = new AbortController();
            const timeoutId = opts.timeout
                ? setTimeout(() => controller.abort(), opts.timeout)
                : null;
            const response = await fetch(url, {
                method: opts.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...opts.headers,
                },
                body: opts.body ? JSON.stringify(opts.body) : undefined,
                signal: controller.signal,
            });
            if (timeoutId)
                clearTimeout(timeoutId);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            setState({
                data,
                loading: false,
                status: response.status,
            });
            return data;
        }
        catch (error) {
            setState({
                error: error instanceof Error ? error.message : 'Unknown error',
                loading: false,
            });
            throw error;
        }
    }, [url, options]);
    return {
        ...state,
        execute,
    };
}
//# sourceMappingURL=use-api.js.map