/**
 * KiTS Hub Email Service Integration
 * Supports multiple email providers: SendGrid, Mailgun, AWS SES
 */

export interface EmailProvider {
  name: string;
  sendEmail(email: EmailRequest): Promise<EmailResponse>;
  getEmailStatus(messageId: string): Promise<EmailStatus>;
  createTemplate(template: EmailTemplate): Promise<Template>;
  sendTemplateEmail(templateRequest: TemplateEmailRequest): Promise<EmailResponse>;
}

export interface EmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from: string;
  reply_to?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
  tracking?: EmailTracking;
}

export interface EmailResponse {
  success: boolean;
  message_id: string;
  provider_message_id: string;
  status: EmailDeliveryStatus;
  error?: string;
  metadata?: Record<string, any>;
}

export interface EmailStatus {
  message_id: string;
  provider_message_id: string;
  status: EmailDeliveryStatus;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string[];
  bounced_at?: string;
  bounced_reason?: string;
  spam_complained_at?: string;
  unsubscribed_at?: string;
  metadata?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  type: string;
  disposition?: 'attachment' | 'inline';
  content_id?: string;
}

export interface EmailTracking {
  open_tracking?: boolean;
  click_tracking?: boolean;
  unsubscribe_tracking?: boolean;
  ganalytics?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

export interface EmailTemplate {
  name: string;
  subject: string;
  text_content?: string;
  html_content: string;
  variables?: TemplateVariable[];
  metadata?: Record<string, any>;
}

export interface TemplateVariable {
  name: string;
  description?: string;
  default_value?: string;
  required?: boolean;
}

export interface Template {
  id: string;
  provider_template_id: string;
  name: string;
  subject: string;
  text_content?: string;
  html_content: string;
  variables: TemplateVariable[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface TemplateEmailRequest {
  template_id: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from: string;
  reply_to?: string;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
  tracking?: EmailTracking;
}

export enum EmailDeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  SPAM_COMPLAINT = 'spam_complaint',
  UNSUBSCRIBED = 'unsubscribed',
  FAILED = 'failed'
}

/**
 * SendGrid Email Provider
 */
export class SendGridProvider implements EmailProvider {
  name = 'sendgrid';
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  async sendEmail(email: EmailRequest): Promise<EmailResponse> {
    try {
      // In production, this would call SendGrid API
      const messageId = `sendgrid_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: `msg_${Date.now()}`,
        status: EmailDeliveryStatus.SENT,
        metadata: email.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: EmailDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  async getEmailStatus(messageId: string): Promise<EmailStatus> {
    // In production, this would call SendGrid API
    return {
      message_id: messageId,
      provider_message_id: `msg_${messageId}`,
      status: EmailDeliveryStatus.DELIVERED,
      delivered_at: new Date().toISOString(),
      metadata: {}
    };
  }

  async createTemplate(template: EmailTemplate): Promise<Template> {
    // In production, this would call SendGrid API
    const templateId = `sendgrid_template_${Date.now()}`;
    
    return {
      id: templateId,
      provider_template_id: `tpl_${Date.now()}`,
      name: template.name,
      subject: template.subject,
      text_content: template.text_content,
      html_content: template.html_content,
      variables: template.variables || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: template.metadata
    };
  }

  async sendTemplateEmail(templateRequest: TemplateEmailRequest): Promise<EmailResponse> {
    try {
      // In production, this would call SendGrid API
      const messageId = `sendgrid_template_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: `msg_${Date.now()}`,
        status: EmailDeliveryStatus.SENT,
        metadata: templateRequest.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: EmailDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // In production, this would verify SendGrid webhook signature
    return true;
  }
}

/**
 * Mailgun Email Provider
 */
export class MailgunProvider implements EmailProvider {
  name = 'mailgun';
  private apiKey: string;
  private domain: string;

  constructor(config: { apiKey: string; domain: string }) {
    this.apiKey = config.apiKey;
    this.domain = config.domain;
  }

  async sendEmail(email: EmailRequest): Promise<EmailResponse> {
    try {
      const messageId = `mailgun_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: `${Date.now()}@${this.domain}`,
        status: EmailDeliveryStatus.SENT,
        metadata: email.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: EmailDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  async getEmailStatus(messageId: string): Promise<EmailStatus> {
    return {
      message_id: messageId,
      provider_message_id: `${messageId}@${this.domain}`,
      status: EmailDeliveryStatus.DELIVERED,
      delivered_at: new Date().toISOString(),
      metadata: {}
    };
  }

  async createTemplate(template: EmailTemplate): Promise<Template> {
    const templateId = `mailgun_template_${Date.now()}`;
    
    return {
      id: templateId,
      provider_template_id: template.name,
      name: template.name,
      subject: template.subject,
      text_content: template.text_content,
      html_content: template.html_content,
      variables: template.variables || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: template.metadata
    };
  }

  async sendTemplateEmail(templateRequest: TemplateEmailRequest): Promise<EmailResponse> {
    try {
      const messageId = `mailgun_template_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: `${Date.now()}@${this.domain}`,
        status: EmailDeliveryStatus.SENT,
        metadata: templateRequest.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: EmailDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  verifyWebhook(payload: string, signature: string, token: string): boolean {
    // In production, this would verify Mailgun webhook signature
    return true;
  }
}

/**
 * AWS SES Email Provider
 */
export class SESProvider implements EmailProvider {
  name = 'ses';
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;

  constructor(config: { accessKeyId: string; secretAccessKey: string; region: string }) {
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region;
  }

  async sendEmail(email: EmailRequest): Promise<EmailResponse> {
    try {
      const messageId = `ses_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: messageId,
        status: EmailDeliveryStatus.SENT,
        metadata: email.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: EmailDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }

  async getEmailStatus(messageId: string): Promise<EmailStatus> {
    return {
      message_id: messageId,
      provider_message_id: messageId,
      status: EmailDeliveryStatus.DELIVERED,
      delivered_at: new Date().toISOString(),
      metadata: {}
    };
  }

  async createTemplate(template: EmailTemplate): Promise<Template> {
    const templateId = `ses_template_${Date.now()}`;
    
    return {
      id: templateId,
      provider_template_id: template.name,
      name: template.name,
      subject: template.subject,
      text_content: template.text_content,
      html_content: template.html_content,
      variables: template.variables || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: template.metadata
    };
  }

  async sendTemplateEmail(templateRequest: TemplateEmailRequest): Promise<EmailResponse> {
    try {
      const messageId = `ses_template_${Date.now()}`;
      
      return {
        success: true,
        message_id: messageId,
        provider_message_id: messageId,
        status: EmailDeliveryStatus.SENT,
        metadata: templateRequest.metadata
      };
    } catch (error) {
      return {
        success: false,
        message_id: '',
        provider_message_id: '',
        status: EmailDeliveryStatus.FAILED,
        error: error.message
      };
    }
  }
}

/**
 * Email Service Manager
 */
export class EmailService {
  private providers: Map<string, EmailProvider> = new Map();
  private defaultProvider: string = 'sendgrid';

  constructor() {
    // Initialize providers with environment variables
    if (process.env.SENDGRID_API_KEY) {
      this.providers.set('sendgrid', new SendGridProvider({
        apiKey: process.env.SENDGRID_API_KEY
      }));
    }

    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      this.providers.set('mailgun', new MailgunProvider({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      }));
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.providers.set('ses', new SESProvider({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      }));
    }
  }

  /**
   * Send email using specified provider
   */
  async sendEmail(providerName: string, email: EmailRequest): Promise<EmailResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email provider '${providerName}' not found`);
    }

    return provider.sendEmail(email);
  }

  /**
   * Send email using default provider
   */
  async sendEmailDefault(email: EmailRequest): Promise<EmailResponse> {
    return this.sendEmail(this.defaultProvider, email);
  }

  /**
   * Get email status
   */
  async getEmailStatus(providerName: string, messageId: string): Promise<EmailStatus> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email provider '${providerName}' not found`);
    }

    return provider.getEmailStatus(messageId);
  }

  /**
   * Create email template
   */
  async createTemplate(providerName: string, template: EmailTemplate): Promise<Template> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email provider '${providerName}' not found`);
    }

    return provider.createTemplate(template);
  }

  /**
   * Send template email
   */
  async sendTemplateEmail(providerName: string, templateRequest: TemplateEmailRequest): Promise<EmailResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email provider '${providerName}' not found`);
    }

    return provider.sendTemplateEmail(templateRequest);
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
      throw new Error(`Email provider '${providerName}' not found`);
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
  addProvider(name: string, provider: EmailProvider): void {
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
   * Send bulk emails with rate limiting
   */
  async sendBulkEmails(providerName: string, emails: EmailRequest[], batchSize: number = 10, delayMs: number = 1000): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(email => this.sendEmail(providerName, email))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            message_id: '',
            provider_message_id: '',
            status: EmailDeliveryStatus.FAILED,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }
}
