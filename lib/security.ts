/**
 * Security utilities for input sanitization and XSS prevention
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption key (in production, this should come from environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only';
const ALGORITHM = 'aes-256-gcm';

// Simple email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password strength validation
export const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
}

/**
 * Simple HTML sanitization to prevent XSS attacks
 * Note: For production, consider using a proper library like DOMPurify
 */
export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and sanitize email input
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string } {
  const sanitized = email.trim().toLowerCase()
  return {
    isValid: EMAIL_REGEX.test(sanitized),
    sanitized
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!PASSWORD_REGEX.minLength.test(password)) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!PASSWORD_REGEX.hasUppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!PASSWORD_REGEX.hasLowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!PASSWORD_REGEX.hasNumber.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!PASSWORD_REGEX.hasSpecialChar.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize user input for general text fields
 */
export function sanitizeTextInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

/**
 * Generate a secure random token for CSRF protection
 * Note: In production, this should come from a secure server-side source
 */
export function generateCSRFToken(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder for now
    return 'server-token-placeholder'
  }
  
  // Client-side: use Web Crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Check if a URL is safe for redirection
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Rate limiting utility for API calls
 */
export class RateLimiter {
  private attempts: number[] = []
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  canAttempt(): boolean {
    const now = Date.now()
    this.attempts = this.attempts.filter(time => now - time < this.windowMs)
    
    if (this.attempts.length >= this.maxAttempts) {
      return false
    }
    
    this.attempts.push(now)
    return true
  }

  getRemainingAttempts(): number {
    const now = Date.now()
    this.attempts = this.attempts.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxAttempts - this.attempts.length)
  }

  getResetTime(): number {
    if (this.attempts.length === 0) return 0
    const oldestAttempt = Math.min(...this.attempts)
    return oldestAttempt + this.windowMs
  }
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encryptData(data: string): string {
  try {
    const key = scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv + authTag + encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export function decryptData(encryptedData: string): string {
  try {
    const key = scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
