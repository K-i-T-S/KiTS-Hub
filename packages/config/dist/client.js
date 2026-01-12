'use strict';

var zod = require('zod');

/**
 * Environment variable schema with comprehensive validation
 * This schema defines all environment variables used across the KiTS Hub platform
 */
// Base environment schema (shared across all environments)
const baseEnvironmentSchema = zod.z.object({
    // Environment identification
    NODE_ENV: zod.z.enum(['development', 'production', 'test']).default('development'),
    // Application URLs and endpoints
    NEXT_PUBLIC_APP_URL: zod.z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_API_URL: zod.z.string().url().default('http://localhost:3000/api'),
    // Supabase Configuration (Public)
    NEXT_PUBLIC_SUPABASE_URL: zod.z.string().url({
        message: 'Supabase URL must be a valid URL'
    }),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: zod.z.string().min(1, {
        message: 'Supabase anonymous key is required'
    }),
    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_ENABLE_FEATURE_X: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: zod.z.string().transform(val => val === 'true').default('false'),
    // Analytics and Tracking
    NEXT_PUBLIC_GA_TRACKING_ID: zod.z.string().optional(),
    NEXT_PUBLIC_HOTJAR_ID: zod.z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: zod.z.string().url().optional(),
    NEXT_PUBLIC_CLARITY_ID: zod.z.string().optional(),
    // Micro-frontend URLs
    NEXT_PUBLIC_INVENTORY_URL: zod.z.string().url().default('http://localhost:4177'),
    NEXT_PUBLIC_POS_URL: zod.z.string().url().default('http://localhost:4178'),
    NEXT_PUBLIC_CRM_URL: zod.z.string().url().default('http://localhost:4179'),
    NEXT_PUBLIC_HR_URL: zod.z.string().url().default('http://localhost:4180'),
    NEXT_PUBLIC_ACCOUNTING_URL: zod.z.string().url().default('http://localhost:4181'),
    NEXT_PUBLIC_ANALYTICS_URL: zod.z.string().url().default('http://localhost:4182'),
    // Application Configuration
    NEXT_PUBLIC_APP_NAME: zod.z.string().default('KiTS Hub'),
    NEXT_PUBLIC_APP_VERSION: zod.z.string().default('1.0.0'),
    NEXT_PUBLIC_APP_DESCRIPTION: zod.z.string().default('Business Management Platform'),
    // UI Configuration
    NEXT_PUBLIC_THEME: zod.z.enum(['light', 'dark', 'auto']).default('auto'),
    NEXT_PUBLIC_PRIMARY_COLOR: zod.z.string().default('#7c3aed'),
    NEXT_PUBLIC_LOCALE: zod.z.string().default('en-US'),
    // Development Configuration
    NEXT_PUBLIC_DEV_TOOLS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    // Cache Configuration
    NEXT_PUBLIC_CACHE_TTL: zod.z.string().transform(Number).default('300000'), // 5 minutes
    NEXT_PUBLIC_ENABLE_CACHE: zod.z.string().transform(val => val === 'true').default('true'),
});
// Server-only environment schema
const serverEnvironmentSchema = baseEnvironmentSchema.extend({
    // Supabase Service Configuration (Server-only)
    SUPABASE_SERVICE_ROLE_KEY: zod.z.string().min(1, {
        message: 'Supabase service role key is required for server operations'
    }),
    // Database Configuration
    DATABASE_URL: zod.z.string().url({
        message: 'Database URL must be a valid URL'
    }),
    DATABASE_POOL_SIZE: zod.z.string().transform(Number).default('10'),
    DATABASE_TIMEOUT: zod.z.string().transform(Number).default('30000'), // 30 seconds
    // Redis Configuration
    REDIS_URL: zod.z.string().url().optional(),
    REDIS_PASSWORD: zod.z.string().optional(),
    REDIS_TTL: zod.z.string().transform(Number).default('3600'), // 1 hour
    // API Configuration
    API_PORT: zod.z.string().transform(Number).default('3000'),
    API_HOST: zod.z.string().default('localhost'),
    API_TIMEOUT: zod.z.string().transform(Number).default('30000'), // 30 seconds
    // Security Configuration
    JWT_SECRET: zod.z.string().min(32, {
        message: 'JWT secret must be at least 32 characters'
    }),
    JWT_EXPIRES_IN: zod.z.string().default('7d'),
    API_KEY_SECRET: zod.z.string().min(16, {
        message: 'API key secret must be at least 16 characters'
    }),
    // Email Configuration
    SMTP_HOST: zod.z.string().optional(),
    SMTP_PORT: zod.z.string().transform(Number).default('587'),
    SMTP_USER: zod.z.string().optional(),
    SMTP_PASS: zod.z.string().optional(),
    SMTP_FROM: zod.z.string().email().optional(),
    // File Storage Configuration
    AWS_ACCESS_KEY_ID: zod.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod.z.string().optional(),
    AWS_REGION: zod.z.string().default('us-east-1'),
    AWS_S3_BUCKET: zod.z.string().optional(),
    // Payment Configuration
    STRIPE_SECRET_KEY: zod.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod.z.string().optional(),
    PAYPAL_CLIENT_SECRET: zod.z.string().optional(),
    // Monitoring and Logging
    LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FORMAT: zod.z.enum(['json', 'text']).default('json'),
    ENABLE_METRICS: zod.z.string().transform(val => val === 'true').default('true'),
    // Rate Limiting
    RATE_LIMIT_WINDOW: zod.z.string().transform(Number).default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: zod.z.string().transform(Number).default('100'),
    // Session Configuration
    SESSION_SECRET: zod.z.string().min(32, {
        message: 'Session secret must be at least 32 characters'
    }),
    SESSION_TTL: zod.z.string().transform(Number).default('86400000'), // 24 hours
    // CORS Configuration
    CORS_ORIGIN: zod.z.string().default('*'),
    CORS_METHODS: zod.z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
    CORS_HEADERS: zod.z.string().default('Content-Type,Authorization'),
    // Webhook Configuration
    WEBHOOK_SECRET: zod.z.string().min(16, {
        message: 'Webhook secret must be at least 16 characters'
    }),
    WEBHOOK_TIMEOUT: zod.z.string().transform(Number).default('10000'), // 10 seconds
    // Backup Configuration
    BACKUP_SCHEDULE: zod.z.string().default('0 2 * * *'), // Daily at 2 AM
    BACKUP_RETENTION_DAYS: zod.z.string().transform(Number).default('30'),
    // Development Server Configuration
    DEV_SERVER_PORT: zod.z.string().transform(Number).default('3000'),
    DEV_SERVER_HOST: zod.z.string().default('localhost'),
    HOT_RELOAD: zod.z.string().transform(val => val === 'true').default('true'),
});
// Development environment schema (more permissive)
serverEnvironmentSchema.extend({
    NEXT_PUBLIC_DEV_TOOLS: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    ENABLE_METRICS: zod.z.string().transform(val => val === 'true').default('false'),
});
// Production environment schema (stricter validation)
serverEnvironmentSchema.extend({
    NEXT_PUBLIC_DEV_TOOLS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_LOG_LEVEL: zod.z.enum(['error', 'warn', 'info']).default('warn'),
    LOG_LEVEL: zod.z.enum(['error', 'warn', 'info']).default('warn'),
    ENABLE_METRICS: zod.z.string().transform(val => val === 'true').default('true'),
    // Production-specific validations
    NEXT_PUBLIC_SUPABASE_URL: zod.z.string().url().refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), { message: 'Production cannot use localhost Supabase URLs' }),
    DATABASE_URL: zod.z.string().url().refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), { message: 'Production cannot use localhost database URLs' }),
});
// Test environment schema
baseEnvironmentSchema.extend({
    NODE_ENV: zod.z.literal('test'),
    NEXT_PUBLIC_ENABLE_ANALYTICS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: zod.z.string().transform(val => val === 'true').default('false'),
});
// Export schemas
const BaseEnvironmentSchema = baseEnvironmentSchema;

/**
 * Client-side configuration utilities
 * Provides type-safe access to public environment variables in the browser
 */
// Client environment schema (only public variables)
const clientEnvironmentSchema = BaseEnvironmentSchema.pick({
    // Environment identification
    NODE_ENV: true,
    // Application URLs and endpoints
    NEXT_PUBLIC_APP_URL: true,
    NEXT_PUBLIC_API_URL: true,
    // Supabase Configuration (Public)
    NEXT_PUBLIC_SUPABASE_URL: true,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: true,
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: true,
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: true,
    NEXT_PUBLIC_ENABLE_FEATURE_X: true,
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: true,
    // Analytics and Tracking
    NEXT_PUBLIC_GA_TRACKING_ID: true,
    NEXT_PUBLIC_HOTJAR_ID: true,
    NEXT_PUBLIC_SENTRY_DSN: true,
    NEXT_PUBLIC_CLARITY_ID: true,
    // Micro-frontend URLs
    NEXT_PUBLIC_INVENTORY_URL: true,
    NEXT_PUBLIC_POS_URL: true,
    NEXT_PUBLIC_CRM_URL: true,
    NEXT_PUBLIC_HR_URL: true,
    NEXT_PUBLIC_ACCOUNTING_URL: true,
    NEXT_PUBLIC_ANALYTICS_URL: true,
    // Application Configuration
    NEXT_PUBLIC_APP_NAME: true,
    NEXT_PUBLIC_APP_VERSION: true,
    NEXT_PUBLIC_APP_DESCRIPTION: true,
    // UI Configuration
    NEXT_PUBLIC_THEME: true,
    NEXT_PUBLIC_PRIMARY_COLOR: true,
    NEXT_PUBLIC_LOCALE: true,
    // Development Configuration
    NEXT_PUBLIC_DEV_TOOLS: true,
    NEXT_PUBLIC_LOG_LEVEL: true,
    // Cache Configuration
    NEXT_PUBLIC_CACHE_TTL: true,
    NEXT_PUBLIC_ENABLE_CACHE: true,
});
/**
 * Validates and returns client-side environment configuration
 * This function should be called once at application startup
 */
function validateClientEnvironment(env = process.env) {
    try {
        const result = clientEnvironmentSchema.parse(env);
        return result;
    }
    catch (error) {
        if (error instanceof zod.z.ZodError) {
            const missingVars = error.errors
                .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
                .map(err => err.path.join('.'));
            const invalidVars = error.errors
                .filter(err => err.code !== 'invalid_type' || err.received !== 'undefined')
                .map(err => `${err.path.join('.')}: ${err.message}`);
            let errorMessage = '❌ Client Environment Validation Failed:\n\n';
            if (missingVars.length > 0) {
                errorMessage += `Missing required environment variables:\n`;
                missingVars.forEach(varName => {
                    errorMessage += `  - ${varName}\n`;
                });
                errorMessage += '\n';
            }
            if (invalidVars.length > 0) {
                errorMessage += `Invalid environment variable values:\n`;
                invalidVars.forEach(varError => {
                    errorMessage += `  - ${varError}\n`;
                });
                errorMessage += '\n';
            }
            errorMessage += `Please check your .env file and ensure all required variables are set.\n`;
            errorMessage += `Refer to the Environment Configuration Guide for details.`;
            throw new Error(errorMessage);
        }
        throw new Error(`❌ Unexpected error validating client environment: ${error}`);
    }
}
/**
 * Client configuration class with type-safe accessors
 */
class ClientConfig {
    static instance;
    config;
    constructor(env) {
        this.config = validateClientEnvironment(env);
    }
    /**
     * Initialize the client configuration
     * This should be called once at application startup
     */
    static initialize(env = process.env) {
        if (!ClientConfig.instance) {
            ClientConfig.instance = new ClientConfig(env);
        }
        return ClientConfig.instance;
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!ClientConfig.instance) {
            throw new Error('ClientConfig not initialized. Call ClientConfig.initialize() first.');
        }
        return ClientConfig.instance;
    }
    /**
     * Get the entire configuration object
     */
    getAll() {
        return { ...this.config };
    }
    // Environment identification
    get nodeEnv() {
        return this.config.NODE_ENV;
    }
    get isDevelopment() {
        return this.config.NODE_ENV === 'development';
    }
    get isProduction() {
        return this.config.NODE_ENV === 'production';
    }
    get isTest() {
        return this.config.NODE_ENV === 'test';
    }
    // Application URLs and endpoints
    get appUrl() {
        return this.config.NEXT_PUBLIC_APP_URL;
    }
    get apiUrl() {
        return this.config.NEXT_PUBLIC_API_URL;
    }
    // Supabase Configuration
    get supabaseUrl() {
        return this.config.NEXT_PUBLIC_SUPABASE_URL;
    }
    get supabaseAnonKey() {
        return this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    // Feature Flags
    get analyticsEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_ANALYTICS;
    }
    get errorReportingEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_ERROR_REPORTING;
    }
    get performanceMonitoringEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING;
    }
    get featureXEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_FEATURE_X;
    }
    get betaFeaturesEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_BETA_FEATURES;
    }
    // Analytics and Tracking
    get gaTrackingId() {
        return this.config.NEXT_PUBLIC_GA_TRACKING_ID;
    }
    get hotjarId() {
        return this.config.NEXT_PUBLIC_HOTJAR_ID;
    }
    get sentryDsn() {
        return this.config.NEXT_PUBLIC_SENTRY_DSN;
    }
    get clarityId() {
        return this.config.NEXT_PUBLIC_CLARITY_ID;
    }
    // Micro-frontend URLs
    get inventoryUrl() {
        return this.config.NEXT_PUBLIC_INVENTORY_URL;
    }
    get posUrl() {
        return this.config.NEXT_PUBLIC_POS_URL;
    }
    get crmUrl() {
        return this.config.NEXT_PUBLIC_CRM_URL;
    }
    get hrUrl() {
        return this.config.NEXT_PUBLIC_HR_URL;
    }
    get accountingUrl() {
        return this.config.NEXT_PUBLIC_ACCOUNTING_URL;
    }
    get analyticsUrl() {
        return this.config.NEXT_PUBLIC_ANALYTICS_URL;
    }
    // Application Configuration
    get appName() {
        return this.config.NEXT_PUBLIC_APP_NAME;
    }
    get appVersion() {
        return this.config.NEXT_PUBLIC_APP_VERSION;
    }
    get appDescription() {
        return this.config.NEXT_PUBLIC_APP_DESCRIPTION;
    }
    // UI Configuration
    get theme() {
        return this.config.NEXT_PUBLIC_THEME;
    }
    get primaryColor() {
        return this.config.NEXT_PUBLIC_PRIMARY_COLOR;
    }
    get locale() {
        return this.config.NEXT_PUBLIC_LOCALE;
    }
    // Development Configuration
    get devToolsEnabled() {
        return this.config.NEXT_PUBLIC_DEV_TOOLS;
    }
    get logLevel() {
        return this.config.NEXT_PUBLIC_LOG_LEVEL;
    }
    // Cache Configuration
    get cacheTtl() {
        return this.config.NEXT_PUBLIC_CACHE_TTL;
    }
    get cacheEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_CACHE;
    }
    /**
     * Check if a specific feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.config[feature];
    }
    /**
     * Get micro-frontend URL by name
     */
    getMicroFrontendUrl(name) {
        const urlMap = {
            inventory: this.inventoryUrl,
            pos: this.posUrl,
            crm: this.crmUrl,
            hr: this.hrUrl,
            accounting: this.accountingUrl,
            analytics: this.analyticsUrl,
        };
        return urlMap[name];
    }
    /**
     * Get analytics configuration
     */
    getAnalyticsConfig() {
        return {
            enabled: this.analyticsEnabled,
            gaTrackingId: this.gaTrackingId,
            hotjarId: this.hotjarId,
            sentryDsn: this.sentryDsn,
            clarityId: this.clarityId,
        };
    }
    /**
     * Get UI configuration
     */
    getUiConfig() {
        return {
            theme: this.theme,
            primaryColor: this.primaryColor,
            locale: this.locale,
            appName: this.appName,
            appVersion: this.appVersion,
            appDescription: this.appDescription,
        };
    }
}
// Export a singleton instance for convenience
let clientConfigInstance = null;
/**
 * Get the client configuration instance
 * Initializes if not already done
 */
function getClientConfig() {
    if (!clientConfigInstance) {
        clientConfigInstance = ClientConfig.initialize();
    }
    return clientConfigInstance;
}
/**
 * Initialize client configuration with custom environment
 */
function initClientConfig(env) {
    clientConfigInstance = ClientConfig.initialize(env);
    return clientConfigInstance;
}
// Export individual getters for convenience
const clientConfigGetters = {
    get nodeEnv() { return getClientConfig().nodeEnv; },
    get isDevelopment() { return getClientConfig().isDevelopment; },
    get isProduction() { return getClientConfig().isProduction; },
    get isTest() { return getClientConfig().isTest; },
    get appUrl() { return getClientConfig().appUrl; },
    get apiUrl() { return getClientConfig().apiUrl; },
    get supabaseUrl() { return getClientConfig().supabaseUrl; },
    get supabaseAnonKey() { return getClientConfig().supabaseAnonKey; },
    get analyticsEnabled() { return getClientConfig().analyticsEnabled; },
    get errorReportingEnabled() { return getClientConfig().errorReportingEnabled; },
    get performanceMonitoringEnabled() { return getClientConfig().performanceMonitoringEnabled; },
    get featureXEnabled() { return getClientConfig().featureXEnabled; },
    get betaFeaturesEnabled() { return getClientConfig().betaFeaturesEnabled; },
    get gaTrackingId() { return getClientConfig().gaTrackingId; },
    get hotjarId() { return getClientConfig().hotjarId; },
    get sentryDsn() { return getClientConfig().sentryDsn; },
    get clarityId() { return getClientConfig().clarityId; },
    get inventoryUrl() { return getClientConfig().inventoryUrl; },
    get posUrl() { return getClientConfig().posUrl; },
    get crmUrl() { return getClientConfig().crmUrl; },
    get hrUrl() { return getClientConfig().hrUrl; },
    get accountingUrl() { return getClientConfig().accountingUrl; },
    get analyticsUrl() { return getClientConfig().analyticsUrl; },
    get appName() { return getClientConfig().appName; },
    get appVersion() { return getClientConfig().appVersion; },
    get appDescription() { return getClientConfig().appDescription; },
    get theme() { return getClientConfig().theme; },
    get primaryColor() { return getClientConfig().primaryColor; },
    get locale() { return getClientConfig().locale; },
    get devToolsEnabled() { return getClientConfig().devToolsEnabled; },
    get logLevel() { return getClientConfig().logLevel; },
    get cacheTtl() { return getClientConfig().cacheTtl; },
    get cacheEnabled() { return getClientConfig().cacheEnabled; },
};

exports.ClientConfig = ClientConfig;
exports.clientConfigGetters = clientConfigGetters;
exports.getClientConfig = getClientConfig;
exports.initClientConfig = initClientConfig;
exports.validateClientEnvironment = validateClientEnvironment;
//# sourceMappingURL=client.js.map
