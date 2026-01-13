import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  CrossTabMessage,
  CrossTabMessageType,
  SyncEvent,
  OptimisticUpdate,
  ConflictResolution,
  SyncEvents,
} from './types';

export class CrossTabSyncManager extends EventEmitter {
  private clientId: string;
  private tabId: string;
  private channel: BroadcastChannel | null = null;
  private isSupported: boolean = true;
  private fallbackStorage: Storage | null = null;
  private messageQueue: CrossTabMessage[] = [];
  private isConnected: boolean = false;

  constructor() {
    super();
    this.clientId = this.getOrCreateClientId();
    this.tabId = uuidv4();
    this.initializeCommunication();
  }

  private getOrCreateClientId(): string {
    if (typeof window === 'undefined') {
      return 'server-client';
    }

    let clientId = localStorage.getItem('kits-hub-client-id');
    if (!clientId) {
      clientId = uuidv4();
      localStorage.setItem('kits-hub-client-id', clientId);
    }
    return clientId;
  }

  private initializeCommunication(): void {
    if (typeof window === 'undefined') {
      this.isSupported = false;
      return;
    }

    try {
      // Try to use BroadcastChannel API
      this.channel = new BroadcastChannel('kits-hub-sync');
      this.channel.onmessage = this.handleMessage.bind(this);
      this.isConnected = true;
    } catch (error) {
      // Fallback to localStorage for browsers that don't support BroadcastChannel
      console.warn('BroadcastChannel not supported, using localStorage fallback');
      this.isSupported = false;
      this.initializeLocalStorageFallback();
    }

    // Set up page visibility change detection
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Set up beforeunload to clean up
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  private initializeLocalStorageFallback(): void {
    if (typeof window === 'undefined') return;

    this.fallbackStorage = window.localStorage;
    
    // Listen for storage events
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    // Check for existing messages
    const existingMessages = this.fallbackStorage.getItem('kits-hub-sync-messages');
    if (existingMessages) {
      try {
        const messages = JSON.parse(existingMessages);
        messages.forEach((message: CrossTabMessage) => {
          if (message.tabId !== this.tabId) {
            this.handleMessage({ data: message } as MessageEvent);
          }
        });
      } catch (error) {
        console.error('Failed to parse existing messages:', error);
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    const message = event.data as CrossTabMessage;
    
    // Ignore messages from the same tab
    if (message.tabId === this.tabId) {
      return;
    }

    // Validate message structure
    if (!this.validateMessage(message)) {
      console.warn('Invalid cross-tab message received:', message);
      return;
    }

    // Process the message based on its type
    this.processMessage(message);
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key !== 'kits-hub-sync-message') {
      return;
    }

    if (!event.newValue) {
      return;
    }

    try {
      const message = JSON.parse(event.newValue) as CrossTabMessage;
      
      // Ignore messages from the same tab
      if (message.tabId === this.tabId) {
        return;
      }

      if (this.validateMessage(message)) {
        this.processMessage(message);
      }
    } catch (error) {
      console.error('Failed to parse storage message:', error);
    }
  }

  private validateMessage(message: any): boolean {
    return (
      message &&
      typeof message === 'object' &&
      message.type &&
      message.payload !== undefined &&
      message.timestamp &&
      message.clientId &&
      message.tabId
    );
  }

  private processMessage(message: CrossTabMessage): void {
    switch (message.type) {
      case CrossTabMessageType.SYNC_EVENT:
        this.emit(SyncEvents.SYNC_EVENT, message.payload);
        break;
      
      case CrossTabMessageType.OPTIMISTIC_UPDATE:
        this.emit(SyncEvents.OPTIMISTIC_UPDATE, message.payload);
        break;
      
      case CrossTabMessageType.CONFLICT:
        this.emit(SyncEvents.CONFLICT, message.payload);
        break;
      
      case CrossTabMessageType.STATUS_UPDATE:
        this.emit('status_update', message.payload);
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Tab is hidden, reduce activity
      this.emit('tab_hidden');
    } else {
      // Tab is visible, resume activity
      this.emit('tab_visible');
      
      // Process any queued messages
      this.processMessageQueue();
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  // Public API methods

  sendMessage(message: Omit<CrossTabMessage, 'timestamp' | 'clientId' | 'tabId'>): void {
    const fullMessage: CrossTabMessage = {
      ...message,
      timestamp: Date.now(),
      clientId: this.clientId,
      tabId: this.tabId,
    };

    if (this.channel && this.isSupported) {
      try {
        this.channel.postMessage(fullMessage);
      } catch (error) {
        console.error('Failed to send message via BroadcastChannel:', error);
        this.fallbackSend(fullMessage);
      }
    } else {
      this.fallbackSend(fullMessage);
    }
  }

  private fallbackSend(message: CrossTabMessage): void {
    if (!this.fallbackStorage) {
      return;
    }

    try {
      // Queue message if tab is hidden
      if (document.hidden) {
        this.messageQueue.push(message);
        return;
      }

      this.fallbackStorage.setItem('kits-hub-sync-message', JSON.stringify(message));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'kits-hub-sync-message',
        newValue: JSON.stringify(message),
      }));

      // Clean up after a short delay
      setTimeout(() => {
        this.fallbackStorage?.removeItem('kits-hub-sync-message');
      }, 100);
    } catch (error) {
      console.error('Failed to send message via localStorage:', error);
    }
  }

  // Specific message senders for convenience

  sendSyncEvent(event: SyncEvent): void {
    this.sendMessage({
      type: CrossTabMessageType.SYNC_EVENT,
      payload: event,
    });
  }

  sendOptimisticUpdate(update: OptimisticUpdate): void {
    this.sendMessage({
      type: CrossTabMessageType.OPTIMISTIC_UPDATE,
      payload: update,
    });
  }

  sendConflict(conflict: ConflictResolution): void {
    this.sendMessage({
      type: CrossTabMessageType.CONFLICT,
      payload: conflict,
    });
  }

  sendStatusUpdate(status: any): void {
    this.sendMessage({
      type: CrossTabMessageType.STATUS_UPDATE,
      payload: status,
    });
  }

  // Utility methods

  isTabVisible(): boolean {
    return !document.hidden;
  }

  getClientId(): string {
    return this.clientId;
  }

  getTabId(): string {
    return this.tabId;
  }

  isConnectionSupported(): boolean {
    return this.isSupported;
  }

  isConnectedToOtherTabs(): boolean {
    return this.isConnected;
  }

  // Get information about other tabs
  async getOtherTabs(): Promise<Array<{ id: string; lastSeen: number }>> {
    if (!this.fallbackStorage) {
      return [];
    }

    const tabs: Array<{ id: string; lastSeen: number }> = [];
    
    // Request tab information from other tabs
    this.sendMessage({
      type: CrossTabMessageType.STATUS_UPDATE,
      payload: { request: 'tab_info' },
    });

    // In a real implementation, you'd collect responses
    // For now, return empty array
    return tabs;
  }

  // Ping other tabs to check connectivity
  pingOtherTabs(): Promise<string[]> {
    return new Promise((resolve) => {
      const responsiveTabs: string[] = [];
      const timeout = setTimeout(() => {
        resolve(responsiveTabs);
      }, 5000); // 5 second timeout

      const handlePong = (event: MessageEvent) => {
        const message = event.data as CrossTabMessage;
        if (message.type === CrossTabMessageType.STATUS_UPDATE && 
            message.payload.response === 'pong') {
          responsiveTabs.push(message.tabId);
        }
      };

      if (this.channel) {
        this.channel.onmessage = handlePong;
      }

      // Send ping
      this.sendMessage({
        type: CrossTabMessageType.STATUS_UPDATE,
        payload: { request: 'ping' },
      });

      // Clean up
      setTimeout(() => {
        if (this.channel) {
          this.channel.onmessage = this.handleMessage.bind(this);
        }
        clearTimeout(timeout);
      }, 100);
    });
  }

  private cleanup(): void {
    if (this.channel) {
      this.channel.close();
    }
    
    // Remove event listeners
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      window.removeEventListener('beforeunload', this.cleanup.bind(this));
      window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  // Destroy the manager
  destroy(): void {
    this.cleanup();
    this.removeAllListeners();
    this.messageQueue = [];
    this.isConnected = false;
  }
}

// Global instance for use across the application
let globalCrossTabSyncManager: CrossTabSyncManager | null = null;

export function getCrossTabSyncManager(): CrossTabSyncManager {
  if (!globalCrossTabSyncManager) {
    globalCrossTabSyncManager = new CrossTabSyncManager();
  }
  return globalCrossTabSyncManager;
}

export function resetCrossTabSyncManager(): void {
  if (globalCrossTabSyncManager) {
    globalCrossTabSyncManager.destroy();
  }
  globalCrossTabSyncManager = null;
}
