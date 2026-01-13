/**
 * Real-Time Data Service
 * Handles WebSocket connections and live data updates for analytics dashboard
 */

export interface RealTimeData {
  timestamp: number
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'system'
  data: any
  source: string
}

export interface RealTimeConfig {
  enabled: boolean
  updateInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  maxRetries: number
}

export interface Subscription {
  id: string
  type: string
  callback: (data: RealTimeData) => void
  filters?: Record<string, any>
}

class RealTimeService {
  private ws: WebSocket | null = null
  private subscriptions: Map<string, Subscription> = new Map()
  private config: RealTimeConfig = {
    enabled: true,
    updateInterval: 30000, // 30 seconds
    reconnectAttempts: 0,
    reconnectDelay: 5000,
    maxRetries: 5
  }
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnecting = false
  private isConnected = false

  constructor(config?: Partial<RealTimeConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Initialize WebSocket connection
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return
    }

    this.isConnecting = true

    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate the connection
      await this.simulateConnection()
      
      this.isConnected = true
      this.isConnecting = false
      this.config.reconnectAttempts = 0

      // Start heartbeat
      this.startHeartbeat()

      console.log('Real-time service connected')
    } catch (error) {
      this.isConnecting = false
      console.error('Failed to connect to real-time service:', error)
      this.handleReconnect()
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
    this.isConnecting = false
    console.log('Real-time service disconnected')
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribe(type: string, callback: (data: RealTimeData) => void, filters?: Record<string, any>): string {
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      type,
      callback,
      filters
    }

    this.subscriptions.set(subscription.id, subscription)

    // If connected, send subscription message to server
    if (this.isConnected) {
      this.sendSubscription(subscription)
    }

    console.log(`Subscribed to ${type} updates with ID: ${subscription.id}`)
    return subscription.id
  }

  /**
   * Unsubscribe from real-time data updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      this.subscriptions.delete(subscriptionId)
      
      // If connected, send unsubscribe message to server
      if (this.isConnected) {
        this.sendUnsubscription(subscriptionId)
      }

      console.log(`Unsubscribed from updates with ID: ${subscriptionId}`)
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Simulate WebSocket connection for demo purposes
   */
  private async simulateConnection(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Start simulated data updates
        this.startSimulatedUpdates()
        resolve()
      }, 1000)
    })
  }

  /**
   * Start simulated real-time data updates
   */
  private startSimulatedUpdates(): void {
    setInterval(() => {
      if (!this.config.enabled || this.subscriptions.size === 0) {
        return
      }

      // Generate random data updates
      const updateTypes = ['sales', 'inventory', 'customer', 'financial']
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
      
      const data: RealTimeData = {
        timestamp: Date.now(),
        type: randomType as any,
        data: this.generateMockData(randomType),
        source: 'simulated'
      }

      this.broadcastToSubscribers(data)
    }, this.config.updateInterval)
  }

  /**
   * Generate mock data for different types
   */
  private generateMockData(type: string): any {
    switch (type) {
      case 'sales':
        return {
          totalRevenue: 523180 + Math.floor(Math.random() * 10000 - 5000),
          totalOrders: 1842 + Math.floor(Math.random() * 50 - 25),
          conversionRate: 3.2 + (Math.random() * 0.4 - 0.2),
          avgOrderValue: 284 + Math.floor(Math.random() * 20 - 10)
        }
      case 'inventory':
        return {
          totalProducts: 1247 + Math.floor(Math.random() * 10 - 5),
          lowStockItems: 47 + Math.floor(Math.random() * 5 - 2),
          turnoverRate: 4.2 + (Math.random() * 0.2 - 0.1),
          warehouseUtilization: 78.5 + (Math.random() * 2 - 1)
        }
      case 'customer':
        return {
          totalCustomers: 12473 + Math.floor(Math.random() * 20 - 10),
          newCustomers: 342 + Math.floor(Math.random() * 10 - 5),
          retentionRate: 78.5 + (Math.random() * 1 - 0.5),
          avgLifetimeValue: 1247.89 + Math.floor(Math.random() * 50 - 25)
        }
      case 'financial':
        return {
          totalRevenue: 5231800 + Math.floor(Math.random() * 100000 - 50000),
          netProfit: 1247800 + Math.floor(Math.random() * 50000 - 25000),
          profitMargin: 23.8 + (Math.random() * 0.5 - 0.25),
          cashFlow: 892300 + Math.floor(Math.random() * 20000 - 10000)
        }
      default:
        return {}
    }
  }

  /**
   * Broadcast data to relevant subscribers
   */
  private broadcastToSubscribers(data: RealTimeData): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.type === data.type || subscription.type === 'all') {
        // Apply filters if specified
        if (subscription.filters && !this.matchesFilters(data, subscription.filters)) {
          return
        }

        try {
          subscription.callback(data)
        } catch (error) {
          console.error(`Error in subscription callback for ${subscription.id}:`, error)
        }
      }
    })
  }

  /**
   * Check if data matches subscription filters
   */
  private matchesFilters(data: RealTimeData, filters: Record<string, any>): boolean {
    // Simple filter implementation - can be extended
    for (const [key, value] of Object.entries(filters)) {
      if (data.data[key] !== value) {
        return false
      }
    }
    return true
  }

  /**
   * Send subscription message to server
   */
  private sendSubscription(subscription: Subscription): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        subscription: {
          id: subscription.id,
          type: subscription.type,
          filters: subscription.filters
        }
      }))
    }
  }

  /**
   * Send unsubscribe message to server
   */
  private sendUnsubscription(subscriptionId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        subscriptionId
      }))
    }
  }

  /**
   * Handle connection reconnection
   */
  private handleReconnect(): void {
    if (this.config.reconnectAttempts >= this.config.maxRetries) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.config.reconnectAttempts++

    console.log(`Attempting to reconnect in ${this.config.reconnectDelay}ms (attempt ${this.config.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.config.reconnectDelay)
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }))
      }
    }, 30000) // 30 seconds
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const realTimeService = new RealTimeService()

// Export types and utilities
export { RealTimeService }

// React hook for using real-time data
export const useRealTimeData = (type: string, callback: (data: RealTimeData) => void, filters?: Record<string, any>) => {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to real-time updates
    const id = realTimeService.subscribe(type, callback, filters)
    setSubscriptionId(id)

    // Cleanup on unmount
    return () => {
      if (id) {
        realTimeService.unsubscribe(id)
      }
    }
  }, [type, callback, filters])

  return subscriptionId
}
