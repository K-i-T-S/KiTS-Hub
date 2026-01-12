import { useState, createContext, useContext, ReactNode } from 'react'
import React from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string | undefined
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      timestamp: new Date(),
      ...notification,
      message: notification.message || undefined,
      duration: notification.duration ?? 5000,
    }

    setNotifications(prev => [...prev, newNotification])

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }

  return React.createElement(
    NotificationContext.Provider,
    { value: contextValue },
    children
  )
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export function useNotify() {
  const { addNotification } = useNotification()

  return {
    success: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'info', title, message, ...options }),
  }
}
