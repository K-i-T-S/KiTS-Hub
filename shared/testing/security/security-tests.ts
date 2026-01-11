/**
 * Security Testing Suite for KiTS Hub
 * Comprehensive security vulnerability testing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TestDatabaseFactory } from '../integration/test-database';

describe('Security Tests', () => {
  let testId: string;
  let authToken: string;

  beforeAll(async () => {
    TestDatabaseFactory.initialize({
      url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
      anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
      serviceKey: process.env.TEST_SUPABASE_SERVICE_KEY || 'test-service-key',
      schema: 'test_schema',
    });
  });

  beforeEach(async () => {
    testId = `security-test-${Date.now()}`;
    await TestDatabaseFactory.setupTest(testId, 'basic');
    
    // Get auth token
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${testId}@example.com`,
        password: 'test-password',
      }),
    });
    
    const data = await response.json();
    authToken = data.token;
  });

  afterEach(async () => {
    await TestDatabaseFactory.cleanupTest(testId);
  });

  afterAll(async () => {
    await TestDatabaseFactory.closeAll();
  });

  describe('Authentication Security', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousInputs = [
        "admin'--",
        "admin' OR '1'='1",
        "admin'; DROP TABLE users;--",
        "' OR '1'='1' --",
        "'; EXEC xp_cmdshell('dir'); --",
      ];

      for (const input of maliciousInputs) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: input,
            password: 'password',
          }),
        });

        // Should reject malicious input
        expect(response.status).toBe(401);
        
        const data = await response.json();
        expect(data).not.toHaveProperty('token');
      }
    });

    it('should enforce rate limiting on authentication', async () => {
      const requests = Array.from({ length: 20 }, () =>
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrong-password',
          }),
        })
      );

      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      );

      // Should rate limit after multiple failed attempts
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should validate JWT token integrity', async () => {
      // Test with malformed token
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': 'Bearer malformed.jwt.token',
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.valid).toBe(false);
    });

    it('should prevent token reuse after logout', async () => {
      // Logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Try to reuse token
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Security', () => {
    it('should enforce tenant isolation', async () => {
      // Create another tenant
      const otherTestId = `other-${Date.now()}`;
      await TestDatabaseFactory.setupTest(otherTestId, 'basic');

      // Try to access other tenant's data
      const response = await fetch('/api/inventory/products', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': `tenant-${otherTestId}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(403);
      
      await TestDatabaseFactory.cleanupTest(otherTestId);
    });

    it('should prevent privilege escalation', async () => {
      // Try to access admin endpoints as regular user
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(403);
    });

    it('should validate role-based access control', async () => {
      const protectedEndpoints = [
        '/api/admin/users',
        '/api/admin/tenants',
        '/api/admin/system-settings',
        '/api/billing/subscriptions',
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Regular user should not access admin endpoints
        expect([403, 404]).toContain(response.status);
      }
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent XSS attacks', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
        '<svg onload="alert(\'xss\')">',
      ];

      for (const payload of xssPayloads) {
        const response = await fetch('/api/inventory/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: payload,
            sku: `XSS-${testId}`,
            category: 'Test',
            price: 99.99,
            cost: 50.00,
            current_stock: 100,
            reorder_point: 10,
          }),
        });

        if (response.status === 201) {
          const data = await response.json();
          // Should sanitize input
          expect(data.name).not.toContain('<script>');
          expect(data.name).not.toContain('javascript:');
          expect(data.name).not.toContain('onerror');
        }
      }
    });

    it('should prevent CSRF attacks', async () => {
      // Test without CSRF token
      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          // Missing CSRF token
        },
        body: JSON.stringify({
          name: 'CSRF Test Product',
          sku: `CSRF-${testId}`,
          category: 'Test',
          price: 99.99,
        }),
      });

      // Should require CSRF token for state-changing operations
      expect([400, 403]).toContain(response.status);
    });

    it('should validate input types and formats', async () => {
      const invalidInputs = [
        { name: '', sku: '', price: -100, cost: 'invalid' },
        { name: 'A'.repeat(1000), sku: 'A'.repeat(500), price: 'invalid', cost: null },
        { name: null, sku: undefined, price: NaN, cost: Infinity },
      ];

      for (const input of invalidInputs) {
        const response = await fetch('/api/inventory/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        expect(response.status).toBe(400);
        
        const data = await response.json();
        expect(data).toHaveProperty('errors');
        expect(Array.isArray(data.errors)).toBe(true);
      }
    });
  });

  describe('Data Privacy Security', () => {
    it('should mask sensitive information in responses', async () => {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      // Should not expose sensitive fields
      expect(data).not.toHaveProperty('password');
      expect(data).not.toHaveProperty('password_hash');
      expect(data).not.toHaveProperty('internal_notes');
    });

    it('should handle GDPR data deletion requests', async () => {
      // Create customer data
      const createResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `gdpr-test-${testId}@example.com`,
          first_name: 'GDPR',
          last_name: 'Test',
        }),
      });

      const customer = await createResponse.json();

      // Request data deletion
      const deleteResponse = await fetch(`/api/customers/${customer.id}/delete-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(deleteResponse.status).toBe(200);

      // Verify data is deleted
      const getResponse = await fetch(`/api/customers/${customer.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(getResponse.status).toBe(404);
    });

    it('should provide data export functionality', async () => {
      const response = await fetch('/api/customers/export', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('personal_data');
      expect(data).toHaveProperty('export_timestamp');
      expect(data).toHaveProperty('format');
    });
  });

  describe('API Security', () => {
    it('should implement proper CORS headers', async () => {
      const response = await fetch('/api/inventory/products', {
        headers: {
          'Origin': 'https://malicious-site.com',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should have proper CORS headers
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).not.toBe('*');
      expect(corsHeader).toBe(process.env.ALLOWED_ORIGIN || 'http://localhost:3000');
    });

    it('should enforce secure headers', async () => {
      const response = await fetch('/api/inventory/products', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should have security headers
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Strict-Transport-Security')).toBeDefined();
    });

    it('should prevent API enumeration', async () => {
      const endpoints = [
        '/api/admin',
        '/api/internal',
        '/api/debug',
        '/api/config',
        '/api/backup',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        // Should not expose internal endpoints
        expect([404, 403]).toContain(response.status);
      }
    });
  });

  describe('Session Security', () => {
    it('should implement secure session management', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${testId}@example.com`,
          password: 'test-password',
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('expires_in');
      expect(data).toHaveProperty('token_type');
      
      // Token should be JWT
      const tokenParts = data.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should handle session expiration', async () => {
      // Simulate expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      const response = await fetch('/api/inventory/products', {
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
    });

    it('should implement secure token storage', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${testId}@example.com`,
          password: 'test-password',
        }),
      });

      const data = await response.json();
      
      // Token should not be stored in insecure cookies
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        expect(setCookieHeader).toContain('HttpOnly');
        expect(setCookieHeader).toContain('Secure');
        expect(setCookieHeader).toContain('SameSite');
      }
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types and sizes', async () => {
      const maliciousFiles = [
        { name: 'malware.exe', type: 'application/octet-stream', size: 10000000 },
        { name: 'script.php', type: 'application/x-php', size: 1000 },
        { name: 'huge.jpg', type: 'image/jpeg', size: 50000000 }, // 50MB
      ];

      for (const file of maliciousFiles) {
        const formData = new FormData();
        const blob = new Blob(['test'], { type: file.type });
        formData.append('file', blob, file.name);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });

        expect([400, 413]).toContain(response.status);
      }
    });

    it('should scan uploaded files for malware', async () => {
      // Simulate malware upload
      const formData = new FormData();
      const maliciousBlob = new Blob(['X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'], { 
        type: 'text/plain' 
      });
      formData.append('file', maliciousBlob, 'eicar.txt');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      // Should detect and block malware
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('malware' || 'virus');
    });
  });

  describe('Webhook Security', () => {
    it('should verify webhook signatures', async () => {
      const webhookData = {
        event: 'test.event',
        data: { test: 'data' },
      };

      // Test without signature
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Missing X-Webhook-Signature
        },
        body: JSON.stringify(webhookData),
      });

      expect(response.status).toBe(401);

      // Test with invalid signature
      const invalidResponse = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'invalid-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect(invalidResponse.status).toBe(401);
    });

    it('should prevent webhook replay attacks', async () => {
      const webhookData = {
        event: 'test.event',
        data: { test: 'data' },
        timestamp: Date.now() - 300000, // 5 minutes ago
      };

      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'valid-signature',
        },
        body: JSON.stringify(webhookData),
      });

      // Should reject old timestamps
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      const response = await fetch('/api/inventory/products/invalid-id', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      // Should not expose internal details
      expect(data.error).not.toContain('database');
      expect(data.error).not.toContain('SQL');
      expect(data.error).not.toContain('stack trace');
      expect(data.error).not.toContain('internal');
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedRequests = [
        { headers: { 'Content-Type': 'application/json' }, body: 'invalid-json' },
        { headers: {}, body: JSON.stringify({}) }, // Missing content-type
        { headers: { 'Content-Type': 'application/xml' }, body: '<xml></xml>' },
      ];

      for (const request of malformedRequests) {
        const response = await fetch('/api/inventory/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            ...request.headers,
          },
          body: request.body,
        });

        expect([400, 415]).toContain(response.status);
      }
    });
  });
});
