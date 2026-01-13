import { UseDeepLinkingReturn } from '../types';
export declare const useDeepLinking: () => UseDeepLinkingReturn;
export declare const useDeepLinkAnalytics: () => {
    trackDeepLinkUsage: (source: string, medium?: string) => void;
    getPerformanceMetrics: () => {
        loadTime: number;
        domContentLoaded: number;
        firstPaint: number;
        firstContentfulPaint: number;
    } | null;
};
export declare const useDeepLinkCampaigns: () => {
    campaignParams: {
        utm_source: any;
        utm_medium: any;
        utm_campaign: any;
        utm_term: any;
        utm_content: any;
    };
    isCampaignLink: boolean;
    getCampaignInfo: () => {
        source: any;
        medium: any;
        campaign: any;
        term: any;
        content: any;
        timestamp: number;
    } | null;
};
