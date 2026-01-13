import { useCallback, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { UseNavigationHistoryReturn, NavigationHistoryItem } from '../types';

export const useNavigationHistory = (): UseNavigationHistoryReturn => {
  const {
    history,
    historyIndex,
    navigate,
    addToHistory: addToStoreHistory,
    clearHistory: clearStoreHistory,
    config,
  } = useNavigationStore();

  // Check if we can go back
  const canGoBack = historyIndex > 0;

  // Check if we can go forward
  const canGoForward = historyIndex < history.length - 1;

  // Go back in history
  const goBack = useCallback(() => {
    if (canGoBack) {
      const newIndex = historyIndex - 1;
      const previousItem = history[newIndex];
      
      // Navigate without adding to history (since we're moving within history)
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  }, [canGoBack, historyIndex, history]);

  // Go forward in history
  const goForward = useCallback(() => {
    if (canGoForward) {
      const newIndex = historyIndex + 1;
      const nextItem = history[newIndex];
      
      // Navigate without adding to history
      if (typeof window !== 'undefined') {
        window.history.forward();
      }
    }
  }, [canGoForward, historyIndex, history]);

  // Add item to history
  const addToHistory = useCallback((item: NavigationHistoryItem) => {
    addToStoreHistory(item);
  }, [addToStoreHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    clearStoreHistory();
  }, [clearStoreHistory]);

  // Get specific history item
  const getHistoryItem = useCallback((index: number): NavigationHistoryItem | null => {
    if (index >= 0 && index < history.length) {
      return history[index];
    }
    return null;
  }, [history]);

  // Get recent history (last N items)
  const getRecentHistory = useCallback((count: number = 10): NavigationHistoryItem[] => {
    return history.slice(-count).reverse();
  }, [history]);

  // Get history by date range
  const getHistoryByDateRange = useCallback((
    startDate: Date,
    endDate: Date
  ): NavigationHistoryItem[] => {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    return history.filter(item => 
      item.timestamp >= startTime && item.timestamp <= endTime
    );
  }, [history]);

  // Get frequently visited pages
  const getFrequentPages = useCallback((limit: number = 5): Array<{ path: string; title: string; count: number }> => {
    const pathCounts = history.reduce((counts, item) => {
      const path = item.path;
      counts[path] = (counts[path] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(pathCounts)
      .map(([path, count]) => ({
        path,
        title: history.find(item => item.path === path)?.title || path,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [history]);

  // Listen to browser navigation events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // This is handled by the store, but we can add additional logic here if needed
      console.log('Browser navigation event:', event);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, []);

  // Auto-save history to localStorage
  useEffect(() => {
    if (config.history.persistAcrossSessions && typeof window !== 'undefined') {
      try {
        const historyData = {
          history,
          historyIndex,
          timestamp: Date.now(),
        };
        localStorage.setItem('kits-hub-navigation-history', JSON.stringify(historyData));
      } catch (error) {
        console.warn('Failed to save navigation history:', error);
      }
    }
  }, [history, historyIndex, config.history.persistAcrossSessions]);

  // Load history from localStorage on mount
  useEffect(() => {
    if (config.history.persistAcrossSessions && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kits-hub-navigation-history');
        if (stored) {
          const data = JSON.parse(stored);
          // Only load if not too old (e.g., 7 days)
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
          if (Date.now() - data.timestamp < maxAge) {
            // This would be handled by the store initialization
            console.log('Loaded navigation history from storage');
          }
        }
      } catch (error) {
        console.warn('Failed to load navigation history:', error);
      }
    }
  }, [config.history.persistAcrossSessions]);

  return {
    history,
    currentIndex: historyIndex,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    addToHistory,
    clearHistory,
    getHistoryItem,
    getRecentHistory,
    getHistoryByDateRange,
    getFrequentPages,
  };
};

// Hook for history analytics
export const useHistoryAnalytics = () => {
  const { history } = useNavigationStore();

  // Get navigation patterns
  const getNavigationPatterns = useCallback(() => {
    const patterns = {
      totalSessions: history.length,
      uniquePages: new Set(history.map(item => item.path)).size,
      averageSessionDuration: 0,
      mostVisitedPages: [] as Array<{ path: string; count: number }>,
      navigationFrequency: {} as Record<string, number>,
    };

    // Calculate most visited pages
    const pageCounts = history.reduce((counts, item) => {
      counts[item.path] = (counts[item.path] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    patterns.mostVisitedPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate navigation frequency by hour
    history.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      patterns.navigationFrequency[hour] = (patterns.navigationFrequency[hour] || 0) + 1;
    });

    return patterns;
  }, [history]);

  // Track user journey
  const trackUserJourney = useCallback(() => {
    if (history.length < 2) return [];

    const journeys = [];
    for (let i = 1; i < history.length; i++) {
      const from = history[i - 1];
      const to = history[i];
      
      journeys.push({
        from: from.path,
        to: to.path,
        duration: to.timestamp - from.timestamp,
        timestamp: to.timestamp,
      });
    }

    return journeys;
  }, [history]);

  return {
    getNavigationPatterns,
    trackUserJourney,
  };
};

// Hook for history suggestions
export const useHistorySuggestions = (limit: number = 5) => {
  const { history } = useNavigationStore();

  const suggestions = history
    .slice(-limit * 2) // Get more items to have better selection
    .reverse()
    .filter((item, index, self) => 
      // Remove duplicates and keep only unique paths
      self.findIndex(i => i.path === item.path) === index
    )
    .slice(0, limit)
    .map(item => ({
      path: item.path,
      title: item.title,
      timestamp: item.timestamp,
    }));

  return suggestions;
};
