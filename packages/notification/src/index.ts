// Core types and interfaces
export * from './types/index.js';

// Notification manager
export { NotificationManager } from './manager/NotificationManager.js';

// Notification channels
export { InAppChannel } from './channels/InAppChannel.js';
export { EmailChannel } from './channels/EmailChannel.js';
export { PushChannel } from './channels/PushChannel.js';
export { DesktopChannel } from './channels/DesktopChannel.js';

// React hooks
export { useNotifications, useNotificationPreferences, useNotificationStats } from './hooks/useNotifications.js';

// React components
export { NotificationCenter } from './components/NotificationCenter.js';
