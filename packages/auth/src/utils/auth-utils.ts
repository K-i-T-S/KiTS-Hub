import { 
  TokenValidationResult, 
  PasswordStrengthResult, 
  SessionTimeoutConfig,
  AuthError,
  AuthErrorCode 
} from '../types/auth.types';
import { sessionManager } from './session';

/**
 * Utility functions for authentication operations
 */

// Token validation utilities
export class TokenUtils {
  /**
   * Validate JWT token (basic validation)
   */
  static validateToken(token: string): TokenValidationResult {
    try {
      if (!token) {
        return {
          isValid: false,
          isExpired: true,
          willExpireSoon: false,
          error: 'No token provided'
        };
      }

      // Parse JWT payload (basic validation without verification)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          isValid: false,
          isExpired: true,
          willExpireSoon: false,
          error: 'Invalid token format'
        };
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp;

      if (!exp) {
        return {
          isValid: false,
          isExpired: false,
          willExpireSoon: false,
          error: 'Token has no expiration'
        };
      }

      const isExpired = now >= exp;
      const willExpireSoon = now >= (exp - 300); // 5 minutes

      return {
        isValid: !isExpired,
        isExpired,
        willExpireSoon,
        expiresAt: exp * 1000
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: true,
        willExpireSoon: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      };
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token will expire within specified minutes
   */
  static willExpireWithin(token: string, minutes: number): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return false;

    return Date.now() >= (expiration - (minutes * 60 * 1000));
  }
}

// Password utilities
export class PasswordUtils {
  /**
   * Enhanced password strength checker
   */
  static checkPasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 2;
    } else if (password.length >= 8) {
      score += 1;
      feedback.push('Consider using at least 12 characters for better security');
      suggestions.push('Use 12+ characters for maximum security');
    } else {
      feedback.push('Password should be at least 8 characters long');
      suggestions.push('Use at least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letters');
      suggestions.push('Add uppercase letters (A-Z)');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letters');
      suggestions.push('Add lowercase letters (a-z)');
    }

    // Numbers check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
      suggestions.push('Add numbers (0-9)');
    }

    // Special characters check
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialChars.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
      suggestions.push('Add special characters (!@#$%^&*())');
    }

    // Common patterns check
    if (this.hasCommonPatterns(password)) {
      score -= 1;
      feedback.push('Avoid common patterns or dictionary words');
      suggestions.push('Use a unique, random password');
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      score -= 1;
      feedback.push('Avoid sequential characters');
      suggestions.push('Avoid sequences like "123" or "abc"');
    }

    return {
      score: Math.max(0, Math.min(5, score)),
      feedback,
      isStrong: score >= 4,
      suggestions
    };
  }

  /**
   * Check for common password patterns
   */
  private static hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /abc123/i
    ];

    return commonPatterns.some(pattern => pattern.test(password));
  }

  /**
   * Check for sequential characters
   */
  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      // Check for sequential numbers or letters
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
      if (char2 === char1 - 1 && char3 === char2 - 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill remaining length
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Session timeout utilities
export class SessionTimeoutUtils {
  private static timeoutId: NodeJS.Timeout | null = null;
  private static warningId: NodeJS.Timeout | null = null;
  private static config: SessionTimeoutConfig = {
    warningMinutes: 5,
    timeoutMinutes: 30,
    extendOnActivity: true
  };

  /**
   * Configure session timeout settings
   */
  static configure(config: Partial<SessionTimeoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start session timeout monitoring
   */
  static start(onTimeout: () => void, onWarning?: () => void): void {
    this.stop();

    // Set warning timeout
    if (onWarning) {
      this.warningId = setTimeout(() => {
        onWarning();
      }, this.config.warningMinutes * 60 * 1000);
    }

    // Set main timeout
    this.timeoutId = setTimeout(() => {
      onTimeout();
    }, this.config.timeoutMinutes * 60 * 1000);

    // Setup activity listeners if enabled
    if (this.config.extendOnActivity) {
      this.setupActivityListeners();
    }
  }

  /**
   * Stop session timeout monitoring
   */
  static stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
    this.removeActivityListeners();
  }

  /**
   * Extend session timeout
   */
  static extend(onTimeout: () => void, onWarning?: () => void): void {
    this.start(onTimeout, onWarning);
  }

  /**
   * Setup activity event listeners
   */
  private static setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
  }

  /**
   * Remove activity event listeners
   */
  private static removeActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
  }

  /**
   * Handle user activity
   */
  private static handleActivity = (): void => {
    // Activity detected - timeout would be extended by the calling code
  };
}

// Error handling utilities
export class AuthErrorUtils {
  /**
   * Create standardized auth error
   */
  static createError(message: string, code: AuthErrorCode, statusCode?: number): AuthError {
    return new AuthError(message, code, statusCode);
  }

  /**
   * Handle Supabase auth errors
   */
  static handleSupabaseError(error: any): AuthError {
    const message = error?.message || 'Authentication error';
    
    // Map common Supabase errors to our error codes
    if (message.includes('Invalid login credentials')) {
      return this.createError(message, AuthErrorCode.INVALID_CREDENTIALS, 401);
    }
    
    if (message.includes('User not found')) {
      return this.createError(message, AuthErrorCode.USER_NOT_FOUND, 404);
    }
    
    if (message.includes('Email already registered')) {
      return this.createError(message, AuthErrorCode.EMAIL_ALREADY_EXISTS, 409);
    }
    
    if (message.includes('Password should be')) {
      return this.createError(message, AuthErrorCode.WEAK_PASSWORD, 400);
    }
    
    if (message.includes('Token has expired')) {
      return this.createError(message, AuthErrorCode.TOKEN_EXPIRED, 401);
    }
    
    if (message.includes('Invalid token')) {
      return this.createError(message, AuthErrorCode.TOKEN_INVALID, 401);
    }

    return this.createError(message, AuthErrorCode.UNKNOWN_ERROR, 500);
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverableError(error: AuthError): boolean {
    const recoverableCodes = [
      AuthErrorCode.TOKEN_EXPIRED,
      AuthErrorCode.NETWORK_ERROR
    ];

    return recoverableCodes.includes(error.code as AuthErrorCode);
  }
}

// Security utilities
export class SecurityUtils {
  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Check if email is from allowed domain
   */
  static isEmailDomainAllowed(email: string, allowedDomains: string[]): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? allowedDomains.includes(domain) : false;
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts: number[] = [];

    return {
      isAllowed: (): boolean => {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Remove old attempts
        while (attempts.length > 0 && attempts[0] < windowStart) {
          attempts.shift();
        }

        // Check if under limit
        if (attempts.length < maxAttempts) {
          attempts.push(now);
          return true;
        }

        return false;
      },
      getRemainingTime: (): number => {
        if (attempts.length === 0) return 0;
        const oldestAttempt = attempts[0];
        return Math.max(0, oldestAttempt + windowMs - Date.now());
      }
    };
  }
}
