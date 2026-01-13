import { ReactNode } from 'react';
// Local UserRole type for navigation package
export type UserRole = 
  | 'super_admin'
  | 'tenant_admin'
  | 'manager'
  | 'employee'
  | 'cashier'
  | 'sales_rep'
  | 'accountant'
  | 'viewer';

// Navigation Types
export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: UserRole[];
  metadata?: {
    category?: string;
    description?: string;
    keywords?: string[];
    shortcut?: string;
  };
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  icon?: ReactNode;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  path: string;
  category: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
  score?: number;
}

export interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  category: string;
  action: () => void | Promise<void>;
  keywords?: string[];
}

export interface NavigationHistoryItem {
  id: string;
  path: string;
  title: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface NavigationState {
  // Current navigation state
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  searchQuery: string;
  searchResults: SearchResult[];
  commandPaletteOpen: boolean;
  
  // History
  history: NavigationHistoryItem[];
  historyIndex: number;
  
  // Deep linking
  deepLinkParams: Record<string, any>;
  
  // Actions
  navigate: (path: string, state?: any) => void;
  goBack: () => void;
  goForward: () => void;
  setSearchQuery: (query: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addToHistory: (item: NavigationHistoryItem) => void;
  clearHistory: () => void;
  setDeepLinkParams: (params: Record<string, any>) => void;
}

export interface NavigationConfig {
  // Breadcrumb configuration
  breadcrumbs: {
    enabled: boolean;
    maxItems: number;
    showHome: boolean;
    separator: ReactNode;
  };
  
  // Search configuration
  search: {
    enabled: boolean;
    shortcut: string;
    placeholder: string;
    maxResults: number;
    fuzzySearch: boolean;
    searchIn: ('title' | 'description' | 'keywords' | 'path')[];
  };
  
  // Command palette configuration
  commandPalette: {
    enabled: boolean;
    shortcut: string;
    placeholder: string;
    maxResults: number;
    categories: string[];
  };
  
  // History configuration
  history: {
    enabled: boolean;
    maxItems: number;
    persistAcrossSessions: boolean;
  };
  
  // Deep linking configuration
  deepLinking: {
    enabled: boolean;
    baseUrl: string;
    routeParams: string[];
  };
}

export interface NavigationProviderProps {
  children: ReactNode;
  config?: Partial<NavigationConfig>;
  navigationItems: NavigationItem[];
}

// Hook return types
export interface UseNavigationReturn {
  // Navigation state
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  canGoBack: boolean;
  canGoForward: boolean;
  
  // Actions
  navigate: (path: string, state?: any) => void;
  goBack: () => void;
  goForward: () => void;
  
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // History
  history: NavigationHistoryItem[];
  clearHistory: () => void;
  
  // Deep linking
  deepLinkParams: Record<string, any>;
  generateDeepLink: (path: string, params?: Record<string, any>) => string;
  parseDeepLink: (url: string) => { path: string; params: Record<string, any> };
}

export interface UseBreadcrumbsReturn {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeBreadcrumb: (id: string) => void;
  clearBreadcrumbs: () => void;
}

export interface UseGlobalSearchReturn {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  setQuery: (query: string) => void;
  setIsOpen: (open: boolean) => void;
  clearResults: () => void;
  executeSearch: (query: string) => Promise<SearchResult[]>;
}

export interface UseCommandPaletteReturn {
  isOpen: boolean;
  commands: Command[];
  filteredCommands: Command[];
  groupedCommands: Record<string, Command[]>;
  query: string;
  selectedCommand: number;
  setIsOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setSelectedCommand: (index: number) => void;
  executeCommand: (command: Command) => Promise<void>;
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
}

export interface UseNavigationHistoryReturn {
  history: NavigationHistoryItem[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  addToHistory: (item: NavigationHistoryItem) => void;
  clearHistory: () => void;
  getHistoryItem: (index: number) => NavigationHistoryItem | null;
  getRecentHistory: (count?: number) => NavigationHistoryItem[];
  getHistoryByDateRange: (startDate: Date, endDate: Date) => NavigationHistoryItem[];
  getFrequentPages: (limit?: number) => Array<{ path: string; title: string; count: number }>;
}

export interface UseDeepLinkingReturn {
  params: Record<string, any>;
  generateLink: (path: string, params?: Record<string, any>) => string;
  parseLink: (url: string) => { path: string; params: Record<string, any> };
  navigateToLink: (link: string) => void;
  shareLink: (path: string, params?: Record<string, any>) => Promise<void>;
  generateQRCode: (path: string, params?: Record<string, any>) => Promise<string>;
  validateParams: (params: Record<string, any>) => { isValid: boolean; errors: string[] };
}

// Event types
export interface NavigationEvent {
  type: 'navigation' | 'search' | 'command' | 'history' | 'deep_link';
  timestamp: number;
  data: any;
}

export interface NavigationEventData {
  path?: string;
  from?: string;
  query?: string;
  command?: string;
  historyIndex?: number;
  deepLink?: string;
}
