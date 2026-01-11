import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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

// Action types
type SharedStateAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_TENANT_CONTEXT'; payload: TenantContext | null }
  | { type: 'UPDATE_TENANT_SETTINGS'; payload: Partial<TenantContext['settings']> }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_GLOBAL_SETTINGS'; payload: Partial<GlobalSettings> }
  | { type: 'UPDATE_CONNECTION_STATUS'; payload: Partial<SharedState['connectionStatus']> }
  | { type: 'SET_LOADING'; payload: { key: keyof SharedState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof SharedState['errors']; value: string | null } }
  | { type: 'HANDLE_CROSS_SOLUTION_EVENT'; payload: CrossSolutionEvent };

// Initial state
const initialState: SharedState = {
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
};

// Reducer function
function sharedStateReducer(state: SharedState, action: SharedStateAction): SharedState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };

    case 'SET_TENANT_CONTEXT':
      return { ...state, tenantContext: action.payload };

    case 'UPDATE_TENANT_SETTINGS':
      return {
        ...state,
        tenantContext: state.tenantContext
          ? { ...state.tenantContext, settings: { ...state.tenantContext.settings, ...action.payload } }
          : null,
      };

    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };
      
      const notifications = [...state.notifications, newNotification];
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case 'REMOVE_NOTIFICATION': {
      const notifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    }

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case 'UPDATE_GLOBAL_SETTINGS':
      return {
        ...state,
        globalSettings: { ...state.globalSettings, ...action.payload },
      };

    case 'UPDATE_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: { ...state.connectionStatus, ...action.payload },
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value },
      };

    case 'HANDLE_CROSS_SOLUTION_EVENT': {
      const event = action.payload;
      
      // Handle different event types
      switch (event.type) {
        case 'notification':
          // Add notification from event
          if (state.globalSettings.notifications.enabled && 
              state.globalSettings.notifications.categories[event.data.category]) {
            const notificationAction: SharedStateAction = {
              type: 'ADD_NOTIFICATION',
              payload: {
                title: event.data.title,
                message: event.data.message,
                severity: event.data.severity,
                category: event.data.category,
                actionUrl: event.data.actionUrl,
                requiresAction: event.data.requiresAction,
              },
            };
            return sharedStateReducer(state, notificationAction);
          }
          break;

        case 'low_stock_alert':
          // Create notification for low stock
          if (state.globalSettings.notifications.categories.inventory) {
            const notificationAction: SharedStateAction = {
              type: 'ADD_NOTIFICATION',
              payload: {
                title: 'Low Stock Alert',
                message: `Product ${event.data.productName} is running low on stock (${event.data.currentStock} remaining)`,
                severity: 'warning',
                category: 'inventory',
                actionUrl: '/inventory',
                requiresAction: true,
              },
            };
            return sharedStateReducer(state, notificationAction);
          }
          break;

        case 'customer_created':
          // Create notification for new customer
          if (state.globalSettings.notifications.categories.customer) {
            const notificationAction: SharedStateAction = {
              type: 'ADD_NOTIFICATION',
              payload: {
                title: 'New Customer Added',
                message: `Customer ${event.data.customerData.name} has been added to the system`,
                severity: 'success',
                category: 'customer',
                actionUrl: `/crm/customer/${event.data.customerId}`,
                requiresAction: false,
              },
            };
            return sharedStateReducer(state, notificationAction);
          }
          break;

        case 'sale_processed':
          // Update connection status
          return sharedStateReducer(state, {
            type: 'UPDATE_CONNECTION_STATUS',
            payload: { eventBus: true },
          });

        case 'system_health':
          // Update connection status based on system health
          if (event.data.service === 'event-bus') {
            return sharedStateReducer(state, {
              type: 'UPDATE_CONNECTION_STATUS',
              payload: { 
                eventBus: event.data.status === 'healthy' 
              },
            });
          }
          break;
      }
      
      return state;
    }

    default:
      return state;
  }
}

// Context interface
interface SharedStateContextType {
  state: SharedState;
  dispatch: React.Dispatch<SharedStateAction>;
}

// Create context
const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

// Provider component
interface SharedStateProviderProps {
  children: ReactNode;
}

export const SharedStateProvider: React.FC<SharedStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(sharedStateReducer, initialState);

  useEffect(() => {
    // Subscribe to event bus
    const unsubscribe = globalEventBus.on('*', (event: CrossSolutionEvent) => {
      dispatch({ type: 'HANDLE_CROSS_SOLUTION_EVENT', payload: event });
    });
    
    // Set initial connection status
    dispatch({ 
      type: 'UPDATE_CONNECTION_STATUS', 
      payload: { eventBus: true } 
    });
    
    // Load saved settings from localStorage
    try {
      const savedSettings = localStorage.getItem('shared-state-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ 
          type: 'UPDATE_GLOBAL_SETTINGS', 
          payload: settings 
        });
      }
    } catch (error) {
      console.warn('Failed to load saved settings:', error);
    }

    // Auto-remove expired notifications
    const interval = setInterval(() => {
      const now = new Date();
      state.notifications.forEach(notification => {
        if (notification.expiresAt && notification.expiresAt < now) {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }
      });
    }, 60000); // Check every minute

    // Cleanup function
    return () => {
      if (typeof unsubscribe === 'string') {
        globalEventBus.off(unsubscribe);
      }
      clearInterval(interval);
      
      // Save settings to localStorage
      try {
        localStorage.setItem('shared-state-settings', JSON.stringify(state.globalSettings));
      } catch (error) {
        console.warn('Failed to save settings:', error);
      }
    };
  }, [state.notifications, state.globalSettings]);

  const value = { state, dispatch };

  return (
    <SharedStateContext.Provider value={value}>
      {children}
    </SharedStateContext.Provider>
  );
};

// Hook to use the shared state
export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (context === undefined) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};

// Convenience hooks
export const useCurrentUser = () => {
  const { state } = useSharedState();
  return state.currentUser;
};

export const useTenantContext = () => {
  const { state } = useSharedState();
  return state.tenantContext;
};

export const useNotifications = () => {
  const { state, dispatch } = useSharedState();
  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    markRead: (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    markAllRead: () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }),
    remove: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    clear: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
  };
};

export const useGlobalSettings = () => {
  const { state, dispatch } = useSharedState();
  return {
    settings: state.globalSettings,
    updateSettings: (settings: Partial<GlobalSettings>) =>
      dispatch({ type: 'UPDATE_GLOBAL_SETTINGS', payload: settings }),
  };
};

export const useConnectionStatus = () => {
  const { state } = useSharedState();
  return state.connectionStatus;
};
