import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  SyncConfig,
  SubscriptionManager,
  DatabaseChangePayload,
  SyncEvent,
  SyncOperation,
  SyncStatus,
  SyncEvents,
  CrossTabMessage,
  CrossTabMessageType,
} from './types';

export class SupabaseSubscriptionManager extends EventEmitter implements SubscriptionManager {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private clientId: string;
  private tabId: string;
  private isOnline: boolean = true;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(
    private supabase: SupabaseClient,
    private enableCrossTab: boolean = true
  ) {
    super();
    this.clientId = uuidv4();
    this.tabId = uuidv4();
    this.setupNetworkListeners();
    this.setupCrossTabListeners();
  }

  async subscribe(config: SyncConfig): Promise<RealtimeChannel> {
    const channelName = `${config.table}_${this.clientId}_${Date.now()}`;
    
    // Check if already subscribed
    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName)!;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: DatabaseChangePayload) => {
          this.handleDatabaseChange(payload, config);
        }
      )
      .on('broadcast', { event: 'sync' }, (payload) => {
        this.handleBroadcastMessage(payload, config);
      })
      .subscribe((status) => {
        this.handleSubscriptionStatus(status, channelName, config);
      });

    this.subscriptions.set(channelName, channel);
    
    // Notify other tabs about this subscription
    if (this.enableCrossTab) {
      this.broadcastCrossTabMessage({
        type: CrossTabMessageType.STATUS_UPDATE,
        payload: { status: 'subscribed', table: config.table },
        timestamp: Date.now(),
        clientId: this.clientId,
        tabId: this.tabId,
      });
    }

    return channel;
  }

  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    const channelName = this.findChannelName(channel);
    if (channelName) {
      await this.supabase.removeChannel(channel);
      this.subscriptions.delete(channelName);
    }
  }

  async unsubscribeAll(): Promise<void> {
    const unsubscribePromises = Array.from(this.subscriptions.values()).map(
      channel => this.unsubscribe(channel)
    );
    await Promise.all(unsubscribePromises);
    this.subscriptions.clear();
  }

  getSubscriptions(): Map<string, RealtimeChannel> {
    return new Map(this.subscriptions);
  }

  private handleDatabaseChange(payload: DatabaseChangePayload, config: SyncConfig): void {
    const syncEvent: SyncEvent = {
      id: uuidv4(),
      table: config.table,
      operation: this.mapPayloadEventToSyncOperation(payload.eventType),
      data: payload.new,
      oldData: payload.old,
      timestamp: new Date().toISOString(),
      clientId: this.clientId,
      status: SyncStatus.COMPLETED,
      retryCount: 0,
    };

    // Emit sync event for components to handle
    this.emit(SyncEvents.SYNC_EVENT, syncEvent, payload);

    // Broadcast to other tabs
    if (this.enableCrossTab) {
      this.broadcastCrossTabMessage({
        type: CrossTabMessageType.SYNC_EVENT,
        payload: syncEvent,
        timestamp: Date.now(),
        clientId: this.clientId,
        tabId: this.tabId,
      });
    }
  }

  private handleBroadcastMessage(payload: any, config: SyncConfig): void {
    if (payload.clientId === this.clientId) {
      return; // Ignore own messages
    }

    const message = payload.payload;
    
    switch (message.type) {
      case CrossTabMessageType.SYNC_EVENT:
        this.emit(SyncEvents.SYNC_EVENT, message.payload, null);
        break;
      case CrossTabMessageType.OPTIMISTIC_UPDATE:
        this.emit(SyncEvents.OPTIMISTIC_UPDATE, message.payload);
        break;
      case CrossTabMessageType.CONFLICT:
        this.emit(SyncEvents.CONFLICT, message.payload);
        break;
      case CrossTabMessageType.STATUS_UPDATE:
        this.emit(SyncEvents.STATUS_UPDATE, message.payload);
        break;
    }
  }

  private handleSubscriptionStatus(
    status: string,
    channelName: string,
    config: SyncConfig
  ): void {
    switch (status) {
      case 'SUBSCRIBED':
        this.reconnectAttempts = 0;
        this.emit(SyncEvents.CONNECTED, { channel: channelName, table: config.table });
        break;
      case 'TIMED_OUT':
      case 'CLOSED':
        this.emit(SyncEvents.DISCONNECTED, { channel: channelName, table: config.table });
        this.attemptReconnect(config);
        break;
      case 'CHANNEL_ERROR':
        this.emit(SyncEvents.ERROR, new Error(`Channel error for ${config.table}`));
        break;
    }
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.reconnectAll();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.emit(SyncEvents.DISCONNECTED, { reason: 'offline' });
      });
    }
  }

  private setupCrossTabListeners(): void {
    if (!this.enableCrossTab || typeof window === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel('kits-hub-sync');
    
    channel.onmessage = (event) => {
      const message = event.data as CrossTabMessage;
      
      // Ignore messages from the same tab
      if (message.tabId === this.tabId) {
        return;
      }

      this.handleCrossTabMessage(message);
    };

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      channel.close();
    });
  }

  private handleCrossTabMessage(message: CrossTabMessage): void {
    // Emit the message for components to handle
    this.emit(message.type, message.payload);
  }

  private broadcastCrossTabMessage(message: CrossTabMessage): void {
    if (!this.enableCrossTab || typeof window === 'undefined') {
      return;
    }

    try {
      const channel = new BroadcastChannel('kits-hub-sync');
      channel.postMessage(message);
      channel.close();
    } catch (error) {
      // Fallback for browsers that don't support BroadcastChannel
      console.warn('BroadcastChannel not supported, falling back to localStorage');
      localStorage.setItem('kits-hub-sync-message', JSON.stringify(message));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'kits-hub-sync-message',
        newValue: JSON.stringify(message),
      }));
    }
  }

  private async attemptReconnect(config: SyncConfig): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit(SyncEvents.ERROR, new Error(`Max reconnection attempts reached for ${config.table}`));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(async () => {
      try {
        if (this.isOnline) {
          await this.subscribe(config);
        }
      } catch (error) {
        this.emit(SyncEvents.ERROR, error);
      }
    }, delay);
  }

  private async reconnectAll(): Promise<void> {
    // Reconnect all active subscriptions
    const reconnectPromises = Array.from(this.subscriptions.entries()).map(
      async ([channelName, channel]) => {
        try {
          // Extract config from channel (this is a simplified approach)
          // In a real implementation, you'd store the config separately
          await channel.subscribe();
        } catch (error) {
          this.emit(SyncEvents.ERROR, error);
        }
      }
    );

    await Promise.allSettled(reconnectPromises);
  }

  private findChannelName(channel: RealtimeChannel): string | null {
    for (const [name, ch] of this.subscriptions.entries()) {
      if (ch === channel) {
        return name;
      }
    }
    return null;
  }

  private mapPayloadEventToSyncOperation(eventType: string): SyncOperation {
    switch (eventType) {
      case 'INSERT':
        return SyncOperation.CREATE;
      case 'UPDATE':
        return SyncOperation.UPDATE;
      case 'DELETE':
        return SyncOperation.DELETE;
      default:
        return SyncOperation.CREATE;
    }
  }

  // Public methods for status checking
  isConnectionActive(): boolean {
    return this.isOnline && this.subscriptions.size > 0;
  }

  getConnectionStats(): {
    subscriptions: number;
    isOnline: boolean;
    reconnectAttempts: number;
    clientId: string;
    tabId: string;
  } {
    return {
      subscriptions: this.subscriptions.size,
      isOnline: this.isOnline,
      reconnectAttempts: this.reconnectAttempts,
      clientId: this.clientId,
      tabId: this.tabId,
    };
  }
}
