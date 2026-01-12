import { Settings as SettingsIcon, User, Bell, Shield, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: 'General',
      icon: SettingsIcon,
      items: [
        { label: 'Company Information', description: 'Update your company details and branding' },
        { label: 'System Preferences', description: 'Configure system-wide settings' },
        { label: 'Time Zone & Language', description: 'Set your regional preferences' },
      ]
    },
    {
      title: 'User Management',
      icon: User,
      items: [
        { label: 'User Profiles', description: 'Manage user accounts and permissions' },
        { label: 'Roles & Permissions', description: 'Configure access control' },
        { label: 'Authentication', description: 'Set up security and login methods' },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Email Notifications', description: 'Configure email alerts and reports' },
        { label: 'System Alerts', description: 'Set up system monitoring alerts' },
        { label: 'Push Notifications', description: 'Manage mobile and web notifications' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'API Keys', description: 'Manage API access tokens' },
        { label: 'Audit Logs', description: 'View system activity logs' },
        { label: 'Security Policies', description: 'Configure security settings' },
      ]
    },
    {
      title: 'Data & Integrations',
      icon: Database,
      items: [
        { label: 'Database Settings', description: 'Configure database connections' },
        { label: 'Backup & Recovery', description: 'Manage data backup policies' },
        { label: 'Third-party Integrations', description: 'Connect external services' },
      ]
    },
    {
      title: 'Localization',
      icon: Globe,
      items: [
        { label: 'Currency Settings', description: 'Configure currency and tax settings' },
        { label: 'Regional Settings', description: 'Set up regional compliance' },
        { label: 'Multi-language Support', description: 'Configure language options' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your KiTS Hub configuration and preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-2 rounded-md hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">KiTS Hub Version</h4>
              <p className="text-sm text-muted-foreground">v2.0.0</p>
            </div>
            <div>
              <h4 className="font-medium">Environment</h4>
              <p className="text-sm text-muted-foreground">Development</p>
            </div>
            <div>
              <h4 className="font-medium">Last Updated</h4>
              <p className="text-sm text-muted-foreground">January 8, 2026</p>
            </div>
            <div>
              <h4 className="font-medium">Database Status</h4>
              <p className="text-sm text-green-600">Connected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
