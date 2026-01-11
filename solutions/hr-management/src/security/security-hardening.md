# KiTS Hub Security Hardening Guide

This document outlines comprehensive security measures for KiTS Hub multi-tenant SaaS platform, following industry best practices and modern security standards.

## Overview

Security in KiTS Hub encompasses multiple layers: application security, infrastructure security, data protection, and compliance. Our approach follows defense-in-depth principles with zero-trust architecture.

## 1. Application Security

### Authentication & Authorization

#### Multi-Factor Authentication (MFA)
```typescript
// shared/security/auth/mfa.ts
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export class MFAService {
  static generateSecret(): string {
    return speakeasy.generateSecret({
      name: 'KiTS Hub',
      issuer: 'KiTS Hub',
      length: 32
    });
  }

  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
      time: 30
    });
  }

  static generateQRCode(secret: string): string {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: 'KiTS Hub',
      issuer: 'KiTS Hub'
    });
    return qrcode.toDataURL(otpauthUrl);
  }

  static async enableMFA(userId: string, secret: string): Promise<void> {
    await database.users.update({
      mfa_secret: secret,
      mfa_enabled: true
    }, {
      where: { id: userId }
    });
  }
}
```

#### Role-Based Access Control (RBAC)
```typescript
// shared/security/auth/rbac.ts
export interface Permission {
  resource: string;
  action: string;
  scope?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  inherits?: string[];
}

export const roles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    permissions: [
      { resource: '*', action: '*' }, // All permissions
    ]
  },
  {
    id: 'tenant_admin',
    name: 'Tenant Administrator',
    permissions: [
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' },
      { resource: 'tenants', action: 'read' },
      { resource: 'tenants', action: 'update' },
      { resource: 'billing', action: 'read' },
    ],
    inherits: ['tenant_user']
  },
  {
    id: 'tenant_user',
    name: 'Tenant User',
    permissions: [
      { resource: 'products', action: 'read' },
      { resource: 'products', action: 'create' },
      { resource: 'products', action: 'update', scope: 'own' },
      { resource: 'sales', action: 'read' },
      { resource: 'sales', action: 'create' },
      { resource: 'sales', action: 'update', scope: 'own' },
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      { resource: '*', action: 'read' },
    ]
  }
];

export class RBACService {
  static hasPermission(userRole: string, permission: Permission): boolean {
    const role = roles.find(r => r.id === userRole);
    if (!role) return false;

    return this.checkPermission(role, permission);
  }

  private static checkPermission(role: Role, permission: Permission): boolean {
    // Direct permission check
    if (role.permissions.some(p => 
      p.resource === permission.resource && 
      (p.action === permission.action || p.action === '*')
    )) {
      return true;
    }

    // Check inherited roles
    if (role.inherits) {
      for (const inheritedRoleId of role.inherits) {
        const inheritedRole = roles.find(r => r.id === inheritedRoleId);
        if (inheritedRole && this.checkPermission(inheritedRole, permission)) {
          return true;
        }
      }
    }

    return false;
  }

  static canAccessResource(userRole: string, resource: string, action: string, resourceId?: string, userId?: string): boolean {
    const permission = { resource, action, scope: resourceId ? 'own' : undefined };
    
    // Check if user owns the resource
    if (resourceId && userId) {
      const isOwner = await this.checkResourceOwnership(userId, resourceId, resource);
      if (!isOwner && permission.scope === 'own') {
        return false;
      }
    }

    return this.hasPermission(userRole, permission);
  }

  private static async checkResourceOwnership(userId: string, resourceId: string, resource: string): Promise<boolean> {
    // Implement resource ownership check based on resource type
    switch (resource) {
      case 'products':
        const result = await database.products.select('created_by').where('id', resourceId).first();
        return result?.created_by === userId;
      case 'sales':
        const saleResult = await database.sales.select('user_id').where('id', resourceId).first();
        return saleResult?.user_id === userId;
      default:
        return false;
    }
  }
}
```

#### Session Management
```typescript
// shared/security/auth/session.ts
import crypto from 'crypto';
import { SignJWT, verifyJWT } from 'jose';

interface SessionData {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

export class SessionService {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly MAX_SESSIONS_PER_USER = 3;

  static async createSession(user: any, tenantId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const sessionData: SessionData = {
      userId: user.id,
      tenantId,
      role: user.role,
      permissions: user.permissions || [],
      sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT,
    };

    // Store session in Redis
    await redis.setex(
      `session:${sessionId}`,
      this.SESSION_TIMEOUT / 1000,
      JSON.stringify(sessionData)
    );

    // Clean up old sessions
    await this.cleanupOldSessions(user.id);

    // Generate JWT
    const token = await this.signJWT(sessionData);

    return token;
  }

  static async validateSession(token: string): Promise<SessionData | null> {
    try {
      const payload = await this.verifyJWT(token);
      
      // Check if session exists in Redis
      const sessionData = await redis.get(`session:${payload.sessionId}`);
      if (!sessionData) {
        return null;
      }

      const session: SessionData = JSON.parse(sessionData);
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        await redis.del(`session:${payload.sessionId}`);
        return null;
      }

      return session;
    } catch (error) {
      return null;
    }
  }

  static async revokeSession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  }

  private static async cleanupOldSessions(userId: string): Promise<void> {
    const pattern = 'session:*';
    const sessions = await redis.keys(pattern);
    
    for (const sessionKey of sessions) {
      const sessionData = await redis.get(sessionKey);
      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData);
        if (session.userId === userId) {
          await redis.del(sessionKey);
        }
      }
    }
  }

  private static async signJWT(payload: SessionData): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const alg = 'HS256';
    
    return await new SignJWT(alg)
      .setProtectedHeader({ alg: alg })
      .setProtectedHeader({ typ: 'JWT' })
      .setPayload(payload)
      .sign(secret);
  }

  private static async verifyJWT(token: string): Promise<any> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const alg = 'HS256';
    
    const { payload } = await jwtVerify(token, secret, { alg });
    return payload;
  }
}
```

## 2. Data Protection

### Encryption at Rest and in Transit
```typescript
// shared/security/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  static generateKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  static encrypt(text: string, key: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipher(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, key, Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static encryptSensitiveData(data: any, tenantKey: string): any {
    const sensitiveFields = ['email', 'phone', 'address', 'credit_card', 'bank_account'];
    
    const encryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field]) {
        const encrypted = this.encrypt(data[field], tenantKey);
        encryptedData[field] = encrypted;
      }
    }
    
    return encryptedData;
  }

  static decryptSensitiveData(encryptedData: any, tenantKey: string): any {
    const sensitiveFields = ['email', 'phone', 'address', 'credit_card', 'bank_account'];
    
    const decryptedData = { ...encryptedData };
    
    for (const field of sensitiveFields) {
      if (encryptedData[field] && typeof encryptedData[field] === 'object') {
        const decrypted = this.decrypt(encryptedData[field], tenantKey);
        decryptedData[field] = decrypted;
      }
    }
    
    return decryptedData;
  }
}
```

### Data Masking for Logs
```typescript
// shared/security/data-masking.ts
export class DataMaskingService {
  private static readonly SENSITIVE_PATTERNS = [
    { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '****-****-****-****' }, // Credit card
    { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, replacement: '***-**-****' }, // Social security
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '***@***.com' }, // Email
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '***-**-****' }, // Phone
  ];

  static maskSensitiveData(data: string): string {
    let maskedData = data;
    
    for (const { pattern, replacement } of this.SENSITIVE_PATTERNS) {
      maskedData = maskedData.replace(pattern, replacement);
    }
    
    return maskedData;
  }

  static maskPII(data: any): any {
    if (typeof data === 'string') {
      return this.maskSensitiveData(data);
    }
    
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      
      for (const key in masked) {
        if (typeof masked[key] === 'string') {
          masked[key] = this.maskSensitiveData(masked[key]);
        }
      }
      
      return masked;
    }
    
    return data;
  }
}
```

## 3. Infrastructure Security

### Network Security
```yaml
# security/nginx/security.conf
server {
    # Hide server version
    server_tokens off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_req zone $binary_remote_addr zone=one:10m burst=20 nodelay;
    
    # IP whitelist for admin access
    geo $admin_whitelist {
        default 0;
        192.168.1.0/24 10;
        10.0.0.0/8 10;
    }
    
    # Restrict admin endpoints
    location /admin {
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;
        
        # Require client certificate
        ssl_verify_client on;
        ssl_client_certificate /etc/nginx/ssl/admin.crt;
        ssl_client_certificate_key /etc/nginx/ssl/admin.key;
    }
    
    # DDoS protection
    client_max_body_size 10M;
    client_body_timeout 12s;
    client_header_timeout 12s;
    keepalive_timeout 15s;
    send_timeout 10s;
}
```

### Database Security
```sql
-- Database security configurations
-- Row Level Security policies
ALTER DATABASE kits_hub SET row_security = on;

-- Enable audit logging
ALTER DATABASE kits_hub SET log_statement = 'all';
ALTER DATABASE kits_hub SET log_min_duration_statement = 1000;

-- Create audit trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            table_name,
            operation,
            user_id,
            tenant_id,
            old_values,
            new_values,
            timestamp
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_setting('app.current_user_id'),
            current_setting('app.current_tenant_id'),
            row_to_json(OLD),
            row_to_json(NEW),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_sales_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Container Security
```dockerfile
# Docker security best practices
FROM node:20-alpine AS builder

# Create non-root user
RUN addgroup -g kitsuser && adduser -D -s -g kitsuser kitsuser

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY --chown=kitsuser:kitsuser . .

# Switch to non-root user
USER kitsuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose only necessary ports
EXPOSE 3000

# Security scan
RUN npm audit --audit-level=high
```

## 4. API Security

### Input Validation and Sanitization
```typescript
// shared/security/api/validation.ts
import Joi from 'joi';
import DOMPurify from 'dompurify';

export class ValidationService {
  static validateProductInput(input: any): { error?: string; value?: any } {
    const schema = Joi.object({
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(1000).optional(),
      sku: Joi.string().alphanum().min(3).max(50).required(),
      price: Joi.number().positive().max(999999.99).required(),
      cost: Joi.number().positive().max(999999.99).required(),
      category: Joi.string().max(100).optional(),
      tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    });

    const { error, value } = schema.validate(input);
    
    if (error) {
      return { error: error.details[0].message };
    }

    // Sanitize HTML content
    if (value.description) {
      value.description = DOMPurify.sanitize(value.description);
    }

    return { value };
  }

  static validateUserInput(input: any): { error?: string; value?: any } {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]).required(),
      firstName: Joi.string().min(1).max(100).required(),
      lastName: Joi.string().min(1).max(100).required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).optional(),
    });

    const { error, value } = schema.validate(input);
    
    if (error) {
      return { error: error.details[0].message };
    }

    return { value };
  }

  static sanitizeSQL(input: string): string {
    // Remove SQL injection patterns
    return input.replace(/['"\\;\\x00]|(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\\b)/gi, '');
  }

  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTR: ['class', 'id'],
    });
  }
}
```

### API Rate Limiting
```typescript
// shared/security/api/rate-limiting.ts
import Redis from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimitingService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async isAllowed(key: string, config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean up old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const current = await this.redis.zcard(key);
    
    if (current >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + config.windowMs
      };
    }

    // Add current request
    await this.redis.zadd(key, now, this.generateRequestId());
    
    // Set expiration
    await this.redis.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - current,
      resetTime: now + config.windowMs
    };
  }

  async createRateLimitMiddleware(config: RateLimitConfig) {
    return async (req: any, res: any, next: any) => {
      const key = `rate_limit:${req.ip}:${req.path}`;
      const result = await this.isAllowed(key, config);
      
      if (!result.allowed) {
        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
        });
        
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`
        });
      }
      
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
      });
      
      next();
    };
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

## 5. Compliance and Privacy

### GDPR Compliance
```typescript
// shared/security/compliance/gdpr.ts
export class GDPRService {
  static async handleDataSubjectRequest(requestType: 'access' | 'portability' | 'deletion', userId: string, tenantId: string): Promise<any> {
    switch (requestType) {
      case 'access':
        return this.exportUserData(userId, tenantId);
      
      case 'portability':
        return this.exportUserDataPortable(userId, tenantId);
      
      case 'deletion':
        return this.deleteUserData(userId, tenantId);
      
      default:
        throw new Error('Invalid request type');
    }
  }

  private static async exportUserData(userId: string, tenantId: string): Promise<any> {
    const userData = {
      personal: await this.getPersonalData(userId, tenantId),
      transactions: await this.getTransactionData(userId, tenantId),
      preferences: await this.getPreferencesData(userId, tenantId),
      exportDate: new Date().toISOString(),
    };

    // Log the export
    await this.logDataExport(userId, tenantId, 'access');

    return userData;
  }

  private static async deleteUserData(userId: string, tenantId: string): Promise<void> {
    // Anonymize instead of delete where required for business purposes
    await this.anonymizeUserData(userId, tenantId);
    
    // Delete truly personal data
    await this.deletePersonalData(userId, tenantId);
    
    // Log the deletion
    await this.logDataExport(userId, tenantId, 'deletion');
  }

  private static async logDataExport(userId: string, tenantId: string, type: string): Promise<void> {
    await database.audit_log.insert({
      user_id: userId,
      tenant_id: tenantId,
      action: `gdpr_${type}`,
      timestamp: new Date(),
      details: `GDPR ${type} request processed`
    });
  }
}
```

### Data Retention Policy
```typescript
// shared/security/compliance/retention.ts
export class DataRetentionService {
  private static readonly RETENTION_POLICIES = {
    user_sessions: { days: 30, reason: 'Security' },
    audit_logs: { days: 365, reason: 'Compliance' },
    transaction_data: { days: 2555, reason: 'Legal' }, // 7 years
    personal_data: { days: 365, reason: 'Privacy' },
    system_logs: { days: 90, reason: 'Operational' },
  };

  static async cleanupExpiredData(): Promise<void> {
    const now = new Date();
    
    for (const [dataType, policy] of Object.entries(this.RETENTION_POLICIES)) {
      const cutoffDate = new Date(now.getTime() - (policy.days * 24 * 60 * 60 * 1000));
      
      await this.cleanupDataType(dataType, cutoffDate);
    }
  }

  private static async cleanupDataType(dataType: string, cutoffDate: Date): Promise<void> {
    switch (dataType) {
      case 'user_sessions':
        await database.user_sessions.delete().where('created_at', '<', cutoffDate);
        break;
        
      case 'audit_logs':
        await database.audit_log.delete().where('timestamp', '<', cutoffDate);
        break;
        
      case 'transaction_data':
        // Archive instead of delete for legal reasons
        await this.archiveTransactionData(cutoffDate);
        break;
        
      default:
        console.warn(`Unknown data type: ${dataType}`);
    }
  }

  private static async archiveTransactionData(cutoffDate: Date): Promise<void> {
    // Implement archiving logic for long-term storage
    const oldTransactions = await database.sales.select('*').where('created_at', '<', cutoffDate);
    
    // Move to archive storage
    for (const transaction of oldTransactions) {
      await archiveStorage.store(`transaction_${transaction.id}`, transaction);
    }
  }
}
```

## 6. Security Monitoring

### Intrusion Detection
```typescript
// shared/security/monitoring/intrusion.ts
export class IntrusionDetectionService {
  static detectSuspiciousPatterns(logs: any[]): any[] {
    const alerts = [];
    
    for (const log of logs) {
      // Multiple failed logins
      if (this.detectMultipleFailedLogins(log)) {
        alerts.push({
          type: 'multiple_failed_logins',
          severity: 'high',
          message: 'Multiple failed login attempts detected',
          data: log
        });
      }

      // Unusual access patterns
      if (this.detectUnusualAccess(log)) {
        alerts.push({
          type: 'unusual_access',
          severity: 'medium',
          message: 'Unusual access pattern detected',
          data: log
        });
      }

      // Potential SQL injection
      if (this.detectSQLInjection(log)) {
        alerts.push({
          type: 'sql_injection',
          severity: 'critical',
          message: 'Potential SQL injection attempt',
          data: log
        });
      }
    }

    return alerts;
  }

  private static detectMultipleFailedLogins(log: any): boolean {
    const failedLogins = log.filter(entry => 
      entry.event === 'login_failed' && 
      entry.timestamp > Date.now() - (5 * 60 * 1000) // Last 5 minutes
    );
    
    return failedLogins.length >= 5;
  }

  private static detectUnusualAccess(log: any): boolean {
    // Implement unusual access pattern detection
    // Example: Access from unusual geographic location
    // Example: Access at unusual time
    // Example: Access from new IP address
    return false;
  }

  private static detectSQLInjection(log: any): boolean {
    const sqlPatterns = [
      /union.*select/i,
      /select.*from.*information_schema/i,
      /drop.*table/i,
      /insert.*into.*values/i,
      /exec.*sp_/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(log.message || log.query));
  }
}
```

### Vulnerability Scanning
```bash
#!/bin/bash
# security/scripts/vulnerability-scan.sh

echo "Starting vulnerability scan..."

# npm audit for JavaScript dependencies
echo "Scanning JavaScript dependencies..."
npm audit --audit-level=high --json > security-reports/npm-audit.json

# OWASP ZAP for web application security
echo "Scanning web application..."
docker run -t owasp/zap2docker-stable \
  zap-baseline.py \
  -t http://localhost:3000 \
  -J security-reports/zap-report.json

# Semgrep for static code analysis
echo "Running static code analysis..."
semgrep --config=auto \
  --json \
  --output=security-reports/semgrep-report.json \
  src/

# Trivy for container security
echo "Scanning container images..."
trivy image --format json --output security-reports/trivy-report.json kits-hub:latest

echo "Vulnerability scan completed. Reports saved to security-reports/"
```

## 7. Security Best Practices

### Development Security
- **Secure Coding**: Follow OWASP guidelines
- **Dependency Management**: Regular updates and vulnerability scanning
- **Code Review**: Peer review for all security changes
- **Static Analysis**: Automated code scanning
- **Secret Management**: Never commit secrets to version control

### Operational Security
- **Least Privilege**: Users have minimum necessary permissions
- **Regular Updates**: Keep all systems patched
- **Backup Security**: Encrypted backups with secure storage
- **Access Controls**: Multi-factor authentication for admin access
- **Monitoring**: Real-time security monitoring and alerting

### Incident Response
- **Detection**: Automated threat detection
- **Analysis**: Security incident investigation
- **Containment**: Isolate affected systems
- **Eradication**: Remove threats and vulnerabilities
- **Recovery**: Restore normal operations
- **Lessons Learned**: Post-incident analysis and improvement

This comprehensive security hardening guide ensures KiTS Hub maintains the highest security standards while protecting customer data and maintaining compliance with industry regulations.
