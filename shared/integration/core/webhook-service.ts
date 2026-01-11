/**
 * KiTS Hub Webhook Service
 * Handles webhook event processing, retry logic, and delivery
 */

import { WebhookEvent, WebhookEventType } from './types';
import { AuthService } from './auth';

export interface WebhookSubscription {
  id: string;
  tenant_id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  subscription_id: string;
  event_id: string;
  attempt: number;
  status: 'pending' | 'delivered' | 'failed';
  response_status?: number;
  response_body?: string;
  error_message?: string;
  next_retry_at?: string;
  delivered_at?: string;
  created_at: string;
}

export class WebhookService {
  private static instance: WebhookService;
  private authService: AuthService;
  private subscriptions: Map<string, WebhookSubscription[]> = new Map();
  private deliveryQueue: WebhookDelivery[] = [];
  private processing = false;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.startDeliveryProcessor();
  }

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Subscribe to webhook events
   */
  async subscribe(subscription: Omit<WebhookSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<WebhookSubscription> {
    const newSubscription: WebhookSubscription = {
      ...subscription,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const tenantSubscriptions = this.subscriptions.get(subscription.tenant_id) || [];
    tenantSubscriptions.push(newSubscription);
    this.subscriptions.set(subscription.tenant_id, tenantSubscriptions);

    return newSubscription;
  }

  /**
   * Unsubscribe from webhook events
   */
  async unsubscribe(tenantId: string, subscriptionId: string): Promise<boolean> {
    const tenantSubscriptions = this.subscriptions.get(tenantId) || [];
    const index = tenantSubscriptions.findIndex(sub => sub.id === subscriptionId);
    
    if (index === -1) {
      return false;
    }

    tenantSubscriptions.splice(index, 1);
    this.subscriptions.set(tenantId, tenantSubscriptions);
    return true;
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: Omit<WebhookEvent, 'id' | 'timestamp' | 'signature' | 'retry_count'>): Promise<void> {
    const webhookEvent: WebhookEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      signature: '',
      retry_count: 0
    };

    const subscriptions = this.getSubscriptionsForEvent(event.tenant_id, event.event);
    
    for (const subscription of subscriptions) {
      if (!subscription.active) continue;

      const signedEvent = {
        ...webhookEvent,
        signature: this.authService.generateWebhookSignature(
          JSON.stringify(webhookEvent),
          subscription.secret
        )
      };

      const delivery: WebhookDelivery = {
        id: this.generateId(),
        subscription_id: subscription.id,
        event_id: webhookEvent.id,
        attempt: 1,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      this.deliveryQueue.push(delivery);
    }
  }

  /**
   * Get subscriptions for specific event
   */
  private getSubscriptionsForEvent(tenantId: string, event: string): WebhookSubscription[] {
    const tenantSubscriptions = this.subscriptions.get(tenantId) || [];
    return tenantSubscriptions.filter(sub => 
      sub.active && (sub.events.includes('*') || sub.events.includes(event))
    );
  }

  /**
   * Start delivery processor
   */
  private startDeliveryProcessor(): void {
    setInterval(() => {
      if (!this.processing && this.deliveryQueue.length > 0) {
        this.processDeliveryQueue();
      }
    }, 1000); // Process every second
  }

  /**
   * Process delivery queue
   */
  private async processDeliveryQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      const pendingDeliveries = this.deliveryQueue.filter(d => 
        d.status === 'pending' && 
        (!d.next_retry_at || new Date(d.next_retry_at) <= new Date())
      );

      for (const delivery of pendingDeliveries) {
        await this.processDelivery(delivery);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual delivery
   */
  private async processDelivery(delivery: WebhookDelivery): Promise<void> {
    const subscription = this.findSubscription(delivery.subscription_id);
    if (!subscription) {
      delivery.status = 'failed';
      delivery.error_message = 'Subscription not found';
      return;
    }

    try {
      const event = this.getEvent(delivery.event_id);
      if (!event) {
        delivery.status = 'failed';
        delivery.error_message = 'Event not found';
        return;
      }

      const response = await this.deliverWebhook(subscription, event);
      
      delivery.response_status = response.status;
      delivery.response_body = await response.text();
      
      if (response.ok) {
        delivery.status = 'delivered';
        delivery.delivered_at = new Date().toISOString();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      delivery.error_message = error.message;
      delivery.attempt++;
      
      if (delivery.attempt >= subscription.retry_count + 1) {
        delivery.status = 'failed';
      } else {
        delivery.next_retry_at = this.calculateRetryTime(delivery.attempt);
      }
    }
  }

  /**
   * Deliver webhook to subscription URL
   */
  private async deliverWebhook(subscription: WebhookSubscription, event: WebhookEvent): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-ID': event.id,
      'X-Webhook-Event': event.event,
      'X-Webhook-Timestamp': event.timestamp,
      'X-Webhook-Signature': event.signature,
      'User-Agent': 'KiTS-Hub-Webhook/1.0'
    };

    return fetch(subscription.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
  }

  /**
   * Calculate retry time using exponential backoff
   */
  private calculateRetryTime(attempt: number): string {
    const baseDelay = 1000; // 1 second
    const maxDelay = 300000; // 5 minutes
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const retryTime = new Date(Date.now() + delay);
    return retryTime.toISOString();
  }

  /**
   * Find subscription by ID
   */
  private findSubscription(subscriptionId: string): WebhookSubscription | undefined {
    for (const subscriptions of this.subscriptions.values()) {
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      if (subscription) return subscription;
    }
    return undefined;
  }

  /**
   * Get event by ID (in production, this would query database)
   */
  private getEvent(eventId: string): WebhookEvent | undefined {
    // In production, this would retrieve from database
    // For demo, returning mock event
    return {
      id: eventId,
      event: WebhookEventType.PRODUCT_CREATED,
      data: { id: '123', name: 'Test Product' },
      tenant_id: 'tenant-123',
      timestamp: new Date().toISOString(),
      signature: 'mock-signature'
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get webhook statistics
   */
  getStats(tenantId?: string): {
    total_subscriptions: number;
    active_subscriptions: number;
    pending_deliveries: number;
    failed_deliveries: number;
    successful_deliveries: number;
  } {
    let allSubscriptions: WebhookSubscription[] = [];
    
    if (tenantId) {
      allSubscriptions = this.subscriptions.get(tenantId) || [];
    } else {
      for (const subscriptions of this.subscriptions.values()) {
        allSubscriptions.push(...subscriptions);
      }
    }

    const pendingDeliveries = this.deliveryQueue.filter(d => d.status === 'pending').length;
    const failedDeliveries = this.deliveryQueue.filter(d => d.status === 'failed').length;
    const successfulDeliveries = this.deliveryQueue.filter(d => d.status === 'delivered').length;

    return {
      total_subscriptions: allSubscriptions.length,
      active_subscriptions: allSubscriptions.filter(sub => sub.active).length,
      pending_deliveries: pendingDeliveries,
      failed_deliveries: failedDeliveries,
      successful_deliveries: successfulDeliveries
    };
  }

  /**
   * Get delivery history
   */
  getDeliveryHistory(subscriptionId: string, limit: number = 50): WebhookDelivery[] {
    return this.deliveryQueue
      .filter(d => d.subscription_id === subscriptionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<boolean> {
    const delivery = this.deliveryQueue.find(d => d.id === deliveryId);
    if (!delivery || delivery.status !== 'failed') {
      return false;
    }

    delivery.status = 'pending';
    delivery.attempt = 1;
    delivery.next_retry_at = undefined;
    delivery.error_message = undefined;
    
    return true;
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, updates: Partial<WebhookSubscription>): Promise<boolean> {
    for (const subscriptions of this.subscriptions.values()) {
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      if (subscription) {
        Object.assign(subscription, updates);
        subscription.updated_at = new Date().toISOString();
        return true;
      }
    }
    return false;
  }
}
