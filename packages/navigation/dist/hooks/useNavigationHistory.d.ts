import { UseNavigationHistoryReturn } from '../types';
export declare const useNavigationHistory: () => UseNavigationHistoryReturn;
export declare const useHistoryAnalytics: () => {
    getNavigationPatterns: () => {
        totalSessions: number;
        uniquePages: number;
        averageSessionDuration: number;
        mostVisitedPages: Array<{
            path: string;
            count: number;
        }>;
        navigationFrequency: Record<string, number>;
    };
    trackUserJourney: () => {
        from: string;
        to: string;
        duration: number;
        timestamp: number;
    }[];
};
export declare const useHistorySuggestions: (limit?: number) => {
    path: string;
    title: string;
    timestamp: number;
}[];
