import React, { useState } from 'react';
import { 
  NotificationPreferences,
  NotificationChannel,
  NotificationType,
  NotificationPriority
} from '../types/index.js';

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (updates: Partial<NotificationPreferences>) => void;
  onResetToDefaults: () => void;
  className?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  onUpdatePreferences,
  onResetToDefaults,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'types' | 'priorities' | 'quiet-hours' | 'frequency'>('channels');

  const handleChannelToggle = (channel: NotificationChannel) => {
    onUpdatePreferences({
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel]
      }
    });
  };

  const handleTypeToggle = (type: NotificationType) => {
    onUpdatePreferences({
      types: {
        ...preferences.types,
        [type]: !preferences.types[type]
      }
    });
  };

  const handlePriorityToggle = (priority: NotificationPriority) => {
    onUpdatePreferences({
      priorities: {
        ...preferences.priorities,
        [priority]: !preferences.priorities[priority]
      }
    });
  };

  const handleQuietHoursToggle = () => {
    onUpdatePreferences({
      quietHours: {
        ...preferences.quietHours,
        enabled: !preferences.quietHours.enabled
      }
    });
  };

  const handleQuietHoursTimeChange = (field: 'start' | 'end', value: string) => {
    onUpdatePreferences({
      quietHours: {
        ...preferences.quietHours,
        [field]: value
      }
    });
  };

  const handleFrequencyChange = (field: 'maxPerHour' | 'maxPerDay' | 'batchDelay', value: number) => {
    onUpdatePreferences({
      frequency: {
        ...preferences.frequency,
        [field]: value
      }
    });
  };

  const handleEmailChange = (field: 'address' | 'enabled', value: string | boolean) => {
    onUpdatePreferences({
      email: {
        ...preferences.email,
        [field]: value
      }
    });
  };

  const handlePushChange = (field: 'enabled' | 'token', value: boolean | string) => {
    onUpdatePreferences({
      push: {
        ...preferences.push,
        [field]: value
      }
    });
  };

  const handleDesktopChange = (field: 'enabled' | 'requireInteraction', value: boolean) => {
    onUpdatePreferences({
      desktop: {
        ...preferences.desktop,
        [field]: value
      }
    });
  };

  const getChannelLabel = (channel: NotificationChannel): string => {
    const labels = {
      [NotificationChannel.IN_APP]: 'In-App',
      [NotificationChannel.EMAIL]: 'Email',
      [NotificationChannel.PUSH]: 'Push',
      [NotificationChannel.DESKTOP]: 'Desktop',
      [NotificationChannel.SMS]: 'SMS'
    };
    return labels[channel] || channel;
  };

  const getTypeLabel = (type: NotificationType): string => {
    const labels = {
      [NotificationType.INFO]: 'Information',
      [NotificationType.SUCCESS]: 'Success',
      [NotificationType.WARNING]: 'Warning',
      [NotificationType.ERROR]: 'Error',
      [NotificationType.SYSTEM]: 'System'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority: NotificationPriority): string => {
    const labels = {
      [NotificationPriority.LOW]: 'Low',
      [NotificationPriority.NORMAL]: 'Normal',
      [NotificationPriority.HIGH]: 'High',
      [NotificationPriority.URGENT]: 'Urgent'
    };
    return labels[priority] || priority;
  };

  return (
    <div className={`notification-preferences ${className}`}>
      <div className="preferences-header">
        <h2>Notification Preferences</h2>
        <button
          onClick={onResetToDefaults}
          className="reset-button"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="preferences-tabs">
        <button
          className={`tab-button ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          Channels
        </button>
        <button
          className={`tab-button ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          Types
        </button>
        <button
          className={`tab-button ${activeTab === 'priorities' ? 'active' : ''}`}
          onClick={() => setActiveTab('priorities')}
        >
          Priorities
        </button>
        <button
          className={`tab-button ${activeTab === 'quiet-hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiet-hours')}
        >
          Quiet Hours
        </button>
        <button
          className={`tab-button ${activeTab === 'frequency' ? 'active' : ''}`}
          onClick={() => setActiveTab('frequency')}
        >
          Frequency
        </button>
      </div>

      <div className="preferences-content">
        {activeTab === 'channels' && (
          <div className="preferences-section">
            <h3>Notification Channels</h3>
            <p className="section-description">
              Choose which channels you want to receive notifications on.
            </p>
            
            <div className="preference-list">
              {Object.values(NotificationChannel).map(channel => (
                <div key={channel} className="preference-item">
                  <label className="preference-label">
                    <input
                      type="checkbox"
                      checked={preferences.channels[channel] || false}
                      onChange={() => handleChannelToggle(channel)}
                      className="preference-checkbox"
                    />
                    <span className="preference-name">{getChannelLabel(channel)}</span>
                  </label>
                  <span className="preference-description">
                    {getChannelDescription(channel)}
                  </span>
                </div>
              ))}
            </div>

            {/* Channel-specific settings */}
            {preferences.channels[NotificationChannel.EMAIL] && (
              <div className="channel-settings">
                <h4>Email Settings</h4>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={preferences.email.address}
                    onChange={(e) => handleEmailChange('address', e.target.value)}
                    placeholder="your.email@example.com"
                    className="form-input"
                  />
                </div>
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={preferences.email.enabled}
                    onChange={(e) => handleEmailChange('enabled', e.target.checked)}
                    className="preference-checkbox"
                  />
                  <span>Enable email notifications</span>
                </label>
              </div>
            )}

            {preferences.channels[NotificationChannel.PUSH] && (
              <div className="channel-settings">
                <h4>Push Settings</h4>
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={preferences.push.enabled}
                    onChange={(e) => handlePushChange('enabled', e.target.checked)}
                    className="preference-checkbox"
                  />
                  <span>Enable push notifications</span>
                </label>
              </div>
            )}

            {preferences.channels[NotificationChannel.DESKTOP] && (
              <div className="channel-settings">
                <h4>Desktop Settings</h4>
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={preferences.desktop.enabled}
                    onChange={(e) => handleDesktopChange('enabled', e.target.checked)}
                    className="preference-checkbox"
                  />
                  <span>Enable desktop notifications</span>
                </label>
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={preferences.desktop.requireInteraction}
                    onChange={(e) => handleDesktopChange('requireInteraction', e.target.checked)}
                    className="preference-checkbox"
                  />
                  <span>Require interaction for desktop notifications</span>
                </label>
              </div>
            )}
          </div>
        )}

        {activeTab === 'types' && (
          <div className="preferences-section">
            <h3>Notification Types</h3>
            <p className="section-description">
              Choose which types of notifications you want to receive.
            </p>
            
            <div className="preference-list">
              {Object.values(NotificationType).map(type => (
                <div key={type} className="preference-item">
                  <label className="preference-label">
                    <input
                      type="checkbox"
                      checked={preferences.types[type] !== false}
                      onChange={() => handleTypeToggle(type)}
                      className="preference-checkbox"
                    />
                    <span className="preference-name">{getTypeLabel(type)}</span>
                  </label>
                  <span className="preference-description">
                    {getTypeDescription(type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'priorities' && (
          <div className="preferences-section">
            <h3>Notification Priorities</h3>
            <p className="section-description">
              Choose which priority levels you want to receive notifications for.
            </p>
            
            <div className="preference-list">
              {Object.values(NotificationPriority).map(priority => (
                <div key={priority} className="preference-item">
                  <label className="preference-label">
                    <input
                      type="checkbox"
                      checked={preferences.priorities[priority] !== false}
                      onChange={() => handlePriorityToggle(priority)}
                      className="preference-checkbox"
                    />
                    <span className="preference-name">{getPriorityLabel(priority)}</span>
                  </label>
                  <span className="preference-description">
                    {getPriorityDescription(priority)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quiet-hours' && (
          <div className="preferences-section">
            <h3>Quiet Hours</h3>
            <p className="section-description">
              Configure quiet hours when you don't want to be disturbed by notifications.
            </p>
            
            <div className="preference-list">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={handleQuietHoursToggle}
                    className="preference-checkbox"
                  />
                  <span className="preference-name">Enable Quiet Hours</span>
                </label>
                <span className="preference-description">
                  Only urgent notifications will be shown during quiet hours
                </span>
              </div>
            </div>

            {preferences.quietHours.enabled && (
              <div className="quiet-hours-settings">
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={preferences.quietHours.timezone}
                    onChange={(e) => onUpdatePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        timezone: e.target.value
                      }
                    })}
                    className="form-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'frequency' && (
          <div className="preferences-section">
            <h3>Frequency Controls</h3>
            <p className="section-description">
              Control how frequently you receive notifications to avoid being overwhelmed.
            </p>
            
            <div className="frequency-settings">
              <div className="form-group">
                <label>Maximum notifications per hour</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={preferences.frequency.maxPerHour}
                  onChange={(e) => handleFrequencyChange('maxPerHour', parseInt(e.target.value) || 10)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Maximum notifications per day</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={preferences.frequency.maxPerDay}
                  onChange={(e) => handleFrequencyChange('maxPerDay', parseInt(e.target.value) || 100)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Batch delay (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={preferences.frequency.batchDelay}
                  onChange={(e) => handleFrequencyChange('batchDelay', parseInt(e.target.value) || 5)}
                  className="form-input"
                />
                <small className="form-help">
                  Group similar notifications together to reduce interruptions
                </small>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .notification-preferences {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .preferences-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .preferences-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .reset-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .preferences-tabs {
          display: flex;
          background: white;
          border-bottom: 1px solid #eee;
        }

        .tab-button {
          padding: 12px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #333;
          background: #f8f9fa;
        }

        .tab-button.active {
          color: #2196F3;
          border-bottom-color: #2196F3;
          background: #f8f9fa;
        }

        .preferences-content {
          padding: 24px;
        }

        .preferences-section {
          margin-bottom: 24px;
        }

        .preferences-section h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #333;
        }

        .section-description {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 14px;
        }

        .preference-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preference-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px;
          border: 1px solid #eee;
          border-radius: 6px;
          background: #fafafa;
        }

        .preference-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .preference-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .preference-name {
          font-weight: 500;
          color: #333;
        }

        .preference-description {
          font-size: 13px;
          color: #666;
          margin-left: 30px;
        }

        .channel-settings,
        .quiet-hours-settings,
        .frequency-settings {
          margin-top: 24px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #eee;
        }

        .channel-settings h4,
        .quiet-hours-settings h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #333;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #2196F3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-help {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

// Helper functions
function getChannelDescription(channel: NotificationChannel): string {
  const descriptions = {
    [NotificationChannel.IN_APP]: 'Show notifications within the application interface',
    [NotificationChannel.EMAIL]: 'Receive notifications via email',
    [NotificationChannel.PUSH]: 'Get push notifications on mobile devices',
    [NotificationChannel.DESKTOP]: 'Show desktop notifications when browser is open',
    [NotificationChannel.SMS]: 'Receive text message notifications'
  };
  return descriptions[channel] || '';
}

function getTypeDescription(type: NotificationType): string {
  const descriptions = {
    [NotificationType.INFO]: 'General information and updates',
    [NotificationType.SUCCESS]: 'Successful operations and achievements',
    [NotificationType.WARNING]: 'Important warnings that need attention',
    [NotificationType.ERROR]: 'Error messages and critical issues',
    [NotificationType.SYSTEM]: 'System maintenance and updates'
  };
  return descriptions[type] || '';
}

function getPriorityDescription(priority: NotificationPriority): string {
  const descriptions = {
    [NotificationPriority.LOW]: 'Low priority notifications that can wait',
    [NotificationPriority.NORMAL]: 'Standard priority notifications',
    [NotificationPriority.HIGH]: 'High priority notifications requiring attention',
    [NotificationPriority.URGENT]: 'Urgent notifications requiring immediate action'
  };
  return descriptions[priority] || '';
}
