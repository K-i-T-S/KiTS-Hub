import React from 'react';
import { useAppContext } from '../../hooks/useApp';

const GlobalStateDemo: React.FC = () => {
  const {
    preferences,
    setPreferences,
    featureFlags,
    setFeatureFlag,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    unreadCount,
    organization,
    setOrganization,
    toggleTheme,
    toggleSidebar,
  } = useAppContext();

  const handleOrganizationUpdate = () => {
    setOrganization({
      id: 'demo-org',
      name: 'Demo Organization',
      plan: 'premium',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
      },
    });
    notifySuccess('Organization Updated', 'Demo organization has been set successfully');
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setFeatureFlag(feature as any, enabled);
    notifyInfo('Feature Updated', `${feature} has been ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handlePreferenceUpdate = (key: string, value: any) => {
    setPreferences({ [key]: value });
    notifySuccess('Preference Updated', `${key} has been updated`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Global State Management Demo</h2>
      
      {/* Organization Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Organization</h3>
        <div className="space-y-2">
          <p><strong>Name:</strong> {organization?.name || 'Not set'}</p>
          <p><strong>Plan:</strong> {organization?.plan || 'Not set'}</p>
          <button
            onClick={handleOrganizationUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set Demo Organization
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Theme:</strong> {preferences.theme}</p>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Toggle Theme
            </button>
          </div>
          <div>
            <p><strong>Sidebar:</strong> {preferences.sidebarCollapsed ? 'Collapsed' : 'Expanded'}</p>
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Toggle Sidebar
            </button>
          </div>
          <div>
            <p><strong>Language:</strong> {preferences.language}</p>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceUpdate('language', e.target.value)}
              className="px-3 py-1 border rounded"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <p><strong>Auto Save:</strong> {preferences.autoSave ? 'Enabled' : 'Disabled'}</p>
            <button
              onClick={() => handlePreferenceUpdate('autoSave', !preferences.autoSave)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Toggle Auto Save
            </button>
          </div>
        </div>
      </div>

      {/* Feature Flags Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(featureFlags).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between">
              <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
              <button
                onClick={() => handleFeatureToggle(feature, !enabled)}
                className={`px-3 py-1 rounded text-white ${
                  enabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div className="space-y-2">
          <p><strong>Unread Count:</strong> {unreadCount}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => notifySuccess('Success!', 'This is a success notification')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Success
            </button>
            <button
              onClick={() => notifyError('Error!', 'This is an error notification')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Error
            </button>
            <button
              onClick={() => notifyWarning('Warning!', 'This is a warning notification')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Warning
            </button>
            <button
              onClick={() => notifyInfo('Info!', 'This is an info notification')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-2">
          {Object.entries(preferences.notifications).map(([type, enabled]) => (
            <div key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`notification-${type}`}
                checked={enabled}
                onChange={() => setPreferences({
                  notifications: {
                    ...preferences.notifications,
                    [type]: !enabled,
                  },
                })}
                className="rounded"
              />
              <label htmlFor={`notification-${type}`} className="capitalize">
                {type} Notifications
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalStateDemo;
