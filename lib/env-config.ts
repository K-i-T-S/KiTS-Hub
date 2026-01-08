/**
 * Production-ready environment configuration and validation
 * Ensures all required environment variables are present and valid
 */

import * as Joi from 'joi';

export interface EnvironmentConfig {
  // Database
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Security
  ENCRYPTION_KEY: string;
  JWT_SECRET: string;

  // Email
  EMAIL_SERVICE: string;
  EMAIL_SERVICE_API_KEY: string;
  FROM_EMAIL: string;
  FROM_NAME: string;

  // Application
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: string;

  // Optional
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  REDIS_URL?: string;
}

// Environment variable validation schema
const environmentSchema = Joi.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().uri().required(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  // Security
  ENCRYPTION_KEY: Joi.string().min(32).required(),
  JWT_SECRET: Joi.string().min(32).required(),

  // Email
  EMAIL_SERVICE: Joi.string().valid('resend', 'sendgrid', 'ses').default('resend'),
  EMAIL_SERVICE_API_KEY: Joi.string().when('EMAIL_SERVICE', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  FROM_EMAIL: Joi.string().email().required(),
  FROM_NAME: Joi.string().min(1).max(100).required(),

  // Application
  NEXT_PUBLIC_APP_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

  // Optional
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  REDIS_URL: Joi.string().uri().optional()
}).unknown();

/**
 * Validates environment variables
 * @returns { isValid: boolean, error?: string, config?: EnvironmentConfig }
 */
export function validateEnvironment(): { isValid: boolean; error?: string; config?: EnvironmentConfig } {
  try {
    const { error, value: config } = environmentSchema.validate(process.env, {
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      return {
        isValid: false,
        error: `Environment validation failed: ${error.details[0]?.message || error.message}`
      };
    }

    // Additional validations
    if (config.NODE_ENV === 'production') {
      // Production-specific validations
      if (!config.ENCRYPTION_KEY || config.ENCRYPTION_KEY.length < 32) {
        return {
          isValid: false,
          error: 'ENCRYPTION_KEY must be at least 32 characters in production'
        };
      }

      if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
        return {
          isValid: false,
          error: 'JWT_SECRET must be at least 32 characters in production'
        };
      }

      // Validate URLs
      if (!config.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
        return {
          isValid: false,
          error: 'NEXT_PUBLIC_APP_URL must use HTTPS in production'
        };
      }
    }

    return {
      isValid: true,
      config: config as EnvironmentConfig
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Environment validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get validated environment configuration
 * @returns {EnvironmentConfig}
 * @throws {Error} If environment validation fails
 */
export function getValidatedEnvironment(): EnvironmentConfig {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  return validation.config!;
}

/**
 * Check if running in production
 * @returns {boolean}
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 * @returns {boolean}
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get environment-specific configuration
 * @returns {object}
 */
export function getEnvironmentConfig() {
  return {
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isTest: isTest(),
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    nodeEnv: process.env.NODE_ENV
  };
}
