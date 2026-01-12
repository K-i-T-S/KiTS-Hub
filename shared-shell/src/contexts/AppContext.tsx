import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types
export interface Organization {
  id: string;
  name: string;
  plan: 'standard' | 'premium' | 'enterprise';
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
  language: string;
  autoSave: boolean;
  compactMode: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
  metadata?: {
    source: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  };
}

export interface FeatureFlags {
  // Core features
  advancedAnalytics: boolean;
  multiTenant: boolean;
  apiAccess: boolean;
  // Solution-specific features
  inventoryManagement: boolean;
  pointOfSale: boolean;
  crmSystem: boolean;
  hrManagement: boolean;
  accountingSystem: boolean;
  // Beta features
  betaFeatures: boolean;
  newDashboard: boolean;
  aiAssistant: boolean;
}

interface AppContextType {
  // Organization
  organization: Organization | null;
  setOrganization: (org: Organization | null) => void;
  updateOrganizationSettings: (settings: Partial<Organization['settings']>) => void;

  // User Preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  resetPreferences: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;

  // Feature Flags
  featureFlags: FeatureFlags;
  setFeatureFlag: (flag: keyof FeatureFlags, value: boolean) => void;
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;

  // Global loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  notifications: {
    email: true,
    push: true,
    desktop: false,
  },
  dashboard: {
    layout: 'grid',
    widgets: ['sales', 'inventory', 'customers', 'revenue'],
  },
  language: 'en',
  autoSave: true,
  compactMode: false,
};

// Default feature flags
const defaultFeatureFlags: FeatureFlags = {
  advancedAnalytics: false,
  multiTenant: true,
  apiAccess: false,
  inventoryManagement: true,
  pointOfSale: true,
  crmSystem: true,
  hrManagement: true,
  accountingSystem: true,
  betaFeatures: false,
  newDashboard: false,
  aiAssistant: false,
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Organization state
  const [organization, setOrganizationState] = useState<Organization | null>(null);

  // Preferences state
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Feature flags state
  const [featureFlags, setFeatureFlagsState] = useState<FeatureFlags>(defaultFeatureFlags);

  // Global loading state
  const [isLoading, setIsLoading] = useState(false);

  // Global error state
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('kits-hub-preferences');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferencesState({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('kits-hub-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  }, [preferences]);

  // Organization methods
  const setOrganization = useCallback((org: Organization | null) => {
    setOrganizationState(org);
  }, []);

  const updateOrganizationSettings = useCallback((settings: Partial<Organization['settings']>) => {
    if (!organization) return;
    
    setOrganizationState({
      ...organization,
      settings: {
        ...organization.settings,
        ...settings,
      },
    });
  }, [organization]);

  // Preferences methods
  const setPreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferencesState(prev => ({
      ...prev,
      ...prefs,
      notifications: {
        ...prev.notifications,
        ...(prefs.notifications || {}),
      },
      dashboard: {
        ...prev.dashboard,
        ...(prefs.dashboard || {}),
      },
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferencesState(defaultPreferences);
  }, []);

  // Notifications methods
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50

    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Feature flags methods
  const setFeatureFlag = useCallback((flag: keyof FeatureFlags, value: boolean) => {
    setFeatureFlagsState(prev => ({
      ...prev,
      [flag]: value,
    }));
  }, []);

  const updateFeatureFlags = useCallback((flags: Partial<FeatureFlags>) => {
    setFeatureFlagsState(prev => ({
      ...prev,
      ...flags,
    }));
  }, []);

  // Computed values
  const unreadCount = notifications.filter(n => !n.read).length;

  const value: AppContextType = {
    // Organization
    organization,
    setOrganization,
    updateOrganizationSettings,

    // Preferences
    preferences,
    setPreferences,
    resetPreferences,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    unreadCount,

    // Feature flags
    featureFlags,
    setFeatureFlag,
    updateFeatureFlags,

    // Global state
    isLoading,
    setIsLoading,
    globalError,
    setGlobalError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
