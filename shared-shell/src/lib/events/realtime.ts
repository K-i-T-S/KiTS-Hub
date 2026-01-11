import { supabase } from '../supabase';
import { globalEventBus } from './event-bus';
import { CrossSolutionEvent } from './types';

export interface RealtimeSubscriptionConfig {
  tables?: string[];
  schemas?: string[];
  events?: ('*' | 'INSERT' | 'UPDATE' | 'DELETE')[];
  filter?: string;
}

export interface RealtimeConnection {
  subscription: any;
  isConnected: boolean;
  lastActivity: Date;
  retryCount: number;
  config: RealtimeSubscriptionConfig;
}

interface DatabaseChangePayload {
  table: string;
  event_type: 'INSERT' | 'UPDATE' | 'DELETE';
  new_record: any;
  old_record: any;
  schema: string;
}

export class SupabaseRealtimeManager {
  private connections: Map<string, RealtimeConnection> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    // Setup heartbeat to monitor connection health
    this.startHeartbeat();
  }

  /**
   * Subscribe to database changes for cross-solution events
   */
  async subscribeToEvents(
    connectionId: string,
    config: RealtimeSubscriptionConfig,
    eventHandler?: (event: CrossSolutionEvent) => void
  ): Promise<void> {
    try {
      // If connection already exists, unsubscribe first
      if (this.connections.has(connectionId)) {
        await this.unsubscribe(connectionId);
      }

      // Create Supabase channel
      const channel = supabase
        .channel(`cross-solution-${connectionId}`)
        .on(
          'postgres_changes' as any,
          {
            event: config.events?.[0] || '*',
            schema: config.schemas?.[0] || 'public',
            table: config.tables?.[0],
            filter: config.filter,
          },
          (payload: DatabaseChangePayload) => this.handleDatabaseChange(payload, eventHandler)
        )
        .subscribe((status) => {
          console.log(`Realtime subscription ${connectionId} status:`, status);
          
          if (status === 'SUBSCRIBED') {
            this.connections.set(connectionId, {
              subscription: channel,
              isConnected: true,
              lastActivity: new Date(),
              retryCount: 0,
              config,
            });
          } else if (status === 'CHANNEL_ERROR') {
            this.handleConnectionError(connectionId);
          }
        });

    } catch (error) {
      console.error(`Failed to create realtime subscription ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to multiple tables with different handlers
   */
  async subscribeToMultipleTables(
    connectionId: string,
    subscriptions: Array<{
      table: string;
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      handler: (payload: any) => void;
    }>
  ): Promise<void> {
    try {
      // If connection already exists, unsubscribe first
      if (this.connections.has(connectionId)) {
        await this.unsubscribe(connectionId);
      }

      // Create channel with multiple subscriptions
      const channel = supabase.channel(`multi-table-${connectionId}`);

      subscriptions.forEach(({ table, event = '*', handler }) => {
        channel.on(
          'postgres_changes' as any,
          {
            event,
            schema: 'public',
            table,
          },
          handler
        );
      });

      channel.subscribe((status) => {
        console.log(`Multi-table subscription ${connectionId} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          this.connections.set(connectionId, {
            subscription: channel,
            isConnected: true,
            lastActivity: new Date(),
            retryCount: 0,
            config: { tables: subscriptions.map(s => s.table) },
          });
        } else if (status === 'CHANNEL_ERROR') {
          this.handleConnectionError(connectionId);
        }
      });

    } catch (error) {
      console.error(`Failed to create multi-table subscription ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a specific connection
   */
  async unsubscribe(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        await connection.subscription.unsubscribe();
        this.connections.delete(connectionId);
        console.log(`Unsubscribed from connection: ${connectionId}`);
      } catch (error) {
        console.error(`Error unsubscribing from ${connectionId}:`, error);
      }
    }
  }

  /**
   * Unsubscribe from all connections
   */
  async unsubscribeAll(): Promise<void> {
    const promises = Array.from(this.connections.keys()).map(id => 
      this.unsubscribe(id)
    );
    await Promise.allSettled(promises);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(connectionId?: string): any {
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      return connection ? {
        isConnected: connection.isConnected,
        lastActivity: connection.lastActivity,
        retryCount: connection.retryCount,
        config: connection.config,
      } : null;
    }

    return {
      totalConnections: this.connections.size,
      connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
        id,
        isConnected: conn.isConnected,
        lastActivity: conn.lastActivity,
        retryCount: conn.retryCount,
        config: conn.config,
      })),
    };
  }

  /**
   * Handle database change events
   */
  private async handleDatabaseChange(
    payload: any,
    customHandler?: (event: CrossSolutionEvent) => void
  ): Promise<void> {
    try {
      console.log('Database change received:', payload);

      // Convert database change to cross-solution event
      const crossSolutionEvent = this.convertDatabaseChangeToEvent(payload);

      if (crossSolutionEvent) {
        // Emit to event bus
        await globalEventBus.emit(crossSolutionEvent);

        // Call custom handler if provided
        if (customHandler) {
          customHandler(crossSolutionEvent);
        }
      }
    } catch (error) {
      console.error('Error handling database change:', error);
    }
  }

  /**
   * Convert Supabase database change to cross-solution event
   */
  private convertDatabaseChangeToEvent(payload: any): CrossSolutionEvent | null {
    const { table, event_type, new_record, old_record } = payload;

    // Map table changes to event types
    switch (table) {
      case 'inventory_stock':
        if (event_type === 'UPDATE') {
          return {
            id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'stock_updated',
            timestamp: new Date(),
            source: 'database',
            tenantId: new_record?.tenant_id || 'unknown',
            userId: 'system',
            data: {
              productId: new_record?.product_id,
              previousStock: old_record?.quantity || 0,
              newStock: new_record?.quantity || 0,
              location: new_record?.location_id,
              reason: this.determineStockUpdateReason(new_record, old_record),
            },
          };
        }
        break;

      case 'customers':
        if (event_type === 'INSERT') {
          return {
            id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'customer_created',
            timestamp: new Date(),
            source: 'database',
            tenantId: new_record?.tenant_id || 'unknown',
            userId: new_record?.created_by || 'system',
            data: {
              customerId: new_record?.id,
              customerData: {
                name: new_record?.name,
                email: new_record?.email,
                phone: new_record?.phone,
                address: new_record?.address,
              },
              source: 'database',
            },
          };
        } else if (event_type === 'UPDATE') {
          return {
            id: `customer_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'customer_updated',
            timestamp: new Date(),
            source: 'database',
            tenantId: new_record?.tenant_id || 'unknown',
            userId: new_record?.updated_by || 'system',
            data: {
              customerId: new_record?.id,
              previousData: old_record,
              newData: new_record,
              changedFields: this.getChangedFields(old_record, new_record),
            },
          };
        }
        break;

      case 'sales':
        if (event_type === 'INSERT') {
          return {
            id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'sale_processed',
            timestamp: new Date(),
            source: 'database',
            tenantId: new_record?.tenant_id || 'unknown',
            userId: new_record?.cashier_id || 'system',
            data: {
              saleId: new_record?.id,
              customerId: new_record?.customer_id,
              items: new_record?.items || [],
              totalAmount: new_record?.total_amount,
              paymentMethod: new_record?.payment_method,
              location: new_record?.location_id,
              cashierId: new_record?.cashier_id,
            },
          };
        }
        break;

      case 'accounting_transactions':
        if (event_type === 'INSERT') {
          return {
            id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'transaction_recorded',
            timestamp: new Date(),
            source: 'database',
            tenantId: new_record?.tenant_id || 'unknown',
            userId: new_record?.created_by || 'system',
            data: {
              transactionId: new_record?.id,
              type: new_record?.transaction_type,
              amount: new_record?.amount,
              accountId: new_record?.account_id,
              categoryId: new_record?.category_id,
              description: new_record?.description,
              referenceId: new_record?.reference_id,
              referenceType: new_record?.reference_type,
            },
          };
        }
        break;

      default:
        console.log(`Unhandled table change: ${table}`);
        return null;
    }

    return null;
  }

  /**
   * Determine the reason for stock update
   */
  private determineStockUpdateReason(newRecord: any, oldRecord: any): 'sale' | 'adjustment' | 'purchase' | 'return' {
    // Simple logic - could be enhanced with more sophisticated tracking
    if (newRecord.quantity < oldRecord.quantity) {
      return 'sale';
    } else if (newRecord.quantity > oldRecord.quantity) {
      return 'purchase';
    }
    return 'adjustment';
  }

  /**
   * Get changed fields between two records
   */
  private getChangedFields(oldRecord: any, newRecord: any): string[] {
    const changed: string[] = [];
    
    if (!oldRecord || !newRecord) return changed;

    for (const key in newRecord) {
      if (oldRecord[key] !== newRecord[key]) {
        changed.push(key);
      }
    }

    return changed;
  }

  /**
   * Handle connection errors with reconnection logic
   */
  private handleConnectionError(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.isConnected = false;
    connection.retryCount++;

    console.warn(`Connection ${connectionId} error, retry count: ${connection.retryCount}`);

    if (connection.retryCount <= this.maxReconnectAttempts) {
      // Attempt to reconnect with exponential backoff
      const delay = this.reconnectDelay * Math.pow(2, connection.retryCount - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect ${connectionId}...`);
        this.subscribeToEvents(connectionId, connection.config);
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for ${connectionId}`);
      this.connections.delete(connectionId);
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000); // Every 30 seconds
  }

  /**
   * Check health of all connections
   */
  private checkConnectionHealth(): void {
    const now = new Date();
    
    this.connections.forEach((connection, id) => {
      const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
      
      // If no activity for 2 minutes, mark as potentially disconnected
      if (timeSinceLastActivity > 120000 && connection.isConnected) {
        console.warn(`Connection ${id} appears inactive, checking status...`);
        connection.isConnected = false;
      }
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    await this.unsubscribeAll();
  }
}

// Global realtime manager instance
export const realtimeManager = new SupabaseRealtimeManager();
