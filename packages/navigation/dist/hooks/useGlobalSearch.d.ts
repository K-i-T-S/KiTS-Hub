import { SearchResult, UseGlobalSearchReturn, NavigationItem } from '../types';
export declare const useGlobalSearch: (navigationItems: NavigationItem[], additionalSearchItems?: SearchResult[]) => UseGlobalSearchReturn;
export declare const useSearchAnalytics: () => {
    trackSearch: (query: string, resultCount: number, selectedResult?: SearchResult) => void;
};
export declare const useSearchSuggestions: (recentSearches?: string[]) => string[];
export declare const useSearchShortcuts: () => {
    handleShortcut: (shortcut: string) => "/" | "/dashboard" | "/settings" | "/help" | null;
};
