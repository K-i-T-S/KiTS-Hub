import { z } from 'zod';
import { EventEmitter } from 'eventemitter3';
import { v4 } from 'uuid';
import require$$0, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';

// Sync operation types
var SyncOperation;
(function (SyncOperation) {
    SyncOperation["CREATE"] = "INSERT";
    SyncOperation["UPDATE"] = "UPDATE";
    SyncOperation["DELETE"] = "DELETE";
})(SyncOperation || (SyncOperation = {}));
// Sync status
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["IN_PROGRESS"] = "in_progress";
    SyncStatus["COMPLETED"] = "completed";
    SyncStatus["FAILED"] = "failed";
    SyncStatus["CONFLICT"] = "conflict";
})(SyncStatus || (SyncStatus = {}));
// Sync direction
var SyncDirection;
(function (SyncDirection) {
    SyncDirection["BIDIRECTIONAL"] = "bidirectional";
    SyncDirection["CLIENT_TO_SERVER"] = "client_to_server";
    SyncDirection["SERVER_TO_CLIENT"] = "server_to_client";
})(SyncDirection || (SyncDirection = {}));
// Base sync event schema
const SyncEventSchema = z.object({
    id: z.string().uuid(),
    table: z.string(),
    operation: z.nativeEnum(SyncOperation),
    data: z.any(),
    oldData: z.any().optional(),
    timestamp: z.string().datetime(),
    userId: z.string().optional(),
    clientId: z.string().optional(),
    status: z.nativeEnum(SyncStatus).default(SyncStatus.PENDING),
    retryCount: z.number().default(0),
    correlationId: z.string().optional(),
});
// Sync configuration
const SyncConfigSchema = z.object({
    table: z.string(),
    direction: z.nativeEnum(SyncDirection).default(SyncDirection.BIDIRECTIONAL),
    filter: z.string().optional(),
    optimisticUpdates: z.boolean().default(true),
    conflictResolution: z.enum(['client_wins', 'server_wins', 'manual']).default('server_wins'),
    retryAttempts: z.number().default(3),
    retryDelay: z.number().default(1000),
    enableCrossTab: z.boolean().default(true),
});
// Cross-tab message types
var CrossTabMessageType;
(function (CrossTabMessageType) {
    CrossTabMessageType["SYNC_EVENT"] = "sync_event";
    CrossTabMessageType["OPTIMISTIC_UPDATE"] = "optimistic_update";
    CrossTabMessageType["CONFLICT"] = "conflict";
    CrossTabMessageType["STATUS_UPDATE"] = "status_update";
})(CrossTabMessageType || (CrossTabMessageType = {}));
const CrossTabMessageSchema = z.object({
    type: z.nativeEnum(CrossTabMessageType),
    payload: z.any(),
    timestamp: z.number(),
    clientId: z.string(),
    tabId: z.string(),
});
// Event emitter events
var SyncEvents;
(function (SyncEvents) {
    SyncEvents["CONNECTED"] = "connected";
    SyncEvents["DISCONNECTED"] = "disconnected";
    SyncEvents["SYNC_EVENT"] = "sync_event";
    SyncEvents["OPTIMISTIC_UPDATE"] = "optimistic_update";
    SyncEvents["CONFLICT"] = "conflict";
    SyncEvents["ERROR"] = "error";
    SyncEvents["STATS_UPDATED"] = "stats_updated";
    SyncEvents["STATUS_UPDATE"] = "status_update";
})(SyncEvents || (SyncEvents = {}));
// Validation schemas for different entities
const InventoryItemSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
    category: z.string(),
    updated_at: z.string().datetime(),
});
const TransactionSchema = z.object({
    id: z.string().uuid(),
    amount: z.number(),
    type: z.enum(['income', 'expense']),
    description: z.string(),
    date: z.string().datetime(),
    account_id: z.string().uuid(),
    created_at: z.string().datetime(),
});
const CustomerSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

class SupabaseSubscriptionManager extends EventEmitter {
    constructor(supabase, enableCrossTab = true) {
        super();
        this.supabase = supabase;
        this.enableCrossTab = enableCrossTab;
        this.subscriptions = new Map();
        this.isOnline = true;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.clientId = v4();
        this.tabId = v4();
        this.setupNetworkListeners();
        this.setupCrossTabListeners();
    }
    async subscribe(config) {
        const channelName = `${config.table}_${this.clientId}_${Date.now()}`;
        // Check if already subscribed
        if (this.subscriptions.has(channelName)) {
            return this.subscriptions.get(channelName);
        }
        const channel = this.supabase
            .channel(channelName)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: config.table,
            filter: config.filter,
        }, (payload) => {
            this.handleDatabaseChange(payload, config);
        })
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
    async unsubscribe(channel) {
        const channelName = this.findChannelName(channel);
        if (channelName) {
            await this.supabase.removeChannel(channel);
            this.subscriptions.delete(channelName);
        }
    }
    async unsubscribeAll() {
        const unsubscribePromises = Array.from(this.subscriptions.values()).map(channel => this.unsubscribe(channel));
        await Promise.all(unsubscribePromises);
        this.subscriptions.clear();
    }
    getSubscriptions() {
        return new Map(this.subscriptions);
    }
    handleDatabaseChange(payload, config) {
        const syncEvent = {
            id: v4(),
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
    handleBroadcastMessage(payload, config) {
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
    handleSubscriptionStatus(status, channelName, config) {
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
    setupNetworkListeners() {
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
    setupCrossTabListeners() {
        if (!this.enableCrossTab || typeof window === 'undefined') {
            return;
        }
        const channel = new BroadcastChannel('kits-hub-sync');
        channel.onmessage = (event) => {
            const message = event.data;
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
    handleCrossTabMessage(message) {
        // Emit the message for components to handle
        this.emit(message.type, message.payload);
    }
    broadcastCrossTabMessage(message) {
        if (!this.enableCrossTab || typeof window === 'undefined') {
            return;
        }
        try {
            const channel = new BroadcastChannel('kits-hub-sync');
            channel.postMessage(message);
            channel.close();
        }
        catch (error) {
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
    async attemptReconnect(config) {
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
            }
            catch (error) {
                this.emit(SyncEvents.ERROR, error);
            }
        }, delay);
    }
    async reconnectAll() {
        // Reconnect all active subscriptions
        const reconnectPromises = Array.from(this.subscriptions.entries()).map(async ([channelName, channel]) => {
            try {
                // Extract config from channel (this is a simplified approach)
                // In a real implementation, you'd store the config separately
                await channel.subscribe();
            }
            catch (error) {
                this.emit(SyncEvents.ERROR, error);
            }
        });
        await Promise.allSettled(reconnectPromises);
    }
    findChannelName(channel) {
        for (const [name, ch] of this.subscriptions.entries()) {
            if (ch === channel) {
                return name;
            }
        }
        return null;
    }
    mapPayloadEventToSyncOperation(eventType) {
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
    isConnectionActive() {
        return this.isOnline && this.subscriptions.size > 0;
    }
    getConnectionStats() {
        return {
            subscriptions: this.subscriptions.size,
            isOnline: this.isOnline,
            reconnectAttempts: this.reconnectAttempts,
            clientId: this.clientId,
            tabId: this.tabId,
        };
    }
}

function useSync(supabase, config) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastSync, setLastSync] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const subscriptionManagerRef = useRef(null);
    const statsRef = useRef({
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        pendingEvents: 0,
        conflicts: 0,
        lastSyncTime: null,
        averageLatency: 0,
    });
    // Initialize subscription manager
    useEffect(() => {
        if (!subscriptionManagerRef.current) {
            subscriptionManagerRef.current = new SupabaseSubscriptionManager(supabase, config.enableCrossTab);
        }
        const manager = subscriptionManagerRef.current;
        // Set up event listeners
        const handleSyncEvent = (event) => {
            if (event.table === config.table) {
                updateLocalData(event);
                updateStats(event);
                setLastSync(new Date());
            }
        };
        const handleConnectionChange = (connected) => {
            setIsOnline(connected);
            if (!connected) {
                setError(new Error('Connection lost'));
            }
            else {
                setError(null);
            }
        };
        const handleError = (err) => {
            setError(err);
            statsRef.current.failedEvents++;
        };
        manager.on(SyncEvents.SYNC_EVENT, handleSyncEvent);
        manager.on(SyncEvents.CONNECTED, () => handleConnectionChange(true));
        manager.on(SyncEvents.DISCONNECTED, () => handleConnectionChange(false));
        manager.on(SyncEvents.ERROR, handleError);
        // Initial data fetch
        fetchInitialData();
        return () => {
            manager.off(SyncEvents.SYNC_EVENT, handleSyncEvent);
            manager.off(SyncEvents.CONNECTED, () => handleConnectionChange(true));
            manager.off(SyncEvents.DISCONNECTED, () => handleConnectionChange(false));
            manager.off(SyncEvents.ERROR, handleError);
        };
    }, [supabase, config]);
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from(config.table).select('*');
            if (config.filter) {
                query = query.filter(config.filter.split('=')[0], config.filter.split('=')[1], config.filter.split('=')[2]);
            }
            const { data: fetchData, error: fetchError } = await query;
            if (fetchError) {
                throw fetchError;
            }
            setData(fetchData);
            setLastSync(new Date());
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    };
    const updateLocalData = (event) => {
        setData(prevData => {
            if (!prevData)
                return prevData;
            switch (event.operation) {
                case SyncOperation.CREATE:
                    return [...prevData, event.data];
                case SyncOperation.UPDATE:
                    return prevData.map(item => item.id === event.data.id ? { ...item, ...event.data } : item);
                case SyncOperation.DELETE:
                    return prevData.filter(item => item.id !== event.oldData?.id);
                default:
                    return prevData;
            }
        });
    };
    const updateStats = (event) => {
        const stats = statsRef.current;
        stats.totalEvents++;
        if (event.status === SyncStatus.COMPLETED) {
            stats.successfulEvents++;
        }
        else if (event.status === SyncStatus.FAILED) {
            stats.failedEvents++;
        }
        else if (event.status === SyncStatus.PENDING) {
            stats.pendingEvents++;
        }
        if (event.status === SyncStatus.CONFLICT) {
            stats.conflicts++;
        }
        stats.lastSyncTime = new Date();
    };
    const sync = useCallback(async (item, operation = SyncOperation.UPDATE) => {
        try {
            setError(null);
            statsRef.current.pendingEvents++;
            let result;
            switch (operation) {
                case SyncOperation.CREATE:
                    result = await supabase.from(config.table).insert(item);
                    break;
                case SyncOperation.UPDATE:
                    result = await supabase.from(config.table).update(item).eq('id', item.id);
                    break;
                case SyncOperation.DELETE:
                    result = await supabase.from(config.table).delete().eq('id', item.id);
                    break;
            }
            if (result.error) {
                throw result.error;
            }
            statsRef.current.successfulEvents++;
            statsRef.current.pendingEvents--;
            setLastSync(new Date());
        }
        catch (err) {
            statsRef.current.failedEvents++;
            statsRef.current.pendingEvents--;
            setError(err);
            throw err;
        }
    }, [supabase, config.table]);
    const optimisticSync = useCallback(async (item, operation = SyncOperation.UPDATE) => {
        if (!config.optimisticUpdates) {
            return sync(item, operation).then(() => item);
        }
        const originalData = data?.find(d => d.id === item.id);
        const tempId = v4();
        // Apply optimistic update immediately
        const optimisticEvent = {
            id: tempId,
            table: config.table,
            operation,
            data: operation === SyncOperation.DELETE ? {} : item,
            oldData: operation === SyncOperation.DELETE ? item : originalData,
            timestamp: new Date().toISOString(),
            clientId: subscriptionManagerRef.current?.getConnectionStats().clientId,
            status: SyncStatus.PENDING,
            retryCount: 0,
        };
        updateLocalData(optimisticEvent);
        try {
            await sync(item, operation);
            // Update the event status to completed
            optimisticEvent.status = SyncStatus.COMPLETED;
            updateStats(optimisticEvent);
            return item;
        }
        catch (err) {
            // Revert optimistic update on error
            const revertEvent = {
                ...optimisticEvent,
                operation: operation === SyncOperation.CREATE ? SyncOperation.DELETE :
                    operation === SyncOperation.DELETE ? SyncOperation.CREATE : SyncOperation.UPDATE,
                data: originalData || {},
                oldData: item,
                status: SyncStatus.FAILED,
            };
            updateLocalData(revertEvent);
            throw err;
        }
    }, [data, config.optimisticUpdates, sync, config.table]);
    const refresh = useCallback(async () => {
        await fetchInitialData();
    }, []);
    return {
        data,
        loading,
        error,
        sync,
        optimisticSync,
        refresh,
        lastSync,
        isOnline,
    };
}
function useRealtimeSync(supabase, config) {
    const syncResult = useSync(supabase, config);
    const [isConnected, setIsConnected] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const subscriptionManagerRef = useRef(null);
    useEffect(() => {
        if (!subscriptionManagerRef.current) {
            subscriptionManagerRef.current = new SupabaseSubscriptionManager(supabase, config.enableCrossTab);
        }
        const manager = subscriptionManagerRef.current;
        const setupSubscription = async () => {
            try {
                const channel = await manager.subscribe(config);
                setSubscription(channel);
                setIsConnected(true);
            }
            catch (err) {
                console.error('Failed to setup subscription:', err);
                setIsConnected(false);
            }
        };
        const handleConnected = () => {
            setIsConnected(true);
        };
        const handleDisconnected = () => {
            setIsConnected(false);
        };
        manager.on(SyncEvents.CONNECTED, handleConnected);
        manager.on(SyncEvents.DISCONNECTED, handleDisconnected);
        setupSubscription();
        return () => {
            manager.off(SyncEvents.CONNECTED, handleConnected);
            manager.off(SyncEvents.DISCONNECTED, handleDisconnected);
            if (subscription) {
                manager.unsubscribe(subscription);
            }
        };
    }, [supabase, config]);
    const reconnect = useCallback(async () => {
        if (subscriptionManagerRef.current) {
            try {
                await subscriptionManagerRef.current.unsubscribeAll();
                const channel = await subscriptionManagerRef.current.subscribe(config);
                setSubscription(channel);
                setIsConnected(true);
            }
            catch (err) {
                console.error('Failed to reconnect:', err);
                setIsConnected(false);
            }
        }
    }, [config]);
    return {
        ...syncResult,
        isConnected,
        subscription,
        reconnect,
    };
}

class OptimisticUpdateManager extends EventEmitter {
    constructor() {
        super();
        this.updates = new Map();
        this.conflictResolutions = new Map();
        this.maxPendingUpdates = 100;
        this.updateTimeout = 30000; // 30 seconds
        this.setupCleanupInterval();
    }
    // Create a new optimistic update
    createOptimisticUpdate(data, operation, originalData) {
        return new Promise((resolve, reject) => {
            const updateId = v4();
            const update = {
                id: updateId,
                type: operation,
                data,
                originalData,
                timestamp: Date.now(),
                status: SyncStatus.PENDING,
                resolve,
                reject,
            };
            // Check if we have too many pending updates
            if (this.updates.size >= this.maxPendingUpdates) {
                this.cleanupExpiredUpdates();
            }
            this.updates.set(updateId, update);
            // Set timeout for the update
            setTimeout(() => {
                if (this.updates.has(updateId)) {
                    this.failUpdate(updateId, new Error('Update timeout'));
                }
            }, this.updateTimeout);
            // Emit the optimistic update event
            this.emit(SyncEvents.OPTIMISTIC_UPDATE, update);
            return updateId;
        });
    }
    // Complete an optimistic update successfully
    completeUpdate(updateId, finalData) {
        const update = this.updates.get(updateId);
        if (!update) {
            return;
        }
        update.status = SyncStatus.COMPLETED;
        if (finalData) {
            update.data = finalData;
        }
        if (update.resolve) {
            update.resolve(finalData || update.data);
        }
        this.updates.delete(updateId);
        this.emit('update_completed', update);
    }
    // Fail an optimistic update
    failUpdate(updateId, error) {
        const update = this.updates.get(updateId);
        if (!update) {
            return;
        }
        update.status = SyncStatus.FAILED;
        if (update.reject) {
            update.reject(error);
        }
        this.updates.delete(updateId);
        this.emit('update_failed', { update, error });
    }
    // Handle conflict resolution
    handleConflict(updateId, serverData, clientData, table, recordId) {
        const update = this.updates.get(updateId);
        if (!update) {
            throw new Error('Update not found');
        }
        const conflict = {
            conflictId: v4(),
            table,
            recordId,
            clientData,
            serverData,
            timestamp: new Date(),
        };
        this.conflictResolutions.set(conflict.conflictId, conflict);
        update.status = SyncStatus.CONFLICT;
        this.emit(SyncEvents.CONFLICT, conflict);
        return conflict;
    }
    // Resolve a conflict
    resolveConflict(conflictId, resolution, mergedData) {
        const conflict = this.conflictResolutions.get(conflictId);
        if (!conflict) {
            return;
        }
        conflict.resolution = resolution;
        let finalData;
        switch (resolution) {
            case 'client':
                finalData = conflict.clientData;
                break;
            case 'server':
                finalData = conflict.serverData;
                break;
            case 'merge':
                finalData = mergedData || this.mergeData(conflict.serverData, conflict.clientData);
                break;
        }
        // Find and update the corresponding optimistic update
        const updateId = this.findUpdateByRecord(conflict.table, conflict.recordId);
        if (updateId) {
            this.completeUpdate(updateId, finalData);
        }
        this.conflictResolutions.delete(conflictId);
        this.emit('conflict_resolved', { conflict, resolution, finalData });
    }
    // Get pending updates
    getPendingUpdates() {
        return Array.from(this.updates.values()).filter(update => update.status === SyncStatus.PENDING);
    }
    // Get update by ID
    getUpdate(updateId) {
        return this.updates.get(updateId);
    }
    // Cancel an update
    cancelUpdate(updateId) {
        const update = this.updates.get(updateId);
        if (!update) {
            return;
        }
        update.status = SyncStatus.FAILED;
        if (update.reject) {
            update.reject(new Error('Update cancelled'));
        }
        this.updates.delete(updateId);
        this.emit('update_cancelled', update);
    }
    // Clear all pending updates
    clearAllUpdates() {
        const updates = Array.from(this.updates.values());
        updates.forEach(update => {
            if (update.reject) {
                update.reject(new Error('Updates cleared'));
            }
        });
        this.updates.clear();
        this.emit('all_updates_cleared');
    }
    // Get statistics
    getStats() {
        const updates = Array.from(this.updates.values());
        return {
            pending: updates.filter(u => u.status === SyncStatus.PENDING).length,
            completed: updates.filter(u => u.status === SyncStatus.COMPLETED).length,
            failed: updates.filter(u => u.status === SyncStatus.FAILED).length,
            conflicts: updates.filter(u => u.status === SyncStatus.CONFLICT).length,
            total: updates.length,
        };
    }
    // Private helper methods
    setupCleanupInterval() {
        setInterval(() => {
            this.cleanupExpiredUpdates();
        }, 60000); // Check every minute
    }
    cleanupExpiredUpdates() {
        const now = Date.now();
        const expiredUpdates = [];
        this.updates.forEach((update, id) => {
            if (now - update.timestamp > this.updateTimeout) {
                expiredUpdates.push(id);
            }
        });
        expiredUpdates.forEach(id => {
            this.failUpdate(id, new Error('Update expired'));
        });
    }
    findUpdateByRecord(table, recordId) {
        for (const [id, update] of this.updates.entries()) {
            if (update.data && typeof update.data === 'object' && 'id' in update.data) {
                if (update.data.id === recordId) {
                    return id;
                }
            }
        }
        return undefined;
    }
    mergeData(serverData, clientData) {
        // Simple merge strategy - client data takes precedence
        // In a real implementation, you might want more sophisticated merging
        return {
            ...serverData,
            ...clientData,
            // Preserve server timestamps
            updated_at: serverData.updated_at || new Date().toISOString(),
            created_at: serverData.created_at || clientData.created_at,
        };
    }
    // Configuration methods
    setMaxPendingUpdates(max) {
        this.maxPendingUpdates = max;
    }
    setUpdateTimeout(timeout) {
        this.updateTimeout = timeout;
    }
    getMaxPendingUpdates() {
        return this.maxPendingUpdates;
    }
    getUpdateTimeout() {
        return this.updateTimeout;
    }
}
// Global instance for use across the application
let globalOptimisticUpdateManager = null;
function getOptimisticUpdateManager() {
    if (!globalOptimisticUpdateManager) {
        globalOptimisticUpdateManager = new OptimisticUpdateManager();
    }
    return globalOptimisticUpdateManager;
}
function resetOptimisticUpdateManager() {
    globalOptimisticUpdateManager = null;
}

class CrossTabSyncManager extends EventEmitter {
    constructor() {
        super();
        this.channel = null;
        this.isSupported = true;
        this.fallbackStorage = null;
        this.messageQueue = [];
        this.isConnected = false;
        this.clientId = this.getOrCreateClientId();
        this.tabId = v4();
        this.initializeCommunication();
    }
    getOrCreateClientId() {
        if (typeof window === 'undefined') {
            return 'server-client';
        }
        let clientId = localStorage.getItem('kits-hub-client-id');
        if (!clientId) {
            clientId = v4();
            localStorage.setItem('kits-hub-client-id', clientId);
        }
        return clientId;
    }
    initializeCommunication() {
        if (typeof window === 'undefined') {
            this.isSupported = false;
            return;
        }
        try {
            // Try to use BroadcastChannel API
            this.channel = new BroadcastChannel('kits-hub-sync');
            this.channel.onmessage = this.handleMessage.bind(this);
            this.isConnected = true;
        }
        catch (error) {
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
    initializeLocalStorageFallback() {
        if (typeof window === 'undefined')
            return;
        this.fallbackStorage = window.localStorage;
        // Listen for storage events
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        // Check for existing messages
        const existingMessages = this.fallbackStorage.getItem('kits-hub-sync-messages');
        if (existingMessages) {
            try {
                const messages = JSON.parse(existingMessages);
                messages.forEach((message) => {
                    if (message.tabId !== this.tabId) {
                        this.handleMessage({ data: message });
                    }
                });
            }
            catch (error) {
                console.error('Failed to parse existing messages:', error);
            }
        }
    }
    handleMessage(event) {
        const message = event.data;
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
    handleStorageEvent(event) {
        if (event.key !== 'kits-hub-sync-message') {
            return;
        }
        if (!event.newValue) {
            return;
        }
        try {
            const message = JSON.parse(event.newValue);
            // Ignore messages from the same tab
            if (message.tabId === this.tabId) {
                return;
            }
            if (this.validateMessage(message)) {
                this.processMessage(message);
            }
        }
        catch (error) {
            console.error('Failed to parse storage message:', error);
        }
    }
    validateMessage(message) {
        return (message &&
            typeof message === 'object' &&
            message.type &&
            message.payload !== undefined &&
            message.timestamp &&
            message.clientId &&
            message.tabId);
    }
    processMessage(message) {
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
    handleVisibilityChange() {
        if (document.hidden) {
            // Tab is hidden, reduce activity
            this.emit('tab_hidden');
        }
        else {
            // Tab is visible, resume activity
            this.emit('tab_visible');
            // Process any queued messages
            this.processMessageQueue();
        }
    }
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.sendMessage(message);
            }
        }
    }
    // Public API methods
    sendMessage(message) {
        const fullMessage = {
            ...message,
            timestamp: Date.now(),
            clientId: this.clientId,
            tabId: this.tabId,
        };
        if (this.channel && this.isSupported) {
            try {
                this.channel.postMessage(fullMessage);
            }
            catch (error) {
                console.error('Failed to send message via BroadcastChannel:', error);
                this.fallbackSend(fullMessage);
            }
        }
        else {
            this.fallbackSend(fullMessage);
        }
    }
    fallbackSend(message) {
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
        }
        catch (error) {
            console.error('Failed to send message via localStorage:', error);
        }
    }
    // Specific message senders for convenience
    sendSyncEvent(event) {
        this.sendMessage({
            type: CrossTabMessageType.SYNC_EVENT,
            payload: event,
        });
    }
    sendOptimisticUpdate(update) {
        this.sendMessage({
            type: CrossTabMessageType.OPTIMISTIC_UPDATE,
            payload: update,
        });
    }
    sendConflict(conflict) {
        this.sendMessage({
            type: CrossTabMessageType.CONFLICT,
            payload: conflict,
        });
    }
    sendStatusUpdate(status) {
        this.sendMessage({
            type: CrossTabMessageType.STATUS_UPDATE,
            payload: status,
        });
    }
    // Utility methods
    isTabVisible() {
        return !document.hidden;
    }
    getClientId() {
        return this.clientId;
    }
    getTabId() {
        return this.tabId;
    }
    isConnectionSupported() {
        return this.isSupported;
    }
    isConnectedToOtherTabs() {
        return this.isConnected;
    }
    // Get information about other tabs
    async getOtherTabs() {
        if (!this.fallbackStorage) {
            return [];
        }
        const tabs = [];
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
    pingOtherTabs() {
        return new Promise((resolve) => {
            const responsiveTabs = [];
            const timeout = setTimeout(() => {
                resolve(responsiveTabs);
            }, 5000); // 5 second timeout
            const handlePong = (event) => {
                const message = event.data;
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
    cleanup() {
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
    destroy() {
        this.cleanup();
        this.removeAllListeners();
        this.messageQueue = [];
        this.isConnected = false;
    }
}
// Global instance for use across the application
let globalCrossTabSyncManager = null;
function getCrossTabSyncManager() {
    if (!globalCrossTabSyncManager) {
        globalCrossTabSyncManager = new CrossTabSyncManager();
    }
    return globalCrossTabSyncManager;
}
function resetCrossTabSyncManager() {
    if (globalCrossTabSyncManager) {
        globalCrossTabSyncManager.destroy();
    }
    globalCrossTabSyncManager = null;
}

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;
	"production" !== process.env.NODE_ENV &&
	  (function () {
	    function getComponentNameFromType(type) {
	      if (null == type) return null;
	      if ("function" === typeof type)
	        return type.$$typeof === REACT_CLIENT_REFERENCE
	          ? null
	          : type.displayName || type.name || null;
	      if ("string" === typeof type) return type;
	      switch (type) {
	        case REACT_FRAGMENT_TYPE:
	          return "Fragment";
	        case REACT_PROFILER_TYPE:
	          return "Profiler";
	        case REACT_STRICT_MODE_TYPE:
	          return "StrictMode";
	        case REACT_SUSPENSE_TYPE:
	          return "Suspense";
	        case REACT_SUSPENSE_LIST_TYPE:
	          return "SuspenseList";
	        case REACT_ACTIVITY_TYPE:
	          return "Activity";
	      }
	      if ("object" === typeof type)
	        switch (
	          ("number" === typeof type.tag &&
	            console.error(
	              "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
	            ),
	          type.$$typeof)
	        ) {
	          case REACT_PORTAL_TYPE:
	            return "Portal";
	          case REACT_CONTEXT_TYPE:
	            return type.displayName || "Context";
	          case REACT_CONSUMER_TYPE:
	            return (type._context.displayName || "Context") + ".Consumer";
	          case REACT_FORWARD_REF_TYPE:
	            var innerType = type.render;
	            type = type.displayName;
	            type ||
	              ((type = innerType.displayName || innerType.name || ""),
	              (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
	            return type;
	          case REACT_MEMO_TYPE:
	            return (
	              (innerType = type.displayName || null),
	              null !== innerType
	                ? innerType
	                : getComponentNameFromType(type.type) || "Memo"
	            );
	          case REACT_LAZY_TYPE:
	            innerType = type._payload;
	            type = type._init;
	            try {
	              return getComponentNameFromType(type(innerType));
	            } catch (x) {}
	        }
	      return null;
	    }
	    function testStringCoercion(value) {
	      return "" + value;
	    }
	    function checkKeyStringCoercion(value) {
	      try {
	        testStringCoercion(value);
	        var JSCompiler_inline_result = !1;
	      } catch (e) {
	        JSCompiler_inline_result = true;
	      }
	      if (JSCompiler_inline_result) {
	        JSCompiler_inline_result = console;
	        var JSCompiler_temp_const = JSCompiler_inline_result.error;
	        var JSCompiler_inline_result$jscomp$0 =
	          ("function" === typeof Symbol &&
	            Symbol.toStringTag &&
	            value[Symbol.toStringTag]) ||
	          value.constructor.name ||
	          "Object";
	        JSCompiler_temp_const.call(
	          JSCompiler_inline_result,
	          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
	          JSCompiler_inline_result$jscomp$0
	        );
	        return testStringCoercion(value);
	      }
	    }
	    function getTaskName(type) {
	      if (type === REACT_FRAGMENT_TYPE) return "<>";
	      if (
	        "object" === typeof type &&
	        null !== type &&
	        type.$$typeof === REACT_LAZY_TYPE
	      )
	        return "<...>";
	      try {
	        var name = getComponentNameFromType(type);
	        return name ? "<" + name + ">" : "<...>";
	      } catch (x) {
	        return "<...>";
	      }
	    }
	    function getOwner() {
	      var dispatcher = ReactSharedInternals.A;
	      return null === dispatcher ? null : dispatcher.getOwner();
	    }
	    function UnknownOwner() {
	      return Error("react-stack-top-frame");
	    }
	    function hasValidKey(config) {
	      if (hasOwnProperty.call(config, "key")) {
	        var getter = Object.getOwnPropertyDescriptor(config, "key").get;
	        if (getter && getter.isReactWarning) return false;
	      }
	      return void 0 !== config.key;
	    }
	    function defineKeyPropWarningGetter(props, displayName) {
	      function warnAboutAccessingKey() {
	        specialPropKeyWarningShown ||
	          ((specialPropKeyWarningShown = true),
	          console.error(
	            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
	            displayName
	          ));
	      }
	      warnAboutAccessingKey.isReactWarning = true;
	      Object.defineProperty(props, "key", {
	        get: warnAboutAccessingKey,
	        configurable: true
	      });
	    }
	    function elementRefGetterWithDeprecationWarning() {
	      var componentName = getComponentNameFromType(this.type);
	      didWarnAboutElementRef[componentName] ||
	        ((didWarnAboutElementRef[componentName] = true),
	        console.error(
	          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
	        ));
	      componentName = this.props.ref;
	      return void 0 !== componentName ? componentName : null;
	    }
	    function ReactElement(type, key, props, owner, debugStack, debugTask) {
	      var refProp = props.ref;
	      type = {
	        $$typeof: REACT_ELEMENT_TYPE,
	        type: type,
	        key: key,
	        props: props,
	        _owner: owner
	      };
	      null !== (void 0 !== refProp ? refProp : null)
	        ? Object.defineProperty(type, "ref", {
	            enumerable: false,
	            get: elementRefGetterWithDeprecationWarning
	          })
	        : Object.defineProperty(type, "ref", { enumerable: false, value: null });
	      type._store = {};
	      Object.defineProperty(type._store, "validated", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: 0
	      });
	      Object.defineProperty(type, "_debugInfo", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: null
	      });
	      Object.defineProperty(type, "_debugStack", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: debugStack
	      });
	      Object.defineProperty(type, "_debugTask", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: debugTask
	      });
	      Object.freeze && (Object.freeze(type.props), Object.freeze(type));
	      return type;
	    }
	    function jsxDEVImpl(
	      type,
	      config,
	      maybeKey,
	      isStaticChildren,
	      debugStack,
	      debugTask
	    ) {
	      var children = config.children;
	      if (void 0 !== children)
	        if (isStaticChildren)
	          if (isArrayImpl(children)) {
	            for (
	              isStaticChildren = 0;
	              isStaticChildren < children.length;
	              isStaticChildren++
	            )
	              validateChildKeys(children[isStaticChildren]);
	            Object.freeze && Object.freeze(children);
	          } else
	            console.error(
	              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
	            );
	        else validateChildKeys(children);
	      if (hasOwnProperty.call(config, "key")) {
	        children = getComponentNameFromType(type);
	        var keys = Object.keys(config).filter(function (k) {
	          return "key" !== k;
	        });
	        isStaticChildren =
	          0 < keys.length
	            ? "{key: someKey, " + keys.join(": ..., ") + ": ...}"
	            : "{key: someKey}";
	        didWarnAboutKeySpread[children + isStaticChildren] ||
	          ((keys =
	            0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}"),
	          console.error(
	            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
	            isStaticChildren,
	            children,
	            keys,
	            children
	          ),
	          (didWarnAboutKeySpread[children + isStaticChildren] = true));
	      }
	      children = null;
	      void 0 !== maybeKey &&
	        (checkKeyStringCoercion(maybeKey), (children = "" + maybeKey));
	      hasValidKey(config) &&
	        (checkKeyStringCoercion(config.key), (children = "" + config.key));
	      if ("key" in config) {
	        maybeKey = {};
	        for (var propName in config)
	          "key" !== propName && (maybeKey[propName] = config[propName]);
	      } else maybeKey = config;
	      children &&
	        defineKeyPropWarningGetter(
	          maybeKey,
	          "function" === typeof type
	            ? type.displayName || type.name || "Unknown"
	            : type
	        );
	      return ReactElement(
	        type,
	        children,
	        maybeKey,
	        getOwner(),
	        debugStack,
	        debugTask
	      );
	    }
	    function validateChildKeys(node) {
	      isValidElement(node)
	        ? node._store && (node._store.validated = 1)
	        : "object" === typeof node &&
	          null !== node &&
	          node.$$typeof === REACT_LAZY_TYPE &&
	          ("fulfilled" === node._payload.status
	            ? isValidElement(node._payload.value) &&
	              node._payload.value._store &&
	              (node._payload.value._store.validated = 1)
	            : node._store && (node._store.validated = 1));
	    }
	    function isValidElement(object) {
	      return (
	        "object" === typeof object &&
	        null !== object &&
	        object.$$typeof === REACT_ELEMENT_TYPE
	      );
	    }
	    var React = require$$0,
	      REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	      REACT_PORTAL_TYPE = Symbol.for("react.portal"),
	      REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
	      REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
	      REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
	      REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
	      REACT_CONTEXT_TYPE = Symbol.for("react.context"),
	      REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
	      REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
	      REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
	      REACT_MEMO_TYPE = Symbol.for("react.memo"),
	      REACT_LAZY_TYPE = Symbol.for("react.lazy"),
	      REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
	      REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"),
	      ReactSharedInternals =
	        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
	      hasOwnProperty = Object.prototype.hasOwnProperty,
	      isArrayImpl = Array.isArray,
	      createTask = console.createTask
	        ? console.createTask
	        : function () {
	            return null;
	          };
	    React = {
	      react_stack_bottom_frame: function (callStackForError) {
	        return callStackForError();
	      }
	    };
	    var specialPropKeyWarningShown;
	    var didWarnAboutElementRef = {};
	    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
	      React,
	      UnknownOwner
	    )();
	    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
	    var didWarnAboutKeySpread = {};
	    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	    reactJsxRuntime_development.jsx = function (type, config, maybeKey) {
	      var trackActualOwner =
	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	      return jsxDEVImpl(
	        type,
	        config,
	        maybeKey,
	        false,
	        trackActualOwner
	          ? Error("react-stack-top-frame")
	          : unknownOwnerDebugStack,
	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	      );
	    };
	    reactJsxRuntime_development.jsxs = function (type, config, maybeKey) {
	      var trackActualOwner =
	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	      return jsxDEVImpl(
	        type,
	        config,
	        maybeKey,
	        true,
	        trackActualOwner
	          ? Error("react-stack-top-frame")
	          : unknownOwnerDebugStack,
	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	      );
	    };
	  })();
	return reactJsxRuntime_development;
}

if (process.env.NODE_ENV === 'production') {
  jsxRuntime.exports = requireReactJsxRuntime_production();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

const SyncContext = createContext(null);
function SyncProvider({ children, supabase, configs, enableOptimisticUpdates = true, enableCrossTab = true, }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);
    const [subscriptionManager] = useState(() => new SupabaseSubscriptionManager(supabase, enableCrossTab));
    const [optimisticManager] = useState(() => new OptimisticUpdateManager());
    const [crossTabManager] = useState(() => new CrossTabSyncManager());
    const [stats] = useState({
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        pendingEvents: 0,
        conflicts: 0,
        lastSyncTime: null,
        averageLatency: 0,
    });
    useEffect(() => {
        // Set up subscription manager event listeners
        const handleConnected = () => {
            setIsConnected(true);
            setError(null);
        };
        const handleDisconnected = () => {
            setIsConnected(false);
        };
        const handleSyncEvent = (event) => {
            setLastSync(new Date());
            stats.totalEvents++;
            if (event.status === SyncStatus.COMPLETED) {
                stats.successfulEvents++;
            }
            else if (event.status === SyncStatus.FAILED) {
                stats.failedEvents++;
            }
            else if (event.status === SyncStatus.PENDING) {
                stats.pendingEvents++;
            }
        };
        const handleError = (err) => {
            setError(err);
            stats.failedEvents++;
        };
        subscriptionManager.on(SyncEvents.CONNECTED, handleConnected);
        subscriptionManager.on(SyncEvents.DISCONNECTED, handleDisconnected);
        subscriptionManager.on(SyncEvents.SYNC_EVENT, handleSyncEvent);
        subscriptionManager.on(SyncEvents.ERROR, handleError);
        // Set up optimistic update manager listeners
        optimisticManager.on(SyncEvents.CONFLICT, (conflict) => {
            stats.conflicts++;
        });
        // Set up cross-tab manager listeners
        crossTabManager.on('tab_visible', () => {
            // Refresh data when tab becomes visible
            setLastSync(new Date());
        });
        // Subscribe to all configured tables
        const setupSubscriptions = async () => {
            try {
                for (const config of configs) {
                    await subscriptionManager.subscribe(config);
                }
            }
            catch (err) {
                setError(err);
            }
        };
        setupSubscriptions();
        // Set up network status monitoring
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            subscriptionManager.off(SyncEvents.CONNECTED, handleConnected);
            subscriptionManager.off(SyncEvents.DISCONNECTED, handleDisconnected);
            subscriptionManager.off(SyncEvents.SYNC_EVENT, handleSyncEvent);
            subscriptionManager.off(SyncEvents.ERROR, handleError);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            subscriptionManager.unsubscribeAll();
        };
    }, [subscriptionManager, optimisticManager, crossTabManager, configs, stats]);
    const contextValue = {
        isConnected,
        isOnline,
        stats,
        lastSync,
        subscriptionManager,
        optimisticManager,
        crossTabManager,
        error,
    };
    return (jsxRuntimeExports.jsx(SyncContext.Provider, { value: contextValue, children: children }));
}
function useSyncContext() {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSyncContext must be used within a SyncProvider');
    }
    return context;
}
// Hook for accessing sync status
function useSyncStatus() {
    const { isConnected, isOnline, stats, lastSync, error } = useSyncContext();
    return {
        isConnected,
        isOnline,
        stats,
        lastSync,
        error,
        isHealthy: isConnected && isOnline && !error,
    };
}
// Hook for accessing managers
function useSyncManagers() {
    const { subscriptionManager, optimisticManager, crossTabManager } = useSyncContext();
    return {
        subscriptionManager,
        optimisticManager,
        crossTabManager,
    };
}

// Validation schemas
const SyncConfigValidationSchema = z.object({
    table: z.string().min(1, 'Table name is required'),
    direction: z.nativeEnum(SyncDirection).default(SyncDirection.BIDIRECTIONAL),
    filter: z.string().optional(),
    optimisticUpdates: z.boolean().default(true),
    conflictResolution: z.enum(['client_wins', 'server_wins', 'manual']).default('server_wins'),
    retryAttempts: z.number().int().min(0).default(3),
    retryDelay: z.number().int().min(0).default(1000),
    enableCrossTab: z.boolean().default(true),
});
const SyncEventValidationSchema = z.object({
    id: z.string().uuid('Invalid event ID'),
    table: z.string().min(1, 'Table name is required'),
    operation: z.nativeEnum(SyncOperation),
    data: z.any(),
    oldData: z.any().optional(),
    timestamp: z.string().datetime('Invalid timestamp format'),
    userId: z.string().optional(),
    clientId: z.string().optional(),
    status: z.nativeEnum(SyncStatus),
    retryCount: z.number().int().min(0),
    correlationId: z.string().optional(),
});
// Validation functions
function validateSyncConfig(config) {
    try {
        return SyncConfigValidationSchema.parse(config);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            throw new Error(`Invalid sync configuration: ${errorMessages.join(', ')}`);
        }
        throw new Error('Invalid sync configuration');
    }
}
function validateSyncEvent(event) {
    try {
        return SyncEventValidationSchema.parse(event);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            throw new Error(`Invalid sync event: ${errorMessages.join(', ')}`);
        }
        throw new Error('Invalid sync event');
    }
}

class SyncPerformanceMonitor extends EventEmitter {
    constructor() {
        super();
        this.alerts = [];
        this.thresholds = new Map();
        this.measurements = new Map();
        this.startTime = Date.now();
        this.lastCleanup = Date.now();
        this.metrics = {
            latency: 0,
            throughput: 0,
            errorRate: 0,
            conflictRate: 0,
            averageResponseTime: 0,
            peakMemoryUsage: 0,
            connectionUptime: 0,
        };
        this.initializeThresholds();
        this.startMonitoring();
    }
    initializeThresholds() {
        this.thresholds.set('latency', 1000); // 1 second
        this.thresholds.set('error_rate', 0.05); // 5%
        this.thresholds.set('memory', 100 * 1024 * 1024); // 100MB
        this.thresholds.set('conflict_rate', 0.02); // 2%
        this.thresholds.set('throughput', 10); // 10 events per second
    }
    startMonitoring() {
        // Update metrics every 5 seconds
        setInterval(() => {
            this.updateMetrics();
            this.checkThresholds();
            this.cleanupOldData();
        }, 5000);
        // Monitor memory usage
        if (typeof window !== 'undefined' && 'performance' in window) {
            setInterval(() => {
                this.updateMemoryUsage();
            }, 10000);
        }
    }
    // Record a sync event for performance tracking
    recordSyncEvent(event, responseTime) {
        const now = Date.now();
        // Record response time if provided
        if (responseTime !== undefined) {
            this.recordMeasurement('response_time', responseTime);
        }
        // Calculate latency if timestamp is available
        if (event.timestamp) {
            const eventTime = new Date(event.timestamp).getTime();
            const latency = now - eventTime;
            this.recordMeasurement('latency', latency);
        }
        // Track status-based metrics
        if (event.status === SyncStatus.FAILED) {
            this.recordMeasurement('error', 1);
        }
        else if (event.status === SyncStatus.CONFLICT) {
            this.recordMeasurement('conflict', 1);
        }
        this.recordMeasurement('throughput', 1);
    }
    // Record a measurement for averaging
    recordMeasurement(type, value) {
        if (!this.measurements.has(type)) {
            this.measurements.set(type, []);
        }
        const measurements = this.measurements.get(type);
        measurements.push(value);
        // Keep only last 100 measurements per type
        if (measurements.length > 100) {
            measurements.shift();
        }
    }
    // Update calculated metrics
    updateMetrics() {
        const now = Date.now();
        // Update connection uptime
        this.metrics.connectionUptime = now - this.startTime;
        // Calculate average latency
        const latencyMeasurements = this.measurements.get('latency') || [];
        this.metrics.latency = this.calculateAverage(latencyMeasurements);
        // Calculate average response time
        const responseTimeMeasurements = this.measurements.get('response_time') || [];
        this.metrics.averageResponseTime = this.calculateAverage(responseTimeMeasurements);
        // Calculate throughput (events per second over last minute)
        const throughputMeasurements = this.measurements.get('throughput') || [];
        const recentThroughput = throughputMeasurements.slice(-12); // Last 12 * 5 seconds = 1 minute
        this.metrics.throughput = recentThroughput.reduce((sum, val) => sum + val, 0) / 60;
        // Calculate error rate
        const errorMeasurements = this.measurements.get('error') || [];
        const totalEvents = throughputMeasurements.length;
        const totalErrors = errorMeasurements.reduce((sum, val) => sum + val, 0);
        this.metrics.errorRate = totalEvents > 0 ? totalErrors / totalEvents : 0;
        // Calculate conflict rate
        const conflictMeasurements = this.measurements.get('conflict') || [];
        const totalConflicts = conflictMeasurements.reduce((sum, val) => sum + val, 0);
        this.metrics.conflictRate = totalEvents > 0 ? totalConflicts / totalEvents : 0;
        this.emit('metrics_updated', this.metrics);
    }
    calculateAverage(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    updateMemoryUsage() {
        if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
            const memory = window.performance.memory;
            const usedMemory = memory.usedJSHeapSize;
            this.recordMeasurement('memory', usedMemory);
            this.metrics.peakMemoryUsage = Math.max(this.metrics.peakMemoryUsage, usedMemory);
        }
    }
    checkThresholds() {
        // Check latency threshold
        if (this.metrics.latency > this.thresholds.get('latency')) {
            this.createAlert('latency', 'high', `Latency (${this.metrics.latency.toFixed(2)}ms) exceeds threshold`, this.metrics.latency);
        }
        // Check error rate threshold
        if (this.metrics.errorRate > this.thresholds.get('error_rate')) {
            this.createAlert('error_rate', 'high', `Error rate (${(this.metrics.errorRate * 100).toFixed(2)}%) exceeds threshold`, this.metrics.errorRate);
        }
        // Check memory usage threshold
        if (this.metrics.peakMemoryUsage > this.thresholds.get('memory')) {
            this.createAlert('memory', 'medium', `Memory usage (${(this.metrics.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB) exceeds threshold`, this.metrics.peakMemoryUsage);
        }
        // Check conflict rate threshold
        if (this.metrics.conflictRate > this.thresholds.get('conflict_rate')) {
            this.createAlert('conflict_rate', 'medium', `Conflict rate (${(this.metrics.conflictRate * 100).toFixed(2)}%) exceeds threshold`, this.metrics.conflictRate);
        }
        // Check throughput threshold
        if (this.metrics.throughput < this.thresholds.get('throughput')) {
            this.createAlert('throughput', 'low', `Throughput (${this.metrics.throughput.toFixed(2)} events/sec) below threshold`, this.metrics.throughput);
        }
    }
    createAlert(type, severity, message, value) {
        const alert = {
            type,
            severity,
            message,
            timestamp: new Date(),
            value,
            threshold: this.thresholds.get(type) || 0,
        };
        this.alerts.push(alert);
        this.emit('performance_alert', alert);
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts.shift();
        }
    }
    cleanupOldData() {
        const now = Date.now();
        // Clean up old measurements every 5 minutes
        if (now - this.lastCleanup > 300000) {
            this.measurements.forEach((measurements, type) => {
                // Keep only recent measurements (last 10 minutes worth)
                const maxMeasurements = Math.min(120, measurements.length); // 10 minutes * 12 per minute
                if (measurements.length > maxMeasurements) {
                    this.measurements.set(type, measurements.slice(-maxMeasurements));
                }
            });
            // Clean up old alerts (older than 1 hour)
            this.alerts = this.alerts.filter(alert => now - alert.timestamp.getTime() < 3600000);
            this.lastCleanup = now;
        }
    }
    // Public API methods
    getMetrics() {
        return { ...this.metrics };
    }
    getAlerts() {
        return [...this.alerts];
    }
    getCriticalAlerts() {
        return this.alerts.filter(alert => alert.severity === 'critical');
    }
    setThreshold(type, value) {
        this.thresholds.set(type, value);
    }
    getThreshold(type) {
        return this.thresholds.get(type);
    }
    clearAlerts() {
        this.alerts = [];
    }
    reset() {
        this.measurements.clear();
        this.alerts = [];
        this.startTime = Date.now();
        this.metrics = {
            latency: 0,
            throughput: 0,
            errorRate: 0,
            conflictRate: 0,
            averageResponseTime: 0,
            peakMemoryUsage: 0,
            connectionUptime: 0,
        };
    }
    // Export performance data for analysis
    exportData() {
        const measurements = {};
        this.measurements.forEach((value, key) => {
            measurements[key] = [...value];
        });
        const thresholds = {};
        this.thresholds.forEach((value, key) => {
            thresholds[key] = value;
        });
        return {
            metrics: this.getMetrics(),
            alerts: this.getAlerts(),
            measurements,
            thresholds,
        };
    }
}

export { CrossTabMessageSchema, CrossTabMessageType, CrossTabSyncManager, CustomerSchema, InventoryItemSchema, OptimisticUpdateManager, SupabaseSubscriptionManager, SyncConfigSchema, SyncDirection, SyncEventSchema, SyncEvents, SyncOperation, SyncPerformanceMonitor, SyncProvider, SyncStatus, TransactionSchema, getCrossTabSyncManager, getOptimisticUpdateManager, resetCrossTabSyncManager, resetOptimisticUpdateManager, useRealtimeSync, useSync, useSyncContext, useSyncManagers, useSyncStatus, validateSyncConfig, validateSyncEvent };
//# sourceMappingURL=index.esm.js.map
