import { Notification, NotificationDeliveryResult, NotificationChannel } from '../types/index.js';

export interface EmailChannelConfig {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
    from: string;
  };
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey;
    from: string;
  };
  mailgun?: {
    domain: string;
    apiKey: string;
    from: string;
  };
  templates: {
    html?: string;
    text?: string;
  };
  rateLimit: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
}

export class EmailChannel {
  private config: EmailChannelConfig;
  private rateLimitTracker: Map<string, number[]> = new Map();

  constructor(config: EmailChannelConfig) {
    this.config = config;
  }

  /**
   * Send notification via email
   */
  async send(notification: Notification): Promise<NotificationDeliveryResult> {
    try {
      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          channel: NotificationChannel.EMAIL,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'Rate limit exceeded'
        };
      }

      // Get recipient email from user preferences or notification metadata
      const recipient = this.getRecipientEmail(notification);
      if (!recipient) {
        return {
          success: false,
          channel: NotificationChannel.EMAIL,
          notificationId: notification.id,
          timestamp: new Date(),
          error: 'No recipient email address'
        };
      }

      // Generate email content
      const emailContent = this.generateEmailContent(notification);

      // Send email based on provider
      await this.sendEmail(recipient, emailContent, notification);

      return {
        success: true,
        channel: NotificationChannel.EMAIL,
        notificationId: notification.id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.EMAIL,
        notificationId: notification.id,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(
    recipient: string, 
    content: EmailContent, 
    notification: Notification
  ): Promise<void> {
    switch (this.config.provider) {
      case 'smtp':
        await this.sendViaSMTP(recipient, content, notification);
        break;
      case 'sendgrid':
        await this.sendViaSendGrid(recipient, content, notification);
        break;
      case 'ses':
        await this.sendViaSES(recipient, content, notification);
        break;
      case 'mailgun':
        await this.sendViaMailgun(recipient, content, notification);
        break;
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  /**
   * Send email via SMTP
   */
  private async sendViaSMTP(
    recipient: string, 
    content: EmailContent, 
    notification: Notification
  ): Promise<void> {
    // This would require nodemailer or similar library
    // For now, we'll simulate the email sending
    console.log('Sending SMTP email to:', recipient);
    console.log('Subject:', content.subject);
    console.log('HTML content length:', content.html?.length || 0);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(
    recipient: string, 
    content: EmailContent, 
    notification: Notification
  ): Promise<void> {
    if (!this.config.sendgrid) {
      throw new Error('SendGrid configuration not provided');
    }

    console.log('Sending SendGrid email to:', recipient);
    console.log('From:', this.config.sendgrid.from);
    console.log('Subject:', content.subject);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Send email via AWS SES
   */
  private async sendViaSES(
    recipient: string, 
    content: EmailContent, 
    notification: Notification
  ): Promise<void> {
    if (!this.config.ses) {
      throw new Error('SES configuration not provided');
    }

    console.log('Sending SES email to:', recipient);
    console.log('Region:', this.config.ses.region);
    console.log('From:', this.config.ses.from);
    
    // Simulate AWS SDK call
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  /**
   * Send email via Mailgun
   */
  private async sendViaMailgun(
    recipient: string, 
    content: EmailContent, 
    notification: Notification
  ): Promise<void> {
    if (!this.config.mailgun) {
      throw new Error('Mailgun configuration not provided');
    }

    console.log('Sending Mailgun email to:', recipient);
    console.log('Domain:', this.config.mailgun.domain);
    console.log('From:', this.config.mailgun.from);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  /**
   * Generate email content
   */
  private generateEmailContent(notification: Notification): EmailContent {
    const subject = this.generateSubject(notification);
    const html = this.generateHtmlContent(notification);
    const text = this.generateTextContent(notification);

    return { subject, html, text };
  }

  /**
   * Generate email subject
   */
  private generateSubject(notification: Notification): string {
    const prefix = this.getSubjectPrefix(notification.type);
    return `${prefix}: ${notification.title}`;
  }

  /**
   * Get subject prefix based on notification type
   */
  private getSubjectPrefix(type: string): string {
    const prefixes = {
      info: 'ℹ️ Info',
      success: '✅ Success',
      warning: '⚠️ Warning',
      error: '❌ Error',
      system: '🔧 System'
    };
    return prefixes[type as keyof typeof prefixes] || '📢 Notification';
  }

  /**
   * Generate HTML email content
   */
  private generateHtmlContent(notification: Notification): string {
    const template = this.config.templates.html || this.getDefaultHtmlTemplate();
    
    return template
      .replace('{{title}}', this.escapeHtml(notification.title))
      .replace('{{message}}', this.escapeHtml(notification.message))
      .replace('{{type}}', notification.type)
      .replace('{{priority}}', notification.priority)
      .replace('{{createdAt}}', notification.createdAt.toLocaleString())
      .replace('{{source}}', notification.source || 'KiTS Hub')
      .replace('{{category}}', notification.category || 'General')
      .replace('{{actions}}', this.generateActionsHtml(notification.actions))
      .replace('{{attachments}}', this.generateAttachmentsHtml(notification.attachments))
      .replace('{{footer}}', this.generateFooter());
  }

  /**
   * Generate text email content
   */
  private generateTextContent(notification: Notification): string {
    const template = this.config.templates.text || this.getDefaultTextTemplate();
    
    return template
      .replace('{{title}}', notification.title)
      .replace('{{message}}', notification.message)
      .replace('{{type}}', notification.type)
      .replace('{{priority}}', notification.priority)
      .replace('{{createdAt}}', notification.createdAt.toLocaleString())
      .replace('{{source}}', notification.source || 'KiTS Hub')
      .replace('{{category}}', notification.category || 'General')
      .replace('{{actions}}', this.generateActionsText(notification.actions))
      .replace('{{attachments}}', this.generateAttachmentsText(notification.attachments))
      .replace('{{footer}}', this.generateFooter());
  }

  /**
   * Generate actions HTML
   */
  private generateActionsHtml(actions: any[]): string {
    if (actions.length === 0) return '';
    
    return `
      <div style="margin-top: 20px;">
        <h4>Actions:</h4>
        ${actions.map(action => `
          <a href="#" style="display: inline-block; margin: 5px; padding: 8px 16px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px;">
            ${this.escapeHtml(action.label)}
          </a>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate actions text
   */
  private generateActionsText(actions: any[]): string {
    if (actions.length === 0) return '';
    
    return `
Actions:
${actions.map(action => `- ${action.label}`).join('\n')}
    `.trim();
  }

  /**
   * Generate attachments HTML
   */
  private generateAttachmentsHtml(attachments: any[]): string {
    if (attachments.length === 0) return '';
    
    return `
      <div style="margin-top: 20px;">
        <h4>Attachments:</h4>
        ${attachments.map(attachment => `
          <div style="margin: 5px 0;">
            <a href="${attachment.url}" style="color: #2196F3; text-decoration: none;">
              📎 ${this.escapeHtml(attachment.name)}
            </a>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate attachments text
   */
  private generateAttachmentsText(attachments: any[]): string {
    if (attachments.length === 0) return '';
    
    return `
Attachments:
${attachments.map(attachment => `- ${attachment.name}: ${attachment.url}`).join('\n')}
    `.trim();
  }

  /**
   * Generate email footer
   */
  private generateFooter(): string {
    return `
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        This notification was sent by KiTS Hub. 
        <a href="#" style="color: #666;">Manage notification preferences</a>
      </p>
    `;
  }

  /**
   * Get default HTML template
   */
  private getDefaultHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #2196F3; padding-bottom: 10px; }
        .content { margin: 20px 0; }
        .footer { border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #666; }
        .type-{{type}} { border-left: 4px solid #2196F3; padding-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{{title}}</h2>
            <p><strong>Type:</strong> {{type}} | <strong>Priority:</strong> {{priority}}</p>
            <p><strong>Source:</strong> {{source}} | <strong>Category:</strong> {{category}}</p>
            <p><strong>Date:</strong> {{createdAt}}</p>
        </div>
        <div class="content type-{{type}}">
            <p>{{message}}</p>
            {{actions}}
            {{attachments}}
        </div>
        <div class="footer">
            {{footer}}
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Get default text template
   */
  private getDefaultTextTemplate(): string {
    return `
{{title}}

Type: {{type}} | Priority: {{priority}}
Source: {{source}} | Category: {{category}}
Date: {{createdAt}}

{{message}}

{{actions}}

{{attachments}}

{{footer}}
    `;
  }

  /**
   * Get recipient email address
   */
  private getRecipientEmail(notification: Notification): string | null {
    // Try to get email from notification metadata
    if (notification.metadata?.email) {
      return notification.metadata.email;
    }

    // Try to get email from user preferences (would need to be injected)
    if (notification.metadata?.userEmail) {
      return notification.metadata.userEmail;
    }

    return null;
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const key = 'email';
    let timestamps = this.rateLimitTracker.get(key) || [];

    // Remove old timestamps
    const oneMinuteAgo = now - 60000;
    timestamps = timestamps.filter(timestamp => timestamp > oneMinuteAgo);

    // Check rate limits
    if (timestamps.length >= this.config.rateLimit.maxPerMinute) {
      return false;
    }

    // Add current timestamp
    timestamps.push(now);
    this.rateLimitTracker.set(key, timestamps);

    return true;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

interface EmailContent {
  subject: string;
  html?: string;
  text?: string;
}
