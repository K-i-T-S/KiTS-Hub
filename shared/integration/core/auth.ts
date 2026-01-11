/**
 * KiTS Hub Authentication Service
 * Handles shared authentication and authorization across all solutions
 */

import * as crypto from 'node:crypto';
import { TenantContext, IntegrationErrorCode } from './types';

export class AuthService {
  private static instance: AuthService;
  private tenantKeys: Map<string, string> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {
    this.initializeTenantKeys();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeTenantKeys(): void {
    // In production, these would be loaded from secure storage
    // For demo purposes, using in-memory storage
    const tenants = process.env.TENANT_KEYS ? JSON.parse(process.env.TENANT_KEYS) : {};
    
    Object.entries(tenants).forEach(([tenantId, apiKey]) => {
      this.tenantKeys.set(tenantId, apiKey as string);
    });
  }

  /**
   * Validate tenant authentication
   */
  validateTenant(context: TenantContext): { valid: boolean; tenantId?: string; error?: string } {
    try {
      // Check if tenant exists
      const storedApiKey = this.tenantKeys.get(context.tenant_id);
      if (!storedApiKey) {
        return { valid: false, error: 'Tenant not found' };
      }

      // Validate API key
      if (storedApiKey !== context.api_key) {
        return { valid: false, error: 'Invalid API key' };
      }

      // Validate signature
      const expectedSignature = this.generateSignature(context);
      if (expectedSignature !== context.signature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Check timestamp (prevent replay attacks - 5 minute window)
      const now = Date.now();
      const timestampDiff = Math.abs(now - context.timestamp);
      if (timestampDiff > 5 * 60 * 1000) {
        return { valid: false, error: 'Request timestamp expired' };
      }

      // Check rate limits
      const rateLimitResult = this.checkRateLimit(context.tenant_id);
      if (!rateLimitResult.allowed) {
        return { valid: false, error: 'Rate limit exceeded' };
      }

      return { valid: true, tenantId: context.tenant_id };
    } catch (error) {
      return { valid: false, error: 'Authentication validation failed' };
    }
  }

  /**
   * Generate HMAC signature for API requests
   */
  generateSignature(context: Omit<TenantContext, 'signature'>): string {
    const apiKey = this.tenantKeys.get(context.tenant_id);
    if (!apiKey) {
      throw new Error('Tenant not found');
    }

    const message = `${context.tenant_id}:${context.api_key}:${context.timestamp}`;
    return crypto
      .createHmac('sha256', apiKey)
      .update(message)
      .digest('hex');
  }

  /**
   * Create tenant context for API calls
   */
  createTenantContext(tenantId: string, apiKey: string): TenantContext {
    const timestamp = Date.now();
    const signature = this.generateSignature({
      tenant_id: tenantId,
      api_key: apiKey,
      timestamp
    });

    return {
      tenant_id: tenantId,
      api_key: apiKey,
      timestamp,
      signature
    };
  }

  /**
   * Check rate limits for tenant
   */
  private checkRateLimit(tenantId: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = this.getRateLimitForTenant(tenantId);

    const current = this.rateLimits.get(tenantId);
    
    if (!current || now > current.resetTime) {
      // New window or expired window
      this.rateLimits.set(tenantId, {
        count: 1,
        resetTime: now + windowMs
      });
      return { allowed: true, resetTime: now + windowMs };
    }

    if (current.count >= maxRequests) {
      return { allowed: false, resetTime: current.resetTime };
    }

    current.count++;
    return { allowed: true, resetTime: current.resetTime };
  }

  /**
   * Get rate limit based on tenant plan
   */
  private getRateLimitForTenant(tenantId: string): number {
    // In production, this would check tenant's subscription plan
    // For demo, returning standard limit
    const plan = this.getTenantPlan(tenantId);
    
    switch (plan) {
      case 'enterprise':
        return 10000; // Unlimited for practical purposes
      case 'premium':
        return 500;
      case 'standard':
      default:
        return 100;
    }
  }

  /**
   * Get tenant subscription plan
   */
  private getTenantPlan(tenantId: string): string {
    // In production, this would query the database
    // For demo, returning standard plan
    return 'standard';
  }

  /**
   * Add new tenant
   */
  addTenant(tenantId: string, apiKey: string): void {
    this.tenantKeys.set(tenantId, apiKey);
  }

  /**
   * Remove tenant
   */
  removeTenant(tenantId: string): void {
    this.tenantKeys.delete(tenantId);
    this.rateLimits.delete(tenantId);
  }

  /**
   * Regenerate API key for tenant
   */
  regenerateApiKey(tenantId: string): string {
    const newApiKey = this.generateApiKey();
    this.tenantKeys.set(tenantId, newApiKey);
    return newApiKey;
  }

  /**
   * Generate random API key
   */
  private generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate webhook signature
   */
  generateWebhookSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(context: TenantContext): Record<string, string> {
    return {
      'X-Tenant-ID': context.tenant_id,
      'X-API-Key': context.api_key,
      'X-Timestamp': context.timestamp.toString(),
      'X-Signature': context.signature,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Extract tenant context from headers
   */
  extractTenantFromHeaders(headers: Record<string, string>): TenantContext | null {
    try {
      const tenantId = headers['x-tenant-id'];
      const apiKey = headers['x-api-key'];
      const timestamp = headers['x-timestamp'];
      const signature = headers['x-signature'];

      if (!tenantId || !apiKey || !timestamp || !signature) {
        return null;
      }

      return {
        tenant_id: tenantId,
        api_key: apiKey,
        timestamp: parseInt(timestamp),
        signature
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Middleware for Express.js
   */
  authMiddleware() {
    return (req: any, res: any, next: any) => {
      const context = this.extractTenantFromHeaders(req.headers);
      
      if (!context) {
        return res.status(401).json({
          success: false,
          error: {
            code: IntegrationErrorCode.INVALID_TENANT,
            message: 'Missing authentication headers'
          }
        });
      }

      const validation = this.validateTenant(context);
      
      if (!validation.valid) {
        return res.status(401).json({
          success: false,
          error: {
            code: IntegrationErrorCode.INVALID_API_KEY,
            message: validation.error
          }
        });
      }

      req.tenantId = validation.tenantId;
      req.tenantContext = context;
      next();
    };
  }
}
