/**
 * KiTS Hub Payment Gateway Integration
 * Supports multiple payment providers: Stripe, PayPal, Square
 */

export interface PaymentProvider {
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  refundPayment(refundRequest: RefundRequest): Promise<RefundResponse>;
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
  createCustomer(customer: CustomerData): Promise<Customer>;
  updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<Customer>;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  payment_method: string;
  customer_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  receipt_email?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_id: string;
  provider_payment_id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  fee?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  payment_id: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  success: boolean;
  refund_id: string;
  provider_refund_id: string;
  status: RefundStatus;
  amount: number;
  currency: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaymentDetails {
  id: string;
  provider_payment_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  customer_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  fee?: number;
  refunds?: RefundDetails[];
  metadata?: Record<string, any>;
}

export interface RefundDetails {
  id: string;
  provider_refund_id: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CustomerData {
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Record<string, any>;
  payment_method?: string;
}

export interface Customer {
  id: string;
  provider_customer_id: string;
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  payment_methods?: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'digital_wallet';
  provider: string;
  provider_payment_method_id: string;
  customer_id: string;
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Stripe Payment Provider
 */
export class StripeProvider implements PaymentProvider {
  name = 'stripe';
  private apiKey: string;
  private webhookSecret: string;

  constructor(config: { apiKey: string; webhookSecret: string }) {
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would call Stripe API
      // For demo, returning mock response
      const paymentId = `stripe_payment_${Date.now()}`;
      
      return {
        success: true,
        payment_id: paymentId,
        provider_payment_id: `pi_${Date.now()}`,
        status: PaymentStatus.COMPLETED,
        amount: request.amount,
        currency: request.currency,
        fee: Math.round(request.amount * 0.029 + 30), // Stripe fee
        metadata: request.metadata
      };
    } catch (error) {
      return {
        success: false,
        payment_id: '',
        provider_payment_id: '',
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: request.currency,
        error: error.message
      };
    }
  }

  async refundPayment(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      // In production, this would call Stripe API
      const refundId = `stripe_refund_${Date.now()}`;
      
      return {
        success: true,
        refund_id: refundId,
        provider_refund_id: `re_${Date.now()}`,
        status: RefundStatus.COMPLETED,
        amount: refundRequest.amount || 0,
        currency: 'usd',
        metadata: refundRequest.metadata
      };
    } catch (error) {
      return {
        success: false,
        refund_id: '',
        provider_refund_id: '',
        status: RefundStatus.FAILED,
        amount: 0,
        currency: 'usd',
        error: error.message
      };
    }
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    // In production, this would call Stripe API
    return {
      id: paymentId,
      provider_payment_id: `pi_${paymentId}`,
      amount: 10000, // $100.00
      currency: 'usd',
      status: PaymentStatus.COMPLETED,
      payment_method: 'card',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fee: 290,
      refunds: []
    };
  }

  async createCustomer(customer: CustomerData): Promise<Customer> {
    // In production, this would call Stripe API
    const customerId = `stripe_customer_${Date.now()}`;
    
    return {
      id: customerId,
      provider_customer_id: `cus_${Date.now()}`,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      description: customer.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: customer.metadata,
      payment_methods: []
    };
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<Customer> {
    // In production, this would call Stripe API
    return {
      id: customerId,
      provider_customer_id: `cus_${customerId}`,
      email: updates.email,
      name: updates.name,
      phone: updates.phone,
      description: updates.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: updates.metadata,
      payment_methods: []
    };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // In production, this would verify Stripe webhook signature
    return true;
  }
}

/**
 * PayPal Payment Provider
 */
export class PayPalProvider implements PaymentProvider {
  name = 'paypal';
  private clientId: string;
  private clientSecret: string;
  private webhookSecret: string;

  constructor(config: { clientId: string; clientSecret: string; webhookSecret: string }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.webhookSecret = config.webhookSecret;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would call PayPal API
      const paymentId = `paypal_payment_${Date.now()}`;
      
      return {
        success: true,
        payment_id: paymentId,
        provider_payment_id: `PAY-${Date.now()}`,
        status: PaymentStatus.COMPLETED,
        amount: request.amount,
        currency: request.currency,
        fee: Math.round(request.amount * 0.034 + 49), // PayPal fee
        metadata: request.metadata
      };
    } catch (error) {
      return {
        success: false,
        payment_id: '',
        provider_payment_id: '',
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: request.currency,
        error: error.message
      };
    }
  }

  async refundPayment(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      const refundId = `paypal_refund_${Date.now()}`;
      
      return {
        success: true,
        refund_id: refundId,
        provider_refund_id: `REF-${Date.now()}`,
        status: RefundStatus.COMPLETED,
        amount: refundRequest.amount || 0,
        currency: 'usd',
        metadata: refundRequest.metadata
      };
    } catch (error) {
      return {
        success: false,
        refund_id: '',
        provider_refund_id: '',
        status: RefundStatus.FAILED,
        amount: 0,
        currency: 'usd',
        error: error.message
      };
    }
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    return {
      id: paymentId,
      provider_payment_id: `PAY-${paymentId}`,
      amount: 10000,
      currency: 'usd',
      status: PaymentStatus.COMPLETED,
      payment_method: 'paypal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fee: 389,
      refunds: []
    };
  }

  async createCustomer(customer: CustomerData): Promise<Customer> {
    const customerId = `paypal_customer_${Date.now()}`;
    
    return {
      id: customerId,
      provider_customer_id: `CUST-${Date.now()}`,
      email: customer.email,
      name: customer.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: customer.metadata,
      payment_methods: []
    };
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<Customer> {
    return {
      id: customerId,
      provider_customer_id: `CUST-${customerId}`,
      email: updates.email,
      name: updates.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: updates.metadata,
      payment_methods: []
    };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // In production, this would verify PayPal webhook signature
    return true;
  }
}

/**
 * Payment Gateway Manager
 */
export class PaymentGateway {
  private providers: Map<string, PaymentProvider> = new Map();
  private defaultProvider: string = 'stripe';

  constructor() {
    // Initialize providers with environment variables
    if (process.env.STRIPE_API_KEY) {
      this.providers.set('stripe', new StripeProvider({
        apiKey: process.env.STRIPE_API_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
      }));
    }

    if (process.env.PAYPAL_CLIENT_ID) {
      this.providers.set('paypal', new PayPalProvider({
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
        webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET || ''
      }));
    }
  }

  /**
   * Process payment using specified provider
   */
  async processPayment(providerName: string, request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }

    return provider.processPayment(request);
  }

  /**
   * Process payment using default provider
   */
  async processPaymentDefault(request: PaymentRequest): Promise<PaymentResponse> {
    return this.processPayment(this.defaultProvider, request);
  }

  /**
   * Refund payment
   */
  async refundPayment(providerName: string, refundRequest: RefundRequest): Promise<RefundResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }

    return provider.refundPayment(refundRequest);
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(providerName: string, paymentId: string): Promise<PaymentDetails> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }

    return provider.getPaymentDetails(paymentId);
  }

  /**
   * Create customer
   */
  async createCustomer(providerName: string, customer: CustomerData): Promise<Customer> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }

    return provider.createCustomer(customer);
  }

  /**
   * Update customer
   */
  async updateCustomer(providerName: string, customerId: string, updates: Partial<CustomerData>): Promise<Customer> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }

    return provider.updateCustomer(customerId, updates);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Set default provider
   */
  setDefaultProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }
    this.defaultProvider = providerName;
  }

  /**
   * Get default provider
   */
  getDefaultProvider(): string {
    return this.defaultProvider;
  }

  /**
   * Add custom provider
   */
  addProvider(name: string, provider: PaymentProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Remove provider
   */
  removeProvider(name: string): void {
    this.providers.delete(name);
    if (this.defaultProvider === name) {
      this.defaultProvider = this.providers.keys().next().value || '';
    }
  }
}
