import { useState, createContext, useContext } from 'react';
import React from 'react';
const NotificationContext = createContext(undefined);
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const addNotification = (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = {
            id,
            timestamp: new Date(),
            ...notification,
            message: notification.message || undefined,
            duration: notification.duration ?? 5000,
        };
        setNotifications(prev => [...prev, newNotification]);
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }
        return id;
    };
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    const clearNotifications = () => {
        setNotifications([]);
    };
    const contextValue = {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
    };
    return React.createElement(NotificationContext.Provider, { value: contextValue }, children);
}
export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
export function useNotify() {
    const { addNotification } = useNotification();
    return {
        success: (title, message, options) => addNotification({ type: 'success', title, message, ...options }),
        error: (title, message, options) => addNotification({ type: 'error', title, message, ...options }),
        warning: (title, message, options) => addNotification({ type: 'warning', title, message, ...options }),
        info: (title, message, options) => addNotification({ type: 'info', title, message, ...options }),
    };
}
//# sourceMappingURL=use-notification.js.map