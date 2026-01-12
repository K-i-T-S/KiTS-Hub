import { z } from 'zod';
const baseEnvironmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url({
        message: 'Supabase URL must be a valid URL'
    }),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
        message: 'Supabase anonymous key is required'
    }),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_ENABLE_FEATURE_X: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
    NEXT_PUBLIC_HOTJAR_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
    NEXT_PUBLIC_INVENTORY_URL: z.string().url().default('http://localhost:4177'),
    NEXT_PUBLIC_POS_URL: z.string().url().default('http://localhost:4178'),
    NEXT_PUBLIC_CRM_URL: z.string().url().default('http://localhost:4179'),
    NEXT_PUBLIC_HR_URL: z.string().url().default('http://localhost:4180'),
    NEXT_PUBLIC_ACCOUNTING_URL: z.string().url().default('http://localhost:4181'),
    NEXT_PUBLIC_ANALYTICS_URL: z.string().url().default('http://localhost:4182'),
    NEXT_PUBLIC_APP_NAME: z.string().default('KiTS Hub'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
    NEXT_PUBLIC_APP_DESCRIPTION: z.string().default('Business Management Platform'),
    NEXT_PUBLIC_THEME: z.enum(['light', 'dark', 'auto']).default('auto'),
    NEXT_PUBLIC_PRIMARY_COLOR: z.string().default('#7c3aed'),
    NEXT_PUBLIC_LOCALE: z.string().default('en-US'),
    NEXT_PUBLIC_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    NEXT_PUBLIC_CACHE_TTL: z.string().transform(Number).default('300000'),
    NEXT_PUBLIC_ENABLE_CACHE: z.string().transform(val => val === 'true').default('true'),
});
const serverEnvironmentSchema = baseEnvironmentSchema.extend({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
        message: 'Supabase service role key is required for server operations'
    }),
    DATABASE_URL: z.string().url({
        message: 'Database URL must be a valid URL'
    }),
    DATABASE_POOL_SIZE: z.string().transform(Number).default('10'),
    DATABASE_TIMEOUT: z.string().transform(Number).default('30000'),
    REDIS_URL: z.string().url().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_TTL: z.string().transform(Number).default('3600'),
    API_PORT: z.string().transform(Number).default('3000'),
    API_HOST: z.string().default('localhost'),
    API_TIMEOUT: z.string().transform(Number).default('30000'),
    JWT_SECRET: z.string().min(32, {
        message: 'JWT secret must be at least 32 characters'
    }),
    JWT_EXPIRES_IN: z.string().default('7d'),
    API_KEY_SECRET: z.string().min(16, {
        message: 'API key secret must be at least 16 characters'
    }),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform(Number).default('587'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_S3_BUCKET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FORMAT: z.enum(['json', 'text']).default('json'),
    ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
    RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
    SESSION_SECRET: z.string().min(32, {
        message: 'Session secret must be at least 32 characters'
    }),
    SESSION_TTL: z.string().transform(Number).default('86400000'),
    CORS_ORIGIN: z.string().default('*'),
    CORS_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
    CORS_HEADERS: z.string().default('Content-Type,Authorization'),
    WEBHOOK_SECRET: z.string().min(16, {
        message: 'Webhook secret must be at least 16 characters'
    }),
    WEBHOOK_TIMEOUT: z.string().transform(Number).default('10000'),
    BACKUP_SCHEDULE: z.string().default('0 2 * * *'),
    BACKUP_RETENTION_DAYS: z.string().transform(Number).default('30'),
    DEV_SERVER_PORT: z.string().transform(Number).default('3000'),
    DEV_SERVER_HOST: z.string().default('localhost'),
    HOT_RELOAD: z.string().transform(val => val === 'true').default('true'),
});
const developmentEnvironmentSchema = serverEnvironmentSchema.extend({
    NEXT_PUBLIC_DEV_TOOLS: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    ENABLE_METRICS: z.string().transform(val => val === 'true').default('false'),
});
const productionEnvironmentSchema = serverEnvironmentSchema.extend({
    NEXT_PUBLIC_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info']).default('warn'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info']).default('warn'),
    ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), { message: 'Production cannot use localhost Supabase URLs' }),
    DATABASE_URL: z.string().url().refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), { message: 'Production cannot use localhost database URLs' }),
});
const testEnvironmentSchema = baseEnvironmentSchema.extend({
    NODE_ENV: z.literal('test'),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),
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
export const BaseEnvironmentSchema = baseEnvironmentSchema;
export const ServerEnvironmentSchema = serverEnvironmentSchema;
export const DevelopmentEnvironmentSchema = developmentEnvironmentSchema;
export const ProductionEnvironmentSchema = productionEnvironmentSchema;
export const TestEnvironmentSchema = testEnvironmentSchema;
export const getEnvironmentSchemaForCurrentEnv = getEnvironmentSchema;
//# sourceMappingURL=schema.js.map