import { EmailNotification } from '@/types/provisioning'

// Email service configuration
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'resend', // resend, sendgrid, ses
  apiKey: process.env.EMAIL_SERVICE_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@kits.com',
  fromName: process.env.FROM_NAME || 'KiTS Team',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.kits.com',
}

// Email templates
const emailTemplates = {
  waiting: {
    subject: 'Your KiTS Account - Initialization Started',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KiTS Account Initialization</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b21a8 0%, #9333ea 50%, #a855f7 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .status-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 20px 0; }
          .progress-step { display: flex; align-items: center; margin: 15px 0; }
          .step-number { width: 32px; height: 32px; background: #6b21a8; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
          .step-text { flex: 1; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .highlight { color: #6b21a8; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚀 KiTS Hub</div>
            <h1>Welcome to the Future of Business Management!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Thank you for choosing KiTS Hub! Your account initialization has begun and we're excited to get you set up with your personalized business management platform.</p>
            
            <div class="status-badge">
              🔄 Initialization Phase (12-72 hours)
            </div>
            
            <h3>What's happening now?</h3>
            <div class="progress-step">
              <div class="step-number">✓</div>
              <div class="step-text"><strong>Account created</strong> - Your customer account is ready</div>
            </div>
            <div class="progress-step">
              <div class="step-number">1</div>
              <div class="step-text"><strong>Queue position #${data.queuePosition}</strong> - You're in our provisioning queue</div>
            </div>
            <div class="progress-step">
              <div class="step-number">2</div>
              <div class="step-text"><strong>Backend setup</strong> - We're creating your dedicated infrastructure</div>
            </div>
            <div class="progress-step">
              <div class="step-number">3</div>
              <div class="step-text"><strong>Feature migration</strong> - Your selected solutions are being configured</div>
            </div>
            <div class="progress-step">
              <div class="step-number">4</div>
              <div class="step-text"><strong>Ready to use</strong> - You'll get notified when everything's ready</div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4>📊 Your Queue Status</h4>
              <p><strong>Estimated wait time:</strong> ${data.estimatedTime}</p>
              <p><strong>People ahead of you:</strong> ${data.aheadInQueue}</p>
              <p><strong>Your subscription:</strong> ${data.plan} plan</p>
            </div>
            
            <p>You can track your progress in real-time by visiting your dashboard:</p>
            <a href="${EMAIL_CONFIG.baseUrl}/onboarding/waiting?customer_id=${data.customerId}" class="btn">
              Track Your Progress
            </a>
            
            <h3>What happens next?</h3>
            <p>Our team is manually creating your dedicated Supabase instance to ensure the highest quality setup. This typically takes <span class="highlight">12-72 hours</span> depending on current demand.</p>
            
            <p>Once your backend is ready, we'll migrate all your selected features and send you a final "Ready to Use" notification email.</p>
            
            <div class="footer">
              <p>Need help? Reply to this email or visit our <a href="${EMAIL_CONFIG.baseUrl}/support">support center</a></p>
              <p style="margin-top: 10px; font-size: 12px;">
                © 2026 KiTS Hub. Transforming businesses with cutting-edge technology solutions.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  ready: {
    subject: '🎉 Your KiTS Account is Ready!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your KiTS Account is Ready!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 20px 0; }
          .feature-list { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { display: flex; align-items: center; margin: 10px 0; }
          .feature-icon { color: #10b981; margin-right: 10px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stat { text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .btn-secondary { display: inline-block; background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉 KiTS Hub</div>
            <h1>Your Account is Ready!</h1>
          </div>
          
          <div class="content">
            <h2>Congratulations ${data.customerName}!</h2>
            <p>Great news! Your KiTS Hub account has been successfully set up and is ready to use. Your personalized business management platform is now live.</p>
            
            <div class="success-badge">
              ✅ Setup Complete - Ready for Business!
            </div>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${data.setupTime}</div>
                <div>Setup Time</div>
              </div>
              <div class="stat">
                <div class="stat-number">${data.featuresCount}</div>
                <div>Features Activated</div>
              </div>
            </div>
            
            <h3>🚀 What's been set up for you:</h3>
            <div class="feature-list">
              ${data.features.map((feature: string) => `
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <strong>${feature.charAt(0).toUpperCase() + feature.slice(1)}</strong> - Fully configured and ready
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${EMAIL_CONFIG.baseUrl}/dashboard" class="btn">
                🎯 Go to Your Dashboard
              </a>
              <br>
              <a href="${EMAIL_CONFIG.baseUrl}/getting-started" class="btn-secondary">
                📚 View Getting Started Guide
              </a>
            </div>
            
            <h3>🎯 Next Steps:</h3>
            <ol>
              <li><strong>Log in to your dashboard</strong> - Access all your tools and settings</li>
              <li><strong>Import your data</strong> - Use our easy import tools for existing data</li>
              <li><strong>Configure your settings</strong> - Customize the platform to your needs</li>
              <li><strong>Invite your team</strong> - Add team members and set permissions</li>
            </ol>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h4>💡 Pro Tip:</h4>
              <p>Start with our <a href="${EMAIL_CONFIG.baseUrl}/getting-started">getting started guide</a> to make the most of your new KiTS Hub account. We also recommend scheduling a free onboarding call with our success team.</p>
            </div>
            
            <h3>🛠️ Need Help?</h3>
            <p>Our support team is here to help you succeed:</p>
            <ul>
              <li>📧 <a href="mailto:support@kits.com">support@kits.com</a> - Email support</li>
              <li>💬 <a href="${EMAIL_CONFIG.baseUrl}/chat">Live chat</a> - Instant help</li>
              <li>📚 <a href="${EMAIL_CONFIG.baseUrl}/docs">Documentation</a> - Guides and tutorials</li>
              <li>🎓 <a href="${EMAIL_CONFIG.baseUrl}/training">Free training</a> - Video courses</li>
            </ul>
            
            <div class="footer">
              <p>Welcome to the KiTS family! We're thrilled to have you with us.</p>
              <p style="margin-top: 10px; font-size: 12px;">
                © 2026 KiTS Hub. Transforming businesses with cutting-edge technology solutions.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  failed: {
    subject: 'Action Required: KiTS Account Setup Issue',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KiTS Account Setup Issue</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .alert-badge { background: #fee2e2; color: #991b1b; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚠️ KiTS Hub</div>
            <h1>Action Required</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>We encountered an issue while setting up your KiTS Hub account. Our team has been notified and is working to resolve this quickly.</p>
            
            <div class="alert-badge">
              ⚠️ Setup Issue Detected
            </div>
            
            <h3>What happened?</h3>
            <p>During the migration process, we encountered an issue that requires manual intervention. This could be due to:</p>
            <ul>
              <li>Temporary Supabase service issues</li>
              <li>Configuration conflicts</li>
              <li>Resource limitations</li>
            </ul>
            
            <h3>What we're doing:</h3>
            <p>Our technical team has been automatically notified and is working to resolve this issue. You don't need to do anything right now.</p>
            
            <h3>Next steps:</h3>
            <ol>
              <li>We'll resolve the issue and restart the migration process</li>
              <li>You'll receive a follow-up email within 24 hours</li>
              <li>If the issue persists, we'll contact you directly</li>
            </ol>
            
            <p>If you have any questions or need immediate assistance, please don't hesitate to contact our support team.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:support@kits.com?subject=Account Setup Issue - ${data.customerId}" class="btn">
                📧 Contact Support
              </a>
            </div>
            
            <div class="footer">
              <p>We apologize for any inconvenience and appreciate your patience.</p>
              <p style="margin-top: 10px; font-size: 12px;">
                © 2026 KiTS Hub. Transforming businesses with cutting-edge technology solutions.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  admin_alert: {
    subject: '🚨 New Customer Requires Provisioning',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Customer Provisioning Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .priority-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 20px 0; }
          .customer-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚨 KiTS Admin</div>
            <h1>New Customer Alert</h1>
          </div>
          
          <div class="content">
            <h2>New Customer Requires Provisioning</h2>
            <p>A new customer has signed up and is waiting for backend provisioning. Please review and claim this task.</p>
            
            <div class="priority-badge">
              Priority: ${data.priority}
            </div>
            
            <div class="customer-info">
              <h3>📋 Customer Information</h3>
              <p><strong>Company:</strong> ${data.companyName}</p>
              <p><strong>Contact:</strong> ${data.contactName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Plan:</strong> ${data.plan}</p>
              <p><strong>Queue Position:</strong> #${data.queuePosition}</p>
              <p><strong>Features:</strong> ${data.features.join(', ')}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${EMAIL_CONFIG.baseUrl}/admin/provisioning" class="btn">
                🎯 Go to Admin Dashboard
              </a>
            </div>
            
            <p>This customer has been in the queue since ${data.waitingTime}. Please claim this task promptly to maintain our SLA standards.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
}

export class EmailService {
  static async sendEmail(notification: EmailNotification): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailTemplates[notification.template as keyof typeof emailTemplates]
      
      if (!template) {
        throw new Error(`Email template not found: ${notification.template}`)
      }

      const htmlContent = template.html(notification.data)
      
      // Use Resend (or other email service)
      if (EMAIL_CONFIG.service === 'resend') {
        return await this.sendViaResend(notification.to, template.subject, htmlContent)
      } else if (EMAIL_CONFIG.service === 'sendgrid') {
        return await this.sendViaSendGrid(notification.to, template.subject, htmlContent)
      } else {
        // Fallback to console for development
        console.log('📧 Email would be sent:', {
          to: notification.to,
          subject: template.subject,
          template: notification.template,
          data: notification.data
        })
        return { success: true }
      }
    } catch (error) {
      console.error('Email sending error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown email error' 
      }
    }
  }

  private static async sendViaResend(
    to: string, 
    subject: string, 
    html: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
          to: [to],
          subject,
          html,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${error}`)
      }

      const data = await response.json()
      console.log('✅ Email sent via Resend:', data.id)
      return { success: true }
    } catch (error) {
      console.error('Resend error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Resend sending failed' 
      }
    }
  }

  private static async sendViaSendGrid(
    to: string, 
    subject: string, 
    html: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
          }],
          from: {
            email: EMAIL_CONFIG.fromEmail,
            name: EMAIL_CONFIG.fromName,
          },
          subject,
          content: [{
            type: 'text/html',
            value: html,
          }],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid API error: ${error}`)
      }

      console.log('✅ Email sent via SendGrid')
      return { success: true }
    } catch (error) {
      console.error('SendGrid error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'SendGrid sending failed' 
      }
    }
  }

  // Send welcome email to new customers
  static async sendWelcomeEmail(customerEmail: string, customerName: string): Promise<{ success: boolean; error?: string }> {
    return await this.sendEmail({
      to: customerEmail,
      template: 'waiting',
      data: {
        customerName,
        customerId: 'temp-id', // Would be actual customer ID
        queuePosition: 1,
        estimatedTime: '12-24 hours',
        aheadInQueue: 0,
        plan: 'Basic',
      }
    })
  }

  // Send ready notification
  static async sendReadyEmail(
    customerEmail: string, 
    customerName: string, 
    features: string[]
  ): Promise<{ success: boolean; error?: string }> {
    return await this.sendEmail({
      to: customerEmail,
      template: 'ready',
      data: {
        customerName,
        setupTime: '24 hours',
        featuresCount: features.length,
        features,
      }
    })
  }

  // Send admin alert for new customer
  static async sendAdminAlert(customerData: any): Promise<{ success: boolean; error?: string }> {
    // Send to all admin users
    const adminEmails = ['admin@kits.com', 'provisioning@kits.com'] // Would fetch from database
    
    const promises = adminEmails.map(email => 
      this.sendEmail({
        to: email,
        template: 'admin_alert',
        data: customerData
      })
    )

    const results = await Promise.allSettled(promises)
    const failures = results.filter(r => r.status === 'rejected')
    
    if (failures.length > 0) {
      return { 
        success: false, 
        error: `${failures.length} admin emails failed to send` 
      }
    }
    
    return { success: true }
  }
}
