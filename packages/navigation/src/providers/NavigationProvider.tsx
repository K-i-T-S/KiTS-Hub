import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNavigationStore } from '../store';
import { NavigationProviderProps, UseNavigationReturn } from '../types';

// Navigation context
const NavigationContext = createContext<UseNavigationReturn | null>(null);

// Navigation provider component
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  config,
  navigationItems,
}) => {
  const {
    currentPath,
    breadcrumbs,
    searchQuery,
    searchResults,
    commandPaletteOpen,
    history,
    historyIndex,
    deepLinkParams,
    navigate,
    goBack,
    goForward,
    setSearchQuery,
    setCommandPaletteOpen,
    addToHistory,
    clearHistory,
    setDeepLinkParams,
    updateConfig,
  } = useNavigationStore();

  // Update configuration when provided
  useEffect(() => {
    if (config) {
      updateConfig(config);
    }
  }, [config, updateConfig]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      const state = event.state;
      
      // Update store state
      setDeepLinkParams(state || {});
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [setDeepLinkParams]);

  // Navigation context value
  const navigationValue: UseNavigationReturn = {
    // Navigation state
    currentPath,
    breadcrumbs,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
    
    // Actions
    navigate,
    goBack,
    goForward,
    
    // Search
    searchQuery,
    searchResults,
    setSearchQuery,
    clearSearch: () => {
      setSearchQuery('');
    },
    
    // Command palette
    commandPaletteOpen,
    setCommandPaletteOpen,
    
    // History
    history,
    clearHistory,
    
    // Deep linking
    deepLinkParams,
    generateDeepLink: (path: string, params: Record<string, any> = {}) => {
      const baseUrl = window?.location?.origin || '';
      const url = new URL(path, baseUrl);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
      
      return url.toString();
    },
    parseDeepLink: (url: string) => {
      try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname;
        const params: Record<string, any> = {};
        
        parsedUrl.searchParams.forEach((value, key) => {
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
    },
  };

  return (
    <NavigationContext.Provider value={navigationValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to use navigation context
export const useNavigation = (): UseNavigationReturn => {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
};

// Higher-order component for navigation
export const withNavigation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WithNavigation = (props: P) => {
    return (
      <NavigationProvider navigationItems={[]}>
        <Component {...props} />
      </NavigationProvider>
    );
  };
  
  WithNavigation.displayName = `withNavigation(${Component.displayName || Component.name})`;
  
  return WithNavigation;
};

// Navigation router wrapper
export const NavigationRouter: React.FC<{
  children: ReactNode;
  navigationItems: any[];
  config?: Partial<NavigationProviderProps['config']>;
}> = ({ children, navigationItems, config }) => {
  return (
    <NavigationProvider navigationItems={navigationItems} config={config}>
      {children}
    </NavigationProvider>
  );
};
