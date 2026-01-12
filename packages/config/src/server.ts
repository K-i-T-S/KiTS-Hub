import { z } from 'zod';
import { 
  getEnvironmentSchemaForCurrentEnv, 
  DevelopmentEnvironment,
  ProductionEnvironment,
  TestEnvironment 
} from './schema';

/**
 * Server-side configuration utilities
 * Provides type-safe access to all environment variables (including server-only secrets)
 */

// Union type for all possible server configurations
type ServerConfigUnion = 
  | (DevelopmentEnvironment & { NODE_ENV: 'development' })
  | (ProductionEnvironment & { NODE_ENV: 'production' })
  | (TestEnvironment & { NODE_ENV: 'test' });

// Full server config type that includes all possible properties
type FullServerConfig = ServerConfigUnion & {
  // Server-only properties that may not exist in test environment
  SUPABASE_SERVICE_ROLE_KEY?: string;
  DATABASE_URL?: string;
  DATABASE_POOL_SIZE?: number;
  DATABASE_TIMEOUT?: number;
  REDIS_URL?: string;
  REDIS_PASSWORD?: string;
  REDIS_TTL?: number;
  API_PORT?: number;
  API_HOST?: string;
  API_TIMEOUT?: number;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  API_KEY_SECRET?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PAYPAL_CLIENT_SECRET?: string;
  LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
  LOG_FORMAT?: 'json' | 'text';
  ENABLE_METRICS?: boolean;
  RATE_LIMIT_WINDOW?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
  SESSION_SECRET?: string;
  SESSION_TTL?: number;
  CORS_ORIGIN?: string;
  CORS_METHODS?: string;
  CORS_HEADERS?: string;
  WEBHOOK_SECRET?: string;
  WEBHOOK_TIMEOUT?: number;
  BACKUP_SCHEDULE?: string;
  BACKUP_RETENTION_DAYS?: number;
  DEV_SERVER_PORT?: number;
  DEV_SERVER_HOST?: string;
  HOT_RELOAD?: boolean;
};

// Export the type for external use
export type ServerConfigType = FullServerConfig;

/**
 * Validates and returns server-side environment configuration
 * This function should be called once at application startup
 */
export function validateServerEnvironment(env: Record<string, string | undefined> = process.env): ServerConfigType {
  try {
    const schema = getEnvironmentSchemaForCurrentEnv();
    const result = schema.parse(env) as ServerConfigType;
    return result;
  } catch (error) {
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

/**
 * Server configuration class with type-safe accessors
 */
export class ServerConfig {
  private static instance: ServerConfig;
  private config: ServerConfigType;
  
  private constructor(env: Record<string, string | undefined>) {
    this.config = validateServerEnvironment(env);
  }
  
  /**
   * Initialize the server configuration
   * This should be called once at application startup
   */
  static initialize(env: Record<string, string | undefined> = process.env): ServerConfig {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig(env);
    }
    return ServerConfig.instance;
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): ServerConfig {
    if (!ServerConfig.instance) {
      throw new Error('ServerConfig not initialized. Call ServerConfig.initialize() first.');
    }
    return ServerConfig.instance;
  }
  
  /**
   * Get the entire configuration object
   */
  getAll(): ServerConfigType {
    return { ...this.config };
  }
  
  // Environment identification
  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }
  
  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }
  
  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
  
  get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
  
  // Application URLs and endpoints
  get appUrl(): string {
    return this.config.NEXT_PUBLIC_APP_URL;
  }
  
  get apiUrl(): string {
    return this.config.NEXT_PUBLIC_API_URL;
  }
  
  // Supabase Configuration
  get supabaseUrl(): string {
    return this.config.NEXT_PUBLIC_SUPABASE_URL;
  }
  
  get supabaseAnonKey(): string {
    return this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  
  get supabaseServiceRoleKey(): string {
    if (!this.config.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set');
    }
    return this.config.SUPABASE_SERVICE_ROLE_KEY;
  }
  
  // Database Configuration
  get databaseUrl(): string {
    if (!this.config.DATABASE_URL) {
      throw new Error('DATABASE_URL is required but not set');
    }
    return this.config.DATABASE_URL;
  }
  
  get databasePoolSize(): number {
    return this.config.DATABASE_POOL_SIZE ?? 10;
  }
  
  get databaseTimeout(): number {
    return this.config.DATABASE_TIMEOUT ?? 30000;
  }
  
  // Redis Configuration
  get redisUrl(): string | undefined {
    return this.config.REDIS_URL;
  }
  
  get redisPassword(): string | undefined {
    return this.config.REDIS_PASSWORD;
  }
  
  get redisTtl(): number {
    return this.config.REDIS_TTL ?? 3600;
  }
  
  // API Configuration
  get apiPort(): number {
    return this.config.API_PORT ?? 3000;
  }
  
  get apiHost(): string {
    return this.config.API_HOST ?? 'localhost';
  }
  
  get apiTimeout(): number {
    return this.config.API_TIMEOUT ?? 30000;
  }
  
  // Security Configuration
  get jwtSecret(): string {
    if (!this.config.JWT_SECRET) {
      throw new Error('JWT_SECRET is required but not set');
    }
    return this.config.JWT_SECRET;
  }
  
  get jwtExpiresIn(): string {
    return this.config.JWT_EXPIRES_IN ?? '7d';
  }
  
  get apiKeySecret(): string {
    if (!this.config.API_KEY_SECRET) {
      throw new Error('API_KEY_SECRET is required but not set');
    }
    return this.config.API_KEY_SECRET;
  }
  
  // Email Configuration
  get smtpHost(): string | undefined {
    return this.config.SMTP_HOST;
  }
  
  get smtpPort(): number {
    return this.config.SMTP_PORT ?? 587;
  }
  
  get smtpUser(): string | undefined {
    return this.config.SMTP_USER;
  }
  
  get smtpPass(): string | undefined {
    return this.config.SMTP_PASS;
  }
  
  get smtpFrom(): string | undefined {
    return this.config.SMTP_FROM;
  }
  
  // File Storage Configuration
  get awsAccessKeyId(): string | undefined {
    return this.config.AWS_ACCESS_KEY_ID;
  }
  
  get awsSecretAccessKey(): string | undefined {
    return this.config.AWS_SECRET_ACCESS_KEY;
  }
  
  get awsRegion(): string {
    return this.config.AWS_REGION ?? 'us-east-1';
  }
  
  get awsS3Bucket(): string | undefined {
    return this.config.AWS_S3_BUCKET;
  }
  
  // Payment Configuration
  get stripeSecretKey(): string | undefined {
    return this.config.STRIPE_SECRET_KEY;
  }
  
  get stripeWebhookSecret(): string | undefined {
    return this.config.STRIPE_WEBHOOK_SECRET;
  }
  
  get paypalClientSecret(): string | undefined {
    return this.config.PAYPAL_CLIENT_SECRET;
  }
  
  // Monitoring and Logging
  get logLevel(): 'error' | 'warn' | 'info' | 'debug' {
    return this.config.LOG_LEVEL ?? 'info';
  }
  
  get logFormat(): 'json' | 'text' {
    return this.config.LOG_FORMAT ?? 'json';
  }
  
  get metricsEnabled(): boolean {
    return this.config.ENABLE_METRICS ?? true;
  }
  
  // Rate Limiting
  get rateLimitWindow(): number {
    return this.config.RATE_LIMIT_WINDOW ?? 900000;
  }
  
  get rateLimitMaxRequests(): number {
    return this.config.RATE_LIMIT_MAX_REQUESTS ?? 100;
  }
  
  // Session Configuration
  get sessionSecret(): string {
    if (!this.config.SESSION_SECRET) {
      throw new Error('SESSION_SECRET is required but not set');
    }
    return this.config.SESSION_SECRET;
  }
  
  get sessionTtl(): number {
    return this.config.SESSION_TTL ?? 86400000;
  }
  
  // CORS Configuration
  get corsOrigin(): string {
    return this.config.CORS_ORIGIN ?? '*';
  }
  
  get corsMethods(): string {
    return this.config.CORS_METHODS ?? 'GET,POST,PUT,DELETE,OPTIONS';
  }
  
  get corsHeaders(): string {
    return this.config.CORS_HEADERS ?? 'Content-Type,Authorization';
  }
  
  // Webhook Configuration
  get webhookSecret(): string {
    if (!this.config.WEBHOOK_SECRET) {
      throw new Error('WEBHOOK_SECRET is required but not set');
    }
    return this.config.WEBHOOK_SECRET;
  }
  
  get webhookTimeout(): number {
    return this.config.WEBHOOK_TIMEOUT ?? 10000;
  }
  
  // Backup Configuration
  get backupSchedule(): string {
    return this.config.BACKUP_SCHEDULE ?? '0 2 * * *';
  }
  
  get backupRetentionDays(): number {
    return this.config.BACKUP_RETENTION_DAYS ?? 30;
  }
  
  // Development Server Configuration
  get devServerPort(): number {
    return this.config.DEV_SERVER_PORT ?? 3000;
  }
  
  get devServerHost(): string {
    return this.config.DEV_SERVER_HOST ?? 'localhost';
  }
  
  get hotReload(): boolean {
    return this.config.HOT_RELOAD ?? true;
  }
  
  // Feature Flags (inherited from client config)
  get analyticsEnabled(): boolean {
    return this.config.NEXT_PUBLIC_ENABLE_ANALYTICS;
  }
  
  get errorReportingEnabled(): boolean {
    return this.config.NEXT_PUBLIC_ENABLE_ERROR_REPORTING;
  }
  
  get performanceMonitoringEnabled(): boolean {
    return this.config.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING;
  }
  
  get featureXEnabled(): boolean {
    return this.config.NEXT_PUBLIC_ENABLE_FEATURE_X;
  }
  
  get betaFeaturesEnabled(): boolean {
    return this.config.NEXT_PUBLIC_ENABLE_BETA_FEATURES;
  }
  
  // Analytics and Tracking
  get gaTrackingId(): string | undefined {
    return this.config.NEXT_PUBLIC_GA_TRACKING_ID;
  }
  
  get hotjarId(): string | undefined {
    return this.config.NEXT_PUBLIC_HOTJAR_ID;
  }
  
  get sentryDsn(): string | undefined {
    return this.config.NEXT_PUBLIC_SENTRY_DSN;
  }
  
  get clarityId(): string | undefined {
    return this.config.NEXT_PUBLIC_CLARITY_ID;
  }
  
  // Micro-frontend URLs
  get inventoryUrl(): string {
    return this.config.NEXT_PUBLIC_INVENTORY_URL;
  }
  
  get posUrl(): string {
    return this.config.NEXT_PUBLIC_POS_URL;
  }
  
  get crmUrl(): string {
    return this.config.NEXT_PUBLIC_CRM_URL;
  }
  
  get hrUrl(): string {
    return this.config.NEXT_PUBLIC_HR_URL;
  }
  
  get accountingUrl(): string {
    return this.config.NEXT_PUBLIC_ACCOUNTING_URL;
  }
  
  get analyticsUrl(): string {
    return this.config.NEXT_PUBLIC_ANALYTICS_URL;
  }
  
  // Application Configuration
  get appName(): string {
    return this.config.NEXT_PUBLIC_APP_NAME;
  }
  
  get appVersion(): string {
    return this.config.NEXT_PUBLIC_APP_VERSION;
  }
  
  get appDescription(): string {
    return this.config.NEXT_PUBLIC_APP_DESCRIPTION;
  }
  
  // UI Configuration
  get theme(): 'light' | 'dark' | 'auto' {
    return this.config.NEXT_PUBLIC_THEME;
  }
  
  get primaryColor(): string {
    return this.config.NEXT_PUBLIC_PRIMARY_COLOR;
  }
  
  get locale(): string {
    return this.config.NEXT_PUBLIC_LOCALE;
  }
  
  // Development Configuration
  get devToolsEnabled(): boolean {
    return this.config.NEXT_PUBLIC_DEV_TOOLS;
  }
  
  get publicLogLevel(): 'error' | 'warn' | 'info' | 'debug' {
    return this.config.NEXT_PUBLIC_LOG_LEVEL;
  }
  
  // Cache Configuration
  get cacheTtl(): number {
    return this.config.NEXT_PUBLIC_CACHE_TTL;
  }
  
  get cacheEnabled(): boolean {
    return this.config.NEXT_PUBLIC_ENABLE_CACHE;
  }
  
  /**
   * Get database configuration object
   */
  getDatabaseConfig() {
    return {
      url: this.databaseUrl,
      poolSize: this.databasePoolSize,
      timeout: this.databaseTimeout,
    };
  }
  
  /**
   * Get Redis configuration object
   */
  getRedisConfig() {
    return {
      url: this.redisUrl,
      password: this.redisPassword,
      ttl: this.redisTtl,
    };
  }
  
  /**
   * Get Supabase configuration object
   */
  getSupabaseConfig() {
    return {
      url: this.supabaseUrl,
      anonKey: this.supabaseAnonKey,
      serviceRoleKey: this.supabaseServiceRoleKey,
    };
  }
  
  /**
   * Get email configuration object
   */
  getEmailConfig() {
    return {
      host: this.smtpHost,
      port: this.smtpPort,
      user: this.smtpUser,
      pass: this.smtpPass,
      from: this.smtpFrom,
    };
  }
  
  /**
   * Get AWS configuration object
   */
  getAwsConfig() {
    return {
      accessKeyId: this.awsAccessKeyId,
      secretAccessKey: this.awsSecretAccessKey,
      region: this.awsRegion,
      s3Bucket: this.awsS3Bucket,
    };
  }
  
  /**
   * Get payment configuration object
   */
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
  
  /**
   * Get security configuration object
   */
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
  
  /**
   * Get CORS configuration object
   */
  getCorsConfig() {
    return {
      origin: this.corsOrigin,
      methods: this.corsMethods,
      headers: this.corsHeaders,
    };
  }
  
  /**
   * Check if all required secrets are present
   */
  validateRequiredSecrets(): { valid: boolean; missing: string[] } {
    const required = [
      'JWT_SECRET',
      'API_KEY_SECRET',
      'SESSION_SECRET',
      'WEBHOOK_SECRET',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];
    
    const missing = required.filter(key => !this.config[key as keyof ServerConfigType]);
    
    return {
      valid: missing.length === 0,
      missing,
    };
  }
  
  /**
   * Check if optional services are configured
   */
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

// Export a singleton instance for convenience
let serverConfigInstance: ServerConfig | null = null;

/**
 * Get the server configuration instance
 * Initializes if not already done
 */
export function getServerConfig(): ServerConfig {
  if (!serverConfigInstance) {
    serverConfigInstance = ServerConfig.initialize();
  }
  return serverConfigInstance;
}

/**
 * Initialize server configuration with custom environment
 */
export function initServerConfig(env: Record<string, string | undefined>): ServerConfig {
  serverConfigInstance = ServerConfig.initialize(env);
  return serverConfigInstance;
}

// Export individual getters for convenience
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
