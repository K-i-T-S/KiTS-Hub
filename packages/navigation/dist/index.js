'use strict';

var zustand = require('zustand');
var middleware = require('zustand/middleware');
var React = require('react');
var reactRouterDom = require('react-router-dom');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');
var clsx = require('clsx');
var cmdk = require('cmdk');

const defaultConfig = {
    breadcrumbs: {
        enabled: true,
        maxItems: 5,
        showHome: true,
        separator: ' / ',
    },
    search: {
        enabled: true,
        shortcut: 'cmd+k',
        placeholder: 'Search...',
        maxResults: 10,
        fuzzySearch: true,
        searchIn: ['title', 'description', 'keywords', 'path'],
    },
    commandPalette: {
        enabled: true,
        shortcut: 'cmd+shift+p',
        placeholder: 'Type a command...',
        maxResults: 10,
        categories: ['navigation', 'actions', 'settings'],
    },
    history: {
        enabled: true,
        maxItems: 50,
        persistAcrossSessions: true,
    },
    deepLinking: {
        enabled: true,
        baseUrl: window?.location?.origin || '',
        routeParams: ['id', 'view', 'tab'],
    },
};
const useNavigationStore = zustand.create()(middleware.subscribeWithSelector((set, get) => ({
    // Initial state
    currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
    breadcrumbs: [],
    searchQuery: '',
    searchResults: [],
    commandPaletteOpen: false,
    history: [],
    historyIndex: -1,
    deepLinkParams: {},
    config: defaultConfig,
    // Navigation actions
    navigate: (path, state) => {
        get().currentPath;
        const history = get().history;
        const historyIndex = get().historyIndex;
        // Create new history item
        const historyItem = {
            id: Date.now().toString(),
            path,
            title: state?.title || path,
            timestamp: Date.now(),
            metadata: state,
        };
        let newHistory = [...history];
        let newIndex = historyIndex + 1;
        // If we're not at the end of history, truncate forward history
        if (historyIndex < history.length - 1) {
            newHistory = history.slice(0, historyIndex + 1);
        }
        // Add new item
        newHistory.push(historyItem);
        // Limit history size
        if (newHistory.length > get().config.history.maxItems) {
            newHistory = newHistory.slice(-get().config.history.maxItems);
            newIndex = newHistory.length - 1;
        }
        set({
            currentPath: path,
            history: newHistory,
            historyIndex: newIndex,
        });
        // Update browser history
        if (typeof window !== 'undefined') {
            window.history.pushState(state, '', path);
        }
        // Save to storage
        get().saveToStorage();
    },
    goBack: () => {
        const history = get().history;
        const historyIndex = get().historyIndex;
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousItem = history[newIndex];
            set({
                currentPath: previousItem.path,
                historyIndex: newIndex,
            });
            if (typeof window !== 'undefined') {
                window.history.back();
            }
        }
    },
    goForward: () => {
        const history = get().history;
        const historyIndex = get().historyIndex;
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextItem = history[newIndex];
            set({
                currentPath: nextItem.path,
                historyIndex: newIndex,
            });
            if (typeof window !== 'undefined') {
                window.history.forward();
            }
        }
    },
    setSearchQuery: (query) => {
        set({ searchQuery: query });
    },
    setCommandPaletteOpen: (open) => {
        set({ commandPaletteOpen: open });
    },
    addToHistory: (item) => {
        const history = get().history;
        const newHistory = [...history, item];
        // Limit history size
        if (newHistory.length > get().config.history.maxItems) {
            newHistory.shift();
        }
        set({ history: newHistory });
        get().saveToStorage();
    },
    clearHistory: () => {
        set({
            history: [],
            historyIndex: -1
        });
        get().saveToStorage();
    },
    setDeepLinkParams: (params) => {
        set({ deepLinkParams: params });
    },
    // Configuration management
    updateConfig: (config) => {
        const currentConfig = get().config;
        const newConfig = {
            ...currentConfig,
            ...config,
            // Deep merge nested objects
            breadcrumbs: { ...currentConfig.breadcrumbs, ...config.breadcrumbs },
            search: { ...currentConfig.search, ...config.search },
            commandPalette: { ...currentConfig.commandPalette, ...config.commandPalette },
            history: { ...currentConfig.history, ...config.history },
            deepLinking: { ...currentConfig.deepLinking, ...config.deepLinking },
        };
        set({ config: newConfig });
    },
    // Internal state management
    setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
    },
    setSearchResults: (results) => {
        set({ searchResults: results });
    },
    setHistoryIndex: (index) => {
        set({ historyIndex: index });
    },
    // Persistence
    saveToStorage: () => {
        if (typeof window !== 'undefined' && get().config.history.persistAcrossSessions) {
            const state = get();
            const storageData = {
                history: state.history,
                historyIndex: state.historyIndex,
                config: state.config,
            };
            try {
                localStorage.setItem('kits-hub-navigation', JSON.stringify(storageData));
            }
            catch (error) {
                console.warn('Failed to save navigation state to localStorage:', error);
            }
        }
    },
    loadFromStorage: () => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('kits-hub-navigation');
                if (stored) {
                    const data = JSON.parse(stored);
                    if (data.history) {
                        set({
                            history: data.history,
                            historyIndex: data.historyIndex || -1,
                        });
                    }
                    if (data.config) {
                        set({
                            config: { ...defaultConfig, ...data.config },
                        });
                    }
                }
            }
            catch (error) {
                console.warn('Failed to load navigation state from localStorage:', error);
            }
        }
    },
})));
// Initialize store on client side
if (typeof window !== 'undefined') {
    useNavigationStore.getState().loadFromStorage();
    // Listen to browser navigation events
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        const path = window.location.pathname;
        useNavigationStore.setState({
            currentPath: path,
            deepLinkParams: state || {},
        });
    });
}

const useBreadcrumbs = (navigationItems) => {
    const location = reactRouterDom.useLocation();
    const { breadcrumbs, setBreadcrumbs, config } = useNavigationStore();
    // Generate breadcrumbs from current path and navigation items
    const generateBreadcrumbs = React.useCallback((path, items) => {
        const crumbs = [];
        // Add home breadcrumb if enabled
        if (config.breadcrumbs.showHome && path !== '/') {
            crumbs.push({
                id: 'home',
                label: 'Home',
                path: '/',
                icon: null,
            });
        }
        // Parse path segments
        const segments = path.split('/').filter(Boolean);
        let currentPath = '';
        // Find matching navigation items for each segment
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            // Try to find a matching navigation item
            const matchedItem = findNavigationItem(currentPath, items);
            if (matchedItem) {
                crumbs.push({
                    id: matchedItem.id,
                    label: matchedItem.label,
                    path: index === segments.length - 1 ? undefined : currentPath,
                    icon: matchedItem.icon,
                });
            }
            else {
                // Create breadcrumb from path segment
                crumbs.push({
                    id: segment,
                    label: formatSegmentLabel(segment),
                    path: index === segments.length - 1 ? undefined : currentPath,
                });
            }
        });
        // Limit breadcrumbs to max items
        if (crumbs.length > config.breadcrumbs.maxItems) {
            const startIndex = crumbs.length - config.breadcrumbs.maxItems;
            return crumbs.slice(startIndex);
        }
        return crumbs;
    }, [config.breadcrumbs.showHome, config.breadcrumbs.maxItems]);
    // Find navigation item by path
    const findNavigationItem = (path, items) => {
        for (const item of items) {
            if (item.path === path) {
                return item;
            }
            // Check children
            if (item.children) {
                const childMatch = findNavigationItem(path, item.children);
                if (childMatch) {
                    return childMatch;
                }
            }
            // Check for pattern matching (e.g., /products/:id)
            if (reactRouterDom.matchPath(item.path, path)) {
                return item;
            }
        }
        return null;
    };
    // Format path segment into readable label
    const formatSegmentLabel = (segment) => {
        // Convert kebab-case to Title Case
        return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    // Memoized breadcrumbs based on current path
    const computedBreadcrumbs = React.useMemo(() => {
        if (!config.breadcrumbs.enabled) {
            return [];
        }
        return generateBreadcrumbs(location.pathname, navigationItems);
    }, [location.pathname, navigationItems, generateBreadcrumbs, config.breadcrumbs.enabled]);
    // Update breadcrumbs when path changes
    const addBreadcrumb = React.useCallback((breadcrumb) => {
        const newBreadcrumbs = [...breadcrumbs, breadcrumb];
        setBreadcrumbs(newBreadcrumbs);
    }, [breadcrumbs, setBreadcrumbs]);
    const removeBreadcrumb = React.useCallback((id) => {
        const newBreadcrumbs = breadcrumbs.filter(crumb => crumb.id !== id);
        setBreadcrumbs(newBreadcrumbs);
    }, [breadcrumbs, setBreadcrumbs]);
    const clearBreadcrumbs = React.useCallback(() => {
        setBreadcrumbs([]);
    }, [setBreadcrumbs]);
    return {
        breadcrumbs: computedBreadcrumbs,
        setBreadcrumbs,
        addBreadcrumb,
        removeBreadcrumb,
        clearBreadcrumbs,
    };
};
// Hook for breadcrumb context provider
const useBreadcrumbContext = () => {
    const { breadcrumbs, setBreadcrumbs } = useNavigationStore();
    const updateBreadcrumb = React.useCallback((id, updates) => {
        const newBreadcrumbs = breadcrumbs.map(crumb => crumb.id === id ? { ...crumb, ...updates } : crumb);
        setBreadcrumbs(newBreadcrumbs);
    }, [breadcrumbs, setBreadcrumbs]);
    const insertBreadcrumb = React.useCallback((index, breadcrumb) => {
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs.splice(index, 0, breadcrumb);
        setBreadcrumbs(newBreadcrumbs);
    }, [breadcrumbs, setBreadcrumbs]);
    const replaceBreadcrumb = React.useCallback((id, breadcrumb) => {
        const newBreadcrumbs = breadcrumbs.map(crumb => crumb.id === id ? breadcrumb : crumb);
        setBreadcrumbs(newBreadcrumbs);
    }, [breadcrumbs, setBreadcrumbs]);
    return {
        breadcrumbs,
        updateBreadcrumb,
        insertBreadcrumb,
        replaceBreadcrumb,
    };
};

// Simple fuzzy search implementation (fallback if fuse.js is not available)
const simpleSearch = (items, query) => {
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
        .sort((a, b) => (b.score || 0) - (a.score || 0));
};
const useGlobalSearch = (navigationItems, additionalSearchItems) => {
    const { searchQuery, searchResults, setSearchQuery, setSearchResults, config, } = useNavigationStore();
    // Convert navigation items to search results
    const navigationSearchResults = React.useMemo(() => {
        const convertItems = (items, category = 'navigation') => {
            return items.flatMap(item => {
                const results = [
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
    const allSearchItems = React.useMemo(() => {
        const items = [...navigationSearchResults];
        if (additionalSearchItems) {
            items.push(...additionalSearchItems);
        }
        return items;
    }, [navigationSearchResults, additionalSearchItems]);
    // Create search function
    const searchFunction = React.useMemo(() => {
        if (!allSearchItems.length)
            return null;
        return simpleSearch;
    }, [allSearchItems]);
    // Execute search
    const executeSearch = React.useCallback(async (query) => {
        if (!query.trim() || !searchFunction) {
            return [];
        }
        try {
            const results = searchFunction(allSearchItems, query);
            return results
                .slice(0, config.search.maxResults)
                .map((result) => ({
                ...result,
                score: result.score || 0,
            }))
                .sort((a, b) => (a.score || 0) - (b.score || 0));
        }
        catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }, [searchFunction, allSearchItems, config.search.maxResults]);
    // Auto-search when query changes
    React.useEffect(() => {
        if (searchQuery.trim()) {
            executeSearch(searchQuery).then(setSearchResults);
        }
        else {
            setSearchResults([]);
        }
    }, [searchQuery, executeSearch, setSearchResults]);
    // Clear search results
    const clearResults = React.useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
    }, [setSearchQuery, setSearchResults]);
    // Handle keyboard shortcut
    React.useEffect(() => {
        const handleKeyDown = (event) => {
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
    const isOpen = React.useMemo(() => searchQuery.length > 0, [searchQuery]);
    return {
        query: searchQuery,
        results: searchResults,
        isOpen,
        setQuery: setSearchQuery,
        setIsOpen: (open) => {
            if (!open) {
                clearResults();
            }
        },
        clearResults,
        executeSearch,
    };
};
// Hook for search analytics
const useSearchAnalytics = () => {
    const { searchQuery, searchResults } = useNavigationStore();
    // Track search metrics
    const trackSearch = React.useCallback((query, resultCount, selectedResult) => {
        // This could be sent to analytics service
        console.log('Search analytics:', {
            query,
            resultCount,
            selectedResult: selectedResult?.title,
            timestamp: Date.now(),
        });
    }, []);
    // Track search completion
    React.useEffect(() => {
        if (searchQuery && searchResults.length >= 0) {
            trackSearch(searchQuery, searchResults.length);
        }
    }, [searchQuery, searchResults.length, trackSearch]);
    return { trackSearch };
};
// Hook for search suggestions
const useSearchSuggestions = (recentSearches = []) => {
    const { searchQuery } = useNavigationStore();
    const suggestions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return recentSearches.slice(0, 5);
        }
        // Filter recent searches that match the query
        return recentSearches
            .filter(search => search.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 3);
    }, [searchQuery, recentSearches]);
    return suggestions;
};
// Hook for search shortcuts
const useSearchShortcuts = () => {
    const handleShortcut = React.useCallback((shortcut) => {
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

const useCommandPalette = (initialCommands = []) => {
    const { config, commandPaletteOpen, setCommandPaletteOpen } = useNavigationStore();
    const [commands, setCommands] = React.useState(initialCommands);
    const [query, setQuery] = React.useState('');
    const [selectedCommand, setSelectedCommand] = React.useState(0);
    // Filter commands based on query
    const filteredCommands = React.useMemo(() => {
        if (!query.trim()) {
            return commands.slice(0, config.commandPalette.maxResults);
        }
        const queryLower = query.toLowerCase();
        return commands
            .filter(command => {
            const searchableText = [
                command.title,
                command.description,
                command.category,
                ...(command.keywords || [])
            ].join(' ').toLowerCase();
            return searchableText.includes(queryLower);
        })
            .slice(0, config.commandPalette.maxResults);
    }, [commands, query, config.commandPalette.maxResults]);
    // Execute a command
    const executeCommand = React.useCallback(async (command) => {
        try {
            await command.action();
            setCommandPaletteOpen(false);
            setQuery('');
            setSelectedCommand(0);
        }
        catch (error) {
            console.error('Command execution error:', error);
        }
    }, [setCommandPaletteOpen]);
    // Register a new command
    const registerCommand = React.useCallback((command) => {
        setCommands(prev => {
            // Remove existing command with same ID
            const filtered = prev.filter(c => c.id !== command.id);
            return [...filtered, command];
        });
    }, []);
    // Unregister a command
    const unregisterCommand = React.useCallback((id) => {
        setCommands(prev => prev.filter(c => c.id !== id));
    }, []);
    // Handle keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (!commandPaletteOpen)
                return;
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setSelectedCommand(prev => {
                        const maxIndex = filteredCommands.length - 1;
                        return prev < maxIndex ? prev + 1 : 0;
                    });
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setSelectedCommand(prev => {
                        const maxIndex = filteredCommands.length - 1;
                        return prev > 0 ? prev - 1 : maxIndex;
                    });
                    break;
                case 'Enter':
                    event.preventDefault();
                    const command = filteredCommands[selectedCommand];
                    if (command) {
                        executeCommand(command);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    setCommandPaletteOpen(false);
                    setQuery('');
                    setSelectedCommand(0);
                    break;
            }
        };
        // Handle command palette shortcut
        const handleShortcut = (event) => {
            // Check for Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                setCommandPaletteOpen(true);
                setQuery('');
                setSelectedCommand(0);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keydown', handleShortcut);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keydown', handleShortcut);
        };
    }, [
        commandPaletteOpen,
        filteredCommands,
        selectedCommand,
        executeCommand,
        setCommandPaletteOpen,
    ]);
    // Reset selection when filtered commands change
    React.useEffect(() => {
        setSelectedCommand(0);
    }, [filteredCommands]);
    // Group commands by category
    const groupedCommands = React.useMemo(() => {
        return filteredCommands.reduce((groups, command) => {
            const category = command.category || 'general';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(command);
            return groups;
        }, {});
    }, [filteredCommands]);
    return {
        isOpen: commandPaletteOpen,
        commands,
        filteredCommands,
        groupedCommands,
        query,
        selectedCommand,
        setIsOpen: setCommandPaletteOpen,
        setQuery,
        setSelectedCommand,
        executeCommand,
        registerCommand,
        unregisterCommand,
    };
};
// Hook for predefined system commands
const useSystemCommands = () => {
    const { navigate } = useNavigationStore();
    return React.useMemo(() => [
        {
            id: 'navigate-home',
            title: 'Go to Home',
            description: 'Navigate to the home page',
            icon: null,
            shortcut: 'home',
            category: 'navigation',
            action: () => navigate('/'),
            keywords: ['home', 'dashboard', 'main'],
        },
        {
            id: 'navigate-settings',
            title: 'Go to Settings',
            description: 'Navigate to settings page',
            icon: null,
            shortcut: 'settings',
            category: 'navigation',
            action: () => navigate('/settings'),
            keywords: ['settings', 'preferences', 'config'],
        },
        {
            id: 'search',
            title: 'Search',
            description: 'Open global search',
            icon: null,
            shortcut: 'search',
            category: 'actions',
            action: () => {
                // This would trigger the global search
                console.log('Open search');
            },
            keywords: ['search', 'find', 'lookup'],
        },
        {
            id: 'help',
            title: 'Help & Documentation',
            description: 'Open help documentation',
            icon: null,
            shortcut: 'help',
            category: 'help',
            action: () => navigate('/help'),
            keywords: ['help', 'docs', 'documentation', 'support'],
        },
        {
            id: 'theme-toggle',
            title: 'Toggle Theme',
            description: 'Switch between light and dark theme',
            icon: null,
            shortcut: 'theme',
            category: 'preferences',
            action: () => {
                // This would toggle the theme
                console.log('Toggle theme');
            },
            keywords: ['theme', 'dark', 'light', 'mode'],
        },
    ], [navigate]);
};
// Hook for dynamic commands based on context
const useContextualCommands = (context) => {
    const { navigate } = useNavigationStore();
    return React.useMemo(() => {
        const commands = [];
        // Add context-specific commands
        if (context?.user?.role === 'admin') {
            commands.push({
                id: 'admin-panel',
                title: 'Admin Panel',
                description: 'Open administration panel',
                icon: null,
                shortcut: 'admin',
                category: 'admin',
                action: () => navigate('/admin'),
                keywords: ['admin', 'administration', 'manage'],
            });
        }
        if (context?.currentPath?.includes('/products/')) {
            commands.push({
                id: 'edit-product',
                title: 'Edit Product',
                description: 'Edit current product',
                icon: null,
                shortcut: 'edit',
                category: 'actions',
                action: () => {
                    // This would open edit mode for current product
                    console.log('Edit product');
                },
                keywords: ['edit', 'modify', 'update', 'product'],
            });
        }
        return commands;
    }, [context, navigate]);
};

const useNavigationHistory = () => {
    const { history, historyIndex, navigate, addToHistory: addToStoreHistory, clearHistory: clearStoreHistory, config, } = useNavigationStore();
    // Check if we can go back
    const canGoBack = historyIndex > 0;
    // Check if we can go forward
    const canGoForward = historyIndex < history.length - 1;
    // Go back in history
    const goBack = React.useCallback(() => {
        if (canGoBack) {
            const newIndex = historyIndex - 1;
            history[newIndex];
            // Navigate without adding to history (since we're moving within history)
            if (typeof window !== 'undefined') {
                window.history.back();
            }
        }
    }, [canGoBack, historyIndex, history]);
    // Go forward in history
    const goForward = React.useCallback(() => {
        if (canGoForward) {
            const newIndex = historyIndex + 1;
            history[newIndex];
            // Navigate without adding to history
            if (typeof window !== 'undefined') {
                window.history.forward();
            }
        }
    }, [canGoForward, historyIndex, history]);
    // Add item to history
    const addToHistory = React.useCallback((item) => {
        addToStoreHistory(item);
    }, [addToStoreHistory]);
    // Clear all history
    const clearHistory = React.useCallback(() => {
        clearStoreHistory();
    }, [clearStoreHistory]);
    // Get specific history item
    const getHistoryItem = React.useCallback((index) => {
        if (index >= 0 && index < history.length) {
            return history[index];
        }
        return null;
    }, [history]);
    // Get recent history (last N items)
    const getRecentHistory = React.useCallback((count = 10) => {
        return history.slice(-count).reverse();
    }, [history]);
    // Get history by date range
    const getHistoryByDateRange = React.useCallback((startDate, endDate) => {
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        return history.filter(item => item.timestamp >= startTime && item.timestamp <= endTime);
    }, [history]);
    // Get frequently visited pages
    const getFrequentPages = React.useCallback((limit = 5) => {
        const pathCounts = history.reduce((counts, item) => {
            const path = item.path;
            counts[path] = (counts[path] || 0) + 1;
            return counts;
        }, {});
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
    React.useEffect(() => {
        const handlePopState = (event) => {
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
    React.useEffect(() => {
        if (config.history.persistAcrossSessions && typeof window !== 'undefined') {
            try {
                const historyData = {
                    history,
                    historyIndex,
                    timestamp: Date.now(),
                };
                localStorage.setItem('kits-hub-navigation-history', JSON.stringify(historyData));
            }
            catch (error) {
                console.warn('Failed to save navigation history:', error);
            }
        }
    }, [history, historyIndex, config.history.persistAcrossSessions]);
    // Load history from localStorage on mount
    React.useEffect(() => {
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
            }
            catch (error) {
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
const useHistoryAnalytics = () => {
    const { history } = useNavigationStore();
    // Get navigation patterns
    const getNavigationPatterns = React.useCallback(() => {
        const patterns = {
            totalSessions: history.length,
            uniquePages: new Set(history.map(item => item.path)).size,
            averageSessionDuration: 0,
            mostVisitedPages: [],
            navigationFrequency: {},
        };
        // Calculate most visited pages
        const pageCounts = history.reduce((counts, item) => {
            counts[item.path] = (counts[item.path] || 0) + 1;
            return counts;
        }, {});
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
    const trackUserJourney = React.useCallback(() => {
        if (history.length < 2)
            return [];
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
const useHistorySuggestions = (limit = 5) => {
    const { history } = useNavigationStore();
    const suggestions = history
        .slice(-limit * 2) // Get more items to have better selection
        .reverse()
        .filter((item, index, self) => 
    // Remove duplicates and keep only unique paths
    self.findIndex(i => i.path === item.path) === index)
        .slice(0, limit)
        .map(item => ({
        path: item.path,
        title: item.title,
        timestamp: item.timestamp,
    }));
    return suggestions;
};

const useDeepLinking = () => {
    const { navigate, deepLinkParams, setDeepLinkParams, config, } = useNavigationStore();
    // Generate deep link URL
    const generateLink = React.useCallback((path, params = {}) => {
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
    const parseLink = React.useCallback((url) => {
        try {
            const parsedUrl = new URL(url);
            const path = parsedUrl.pathname;
            const params = {};
            // Parse query parameters
            parsedUrl.searchParams.forEach((value, key) => {
                // Try to parse as JSON, fallback to string
                try {
                    params[key] = JSON.parse(value);
                }
                catch {
                    params[key] = value;
                }
            });
            return { path, params };
        }
        catch (error) {
            console.error('Failed to parse deep link:', error);
            return { path: '/', params: {} };
        }
    }, []);
    // Navigate to deep link
    const navigateToLink = React.useCallback((link) => {
        const { path, params } = parseLink(link);
        // Set deep link params in store
        setDeepLinkParams(params);
        // Navigate to the path
        navigate(path, { fromDeepLink: true, ...params });
    }, [parseLink, navigate, setDeepLinkParams]);
    // Share deep link
    const shareLink = React.useCallback(async (path, params = {}) => {
        const link = generateLink(path, params);
        if (typeof window !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: 'KiTS Hub Link',
                    text: 'Check out this page on KiTS Hub',
                    url: link,
                });
            }
            catch (error) {
                // User cancelled sharing or sharing failed
                console.log('Share cancelled or failed:', error);
                // Fallback to copying to clipboard
                await copyToClipboard(link);
            }
        }
        else {
            // Fallback to copying to clipboard
            await copyToClipboard(link);
        }
    }, [generateLink]);
    // Copy to clipboard helper
    const copyToClipboard = async (text) => {
        try {
            if (typeof window !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(text);
            }
            else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        }
        catch (error) {
            console.error('Failed to copy to clipboard:', error);
            throw error;
        }
    };
    // Handle deep link on page load
    React.useEffect(() => {
        if (typeof window !== 'undefined' && config.deepLinking.enabled) {
            const currentUrl = window.location.href;
            const { path, params } = parseLink(currentUrl);
            // If there are query parameters, treat as deep link
            if (Object.keys(params).length > 0) {
                setDeepLinkParams(params);
                // Check if this is a valid deep link route
                const isValidDeepLink = config.deepLinking.routeParams.some(param => params.hasOwnProperty(param));
                if (isValidDeepLink) {
                    console.log('Deep link detected:', { path, params });
                    // The navigation will be handled by the router
                }
            }
        }
    }, [config.deepLinking.enabled, config.deepLinking.routeParams, parseLink, setDeepLinkParams]);
    // Listen for deep link changes
    React.useEffect(() => {
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
    const generateQRCode = React.useCallback(async (path, params = {}) => {
        const link = generateLink(path, params);
        // This would integrate with a QR code library
        // For now, return a placeholder
        return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12">
          QR: ${link.substring(0, 30)}...
        </text>
      </svg>`)}`;
    }, [generateLink]);
    // Validate deep link parameters
    const validateParams = React.useCallback((params) => {
        const errors = [];
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
const useDeepLinkAnalytics = () => {
    const { params } = useDeepLinking();
    // Track deep link usage
    const trackDeepLinkUsage = React.useCallback((source, medium) => {
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
    const getPerformanceMetrics = React.useCallback(() => {
        if (typeof window === 'undefined')
            return null;
        const navigation = performance.getEntriesByType('navigation')[0];
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
const useDeepLinkCampaigns = () => {
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
    const getCampaignInfo = React.useCallback(() => {
        if (!isCampaignLink)
            return null;
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

const Breadcrumbs = ({ items, className, showHomeIcon = true, separator = jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4" }), maxItems, showTooltip = true, }) => {
    // Limit items if maxItems is specified
    const displayItems = maxItems && items.length > maxItems
        ? [
            items[0], // First item (usually Home)
            { id: 'ellipsis', label: '...', path: undefined },
            ...items.slice(-(maxItems - 1))
        ]
        : items;
    if (!items.length) {
        return null;
    }
    return (jsxRuntime.jsx("nav", { className: clsx.clsx('flex items-center space-x-1 text-sm text-gray-600', className), "aria-label": "Breadcrumb navigation", children: displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isEllipsis = item.id === 'ellipsis';
            return (jsxRuntime.jsxs(React.Fragment, { children: [index > 0 && !isEllipsis && (jsxRuntime.jsx("span", { className: "text-gray-400 mx-1", "aria-hidden": "true", children: separator })), !isEllipsis && (jsxRuntime.jsxs("div", { className: "flex items-center", children: [item.id === 'home' && showHomeIcon && (jsxRuntime.jsx(lucideReact.Home, { className: "h-4 w-4 mr-1" })), item.path && !isLast ? (jsxRuntime.jsx(reactRouterDom.Link, { to: item.path, className: clsx.clsx('hover:text-gray-900 transition-colors duration-200', 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded', showTooltip && 'tooltip-trigger'), title: showTooltip ? item.label : undefined, "aria-current": isLast ? 'page' : undefined, children: item.label })) : (jsxRuntime.jsx("span", { className: clsx.clsx('font-medium', isLast ? 'text-gray-900' : 'text-gray-600'), "aria-current": isLast ? 'page' : undefined, children: item.label }))] })), isEllipsis && (jsxRuntime.jsx("span", { className: "text-gray-400 px-1", children: "..." }))] }, item.id));
        }) }));
};
// Collapsible breadcrumbs for mobile
const CollapsibleBreadcrumbs = ({ items, className, maxItems = 3, ...props }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    if (items.length <= maxItems) {
        return jsxRuntime.jsx(Breadcrumbs, { items: items, className: className, ...props });
    }
    const displayItems = isExpanded ? items : [
        items[0],
        { id: 'ellipsis', label: '...', path: undefined },
        ...items.slice(-2)
    ];
    return (jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [jsxRuntime.jsx(Breadcrumbs, { items: displayItems, className: className, ...props }), items.length > maxItems && (jsxRuntime.jsx("button", { onClick: () => setIsExpanded(!isExpanded), className: "text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1", "aria-label": isExpanded ? 'Collapse breadcrumbs' : 'Expand breadcrumbs', children: isExpanded ? 'Show less' : `Show ${items.length - maxItems} more` }))] }));
};
// Schema.org structured data for breadcrumbs
const BreadcrumbStructuredData = ({ items }) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.label,
            'item': item.path || window.location.origin,
        })),
    };
    return (jsxRuntime.jsx("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(structuredData) } }));
};

// Category icons mapping
const categoryIcons$1 = {
    navigation: jsxRuntime.jsx(lucideReact.Home, { className: "h-4 w-4" }),
    products: jsxRuntime.jsx(lucideReact.Package, { className: "h-4 w-4" }),
    customers: jsxRuntime.jsx(lucideReact.Users, { className: "h-4 w-4" }),
    reports: jsxRuntime.jsx(lucideReact.FileText, { className: "h-4 w-4" }),
    settings: jsxRuntime.jsx(lucideReact.Settings, { className: "h-4 w-4" }),
    default: jsxRuntime.jsx(lucideReact.FileText, { className: "h-4 w-4" }),
};
const GlobalSearch = ({ isOpen, query, results, onQueryChange, onSelect, onClose, placeholder = 'Search...', maxResults = 10, showShortcuts = true, className, }) => {
    const inputRef = React.useRef(null);
    // Focus input when search opens
    React.useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);
    // Handle keyboard navigation
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    // Group results by category
    const groupedResults = results.reduce((groups, result) => {
        const category = result.category || 'default';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(result);
        return groups;
    }, {});
    if (!isOpen) {
        return null;
    }
    return (jsxRuntime.jsxs(cmdk.Command.Dialog, { open: isOpen, onOpenChange: onClose, className: clsx.clsx('fixed inset-0 z-50 flex items-start justify-center pt-16', className), children: [jsxRuntime.jsx("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm", onClick: onClose }), jsxRuntime.jsx("div", { className: "relative w-full max-w-2xl mx-4", children: jsxRuntime.jsxs(cmdk.Command, { className: "rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden", children: [jsxRuntime.jsxs("div", { className: "flex items-center border-b border-gray-200 px-4", children: [jsxRuntime.jsx(lucideReact.Search, { className: "h-5 w-5 text-gray-400 mr-3" }), jsxRuntime.jsx(cmdk.Command.Input, { ref: inputRef, value: query, onValueChange: onQueryChange, placeholder: placeholder, className: "flex-1 py-3 text-lg outline-none bg-transparent placeholder-gray-500", onKeyDown: handleKeyDown }), query && (jsxRuntime.jsx("button", { onClick: () => onQueryChange(''), className: "text-gray-400 hover:text-gray-600 transition-colors", "aria-label": "Clear search", children: "\u00D7" }))] }), jsxRuntime.jsxs(cmdk.Command.List, { className: "max-h-96 overflow-y-auto p-2", children: [!query && showShortcuts && (jsxRuntime.jsxs("div", { className: "px-2 py-3", children: [jsxRuntime.jsx("h3", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider mb-2", children: "Quick Actions" }), jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [jsxRuntime.jsx(QuickAction, { icon: jsxRuntime.jsx(lucideReact.Home, { className: "h-4 w-4" }), label: "Home", shortcut: "\u2318H", onClick: () => onSelect({ id: 'home', title: 'Home', path: '/', category: 'navigation' }) }), jsxRuntime.jsx(QuickAction, { icon: jsxRuntime.jsx(lucideReact.Settings, { className: "h-4 w-4" }), label: "Settings", shortcut: "\u2318S", onClick: () => onSelect({ id: 'settings', title: 'Settings', path: '/settings', category: 'navigation' }) }), jsxRuntime.jsx(QuickAction, { icon: jsxRuntime.jsx(lucideReact.Package, { className: "h-4 w-4" }), label: "Products", shortcut: "\u2318P", onClick: () => onSelect({ id: 'products', title: 'Products', path: '/products', category: 'products' }) }), jsxRuntime.jsx(QuickAction, { icon: jsxRuntime.jsx(lucideReact.Users, { className: "h-4 w-4" }), label: "Customers", shortcut: "\u2318C", onClick: () => onSelect({ id: 'customers', title: 'Customers', path: '/customers', category: 'customers' }) })] })] })), query && Object.entries(groupedResults).map(([category, categoryResults]) => (jsxRuntime.jsxs("div", { className: "mb-4 last:mb-0", children: [jsxRuntime.jsxs("div", { className: "flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider", children: [categoryIcons$1[category] || categoryIcons$1.default, jsxRuntime.jsx("span", { className: "ml-2", children: category })] }), categoryResults.slice(0, maxResults).map((result) => (jsxRuntime.jsx(cmdk.Command.Item, { value: `${result.title} ${result.description || ''} ${result.keywords?.join(' ') || ''}`, onSelect: () => onSelect(result), className: "flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer transition-colors", children: jsxRuntime.jsxs("div", { className: "flex items-center flex-1 min-w-0", children: [result.icon && (jsxRuntime.jsx("span", { className: "mr-3 text-gray-400 flex-shrink-0", children: result.icon })), jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [jsxRuntime.jsx("div", { className: "font-medium text-gray-900 truncate", children: result.title }), result.description && (jsxRuntime.jsx("div", { className: "text-gray-500 text-xs truncate", children: result.description })), jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [jsxRuntime.jsx("span", { className: "text-xs text-gray-400", children: result.path }), result.shortcut && (jsxRuntime.jsx("span", { className: "ml-2 text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded", children: result.shortcut }))] })] }), jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4 text-gray-400 ml-2 flex-shrink-0" })] }) }, result.id)))] }, category))), query && results.length === 0 && (jsxRuntime.jsxs("div", { className: "px-4 py-8 text-center", children: [jsxRuntime.jsx("div", { className: "text-gray-400 mb-2", children: "No results found" }), jsxRuntime.jsx("div", { className: "text-sm text-gray-500", children: "Try searching with different keywords" })] }))] }), jsxRuntime.jsx("div", { className: "border-t border-gray-200 px-4 py-2", children: jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [jsxRuntime.jsxs("div", { className: "flex items-center space-x-4", children: [jsxRuntime.jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded text-xs", children: "\u2191\u2193" }), jsxRuntime.jsx("span", { children: "Navigate" })] }), jsxRuntime.jsxs("div", { className: "flex items-center space-x-4", children: [jsxRuntime.jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded text-xs", children: "\u21B5" }), jsxRuntime.jsx("span", { children: "Select" })] }), jsxRuntime.jsxs("div", { className: "flex items-center space-x-4", children: [jsxRuntime.jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded text-xs", children: "ESC" }), jsxRuntime.jsx("span", { children: "Close" })] })] }) })] }) })] }));
};
const QuickAction = ({ icon, label, shortcut, onClick, }) => {
    return (jsxRuntime.jsxs("button", { onClick: onClick, className: "flex items-center justify-between w-full p-3 text-left rounded-md hover:bg-gray-50 transition-colors", children: [jsxRuntime.jsxs("div", { className: "flex items-center", children: [jsxRuntime.jsx("span", { className: "mr-3 text-gray-600", children: icon }), jsxRuntime.jsx("span", { className: "text-sm font-medium text-gray-900", children: label })] }), jsxRuntime.jsx("kbd", { className: "text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded", children: shortcut })] }));
};
// Search trigger button
const SearchTrigger = ({ onClick, shortcut = '⌘K', className }) => {
    return (jsxRuntime.jsxs("button", { onClick: onClick, className: clsx.clsx('flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors', className), "aria-label": "Search", children: [jsxRuntime.jsx(lucideReact.Search, { className: "h-4 w-4 mr-2" }), jsxRuntime.jsx("span", { className: "flex-1 text-left", children: "Search..." }), jsxRuntime.jsx("kbd", { className: "text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded", children: shortcut })] }));
};

// Category icons mapping
const categoryIcons = {
    navigation: jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4" }),
    actions: jsxRuntime.jsx(lucideReact.Terminal, { className: "h-4 w-4" }),
    admin: jsxRuntime.jsx(lucideReact.Terminal, { className: "h-4 w-4" }),
    help: jsxRuntime.jsx(lucideReact.Search, { className: "h-4 w-4" }),
    preferences: jsxRuntime.jsx(lucideReact.Terminal, { className: "h-4 w-4" }),
    general: jsxRuntime.jsx(lucideReact.Terminal, { className: "h-4 w-4" }),
};
const CommandPalette = ({ isOpen, commands, filteredCommands, groupedCommands, query, selectedCommand, onQueryChange, onSelectCommand, onClose, placeholder = 'Type a command...', className, }) => {
    const inputRef = React.useRef(null);
    // Focus input when command palette opens
    React.useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);
    // Handle keyboard navigation
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    if (!isOpen) {
        return null;
    }
    return (jsxRuntime.jsxs(cmdk.Command.Dialog, { open: isOpen, onOpenChange: onClose, className: clsx.clsx('fixed inset-0 z-50 flex items-start justify-center pt-16', className), children: [jsxRuntime.jsx("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm", onClick: onClose }), jsxRuntime.jsx("div", { className: "relative w-full max-w-2xl mx-4", children: jsxRuntime.jsxs(cmdk.Command, { className: "rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden", children: [jsxRuntime.jsxs("div", { className: "flex items-center border-b border-gray-200 px-4", children: [jsxRuntime.jsx(lucideReact.Terminal, { className: "h-5 w-5 text-gray-400 mr-3" }), jsxRuntime.jsx(cmdk.Command.Input, { ref: inputRef, value: query, onValueChange: onQueryChange, placeholder: placeholder, className: "flex-1 py-3 text-lg outline-none bg-transparent placeholder-gray-500", onKeyDown: handleKeyDown }), query && (jsxRuntime.jsx("button", { onClick: () => onQueryChange(''), className: "text-gray-400 hover:text-gray-600 transition-colors", "aria-label": "Clear command", children: "\u00D7" }))] }), jsxRuntime.jsxs(cmdk.Command.List, { className: "max-h-96 overflow-y-auto p-2", children: [!query && (jsxRuntime.jsxs("div", { className: "px-2 py-3", children: [jsxRuntime.jsx("h3", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider mb-2", children: "Quick Actions" }), jsxRuntime.jsx("div", { className: "space-y-1", children: commands.slice(0, 6).map((command) => (jsxRuntime.jsx(CommandItem, { command: command, isSelected: false, onSelect: () => onSelectCommand(command) }, command.id))) })] })), query && Object.entries(groupedCommands).map(([category, categoryCommands]) => (jsxRuntime.jsxs("div", { className: "mb-4 last:mb-0", children: [jsxRuntime.jsxs("div", { className: "flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider", children: [categoryIcons[category] || categoryIcons.general, jsxRuntime.jsx("span", { className: "ml-2", children: category })] }), jsxRuntime.jsx("div", { className: "space-y-1", children: categoryCommands.map((command, index) => (jsxRuntime.jsx(CommandItem, { command: command, isSelected: index === selectedCommand, onSelect: () => onSelectCommand(command) }, command.id))) })] }, category))), query && filteredCommands.length === 0 && (jsxRuntime.jsxs("div", { className: "px-4 py-8 text-center", children: [jsxRuntime.jsx("div", { className: "text-gray-400 mb-2", children: "No commands found" }), jsxRuntime.jsx("div", { className: "text-sm text-gray-500", children: "Try typing a different command" })] }))] }), jsxRuntime.jsx("div", { className: "border-t border-gray-200 px-4 py-2", children: jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [jsxRuntime.jsxs("div", { className: "flex items-center space-x-4", children: [jsxRuntime.jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded text-xs", children: "\u2191\u2193" }), jsxRuntime.jsx("span", { children: "Navigate" })] }), jsxRuntime.jsxs("div", { className: "flex items-center space-x-4", children: [jsxRuntime.jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded text-xs", children: "\u21B5" }), jsxRuntime.jsx("span", { children: "Execute" })] }), jsxRuntime.jsxs("div", { className: "flex items-center space-x-4", children: [jsxRuntime.jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded text-xs", children: "ESC" }), jsxRuntime.jsx("span", { children: "Close" })] })] }) })] }) })] }));
};
const CommandItem = ({ command, isSelected, onSelect, }) => {
    return (jsxRuntime.jsx(cmdk.Command.Item, { value: `${command.title} ${command.description || ''} ${command.keywords?.join(' ') || ''}`, onSelect: onSelect, className: clsx.clsx('flex items-center px-2 py-2 text-sm rounded-md cursor-pointer transition-colors', isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'), children: jsxRuntime.jsxs("div", { className: "flex items-center flex-1 min-w-0", children: [command.icon && (jsxRuntime.jsx("span", { className: "mr-3 text-gray-400 flex-shrink-0", children: command.icon })), jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [jsxRuntime.jsx("div", { className: "font-medium text-gray-900 truncate", children: command.title }), command.description && (jsxRuntime.jsx("div", { className: "text-gray-500 text-xs truncate", children: command.description })), command.shortcut && (jsxRuntime.jsx("div", { className: "flex items-center mt-1", children: jsxRuntime.jsx("span", { className: "text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded", children: command.shortcut }) }))] }), jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4 text-gray-400 ml-2 flex-shrink-0" })] }) }));
};
// Command trigger button
const CommandTrigger = ({ onClick, shortcut = '⌘⇧P', className }) => {
    return (jsxRuntime.jsxs("button", { onClick: onClick, className: clsx.clsx('flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors', className), "aria-label": "Command palette", children: [jsxRuntime.jsx(lucideReact.Terminal, { className: "h-4 w-4 mr-2" }), jsxRuntime.jsx("span", { className: "flex-1 text-left", children: "Commands..." }), jsxRuntime.jsx("kbd", { className: "text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded", children: shortcut })] }));
};

const NavigationHistory = ({ history, currentIndex, canGoBack, canGoForward, onGoBack, onGoForward, onNavigateToItem, onClearHistory, className, maxItems = 10, showTimestamps = true, showActions = true, }) => {
    const [expanded, setExpanded] = React.useState(false);
    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins} min ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7)
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };
    // Get display history
    const displayHistory = expanded
        ? history.slice(-maxItems)
        : history.slice(-5);
    if (history.length === 0) {
        return (jsxRuntime.jsxs("div", { className: clsx.clsx('text-center py-8 text-gray-500', className), children: [jsxRuntime.jsx(lucideReact.Clock, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), jsxRuntime.jsx("p", { children: "No navigation history" }), jsxRuntime.jsx("p", { className: "text-sm text-gray-400 mt-2", children: "Your browsing history will appear here" })] }));
    }
    return (jsxRuntime.jsxs("div", { className: clsx.clsx('bg-white rounded-lg border border-gray-200', className), children: [jsxRuntime.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [jsxRuntime.jsx(lucideReact.Clock, { className: "h-5 w-5 text-gray-500" }), jsxRuntime.jsx("h3", { className: "font-medium text-gray-900", children: "Navigation History" }), jsxRuntime.jsxs("span", { className: "text-sm text-gray-500", children: [history.length, " items"] })] }), showActions && (jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [jsxRuntime.jsx("button", { onClick: onGoBack, disabled: !canGoBack, className: clsx.clsx('p-2 rounded-md transition-colors', canGoBack
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'), title: "Go back", children: jsxRuntime.jsx(lucideReact.ArrowLeft, { className: "h-4 w-4" }) }), jsxRuntime.jsx("button", { onClick: onGoForward, disabled: !canGoForward, className: clsx.clsx('p-2 rounded-md transition-colors', canGoForward
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'), title: "Go forward", children: jsxRuntime.jsx(lucideReact.ArrowRight, { className: "h-4 w-4" }) }), jsxRuntime.jsx("button", { onClick: onClearHistory, className: "p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors", title: "Clear history", children: jsxRuntime.jsx(lucideReact.Trash2, { className: "h-4 w-4" }) })] }))] }), jsxRuntime.jsx("div", { className: "max-h-96 overflow-y-auto", children: displayHistory.map((item, index) => {
                    const isCurrent = history.length - displayHistory.length + index === currentIndex;
                    history.length - displayHistory.length + index;
                    return (jsxRuntime.jsxs("div", { className: clsx.clsx('flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 transition-colors', isCurrent
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50'), children: [jsxRuntime.jsx("div", { className: "flex items-center flex-1 min-w-0", children: jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [jsxRuntime.jsx("h4", { className: clsx.clsx('font-medium truncate', isCurrent ? 'text-blue-900' : 'text-gray-900'), children: item.title }), isCurrent && (jsxRuntime.jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded", children: "Current" }))] }), jsxRuntime.jsx("p", { className: "text-sm text-gray-500 truncate", children: item.path }), showTimestamps && (jsxRuntime.jsx("p", { className: "text-xs text-gray-400 mt-1", children: formatTimestamp(item.timestamp) })), item.metadata && Object.keys(item.metadata).length > 0 && (jsxRuntime.jsx("div", { className: "flex items-center space-x-2 mt-2", children: Object.entries(item.metadata).slice(0, 2).map(([key, value]) => (jsxRuntime.jsxs("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: [key, ": ", String(value)] }, key))) }))] }) }), !isCurrent && (jsxRuntime.jsx("button", { onClick: () => onNavigateToItem(item), className: "ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors", title: "Navigate to this page", children: jsxRuntime.jsx(lucideReact.ExternalLink, { className: "h-4 w-4" }) }))] }, item.id));
                }) }), history.length > 5 && (jsxRuntime.jsx("div", { className: "p-4 border-t border-gray-200", children: jsxRuntime.jsx("button", { onClick: () => setExpanded(!expanded), className: "text-sm text-blue-600 hover:text-blue-800 transition-colors", children: expanded ? 'Show less' : `Show ${history.length - 5} more items` }) }))] }));
};
// Compact history component
const CompactHistory = ({ history, onNavigateToItem, className, maxItems = 5, }) => {
    const recentHistory = history.slice(-maxItems).reverse();
    if (recentHistory.length === 0) {
        return null;
    }
    return (jsxRuntime.jsxs("div", { className: clsx.clsx('space-y-1', className), children: [jsxRuntime.jsx("h4", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider mb-2", children: "Recent Pages" }), recentHistory.map((item) => (jsxRuntime.jsxs("button", { onClick: () => onNavigateToItem(item), className: "w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors", children: [jsxRuntime.jsx("div", { className: "font-medium truncate", children: item.title }), jsxRuntime.jsx("div", { className: "text-xs text-gray-400 truncate", children: item.path })] }, item.id)))] }));
};
// History dropdown component
const HistoryDropdown = ({ history, onNavigateToItem, onClearHistory, className, }) => {
    const recentHistory = history.slice(-10).reverse();
    return (jsxRuntime.jsxs("div", { className: clsx.clsx('bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden', className), children: [jsxRuntime.jsx("div", { className: "p-3 border-b border-gray-200", children: jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [jsxRuntime.jsx("h4", { className: "font-medium text-gray-900", children: "Recent History" }), jsxRuntime.jsx("button", { onClick: onClearHistory, className: "text-xs text-red-600 hover:text-red-800 transition-colors", children: "Clear" })] }) }), jsxRuntime.jsx("div", { className: "max-h-64 overflow-y-auto", children: recentHistory.map((item) => (jsxRuntime.jsxs("button", { onClick: () => onNavigateToItem(item), className: "w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0", children: [jsxRuntime.jsx("div", { className: "font-medium text-gray-900 truncate", children: item.title }), jsxRuntime.jsx("div", { className: "text-sm text-gray-500 truncate", children: item.path })] }, item.id))) })] }));
};

// Navigation context
const NavigationContext = React.createContext(null);
// Navigation provider component
const NavigationProvider = ({ children, config, navigationItems, }) => {
    const { currentPath, breadcrumbs, searchQuery, searchResults, commandPaletteOpen, history, historyIndex, deepLinkParams, navigate, goBack, goForward, setSearchQuery, setCommandPaletteOpen, addToHistory, clearHistory, setDeepLinkParams, updateConfig, } = useNavigationStore();
    // Update configuration when provided
    React.useEffect(() => {
        if (config) {
            updateConfig(config);
        }
    }, [config, updateConfig]);
    // Handle browser navigation
    React.useEffect(() => {
        const handlePopState = (event) => {
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
    const navigationValue = {
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
        generateDeepLink: (path, params = {}) => {
            const baseUrl = window?.location?.origin || '';
            const url = new URL(path, baseUrl);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(key, String(value));
                }
            });
            return url.toString();
        },
        parseDeepLink: (url) => {
            try {
                const parsedUrl = new URL(url);
                const path = parsedUrl.pathname;
                const params = {};
                parsedUrl.searchParams.forEach((value, key) => {
                    try {
                        params[key] = JSON.parse(value);
                    }
                    catch {
                        params[key] = value;
                    }
                });
                return { path, params };
            }
            catch (error) {
                console.error('Failed to parse deep link:', error);
                return { path: '/', params: {} };
            }
        },
    };
    return (jsxRuntime.jsx(NavigationContext.Provider, { value: navigationValue, children: children }));
};
// Hook to use navigation context
const useNavigation = () => {
    const context = React.useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
// Higher-order component for navigation
const withNavigation = (Component) => {
    const WithNavigation = (props) => {
        return (jsxRuntime.jsx(NavigationProvider, { navigationItems: [], children: jsxRuntime.jsx(Component, { ...props }) }));
    };
    WithNavigation.displayName = `withNavigation(${Component.displayName || Component.name})`;
    return WithNavigation;
};
// Navigation router wrapper
const NavigationRouter = ({ children, navigationItems, config }) => {
    return (jsxRuntime.jsx(NavigationProvider, { navigationItems: navigationItems, config: config, children: children }));
};

exports.BreadcrumbStructuredData = BreadcrumbStructuredData;
exports.Breadcrumbs = Breadcrumbs;
exports.CollapsibleBreadcrumbs = CollapsibleBreadcrumbs;
exports.CommandPalette = CommandPalette;
exports.CommandTrigger = CommandTrigger;
exports.CompactHistory = CompactHistory;
exports.GlobalSearch = GlobalSearch;
exports.HistoryDropdown = HistoryDropdown;
exports.NavigationHistory = NavigationHistory;
exports.NavigationProvider = NavigationProvider;
exports.NavigationRouter = NavigationRouter;
exports.SearchTrigger = SearchTrigger;
exports.useBreadcrumbContext = useBreadcrumbContext;
exports.useBreadcrumbs = useBreadcrumbs;
exports.useCommandPalette = useCommandPalette;
exports.useContextualCommands = useContextualCommands;
exports.useDeepLinkAnalytics = useDeepLinkAnalytics;
exports.useDeepLinkCampaigns = useDeepLinkCampaigns;
exports.useDeepLinking = useDeepLinking;
exports.useGlobalSearch = useGlobalSearch;
exports.useHistoryAnalytics = useHistoryAnalytics;
exports.useHistorySuggestions = useHistorySuggestions;
exports.useNavigation = useNavigation;
exports.useNavigationHistory = useNavigationHistory;
exports.useNavigationStore = useNavigationStore;
exports.useSearchAnalytics = useSearchAnalytics;
exports.useSearchShortcuts = useSearchShortcuts;
exports.useSearchSuggestions = useSearchSuggestions;
exports.useSystemCommands = useSystemCommands;
exports.withNavigation = withNavigation;
//# sourceMappingURL=index.js.map
