/**
 * Production-ready environment configuration and validation
 * Ensures all required environment variables are present and valid
 */

const Joi = require('joi');

// Environment variable validation schema
const environmentSchema = Joi.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().uri().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  // Security
  ENCRYPTION_KEY: Joi.string().min(32).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  JWT_SECRET: Joi.string().min(32).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  // Email
  EMAIL_SERVICE: Joi.string().valid('resend', 'sendgrid', 'ses').default('resend'),
  EMAIL_SERVICE_API_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  FROM_EMAIL: Joi.string().email().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  FROM_NAME: Joi.string().min(1).max(100).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  // Application
  NEXT_PUBLIC_APP_URL: Joi.string().uri().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
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
function validateEnvironment() {
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
      config: config
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Environment validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if running in production
 * @returns {boolean}
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 * @returns {boolean}
 */
function isTest() {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get environment-specific configuration
 * @returns {object}
 */
function getEnvironmentConfig() {
  return {
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isTest: isTest(),
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    nodeEnv: process.env.NODE_ENV
  };
}

module.exports = {
  validateEnvironment,
  isProduction,
  isDevelopment,
  isTest,
  getEnvironmentConfig
};
