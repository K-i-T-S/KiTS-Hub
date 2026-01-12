import React, { useState } from 'react';
import { useAppContext } from '../hooks/useApp';

const StateNotificationTest: React.FC = () => {
  const { 
    preferences, 
    setPreferences, 
    notifySuccess, 
    notifyError, 
    notifyWarning, 
    notifyInfo,
    notifications,
    clearNotifications,
    markAllNotificationsRead,
    unreadCount,
    featureFlags,
    enableFeature,
    disableFeature,
    isFeatureEnabled,
    resetPreferences
  } = useAppContext();

  const [testCounter, setTestCounter] = useState(0);

  const handleStatePersistence = () => {
    // Test theme change
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentThemeIndex = themes.indexOf(preferences.theme);
    const nextTheme = themes[(currentThemeIndex + 1) % themes.length];
    
    setPreferences({ theme: nextTheme });
    notifySuccess('Theme Changed', `Theme changed to ${nextTheme}`);
    
    // Test sidebar toggle
    setPreferences({ sidebarCollapsed: !preferences.sidebarCollapsed });
    notifyInfo('Sidebar Toggled', `Sidebar is now ${!preferences.sidebarCollapsed ? 'collapsed' : 'expanded'}`);
  };

  const handleNotificationTest = () => {
    setTestCounter(prev => prev + 1);
    
    // Test all notification types
    notifySuccess(`Success Test #${testCounter}`, 'This is a success notification that will auto-remove in 5 seconds');
    notifyError(`Error Test #${testCounter}`, 'This is an error notification that requires manual dismissal');
    notifyWarning(`Warning Test #${testCounter}`, 'This is a warning notification with important information');
    notifyInfo(`Info Test #${testCounter}`, 'This is an informational notification');
  };

  const handleFeatureFlags = () => {
    // Toggle a feature flag
    const featureName = 'advancedAnalytics';
    const isEnabled = isFeatureEnabled(featureName);
    
    if (isEnabled) {
      disableFeature(featureName);
      notifyWarning('Feature Disabled', 'Advanced Analytics has been disabled');
    } else {
      enableFeature(featureName);
      notifySuccess('Feature Enabled', 'Advanced Analytics has been enabled');
    }
  };

  const handleResetState = () => {
    resetPreferences();
    clearNotifications();
    notifyInfo('State Reset', 'All preferences have been reset to defaults');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">State & Notification Validation</h2>
      
      {/* Current State Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Current State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Theme:</span> {preferences.theme}
          </div>
          <div>
            <span className="font-medium">Sidebar:</span> {preferences.sidebarCollapsed ? 'Collapsed' : 'Expanded'}
          </div>
          <div>
            <span className="font-medium">Notifications:</span> {unreadCount} unread
          </div>
          <div>
            <span className="font-medium">Total Notifications:</span> {notifications.length}
          </div>
          <div>
            <span className="font-medium">Advanced Analytics:</span> {isFeatureEnabled('advancedAnalytics') ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <span className="font-medium">Multi-Tenant:</span> {isFeatureEnabled('multiTenant') ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStatePersistence}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Test State Persistence
          </button>
          
          <button
            onClick={handleNotificationTest}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Test Notifications
          </button>
          
          <button
            onClick={handleFeatureFlags}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Toggle Feature Flag
          </button>
          
          <button
            onClick={handleResetState}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reset All State
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => markAllNotificationsRead()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Mark All Read
          </button>
          
          <button
            onClick={clearNotifications}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Clear Notifications
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Validation Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>Click "Test State Persistence" to change theme and sidebar</li>
          <li>Refresh the page - preferences should persist</li>
          <li>Click "Test Notifications" to see all notification types</li>
          <li>Success notifications should auto-remove after 5 seconds</li>
          <li>Click notifications to mark them as read</li>
          <li>Use close button (X) to remove notifications manually</li>
          <li>Click "Toggle Feature Flag" to enable/disable features</li>
          <li>Click "Reset All State" to reset everything to defaults</li>
        </ol>
      </div>

      {/* Feature Flags Display */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Feature Flags Status</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {Object.entries(featureFlags).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-700">{key}: {value ? 'ON' : 'OFF'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateNotificationTest;
