import { useCallback, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { UseDeepLinkingReturn } from '../types';

export const useDeepLinking = (): UseDeepLinkingReturn => {
  const {
    navigate,
    deepLinkParams,
    setDeepLinkParams,
    config,
  } = useNavigationStore();

  // Generate deep link URL
  const generateLink = useCallback((
    path: string, 
    params: Record<string, any> = {}
  ): string => {
    const baseUrl = config.deepLinking.baseUrl;
    const url = new URL(path, baseUrl);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
    
    return url.toString();
  }, [config.deepLinking.baseUrl]);

  // Parse deep link URL
  const parseLink = useCallback((url: string): { path: string; params: Record<string, any> } => {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const params: Record<string, any> = {};
      
      // Parse query parameters
      parsedUrl.searchParams.forEach((value, key) => {
        // Try to parse as JSON, fallback to string
        try {
          params[key] = JSON.parse(value);
        } catch {
          params[key] = value;
        }
      });
      
      return { path, params };
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return { path: '/', params: {} };
    }
  }, []);

  // Navigate to deep link
  const navigateToLink = useCallback((link: string) => {
    const { path, params } = parseLink(link);
    
    // Set deep link params in store
    setDeepLinkParams(params);
    
    // Navigate to the path
    navigate(path, { fromDeepLink: true, ...params });
  }, [parseLink, navigate, setDeepLinkParams]);

  // Share deep link
  const shareLink = useCallback(async (
    path: string, 
    params: Record<string, any> = {}
  ): Promise<void> => {
    const link = generateLink(path, params);
    
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'KiTS Hub Link',
          text: 'Check out this page on KiTS Hub',
          url: link,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log('Share cancelled or failed:', error);
        // Fallback to copying to clipboard
        await copyToClipboard(link);
      }
    } else {
      // Fallback to copying to clipboard
      await copyToClipboard(link);
    }
  }, [generateLink]);

  // Copy to clipboard helper
  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  };

  // Handle deep link on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && config.deepLinking.enabled) {
      const currentUrl = window.location.href;
      const { path, params } = parseLink(currentUrl);
      
      // If there are query parameters, treat as deep link
      if (Object.keys(params).length > 0) {
        setDeepLinkParams(params);
        
        // Check if this is a valid deep link route
        const isValidDeepLink = config.deepLinking.routeParams.some(param => 
          params.hasOwnProperty(param)
        );
        
        if (isValidDeepLink) {
          console.log('Deep link detected:', { path, params });
          // The navigation will be handled by the router
        }
      }
    }
  }, [config.deepLinking.enabled, config.deepLinking.routeParams, parseLink, setDeepLinkParams]);

  // Listen for deep link changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleUrlChange = () => {
        const currentUrl = window.location.href;
        const { params } = parseLink(currentUrl);
        setDeepLinkParams(params);
      };

      // Listen to popstate events (browser back/forward)
      window.addEventListener('popstate', handleUrlChange);
      
      return () => {
        window.removeEventListener('popstate', handleUrlChange);
      };
    }
  }, [parseLink, setDeepLinkParams]);

  // Generate QR code for deep link (if needed)
  const generateQRCode = useCallback(async (
    path: string, 
    params: Record<string, any> = {}
  ): Promise<string> => {
    const link = generateLink(path, params);
    
    // This would integrate with a QR code library
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12">
          QR: ${link.substring(0, 30)}...
        </text>
      </svg>`
    )}`;
  }, [generateLink]);

  // Validate deep link parameters
  const validateParams = useCallback((
    params: Record<string, any>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check for required route parameters
    config.deepLinking.routeParams.forEach(param => {
      if (params[param] === undefined || params[param] === null) {
        errors.push(`Missing required parameter: ${param}`);
      }
    });
    
    // Validate parameter types if needed
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 1000) {
        errors.push(`Parameter ${key} is too long`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [config.deepLinking.routeParams]);

  return {
    params: deepLinkParams,
    generateLink,
    parseLink,
    navigateToLink,
    shareLink,
    generateQRCode,
    validateParams,
  };
};

// Hook for deep link analytics
export const useDeepLinkAnalytics = () => {
  const { params } = useDeepLinking();

  // Track deep link usage
  const trackDeepLinkUsage = useCallback((source: string, medium?: string) => {
    const analyticsData = {
      timestamp: Date.now(),
      source,
      medium,
      params,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    };
    
    console.log('Deep link analytics:', analyticsData);
    // This would send to analytics service
  }, [params]);

  // Get deep link performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
    };
  }, []);

  return {
    trackDeepLinkUsage,
    getPerformanceMetrics,
  };
};

// Hook for deep link campaigns
export const useDeepLinkCampaigns = () => {
  const { params } = useDeepLinking();

  // Extract campaign parameters
  const campaignParams = {
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_term: params.utm_term,
    utm_content: params.utm_content,
  };

  // Check if this is a campaign link
  const isCampaignLink = Object.values(campaignParams).some(value => value !== undefined);

  // Get campaign information
  const getCampaignInfo = useCallback(() => {
    if (!isCampaignLink) return null;
    
    return {
      source: campaignParams.utm_source,
      medium: campaignParams.utm_medium,
      campaign: campaignParams.utm_campaign,
      term: campaignParams.utm_term,
      content: campaignParams.utm_content,
      timestamp: Date.now(),
    };
  }, [isCampaignLink, campaignParams]);

  return {
    campaignParams,
    isCampaignLink,
    getCampaignInfo,
  };
};
