import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Notification, Organization, UserPreferences, FeatureFlags } from '../contexts/AppContext';

// Enhanced hook with additional utilities
export const useAppContext = () => {
  const context = useApp();

  // Notification utilities
  const notifySuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    context.addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [context.addNotification]);

  const notifyError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    context.addNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [context.addNotification]);

  const notifyWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    context.addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [context.addNotification]);

  const notifyInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    context.addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [context.addNotification]);

  // Organization utilities
  const updateOrganization = useCallback((updates: Partial<Organization>) => {
    if (!context.organization) return;
    
    context.setOrganization({
      ...context.organization,
      ...updates,
    });
  }, [context.organization, context.setOrganization]);

  // Preference utilities
  const toggleTheme = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(context.preferences.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    context.setPreferences({ theme: nextTheme });
  }, [context.preferences.theme, context.setPreferences]);

  const toggleSidebar = useCallback(() => {
    context.setPreferences({
      sidebarCollapsed: !context.preferences.sidebarCollapsed,
    });
  }, [context.preferences.sidebarCollapsed, context.setPreferences]);

  const toggleNotificationSetting = useCallback((type: keyof UserPreferences['notifications']) => {
    context.setPreferences({
      notifications: {
        ...context.preferences.notifications,
        [type]: !context.preferences.notifications[type],
      },
    });
  }, [context.preferences.notifications, context.setPreferences]);

  // Feature flag utilities
  const enableFeature = useCallback((flag: keyof FeatureFlags) => {
    context.setFeatureFlag(flag, true);
  }, [context.setFeatureFlag]);

  const disableFeature = useCallback((flag: keyof FeatureFlags) => {
    context.setFeatureFlag(flag, false);
  }, [context.setFeatureFlag]);

  const isFeatureEnabled = useCallback((flag: keyof FeatureFlags) => {
    return context.featureFlags[flag];
  }, [context.featureFlags]);

  // Loading utilities
  const withLoading = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    context.setIsLoading(true);
    try {
      return await operation();
    } finally {
      context.setIsLoading(false);
    }
  }, [context.setIsLoading]);

  // Error utilities
  const handleError = useCallback((error: unknown, defaultMessage?: string) => {
    const message = error instanceof Error ? error.message : defaultMessage || 'An unexpected error occurred';
    context.setGlobalError(message);
    notifyError('Error', message);
  }, [context.setGlobalError, notifyError]);

  const clearError = useCallback(() => {
    context.setGlobalError(null);
  }, [context.setGlobalError]);

  return {
    ...context,
    // Notification shortcuts
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Organization utilities
    updateOrganization,
    
    // Preference utilities
    toggleTheme,
    toggleSidebar,
    toggleNotificationSetting,
    
    // Feature flag utilities
    enableFeature,
    disableFeature,
    isFeatureEnabled,
    
    // Loading utilities
    withLoading,
    
    // Error utilities
    handleError,
    clearError,
  };
};

// Export the original hook for backward compatibility
export { useApp as useAppContextBase } from '../contexts/AppContext';

// Type exports
export type { Notification, Organization, UserPreferences, FeatureFlags } from '../contexts/AppContext';
