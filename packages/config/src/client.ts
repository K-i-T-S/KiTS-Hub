import { z } from 'zod';
import { BaseEnvironmentSchema } from './schema';

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

// Type for client environment
export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;

/**
 * Validates and returns client-side environment configuration
 * This function should be called once at application startup
 */
export function validateClientEnvironment(env: Record<string, string | undefined> = process.env): ClientEnvironment {
  try {
    const result = clientEnvironmentSchema.parse(env);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
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
export class ClientConfig {
  private static instance: ClientConfig;
  private config: ClientEnvironment;
  
  private constructor(env: Record<string, string | undefined>) {
    this.config = validateClientEnvironment(env);
  }
  
  /**
   * Initialize the client configuration
   * This should be called once at application startup
   */
  static initialize(env: Record<string, string | undefined> = process.env): ClientConfig {
    if (!ClientConfig.instance) {
      ClientConfig.instance = new ClientConfig(env);
    }
    return ClientConfig.instance;
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): ClientConfig {
    if (!ClientConfig.instance) {
      throw new Error('ClientConfig not initialized. Call ClientConfig.initialize() first.');
    }
    return ClientConfig.instance;
  }
  
  /**
   * Get the entire configuration object
   */
  getAll(): ClientEnvironment {
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
  
  // Feature Flags
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
  
  get logLevel(): 'error' | 'warn' | 'info' | 'debug' {
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
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(feature: keyof Pick<ClientEnvironment, 'NEXT_PUBLIC_ENABLE_ANALYTICS' | 'NEXT_PUBLIC_ENABLE_ERROR_REPORTING' | 'NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING' | 'NEXT_PUBLIC_ENABLE_FEATURE_X' | 'NEXT_PUBLIC_ENABLE_BETA_FEATURES'>): boolean {
    return this.config[feature];
  }
  
  /**
   * Get micro-frontend URL by name
   */
  getMicroFrontendUrl(name: 'inventory' | 'pos' | 'crm' | 'hr' | 'accounting' | 'analytics'): string {
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
let clientConfigInstance: ClientConfig | null = null;

/**
 * Get the client configuration instance
 * Initializes if not already done
 */
export function getClientConfig(): ClientConfig {
  if (!clientConfigInstance) {
    clientConfigInstance = ClientConfig.initialize();
  }
  return clientConfigInstance;
}

/**
 * Initialize client configuration with custom environment
 */
export function initClientConfig(env: Record<string, string | undefined>): ClientConfig {
  clientConfigInstance = ClientConfig.initialize(env);
  return clientConfigInstance;
}

// Export individual getters for convenience
export const clientConfigGetters = {
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
