import React from 'react';
import { SearchResult } from '../types';
interface GlobalSearchProps {
    isOpen: boolean;
    query: string;
    results: SearchResult[];
    onQueryChange: (query: string) => void;
    onSelect: (result: SearchResult) => void;
    onClose: () => void;
    placeholder?: string;
    maxResults?: number;
    showShortcuts?: boolean;
    className?: string;
}
export declare const GlobalSearch: React.FC<GlobalSearchProps>;
export declare const SearchTrigger: React.FC<{
    onClick: () => void;
    shortcut?: string;
    className?: string;
}>;
export {};
