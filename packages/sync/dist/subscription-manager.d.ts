import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'eventemitter3';
import { SyncConfig, SubscriptionManager } from './types';
export declare class SupabaseSubscriptionManager extends EventEmitter implements SubscriptionManager {
    private supabase;
    private enableCrossTab;
    private subscriptions;
    private clientId;
    private tabId;
    private isOnline;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    constructor(supabase: SupabaseClient, enableCrossTab?: boolean);
    subscribe(config: SyncConfig): Promise<RealtimeChannel>;
    unsubscribe(channel: RealtimeChannel): Promise<void>;
    unsubscribeAll(): Promise<void>;
    getSubscriptions(): Map<string, RealtimeChannel>;
    private handleDatabaseChange;
    private handleBroadcastMessage;
    private handleSubscriptionStatus;
    private setupNetworkListeners;
    private setupCrossTabListeners;
    private handleCrossTabMessage;
    private broadcastCrossTabMessage;
    private attemptReconnect;
    private reconnectAll;
    private findChannelName;
    private mapPayloadEventToSyncOperation;
    isConnectionActive(): boolean;
    getConnectionStats(): {
        subscriptions: number;
        isOnline: boolean;
        reconnectAttempts: number;
        clientId: string;
        tabId: string;
    };
}
