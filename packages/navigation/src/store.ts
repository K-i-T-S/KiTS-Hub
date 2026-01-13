import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { NavigationState, NavigationConfig, NavigationHistoryItem } from './types';

const defaultConfig: NavigationConfig = {
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

interface NavigationStore extends NavigationState {
  // Configuration
  config: NavigationConfig;
  
  // Update configuration
  updateConfig: (config: Partial<NavigationConfig>) => void;
  
  // Internal state management
  setBreadcrumbs: (breadcrumbs: any[]) => void;
  setSearchResults: (results: any[]) => void;
  setHistoryIndex: (index: number) => void;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
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
    navigate: (path: string, state?: any) => {
      const currentPath = get().currentPath;
      const history = get().history;
      const historyIndex = get().historyIndex;
      
      // Create new history item
      const historyItem: NavigationHistoryItem = {
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

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    setCommandPaletteOpen: (open: boolean) => {
      set({ commandPaletteOpen: open });
    },

    addToHistory: (item: NavigationHistoryItem) => {
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

    setDeepLinkParams: (params: Record<string, any>) => {
      set({ deepLinkParams: params });
    },

    // Configuration management
    updateConfig: (config: Partial<NavigationConfig>) => {
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
    setBreadcrumbs: (breadcrumbs: any[]) => {
      set({ breadcrumbs });
    },

    setSearchResults: (results: any[]) => {
      set({ searchResults: results });
    },

    setHistoryIndex: (index: number) => {
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
        } catch (error) {
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
        } catch (error) {
          console.warn('Failed to load navigation state from localStorage:', error);
        }
      }
    },
  }))
);

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
