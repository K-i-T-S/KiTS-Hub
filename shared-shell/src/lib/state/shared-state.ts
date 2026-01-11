import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { globalEventBus } from '../events/event-bus';
import { CrossSolutionEvent } from '../events/types';

// User and tenant context
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee' | 'cashier' | 'viewer';
  tenantId: string;
  permissions: string[];
  lastLogin?: Date;
}

export interface TenantContext {
  id: string;
  name: string;
  plan: 'standard' | 'premium' | 'enterprise';
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
  features: {
    inventory: boolean;
    pos: boolean;
    crm: boolean;
    hr: boolean;
    accounting: boolean;
    analytics: boolean;
  };
  limits: {
    maxUsers: number;
    maxProducts: number;
    maxCustomers: number;
    storageGB: number;
  };
}

// Notification system
export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'inventory' | 'sales' | 'customer' | 'financial' | 'hr';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  requiresAction: boolean;
  expiresAt?: Date;
}

// Global settings
export interface GlobalSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    desktop: boolean;
    email: boolean;
    sound: boolean;
    categories: Record<string, boolean>;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
    usageStats: boolean;
  };
  performance: {
    enableAnimations: boolean;
    enableRealTimeUpdates: boolean;
    cacheSize: number;
  };
}

// Cross-solution state interface
export interface SharedState {
  // User and tenant context
  currentUser: User | null;
  tenantContext: TenantContext | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Global settings
  globalSettings: GlobalSettings;
  
  // Real-time connection status
  connectionStatus: {
    eventBus: boolean;
    database: boolean;
    realtime: boolean;
  };
  
  // Loading states
  loading: {
    user: boolean;
    tenant: boolean;
    notifications: boolean;
    settings: boolean;
  };
  
  // Error states
  errors: {
    user: string | null;
    tenant: string | null;
    notifications: string | null;
    settings: string | null;
  };
}

// Store actions
export interface SharedStateActions {
  // User management
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Tenant management
  setTenantContext: (tenant: TenantContext | null) => void;
  updateTenantSettings: (settings: Partial<TenantContext['settings']>) => void;
  
  // Notification management
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Settings management
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  
  // Connection status
  updateConnectionStatus: (status: Partial<SharedState['connectionStatus']>) => void;
  
  // Loading states
  setLoading: (key: keyof SharedState['loading'], loading: boolean) => void;
  
  // Error states
  setError: (key: keyof SharedState['errors'], error: string | null) => void;
  
  // Event handling
  handleCrossSolutionEvent: (event: CrossSolutionEvent) => void;
  
  // Initialize and cleanup
  initialize: () => void;
  cleanup: () => void;
}

// Create the shared state store
export const useSharedState = create<SharedState & SharedStateActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentUser: null,
    tenantContext: null,
    notifications: [],
    unreadCount: 0,
    globalSettings: {
      theme: 'system',
      notifications: {
        enabled: true,
        desktop: true,
        email: true,
        sound: false,
        categories: {
          system: true,
          inventory: true,
          sales: true,
          customer: true,
          financial: true,
          hr: true,
        },
      },
      privacy: {
        analytics: true,
        crashReporting: true,
        usageStats: false,
      },
      performance: {
        enableAnimations: true,
        enableRealTimeUpdates: true,
        cacheSize: 100,
      },
    },
    connectionStatus: {
      eventBus: false,
      database: false,
      realtime: false,
    },
    loading: {
      user: false,
      tenant: false,
      notifications: false,
      settings: false,
    },
    errors: {
      user: null,
      tenant: null,
      notifications: null,
      settings: null,
    },

    // User management
    setCurrentUser: (user) => set({ currentUser: user }),
    
    updateUser: (updates) => set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    })),

    // Tenant management
    setTenantContext: (tenant) => set({ tenantContext: tenant }),
    
    updateTenantSettings: (settings) => set((state) => ({
      tenantContext: state.tenantContext 
        ? { ...state.tenantContext, settings: { ...state.tenantContext.settings, ...settings } }
        : null,
    })),

    // Notification management
    addNotification: (notification) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };
      
      set((state) => {
        const notifications = [...state.notifications, newNotification];
        return {
          notifications,
          unreadCount: notifications.filter(n => !n.read).length,
        };
      });

      // Auto-remove notification after expiry if set
      if (notification.expiresAt) {
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, notification.expiresAt.getTime() - Date.now());
      }
    },

    markNotificationRead: (id) => set((state) => {
      const notifications = state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    }),

    markAllNotificationsRead: () => set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    })),

    removeNotification: (id) => set((state) => {
      const notifications = state.notifications.filter(n => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    }),

    clearNotifications: () => set({
      notifications: [],
      unreadCount: 0,
    }),

    // Settings management
    updateGlobalSettings: (settings) => set((state) => ({
      globalSettings: { ...state.globalSettings, ...settings },
    })),

    // Connection status
    updateConnectionStatus: (status) => set((state) => ({
      connectionStatus: { ...state.connectionStatus, ...status },
    })),

    // Loading states
    setLoading: (key, loading) => set((state) => ({
      loading: { ...state.loading, [key]: loading },
    })),

    // Error states
    setError: (key, error) => set((state) => ({
      errors: { ...state.errors, [key]: error },
    })),

    // Event handling
    handleCrossSolutionEvent: (event) => {
      const state = get();
      
      // Handle different event types
      switch (event.type) {
        case 'notification':
          // Add notification from event
          if (state.globalSettings.notifications.enabled && 
              state.globalSettings.notifications.categories[event.data.category]) {
            get().addNotification({
              title: event.data.title,
              message: event.data.message,
              severity: event.data.severity,
              category: event.data.category,
              actionUrl: event.data.actionUrl,
              requiresAction: event.data.requiresAction,
            });
          }
          break;

        case 'low_stock_alert':
          // Create notification for low stock
          if (state.globalSettings.notifications.categories.inventory) {
            get().addNotification({
              title: 'Low Stock Alert',
              message: `Product ${event.data.productName} is running low on stock (${event.data.currentStock} remaining)`,
              severity: 'warning',
              category: 'inventory',
              actionUrl: '/inventory',
              requiresAction: true,
            });
          }
          break;

        case 'customer_created':
          // Create notification for new customer
          if (state.globalSettings.notifications.categories.customer) {
            get().addNotification({
              title: 'New Customer Added',
              message: `Customer ${event.data.customerData.name} has been added to the system`,
              severity: 'success',
              category: 'customer',
              actionUrl: `/crm/customer/${event.data.customerId}`,
              requiresAction: false,
            });
          }
          break;

        case 'sale_processed':
          // Update connection status and potentially create notification
          get().updateConnectionStatus({ eventBus: true });
          break;

        case 'system_health':
          // Update connection status based on system health
          if (event.data.service === 'event-bus') {
            get().updateConnectionStatus({ 
              eventBus: event.data.status === 'healthy' 
            });
          }
          break;
      }
    },

    // Initialize and cleanup
    initialize: () => {
      // Subscribe to event bus
      const unsubscribe = globalEventBus.on('*', get().handleCrossSolutionEvent);
      
      // Set initial connection status
      get().updateConnectionStatus({ eventBus: true });
      
      // Load saved settings from localStorage
      try {
        const savedSettings = localStorage.getItem('shared-state-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          get().updateGlobalSettings(settings);
        }
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }

      // Return cleanup function
      return () => {
        if (typeof unsubscribe === 'string') {
          globalEventBus.off(unsubscribe);
        }
      };
    },

    cleanup: () => {
      // Save settings to localStorage
      try {
        const { globalSettings } = get();
        localStorage.setItem('shared-state-settings', JSON.stringify(globalSettings));
      } catch (error) {
        console.warn('Failed to save settings:', error);
      }
    },
  }))
);

// Hook for accessing shared state with subscriptions
export const useSharedStateSubscription = (
  selector: (state: SharedState & SharedStateActions) => any,
  _equalityFn?: (a: any, b: any) => boolean
) => {
  return useSharedState(selector);
};

// Convenience hooks
export const useCurrentUser = () => useSharedState((state) => state.currentUser);
export const useTenantContext = () => useSharedState((state) => state.tenantContext);
export const useNotifications = () => useSharedState((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  addNotification: state.addNotification,
  markRead: state.markNotificationRead,
  markAllRead: state.markAllNotificationsRead,
  remove: state.removeNotification,
  clear: state.clearNotifications,
}));
export const useGlobalSettings = () => useSharedState((state) => state.globalSettings);
export const useConnectionStatus = () => useSharedState((state) => state.connectionStatus);

// Initialize the shared state when the module loads
if (typeof window !== 'undefined') {
  useSharedState.getState().initialize();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    useSharedState.getState().cleanup();
  });
}
