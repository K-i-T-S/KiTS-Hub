'use strict';

var zod = require('zod');

const baseEnvironmentSchema = zod.z.object({
    NODE_ENV: zod.z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_APP_URL: zod.z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_API_URL: zod.z.string().url().default('http://localhost:3000/api'),
    NEXT_PUBLIC_SUPABASE_URL: zod.z.string().url({
        message: 'Supabase URL must be a valid URL'
    }),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: zod.z.string().min(1, {
        message: 'Supabase anonymous key is required'
    }),
    NEXT_PUBLIC_ENABLE_ANALYTICS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_ENABLE_FEATURE_X: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_GA_TRACKING_ID: zod.z.string().optional(),
    NEXT_PUBLIC_HOTJAR_ID: zod.z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: zod.z.string().url().optional(),
    NEXT_PUBLIC_CLARITY_ID: zod.z.string().optional(),
    NEXT_PUBLIC_INVENTORY_URL: zod.z.string().url().default('http://localhost:4177'),
    NEXT_PUBLIC_POS_URL: zod.z.string().url().default('http://localhost:4178'),
    NEXT_PUBLIC_CRM_URL: zod.z.string().url().default('http://localhost:4179'),
    NEXT_PUBLIC_HR_URL: zod.z.string().url().default('http://localhost:4180'),
    NEXT_PUBLIC_ACCOUNTING_URL: zod.z.string().url().default('http://localhost:4181'),
    NEXT_PUBLIC_ANALYTICS_URL: zod.z.string().url().default('http://localhost:4182'),
    NEXT_PUBLIC_APP_NAME: zod.z.string().default('KiTS Hub'),
    NEXT_PUBLIC_APP_VERSION: zod.z.string().default('1.0.0'),
    NEXT_PUBLIC_APP_DESCRIPTION: zod.z.string().default('Business Management Platform'),
    NEXT_PUBLIC_THEME: zod.z.enum(['light', 'dark', 'auto']).default('auto'),
    NEXT_PUBLIC_PRIMARY_COLOR: zod.z.string().default('#7c3aed'),
    NEXT_PUBLIC_LOCALE: zod.z.string().default('en-US'),
    NEXT_PUBLIC_DEV_TOOLS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    NEXT_PUBLIC_CACHE_TTL: zod.z.string().transform(Number).default('300000'),
    NEXT_PUBLIC_ENABLE_CACHE: zod.z.string().transform(val => val === 'true').default('true'),
});
const serverEnvironmentSchema = baseEnvironmentSchema.extend({
    SUPABASE_SERVICE_ROLE_KEY: zod.z.string().min(1, {
        message: 'Supabase service role key is required for server operations'
    }),
    DATABASE_URL: zod.z.string().url({
        message: 'Database URL must be a valid URL'
    }),
    DATABASE_POOL_SIZE: zod.z.string().transform(Number).default('10'),
    DATABASE_TIMEOUT: zod.z.string().transform(Number).default('30000'),
    REDIS_URL: zod.z.string().url().optional(),
    REDIS_PASSWORD: zod.z.string().optional(),
    REDIS_TTL: zod.z.string().transform(Number).default('3600'),
    API_PORT: zod.z.string().transform(Number).default('3000'),
    API_HOST: zod.z.string().default('localhost'),
    API_TIMEOUT: zod.z.string().transform(Number).default('30000'),
    JWT_SECRET: zod.z.string().min(32, {
        message: 'JWT secret must be at least 32 characters'
    }),
    JWT_EXPIRES_IN: zod.z.string().default('7d'),
    API_KEY_SECRET: zod.z.string().min(16, {
        message: 'API key secret must be at least 16 characters'
    }),
    SMTP_HOST: zod.z.string().optional(),
    SMTP_PORT: zod.z.string().transform(Number).default('587'),
    SMTP_USER: zod.z.string().optional(),
    SMTP_PASS: zod.z.string().optional(),
    SMTP_FROM: zod.z.string().email().optional(),
    AWS_ACCESS_KEY_ID: zod.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod.z.string().optional(),
    AWS_REGION: zod.z.string().default('us-east-1'),
    AWS_S3_BUCKET: zod.z.string().optional(),
    STRIPE_SECRET_KEY: zod.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod.z.string().optional(),
    PAYPAL_CLIENT_SECRET: zod.z.string().optional(),
    LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FORMAT: zod.z.enum(['json', 'text']).default('json'),
    ENABLE_METRICS: zod.z.string().transform(val => val === 'true').default('true'),
    RATE_LIMIT_WINDOW: zod.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod.z.string().transform(Number).default('100'),
    SESSION_SECRET: zod.z.string().min(32, {
        message: 'Session secret must be at least 32 characters'
    }),
    SESSION_TTL: zod.z.string().transform(Number).default('86400000'),
    CORS_ORIGIN: zod.z.string().default('*'),
    CORS_METHODS: zod.z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
    CORS_HEADERS: zod.z.string().default('Content-Type,Authorization'),
    WEBHOOK_SECRET: zod.z.string().min(16, {
        message: 'Webhook secret must be at least 16 characters'
    }),
    WEBHOOK_TIMEOUT: zod.z.string().transform(Number).default('10000'),
    BACKUP_SCHEDULE: zod.z.string().default('0 2 * * *'),
    BACKUP_RETENTION_DAYS: zod.z.string().transform(Number).default('30'),
    DEV_SERVER_PORT: zod.z.string().transform(Number).default('3000'),
    DEV_SERVER_HOST: zod.z.string().default('localhost'),
    HOT_RELOAD: zod.z.string().transform(val => val === 'true').default('true'),
});
const developmentEnvironmentSchema = serverEnvironmentSchema.extend({
    NEXT_PUBLIC_DEV_TOOLS: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    LOG_LEVEL: zod.z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    ENABLE_METRICS: zod.z.string().transform(val => val === 'true').default('false'),
});
const productionEnvironmentSchema = serverEnvironmentSchema.extend({
    NEXT_PUBLIC_DEV_TOOLS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_LOG_LEVEL: zod.z.enum(['error', 'warn', 'info']).default('warn'),
    LOG_LEVEL: zod.z.enum(['error', 'warn', 'info']).default('warn'),
    ENABLE_METRICS: zod.z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_SUPABASE_URL: zod.z.string().url().refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), { message: 'Production cannot use localhost Supabase URLs' }),
    DATABASE_URL: zod.z.string().url().refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), { message: 'Production cannot use localhost database URLs' }),
});
const testEnvironmentSchema = baseEnvironmentSchema.extend({
    NODE_ENV: zod.z.literal('test'),
    NEXT_PUBLIC_ENABLE_ANALYTICS: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: zod.z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: zod.z.string().transform(val => val === 'true').default('false'),
});
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
const BaseEnvironmentSchema = baseEnvironmentSchema;
const ServerEnvironmentSchema = serverEnvironmentSchema;
const DevelopmentEnvironmentSchema = developmentEnvironmentSchema;
const ProductionEnvironmentSchema = productionEnvironmentSchema;
const TestEnvironmentSchema = testEnvironmentSchema;
const getEnvironmentSchemaForCurrentEnv = getEnvironmentSchema;

const clientEnvironmentSchema = BaseEnvironmentSchema.pick({
    NODE_ENV: true,
    NEXT_PUBLIC_APP_URL: true,
    NEXT_PUBLIC_API_URL: true,
    NEXT_PUBLIC_SUPABASE_URL: true,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
    NEXT_PUBLIC_ENABLE_ANALYTICS: true,
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: true,
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: true,
    NEXT_PUBLIC_ENABLE_FEATURE_X: true,
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: true,
    NEXT_PUBLIC_GA_TRACKING_ID: true,
    NEXT_PUBLIC_HOTJAR_ID: true,
    NEXT_PUBLIC_SENTRY_DSN: true,
    NEXT_PUBLIC_CLARITY_ID: true,
    NEXT_PUBLIC_INVENTORY_URL: true,
    NEXT_PUBLIC_POS_URL: true,
    NEXT_PUBLIC_CRM_URL: true,
    NEXT_PUBLIC_HR_URL: true,
    NEXT_PUBLIC_ACCOUNTING_URL: true,
    NEXT_PUBLIC_ANALYTICS_URL: true,
    NEXT_PUBLIC_APP_NAME: true,
    NEXT_PUBLIC_APP_VERSION: true,
    NEXT_PUBLIC_APP_DESCRIPTION: true,
    NEXT_PUBLIC_THEME: true,
    NEXT_PUBLIC_PRIMARY_COLOR: true,
    NEXT_PUBLIC_LOCALE: true,
    NEXT_PUBLIC_DEV_TOOLS: true,
    NEXT_PUBLIC_LOG_LEVEL: true,
    NEXT_PUBLIC_CACHE_TTL: true,
    NEXT_PUBLIC_ENABLE_CACHE: true,
});
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
class ClientConfig {
    static instance;
    config;
    constructor(env) {
        this.config = validateClientEnvironment(env);
    }
    static initialize(env = process.env) {
        if (!ClientConfig.instance) {
            ClientConfig.instance = new ClientConfig(env);
        }
        return ClientConfig.instance;
    }
    static getInstance() {
        if (!ClientConfig.instance) {
            throw new Error('ClientConfig not initialized. Call ClientConfig.initialize() first.');
        }
        return ClientConfig.instance;
    }
    getAll() {
        return { ...this.config };
    }
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
    get appUrl() {
        return this.config.NEXT_PUBLIC_APP_URL;
    }
    get apiUrl() {
        return this.config.NEXT_PUBLIC_API_URL;
    }
    get supabaseUrl() {
        return this.config.NEXT_PUBLIC_SUPABASE_URL;
    }
    get supabaseAnonKey() {
        return this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
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
    get appName() {
        return this.config.NEXT_PUBLIC_APP_NAME;
    }
    get appVersion() {
        return this.config.NEXT_PUBLIC_APP_VERSION;
    }
    get appDescription() {
        return this.config.NEXT_PUBLIC_APP_DESCRIPTION;
    }
    get theme() {
        return this.config.NEXT_PUBLIC_THEME;
    }
    get primaryColor() {
        return this.config.NEXT_PUBLIC_PRIMARY_COLOR;
    }
    get locale() {
        return this.config.NEXT_PUBLIC_LOCALE;
    }
    get devToolsEnabled() {
        return this.config.NEXT_PUBLIC_DEV_TOOLS;
    }
    get logLevel() {
        return this.config.NEXT_PUBLIC_LOG_LEVEL;
    }
    get cacheTtl() {
        return this.config.NEXT_PUBLIC_CACHE_TTL;
    }
    get cacheEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_CACHE;
    }
    isFeatureEnabled(feature) {
        return this.config[feature];
    }
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
    getAnalyticsConfig() {
        return {
            enabled: this.analyticsEnabled,
            gaTrackingId: this.gaTrackingId,
            hotjarId: this.hotjarId,
            sentryDsn: this.sentryDsn,
            clarityId: this.clarityId,
        };
    }
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
let clientConfigInstance = null;
function getClientConfig() {
    if (!clientConfigInstance) {
        clientConfigInstance = ClientConfig.initialize();
    }
    return clientConfigInstance;
}
function initClientConfig(env) {
    clientConfigInstance = ClientConfig.initialize(env);
    return clientConfigInstance;
}
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

function validateServerEnvironment(env = process.env) {
    try {
        const schema = getEnvironmentSchemaForCurrentEnv();
        const result = schema.parse(env);
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
            let errorMessage = '❌ Server Environment Validation Failed:\n\n';
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
        throw new Error(`❌ Unexpected error validating server environment: ${error}`);
    }
}
class ServerConfig {
    static instance;
    config;
    constructor(env) {
        this.config = validateServerEnvironment(env);
    }
    static initialize(env = process.env) {
        if (!ServerConfig.instance) {
            ServerConfig.instance = new ServerConfig(env);
        }
        return ServerConfig.instance;
    }
    static getInstance() {
        if (!ServerConfig.instance) {
            throw new Error('ServerConfig not initialized. Call ServerConfig.initialize() first.');
        }
        return ServerConfig.instance;
    }
    getAll() {
        return { ...this.config };
    }
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
    get appUrl() {
        return this.config.NEXT_PUBLIC_APP_URL;
    }
    get apiUrl() {
        return this.config.NEXT_PUBLIC_API_URL;
    }
    get supabaseUrl() {
        return this.config.NEXT_PUBLIC_SUPABASE_URL;
    }
    get supabaseAnonKey() {
        return this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    get supabaseServiceRoleKey() {
        if (!this.config.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set');
        }
        return this.config.SUPABASE_SERVICE_ROLE_KEY;
    }
    get databaseUrl() {
        if (!this.config.DATABASE_URL) {
            throw new Error('DATABASE_URL is required but not set');
        }
        return this.config.DATABASE_URL;
    }
    get databasePoolSize() {
        return this.config.DATABASE_POOL_SIZE ?? 10;
    }
    get databaseTimeout() {
        return this.config.DATABASE_TIMEOUT ?? 30000;
    }
    get redisUrl() {
        return this.config.REDIS_URL;
    }
    get redisPassword() {
        return this.config.REDIS_PASSWORD;
    }
    get redisTtl() {
        return this.config.REDIS_TTL ?? 3600;
    }
    get apiPort() {
        return this.config.API_PORT ?? 3000;
    }
    get apiHost() {
        return this.config.API_HOST ?? 'localhost';
    }
    get apiTimeout() {
        return this.config.API_TIMEOUT ?? 30000;
    }
    get jwtSecret() {
        if (!this.config.JWT_SECRET) {
            throw new Error('JWT_SECRET is required but not set');
        }
        return this.config.JWT_SECRET;
    }
    get jwtExpiresIn() {
        return this.config.JWT_EXPIRES_IN ?? '7d';
    }
    get apiKeySecret() {
        if (!this.config.API_KEY_SECRET) {
            throw new Error('API_KEY_SECRET is required but not set');
        }
        return this.config.API_KEY_SECRET;
    }
    get smtpHost() {
        return this.config.SMTP_HOST;
    }
    get smtpPort() {
        return this.config.SMTP_PORT ?? 587;
    }
    get smtpUser() {
        return this.config.SMTP_USER;
    }
    get smtpPass() {
        return this.config.SMTP_PASS;
    }
    get smtpFrom() {
        return this.config.SMTP_FROM;
    }
    get awsAccessKeyId() {
        return this.config.AWS_ACCESS_KEY_ID;
    }
    get awsSecretAccessKey() {
        return this.config.AWS_SECRET_ACCESS_KEY;
    }
    get awsRegion() {
        return this.config.AWS_REGION ?? 'us-east-1';
    }
    get awsS3Bucket() {
        return this.config.AWS_S3_BUCKET;
    }
    get stripeSecretKey() {
        return this.config.STRIPE_SECRET_KEY;
    }
    get stripeWebhookSecret() {
        return this.config.STRIPE_WEBHOOK_SECRET;
    }
    get paypalClientSecret() {
        return this.config.PAYPAL_CLIENT_SECRET;
    }
    get logLevel() {
        return this.config.LOG_LEVEL ?? 'info';
    }
    get logFormat() {
        return this.config.LOG_FORMAT ?? 'json';
    }
    get metricsEnabled() {
        return this.config.ENABLE_METRICS ?? true;
    }
    get rateLimitWindow() {
        return this.config.RATE_LIMIT_WINDOW ?? 900000;
    }
    get rateLimitMaxRequests() {
        return this.config.RATE_LIMIT_MAX_REQUESTS ?? 100;
    }
    get sessionSecret() {
        if (!this.config.SESSION_SECRET) {
            throw new Error('SESSION_SECRET is required but not set');
        }
        return this.config.SESSION_SECRET;
    }
    get sessionTtl() {
        return this.config.SESSION_TTL ?? 86400000;
    }
    get corsOrigin() {
        return this.config.CORS_ORIGIN ?? '*';
    }
    get corsMethods() {
        return this.config.CORS_METHODS ?? 'GET,POST,PUT,DELETE,OPTIONS';
    }
    get corsHeaders() {
        return this.config.CORS_HEADERS ?? 'Content-Type,Authorization';
    }
    get webhookSecret() {
        if (!this.config.WEBHOOK_SECRET) {
            throw new Error('WEBHOOK_SECRET is required but not set');
        }
        return this.config.WEBHOOK_SECRET;
    }
    get webhookTimeout() {
        return this.config.WEBHOOK_TIMEOUT ?? 10000;
    }
    get backupSchedule() {
        return this.config.BACKUP_SCHEDULE ?? '0 2 * * *';
    }
    get backupRetentionDays() {
        return this.config.BACKUP_RETENTION_DAYS ?? 30;
    }
    get devServerPort() {
        return this.config.DEV_SERVER_PORT ?? 3000;
    }
    get devServerHost() {
        return this.config.DEV_SERVER_HOST ?? 'localhost';
    }
    get hotReload() {
        return this.config.HOT_RELOAD ?? true;
    }
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
    get appName() {
        return this.config.NEXT_PUBLIC_APP_NAME;
    }
    get appVersion() {
        return this.config.NEXT_PUBLIC_APP_VERSION;
    }
    get appDescription() {
        return this.config.NEXT_PUBLIC_APP_DESCRIPTION;
    }
    get theme() {
        return this.config.NEXT_PUBLIC_THEME;
    }
    get primaryColor() {
        return this.config.NEXT_PUBLIC_PRIMARY_COLOR;
    }
    get locale() {
        return this.config.NEXT_PUBLIC_LOCALE;
    }
    get devToolsEnabled() {
        return this.config.NEXT_PUBLIC_DEV_TOOLS;
    }
    get publicLogLevel() {
        return this.config.NEXT_PUBLIC_LOG_LEVEL;
    }
    get cacheTtl() {
        return this.config.NEXT_PUBLIC_CACHE_TTL;
    }
    get cacheEnabled() {
        return this.config.NEXT_PUBLIC_ENABLE_CACHE;
    }
    getDatabaseConfig() {
        return {
            url: this.databaseUrl,
            poolSize: this.databasePoolSize,
            timeout: this.databaseTimeout,
        };
    }
    getRedisConfig() {
        return {
            url: this.redisUrl,
            password: this.redisPassword,
            ttl: this.redisTtl,
        };
    }
    getSupabaseConfig() {
        return {
            url: this.supabaseUrl,
            anonKey: this.supabaseAnonKey,
            serviceRoleKey: this.supabaseServiceRoleKey,
        };
    }
    getEmailConfig() {
        return {
            host: this.smtpHost,
            port: this.smtpPort,
            user: this.smtpUser,
            pass: this.smtpPass,
            from: this.smtpFrom,
        };
    }
    getAwsConfig() {
        return {
            accessKeyId: this.awsAccessKeyId,
            secretAccessKey: this.awsSecretAccessKey,
            region: this.awsRegion,
            s3Bucket: this.awsS3Bucket,
        };
    }
    getPaymentConfig() {
        return {
            stripe: {
                secretKey: this.stripeSecretKey,
                webhookSecret: this.stripeWebhookSecret,
            },
            paypal: {
                clientSecret: this.paypalClientSecret,
            },
        };
    }
    getSecurityConfig() {
        return {
            jwt: {
                secret: this.jwtSecret,
                expiresIn: this.jwtExpiresIn,
            },
            apiKey: {
                secret: this.apiKeySecret,
            },
            session: {
                secret: this.sessionSecret,
                ttl: this.sessionTtl,
            },
            webhook: {
                secret: this.webhookSecret,
                timeout: this.webhookTimeout,
            },
        };
    }
    getCorsConfig() {
        return {
            origin: this.corsOrigin,
            methods: this.corsMethods,
            headers: this.corsHeaders,
        };
    }
    validateRequiredSecrets() {
        const required = [
            'JWT_SECRET',
            'API_KEY_SECRET',
            'SESSION_SECRET',
            'WEBHOOK_SECRET',
            'SUPABASE_SERVICE_ROLE_KEY',
        ];
        const missing = required.filter(key => !this.config[key]);
        return {
            valid: missing.length === 0,
            missing,
        };
    }
    getOptionalServicesStatus() {
        return {
            redis: !!this.redisUrl,
            email: !!this.smtpHost,
            aws: !!this.awsAccessKeyId,
            stripe: !!this.stripeSecretKey,
            paypal: !!this.paypalClientSecret,
            analytics: !!this.gaTrackingId,
            sentry: !!this.sentryDsn,
            hotjar: !!this.hotjarId,
        };
    }
}
let serverConfigInstance = null;
function getServerConfig() {
    if (!serverConfigInstance) {
        serverConfigInstance = ServerConfig.initialize();
    }
    return serverConfigInstance;
}
function initServerConfig(env) {
    serverConfigInstance = ServerConfig.initialize(env);
    return serverConfigInstance;
}
const serverConfigGetters = {
    get nodeEnv() { return getServerConfig().nodeEnv; },
    get isDevelopment() { return getServerConfig().isDevelopment; },
    get isProduction() { return getServerConfig().isProduction; },
    get isTest() { return getServerConfig().isTest; },
    get appUrl() { return getServerConfig().appUrl; },
    get apiUrl() { return getServerConfig().apiUrl; },
    get supabaseUrl() { return getServerConfig().supabaseUrl; },
    get supabaseAnonKey() { return getServerConfig().supabaseAnonKey; },
    get supabaseServiceRoleKey() { return getServerConfig().supabaseServiceRoleKey; },
    get databaseUrl() { return getServerConfig().databaseUrl; },
    get databasePoolSize() { return getServerConfig().databasePoolSize; },
    get databaseTimeout() { return getServerConfig().databaseTimeout; },
    get redisUrl() { return getServerConfig().redisUrl; },
    get redisPassword() { return getServerConfig().redisPassword; },
    get redisTtl() { return getServerConfig().redisTtl; },
    get apiPort() { return getServerConfig().apiPort; },
    get apiHost() { return getServerConfig().apiHost; },
    get apiTimeout() { return getServerConfig().apiTimeout; },
    get jwtSecret() { return getServerConfig().jwtSecret; },
    get jwtExpiresIn() { return getServerConfig().jwtExpiresIn; },
    get apiKeySecret() { return getServerConfig().apiKeySecret; },
    get smtpHost() { return getServerConfig().smtpHost; },
    get smtpPort() { return getServerConfig().smtpPort; },
    get smtpUser() { return getServerConfig().smtpUser; },
    get smtpPass() { return getServerConfig().smtpPass; },
    get smtpFrom() { return getServerConfig().smtpFrom; },
    get awsAccessKeyId() { return getServerConfig().awsAccessKeyId; },
    get awsSecretAccessKey() { return getServerConfig().awsSecretAccessKey; },
    get awsRegion() { return getServerConfig().awsRegion; },
    get awsS3Bucket() { return getServerConfig().awsS3Bucket; },
    get stripeSecretKey() { return getServerConfig().stripeSecretKey; },
    get stripeWebhookSecret() { return getServerConfig().stripeWebhookSecret; },
    get paypalClientSecret() { return getServerConfig().paypalClientSecret; },
    get logLevel() { return getServerConfig().logLevel; },
    get logFormat() { return getServerConfig().logFormat; },
    get metricsEnabled() { return getServerConfig().metricsEnabled; },
    get rateLimitWindow() { return getServerConfig().rateLimitWindow; },
    get rateLimitMaxRequests() { return getServerConfig().rateLimitMaxRequests; },
    get sessionSecret() { return getServerConfig().sessionSecret; },
    get sessionTtl() { return getServerConfig().sessionTtl; },
    get corsOrigin() { return getServerConfig().corsOrigin; },
    get corsMethods() { return getServerConfig().corsMethods; },
    get corsHeaders() { return getServerConfig().corsHeaders; },
    get webhookSecret() { return getServerConfig().webhookSecret; },
    get webhookTimeout() { return getServerConfig().webhookTimeout; },
    get backupSchedule() { return getServerConfig().backupSchedule; },
    get backupRetentionDays() { return getServerConfig().backupRetentionDays; },
    get devServerPort() { return getServerConfig().devServerPort; },
    get devServerHost() { return getServerConfig().devServerHost; },
    get hotReload() { return getServerConfig().hotReload; },
    get analyticsEnabled() { return getServerConfig().analyticsEnabled; },
    get errorReportingEnabled() { return getServerConfig().errorReportingEnabled; },
    get performanceMonitoringEnabled() { return getServerConfig().performanceMonitoringEnabled; },
    get featureXEnabled() { return getServerConfig().featureXEnabled; },
    get betaFeaturesEnabled() { return getServerConfig().betaFeaturesEnabled; },
    get gaTrackingId() { return getServerConfig().gaTrackingId; },
    get hotjarId() { return getServerConfig().hotjarId; },
    get sentryDsn() { return getServerConfig().sentryDsn; },
    get clarityId() { return getServerConfig().clarityId; },
    get inventoryUrl() { return getServerConfig().inventoryUrl; },
    get posUrl() { return getServerConfig().posUrl; },
    get crmUrl() { return getServerConfig().crmUrl; },
    get hrUrl() { return getServerConfig().hrUrl; },
    get accountingUrl() { return getServerConfig().accountingUrl; },
    get analyticsUrl() { return getServerConfig().analyticsUrl; },
    get appName() { return getServerConfig().appName; },
    get appVersion() { return getServerConfig().appVersion; },
    get appDescription() { return getServerConfig().appDescription; },
    get theme() { return getServerConfig().theme; },
    get primaryColor() { return getServerConfig().primaryColor; },
    get locale() { return getServerConfig().locale; },
    get devToolsEnabled() { return getServerConfig().devToolsEnabled; },
    get publicLogLevel() { return getServerConfig().publicLogLevel; },
    get cacheTtl() { return getServerConfig().cacheTtl; },
    get cacheEnabled() { return getServerConfig().cacheEnabled; },
};

const CONFIG_PACKAGE_VERSION = '1.0.0';

exports.BaseEnvironmentSchema = BaseEnvironmentSchema;
exports.CONFIG_PACKAGE_VERSION = CONFIG_PACKAGE_VERSION;
exports.ClientConfig = ClientConfig;
exports.DevelopmentEnvironmentSchema = DevelopmentEnvironmentSchema;
exports.ProductionEnvironmentSchema = ProductionEnvironmentSchema;
exports.ServerConfig = ServerConfig;
exports.ServerEnvironmentSchema = ServerEnvironmentSchema;
exports.TestEnvironmentSchema = TestEnvironmentSchema;
exports.clientConfigGetters = clientConfigGetters;
exports.getClientConfig = getClientConfig;
exports.getEnvironmentSchemaForCurrentEnv = getEnvironmentSchemaForCurrentEnv;
exports.getServerConfig = getServerConfig;
exports.initClientConfig = initClientConfig;
exports.initServerConfig = initServerConfig;
exports.serverConfigGetters = serverConfigGetters;
exports.validateClientEnvironment = validateClientEnvironment;
exports.validateServerEnvironment = validateServerEnvironment;
//# sourceMappingURL=index.js.map
