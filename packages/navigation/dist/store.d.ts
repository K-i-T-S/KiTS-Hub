import { NavigationState, NavigationConfig } from './types';
interface NavigationStore extends NavigationState {
    config: NavigationConfig;
    updateConfig: (config: Partial<NavigationConfig>) => void;
    setBreadcrumbs: (breadcrumbs: any[]) => void;
    setSearchResults: (results: any[]) => void;
    setHistoryIndex: (index: number) => void;
    saveToStorage: () => void;
    loadFromStorage: () => void;
}
export declare const useNavigationStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<NavigationStore>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: NavigationStore, previousSelectedState: NavigationStore) => void): () => void;
        <U>(selector: (state: NavigationStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export {};
