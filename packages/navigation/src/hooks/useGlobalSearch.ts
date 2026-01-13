import { useCallback, useEffect, useMemo } from 'react';
import { useNavigationStore } from '../store';
import { SearchResult, UseGlobalSearchReturn, NavigationItem } from '../types';

// Simple fuzzy search implementation (fallback if fuse.js is not available)
const simpleSearch = (items: SearchResult[], query: string): SearchResult[] => {
  const queryLower = query.toLowerCase();
  
  return items
    .map(item => {
      let score = 0;
      const searchableText = [
        item.title,
        item.description,
        item.path,
        ...(item.keywords || [])
      ].join(' ').toLowerCase();
      
      // Exact match gets highest score
      if (item.title.toLowerCase() === queryLower) {
        score = 1;
      }
      // Title starts with query
      else if (item.title.toLowerCase().startsWith(queryLower)) {
        score = 0.8;
      }
      // Query appears in title
      else if (item.title.toLowerCase().includes(queryLower)) {
        score = 0.6;
      }
      // Query appears elsewhere
      else if (searchableText.includes(queryLower)) {
        score = 0.4;
      }
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a: SearchResult, b: SearchResult) => (b.score || 0) - (a.score || 0));
};

export const useGlobalSearch = (
  navigationItems: NavigationItem[],
  additionalSearchItems?: SearchResult[]
): UseGlobalSearchReturn => {
  const {
    searchQuery,
    searchResults,
    setSearchQuery,
    setSearchResults,
    config,
  } = useNavigationStore();

  // Convert navigation items to search results
  const navigationSearchResults = useMemo((): SearchResult[] => {
    const convertItems = (items: NavigationItem[], category = 'navigation'): SearchResult[] => {
      return items.flatMap(item => {
        const results: SearchResult[] = [
          {
            id: item.id,
            title: item.label,
            description: item.metadata?.description,
            path: item.path,
            category,
            icon: item.icon,
            shortcut: item.metadata?.shortcut,
            keywords: item.metadata?.keywords || [],
          },
        ];

        // Add children if they exist
        if (item.children && item.children.length > 0) {
          results.push(...convertItems(item.children, category));
        }

        return results;
      });
    };

    return convertItems(navigationItems);
  }, [navigationItems]);

  // Combine all searchable items
  const allSearchItems = useMemo(() => {
    const items = [...navigationSearchResults];
    
    if (additionalSearchItems) {
      items.push(...additionalSearchItems);
    }

    return items;
  }, [navigationSearchResults, additionalSearchItems]);

  // Create search function
  const searchFunction = useMemo(() => {
    if (!allSearchItems.length) return null;
    return simpleSearch;
  }, [allSearchItems]);

  // Execute search
  const executeSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim() || !searchFunction) {
      return [];
    }

    try {
      const results = searchFunction(allSearchItems, query);
      
      return results
        .slice(0, config.search.maxResults)
        .map((result: SearchResult) => ({
          ...result,
          score: result.score || 0,
        }))
        .sort((a: SearchResult, b: SearchResult) => (a.score || 0) - (b.score || 0));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [searchFunction, allSearchItems, config.search.maxResults]);

  // Auto-search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      executeSearch(searchQuery).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, executeSearch, setSearchResults]);

  // Clear search results
  const clearResults = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, [setSearchQuery, setSearchResults]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchQuery(''); // Clear previous query
        // Focus on search input (handled by component)
      }
    };

    if (config.search.enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config.search.enabled, setSearchQuery]);

  // Search state
  const isOpen = useMemo(() => searchQuery.length > 0, [searchQuery]);

  return {
    query: searchQuery,
    results: searchResults,
    isOpen,
    setQuery: setSearchQuery,
    setIsOpen: (open: boolean) => {
      if (!open) {
        clearResults();
      }
    },
    clearResults,
    executeSearch,
  };
};

// Hook for search analytics
export const useSearchAnalytics = () => {
  const { searchQuery, searchResults } = useNavigationStore();

  // Track search metrics
  const trackSearch = useCallback((query: string, resultCount: number, selectedResult?: SearchResult) => {
    // This could be sent to analytics service
    console.log('Search analytics:', {
      query,
      resultCount,
      selectedResult: selectedResult?.title,
      timestamp: Date.now(),
    });
  }, []);

  // Track search completion
  useEffect(() => {
    if (searchQuery && searchResults.length >= 0) {
      trackSearch(searchQuery, searchResults.length);
    }
  }, [searchQuery, searchResults.length, trackSearch]);

  return { trackSearch };
};

// Hook for search suggestions
export const useSearchSuggestions = (recentSearches: string[] = []) => {
  const { searchQuery } = useNavigationStore();

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentSearches.slice(0, 5);
    }

    // Filter recent searches that match the query
    return recentSearches
      .filter(search => 
        search.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3);
  }, [searchQuery, recentSearches]);

  return suggestions;
};

// Hook for search shortcuts
export const useSearchShortcuts = () => {
  const handleShortcut = useCallback((shortcut: string) => {
    // Handle predefined shortcuts
    switch (shortcut.toLowerCase()) {
      case 'home':
      case 'h':
        return '/';
      case 'dashboard':
      case 'd':
        return '/dashboard';
      case 'settings':
      case 's':
        return '/settings';
      case 'help':
      case '?':
        return '/help';
      default:
        return null;
    }
  }, []);

  return { handleShortcut };
};
