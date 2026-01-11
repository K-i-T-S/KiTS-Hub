/**
 * KiTS Hub SMS Service Integration
 * Supports multiple SMS providers: Twilio, Vonage, AWS SNS
 */

export interface SMSProvider {
  name: string;
  sendSMS(sms: SMSRequest): Promise<SMSResponse>;
  getSMSStatus(messageId: string): Promise<SMSStatus>;
  getDeliveryReport(messageId: string): Promise<DeliveryReport>;
}

export interface SMSRequest {
  to: string | string[];
  from?: string;
  body: string;
  media_urls?: string[];
  status_callback_url?: string;
  metadata?: Record<string, any>;
  scheduled_for?: string;
  validity_period?: number;
}

export interface SMSResponse {
  success: boolean;
  message_id: string;
  provider_message_id: string;
  status: SMSDeliveryStatus;
  error?: string;
  cost?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface SMSStatus {
  message_id: string;
  provider_message_id: string;
  status: SMSDeliveryStatus;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_code?: string;
  error_message?: string;
  cost?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface DeliveryReport {
  message_id: string;
  provider_message_id: string;
  status: SMSDeliveryStatus;
  segments: number;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_code?: string;
  error_message?: string;
  carrier?: string;
  cost?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export enum SMSDeliveryStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  UNDELIVERED = 'undelivered',
  FAILED = 'failed',
  RECEIVED = 'received',
  READ = 'read'
}

/**
 * Twilio SMS Provider
 */
export class TwilioProvider implements SMSProvider {
  name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(config: { accountSid: string; authToken: string; fromNumber: string }) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
  }

  async sendSMS(sms: SMSRequest): Promise<SMSResponse> {
    try {
      // In production, this would call Twilio API
      const messageId = `twilio_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: `SM_${Date.now()}`,
        status: SMSDeliveryStatus.SENT,
        cost: 0.0799, // Twilio SMS cost
        currency: 'USD',
        metadata: sms.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: SMSDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  async getSMSStatus(messageId: string): Promise<SMSStatus> {
    // In production, this would call Twilio API
    return {
      message_id: messageId,
      provider_message_id: `SM_${messageId}`,
      status: SMSDeliveryStatus.DELIVERED,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      cost: 0.0799,
      currency: 'USD',
      metadata: {}
    };
  }

  async getDeliveryReport(messageId: string): Promise<DeliveryReport> {
    return {
      message_id: messageId,
      provider_message_id: `SM_${messageId}`,
      status: SMSDeliveryStatus.DELIVERED,
      segments: 1,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      carrier: 'Verizon Wireless',
      cost: 0.0799,
      currency: 'USD',
      metadata: {}
    };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // In production, this would verify Twilio webhook signature
    return true;
  }
}

/**
 * Vonage (Nexmo) SMS Provider
 */
export class VonageProvider implements SMSProvider {
  name = 'vonage';
  private apiKey: string;
  private apiSecret: string;
  private fromNumber: string;

  constructor(config: { apiKey: string; apiSecret: string; fromNumber: string }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.fromNumber = config.fromNumber;
  }

  async sendSMS(sms: SMSRequest): Promise<SMSResponse> {
    try {
      const messageId = `vonage_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: `${Date.now()}-abcd`,
        status: SMSDeliveryStatus.SENT,
        cost: 0.0666, // Vonage SMS cost
        currency: 'EUR',
        metadata: sms.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: SMSDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  async getSMSStatus(messageId: string): Promise<SMSStatus> {
    return {
      message_id: messageId,
      provider_message_id: `${messageId}-abcd`,
      status: SMSDeliveryStatus.DELIVERED,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      cost: 0.0666,
      currency: 'EUR',
      metadata: {}
    };
  }

  async getDeliveryReport(messageId: string): Promise<DeliveryReport> {
    return {
      message_id: messageId,
      provider_message_id: `${messageId}-abcd`,
      status: SMSDeliveryStatus.DELIVERED,
      segments: 1,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      carrier: 'T-Mobile',
      cost: 0.0666,
      currency: 'EUR',
      metadata: {}
    };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // In production, this would verify Vonage webhook signature
    return true;
  }
}

/**
 * AWS SNS SMS Provider
 */
export class SNSProvider implements SMSProvider {
  name = 'sns';
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;

  constructor(config: { accessKeyId: string; secretAccessKey: string; region: string }) {
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region;
  }

  async sendSMS(sms: SMSRequest): Promise<SMSResponse> {
    try {
      const messageId = `sns_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: messageId,
        status: SMSDeliveryStatus.SENT,
        cost: 0.0645, // AWS SNS SMS cost
        currency: 'USD',
        metadata: sms.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: SMSDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  async getSMSStatus(messageId: string): Promise<SMSStatus> {
    return {
      message_id: messageId,
      provider_message_id: messageId,
      status: SMSDeliveryStatus.DELIVERED,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      cost: 0.0645,
      currency: 'USD',
      metadata: {}
    };
  }

  async getDeliveryReport(messageId: string): Promise<DeliveryReport> {
    return {
      message_id: messageId,
      provider_message_id: messageId,
      status: SMSDeliveryStatus.DELIVERED,
      segments: 1,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      carrier: 'AT&T',
      cost: 0.0645,
      currency: 'USD',
      metadata: {}
    };
  }
}

/**
 * SMS Service Manager
 */
export class SMSService {
  private providers: Map<string, SMSProvider> = new Map();
  private defaultProvider: string = 'twilio';

  constructor() {
    // Initialize providers with environment variables
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.providers.set('twilio', new TwilioProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER || ''
      }));
    }

    if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
      this.providers.set('vonage', new VonageProvider({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET,
        fromNumber: process.env.VONAGE_FROM_NUMBER || ''
      }));
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.providers.set('sns', new SNSProvider({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      }));
    }
  }

  /**
   * Send SMS using specified provider
   */
  async sendSMS(providerName: string, sms: SMSRequest): Promise<SMSResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`SMS provider '${providerName}' not found`);
    }

    return provider.sendSMS(sms);
  }

  /**
   * Send SMS using default provider
   */
  async sendSMSDefault(sms: SMSRequest): Promise<SMSResponse> {
    return this.sendSMS(this.defaultProvider, sms);
  }

  /**
   * Get SMS status
   */
  async getSMSStatus(providerName: string, messageId: string): Promise<SMSStatus> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`SMS provider '${providerName}' not found`);
    }

    return provider.getSMSStatus(messageId);
  }

  /**
   * Get delivery report
   */
  async getDeliveryReport(providerName: string, messageId: string): Promise<DeliveryReport> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`SMS provider '${providerName}' not found`);
    }

    return provider.getDeliveryReport(messageId);
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
      throw new Error(`SMS provider '${providerName}' not found`);
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
  addProvider(name: string, provider: SMSProvider): void {
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

  /**
   * Send bulk SMS with rate limiting
   */
  async sendBulkSMS(providerName: string, smsMessages: SMSRequest[], batchSize: number = 10, delayMs: number = 1000): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];
    
    for (let i = 0; i < smsMessages.length; i += batchSize) {
      const batch = smsMessages.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(sms => this.sendSMS(providerName, sms))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            message_id: '',
            provider_message_id: '',
            status: SMSDeliveryStatus.FAILED,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < smsMessages.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const e164Pattern = /^\+[1-9]\d{1,14}$/;
    return e164Pattern.test(phoneNumber);
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+1'): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If already in E.164 format, return as-is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Add country code if missing
    if (cleaned.length === 10) {
      return countryCode + cleaned;
    }
    
    // Return original if can't format
    return phoneNumber;
  }

  /**
   * Calculate SMS cost estimate
   */
  calculateCostEstimate(providerName: string, message: string, destinations: string[]): number {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`SMS provider '${providerName}' not found`);
    }

    // Estimate segments (160 characters per segment for GSM-7)
    const segments = Math.ceil(message.length / 160);
    
    // Base cost per segment (varies by provider and destination)
    const baseCostPerSegment = this.getBaseCostPerSegment(providerName);
    
    return segments * destinations.length * baseCostPerSegment;
  }

  /**
   * Get base cost per segment for provider
   */
  private getBaseCostPerSegment(providerName: string): number {
    switch (providerName) {
      case 'twilio':
        return 0.0799;
      case 'vonage':
        return 0.0666;
      case 'sns':
        return 0.0645;
      default:
        return 0.08;
    }
  }
}
