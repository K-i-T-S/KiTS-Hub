import { z } from 'zod';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  DESKTOP = 'desktop',
  SMS = 'sms'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  DISMISSED = 'dismissed'
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

export interface NotificationMetadata {
  source?: string;
  category?: string;
  tags?: string[];
  correlationId?: string;
  expiresAt?: Date;
  retryCount?: number;
  maxRetries?: number;
}

export interface NotificationAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
  channels: z.array(z.nativeEnum(NotificationChannel)),
  status: z.nativeEnum(NotificationStatus).default(NotificationStatus.PENDING),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().optional(),
  readAt: z.date().optional(),
  dismissedAt: z.date().optional(),
  userId: z.string().optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    action: z.function().returns(z.union([z.void(), z.promise(z.void())])),
    variant: z.enum(['primary', 'secondary', 'danger']).optional(),
    icon: z.string().optional()
  })).default([]),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number().optional()
  })).default([]),
  metadata: z.record(z.any()).optional()
});

export type Notification = z.infer<typeof NotificationSchema>;

export interface NotificationPreferences {
  userId: string;
  channels: Partial<Record<NotificationChannel, boolean>>;
  types: Partial<Record<NotificationType, boolean>>;
  priorities: Partial<Record<NotificationPriority, boolean>>;
  categories: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  frequency: {
    maxPerHour: number;
    maxPerDay: number;
    batchDelay: number; // minutes
  };
  email: {
    address: string;
    enabled: boolean;
  };
  push: {
    enabled: boolean;
    token?: string;
  };
  desktop: {
    enabled: boolean;
    requireInteraction: boolean;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  titleTemplate: string;
  messageTemplate: string;
  variables: Record<string, string>;
  conditions?: {
    categories?: string[];
    tags?: string[];
    sources?: string[];
  };
}

export interface NotificationFilter {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  channels?: NotificationChannel[];
  statuses?: NotificationStatus[];
  categories?: string[];
  tags?: string[];
  sources?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  dismissed: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  byChannel: Record<NotificationChannel, number>;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number; // milliseconds
}

export interface NotificationManagerConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  batchSize: number;
  batchDelay: number; // milliseconds
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  persistenceEnabled: boolean;
  maxHistorySize: number;
}

export interface ChannelConfig {
  enabled: boolean;
  rateLimit: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  formatting: {
    maxLength?: number;
    allowHtml?: boolean;
    template?: string;
  };
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  notificationId: string;
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface NotificationBatch {
  id: string;
  notifications: Notification[];
  createdAt: Date;
  scheduledAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: NotificationDeliveryResult[];
}

export type NotificationEventHandler = (notification: Notification) => void;
export type NotificationFilterFunction = (notification: Notification) => boolean;
export type NotificationTransformer = (notification: Notification) => Notification;
