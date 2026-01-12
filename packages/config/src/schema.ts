import { z } from 'zod';

/**
 * Environment variable schema with comprehensive validation
 * This schema defines all environment variables used across the KiTS Hub platform
 */

// Base environment schema (shared across all environments)
const baseEnvironmentSchema = z.object({
  // Environment identification
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application URLs and endpoints
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  
  // Supabase Configuration (Public)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'Supabase URL must be a valid URL'
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'Supabase anonymous key is required'
  }),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_FEATURE_X: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.string().transform(val => val === 'true').default('false'),
  
  // Analytics and Tracking
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
  NEXT_PUBLIC_HOTJAR_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
  
  // Micro-frontend URLs
  NEXT_PUBLIC_INVENTORY_URL: z.string().url().default('http://localhost:4177'),
  NEXT_PUBLIC_POS_URL: z.string().url().default('http://localhost:4178'),
  NEXT_PUBLIC_CRM_URL: z.string().url().default('http://localhost:4179'),
  NEXT_PUBLIC_HR_URL: z.string().url().default('http://localhost:4180'),
  NEXT_PUBLIC_ACCOUNTING_URL: z.string().url().default('http://localhost:4181'),
  NEXT_PUBLIC_ANALYTICS_URL: z.string().url().default('http://localhost:4182'),
  
  // Application Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('KiTS Hub'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().default('Business Management Platform'),
  
  // UI Configuration
  NEXT_PUBLIC_THEME: z.enum(['light', 'dark', 'auto']).default('auto'),
  NEXT_PUBLIC_PRIMARY_COLOR: z.string().default('#7c3aed'),
  NEXT_PUBLIC_LOCALE: z.string().default('en-US'),
  
  // Development Configuration
  NEXT_PUBLIC_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Cache Configuration
  NEXT_PUBLIC_CACHE_TTL: z.string().transform(Number).default('300000'), // 5 minutes
  NEXT_PUBLIC_ENABLE_CACHE: z.string().transform(val => val === 'true').default('true'),
});

// Server-only environment schema
const serverEnvironmentSchema = baseEnvironmentSchema.extend({
  // Supabase Service Configuration (Server-only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: 'Supabase service role key is required for server operations'
  }),
  
  // Database Configuration
  DATABASE_URL: z.string().url({
    message: 'Database URL must be a valid URL'
  }),
  DATABASE_POOL_SIZE: z.string().transform(Number).default('10'),
  DATABASE_TIMEOUT: z.string().transform(Number).default('30000'), // 30 seconds
  
  // Redis Configuration
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL: z.string().transform(Number).default('3600'), // 1 hour
  
  // API Configuration
  API_PORT: z.string().transform(Number).default('3000'),
  API_HOST: z.string().default('localhost'),
  API_TIMEOUT: z.string().transform(Number).default('30000'), // 30 seconds
  
  // Security Configuration
  JWT_SECRET: z.string().min(32, {
    message: 'JWT secret must be at least 32 characters'
  }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_KEY_SECRET: z.string().min(16, {
    message: 'API key secret must be at least 16 characters'
  }),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // File Storage Configuration
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Payment Configuration
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  
  // Monitoring and Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Session Configuration
  SESSION_SECRET: z.string().min(32, {
    message: 'Session secret must be at least 32 characters'
  }),
  SESSION_TTL: z.string().transform(Number).default('86400000'), // 24 hours
  
  // CORS Configuration
  CORS_ORIGIN: z.string().default('*'),
  CORS_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  CORS_HEADERS: z.string().default('Content-Type,Authorization'),
  
  // Webhook Configuration
  WEBHOOK_SECRET: z.string().min(16, {
    message: 'Webhook secret must be at least 16 characters'
  }),
  WEBHOOK_TIMEOUT: z.string().transform(Number).default('10000'), // 10 seconds
  
  // Backup Configuration
  BACKUP_SCHEDULE: z.string().default('0 2 * * *'), // Daily at 2 AM
  BACKUP_RETENTION_DAYS: z.string().transform(Number).default('30'),
  
  // Development Server Configuration
  DEV_SERVER_PORT: z.string().transform(Number).default('3000'),
  DEV_SERVER_HOST: z.string().default('localhost'),
  HOT_RELOAD: z.string().transform(val => val === 'true').default('true'),
});

// Development environment schema (more permissive)
const developmentEnvironmentSchema = serverEnvironmentSchema.extend({
  NEXT_PUBLIC_DEV_TOOLS: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('false'),
});

// Production environment schema (stricter validation)
const productionEnvironmentSchema = serverEnvironmentSchema.extend({
  NEXT_PUBLIC_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info']).default('warn'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info']).default('warn'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  
  // Production-specific validations
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().refine(
    (url) => !url.includes('localhost') && !url.includes('127.0.0.1'),
    { message: 'Production cannot use localhost Supabase URLs' }
  ),
  DATABASE_URL: z.string().url().refine(
    (url) => !url.includes('localhost') && !url.includes('127.0.0.1'),
    { message: 'Production cannot use localhost database URLs' }
  ),
});

// Test environment schema
const testEnvironmentSchema = baseEnvironmentSchema.extend({
  NODE_ENV: z.literal('test'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),
});

// Environment-specific schema selector
function getEnvironmentSchema() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return productionEnvironmentSchema;
    case 'test':
      return testEnvironmentSchema;
    case 'development':
    default:
      return developmentEnvironmentSchema;
  }
}

// Export schemas
export const BaseEnvironmentSchema = baseEnvironmentSchema;
export const ServerEnvironmentSchema = serverEnvironmentSchema;
export const DevelopmentEnvironmentSchema = developmentEnvironmentSchema;
export const ProductionEnvironmentSchema = productionEnvironmentSchema;
export const TestEnvironmentSchema = testEnvironmentSchema;

// Export the dynamic schema selector
export const getEnvironmentSchemaForCurrentEnv = getEnvironmentSchema;

// Type exports
export type BaseEnvironment = z.infer<typeof baseEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
export type DevelopmentEnvironment = z.infer<typeof developmentEnvironmentSchema>;
export type ProductionEnvironment = z.infer<typeof productionEnvironmentSchema>;
export type TestEnvironment = z.infer<typeof testEnvironmentSchema>;

// Dynamic environment type based on NODE_ENV
export type Environment = z.infer<ReturnType<typeof getEnvironmentSchema>>;
