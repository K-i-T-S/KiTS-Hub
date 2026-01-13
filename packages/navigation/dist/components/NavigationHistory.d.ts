import React from 'react';
import { NavigationHistoryItem } from '../types';
interface NavigationHistoryProps {
    history: NavigationHistoryItem[];
    currentIndex: number;
    canGoBack: boolean;
    canGoForward: boolean;
    onGoBack: () => void;
    onGoForward: () => void;
    onNavigateToItem: (item: NavigationHistoryItem) => void;
    onClearHistory: () => void;
    className?: string;
    maxItems?: number;
    showTimestamps?: boolean;
    showActions?: boolean;
}
export declare const NavigationHistory: React.FC<NavigationHistoryProps>;
export declare const CompactHistory: React.FC<{
    history: NavigationHistoryItem[];
    onNavigateToItem: (item: NavigationHistoryItem) => void;
    className?: string;
    maxItems?: number;
}>;
export declare const HistoryDropdown: React.FC<{
    history: NavigationHistoryItem[];
    onNavigateToItem: (item: NavigationHistoryItem) => void;
    onClearHistory: () => void;
    className?: string;
}>;
export {};
