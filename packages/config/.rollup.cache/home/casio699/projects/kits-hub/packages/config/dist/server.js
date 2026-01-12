import { z } from 'zod';
import { getEnvironmentSchemaForCurrentEnv } from './schema';
export function validateServerEnvironment(env = process.env) {
    try {
        const schema = getEnvironmentSchemaForCurrentEnv();
        const result = schema.parse(env);
        return result;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
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
export class ServerConfig {
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
export function getServerConfig() {
    if (!serverConfigInstance) {
        serverConfigInstance = ServerConfig.initialize();
    }
    return serverConfigInstance;
}
export function initServerConfig(env) {
    serverConfigInstance = ServerConfig.initialize(env);
    return serverConfigInstance;
}
export const serverConfigGetters = {
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
//# sourceMappingURL=server.js.map