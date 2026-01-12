import { ReactNode } from 'react';
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string | undefined;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
    timestamp: Date;
}
export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}
export declare function NotificationProvider({ children }: {
    children: ReactNode;
}): boolean;
export declare function useNotification(): NotificationContextType;
export declare function useNotify(): {
    success: (title: string, message?: string, options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "title" | "message">>) => string;
    error: (title: string, message?: string, options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "title" | "message">>) => string;
    warning: (title: string, message?: string, options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "title" | "message">>) => string;
    info: (title: string, message?: string, options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "title" | "message">>) => string;
};
//# sourceMappingURL=use-notification.d.ts.map