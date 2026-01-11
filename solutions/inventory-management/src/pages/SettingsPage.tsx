import { useState } from 'react';
import { Save, Bell, Shield, Database, Globe, User } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    lowStockAlerts: true,
    autoBackup: false,
    dataRetention: '365',
    currency: 'USD',
    language: 'en'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In real app, this would save to API
    console.log(`Setting changed: ${key} = ${value}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <div className="kits-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Bell className="h-6 w-6 text-kits-primary" />
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              </div>
              <label className="flex items-center relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="h-4 w-4 text-kits-primary focus:ring-kits-primary focus:ring-offset-2"
                />
                <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
              </label>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="kits-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-kits-warning" />
                <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
              </div>
              <label className="flex items-center relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lowStockAlerts}
                  onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                  className="h-4 w-4 text-kits-primary focus:ring-kits-primary focus:ring-offset-2"
                />
                <span className="ml-2 text-sm text-gray-700">Enable low stock alerts</span>
              </label>
            </div>
          </div>

          {/* Data Backup */}
          <div className="kits-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="h-6 w-6 text-kits-primary" />
                <h3 className="text-lg font-medium text-gray-900">Data Backup</h3>
              </div>
              <label className="flex items-center relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  className="h-4 w-4 text-kits-primary focus:ring-kits-primary focus:ring-offset-2"
                />
                <span className="ml-2 text-sm text-gray-700">Enable automatic backup</span>
              </label>
            </div>
          </div>

          {/* Data Retention */}
          <div className="kits-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Save className="h-6 w-6 text-kits-primary" />
                <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
              </div>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="kits-input px-3 py-2"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="730">2 years</option>
              </select>
              <span className="text-xs text-gray-500 ml-2">Keep data for {settings.dataRetention} days</span>
            </div>
          </div>

          {/* Currency */}
          <div className="kits-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Globe className="h-6 w-6 text-kits-primary" />
                <h3 className="text-lg font-medium text-gray-900">Currency</h3>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="kits-input px-3 py-2"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="LBP">LBP (£)</option>
              </select>
            </div>
          </div>

          {/* Language */}
          <div className="kits-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="h-6 w-6 text-kits-primary" />
                <h3 className="text-lg font-medium text-gray-900">Language</h3>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="kits-input px-3 py-2"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button className="kits-button kits-button-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
