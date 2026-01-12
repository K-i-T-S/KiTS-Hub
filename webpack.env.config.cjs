const webpack = require('webpack');

/**
 * Webpack Environment Configuration for KiTS Hub
 * 
 * This module provides secure environment variable injection for Webpack builds.
 * It ensures only NEXT_PUBLIC_* variables are exposed to the browser
 * while server-side variables remain secure.
 * 
 * Usage:
 * const envConfig = require('./webpack.env.config.cjs');
 * const webpackConfig = envConfig.getDefinePluginConfig(process.env);
 */

function getDefinePluginConfig(env = {}) {
  // Create environment object for DefinePlugin
  const defineEnv = {};
  
  // Core environment variables
  defineEnv['process.env.NODE_ENV'] = JSON.stringify(env.NODE_ENV || 'development');
  defineEnv['process.env.BUILD_TIME'] = JSON.stringify(new Date().toISOString());
  defineEnv['process.env.BUILD_VERSION'] = JSON.stringify(require('./package.json').version || '1.0.0');
  
  // Build-time constants
  defineEnv['process.env.IS_BROWSER'] = JSON.stringify(true);
  defineEnv['process.env.IS_SERVER'] = JSON.stringify(false);
  
  // Security: Only expose NEXT_PUBLIC_* variables to browser
  Object.keys(env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      const value = env[key];
      
      // Validate and sanitize the value
      if (value !== undefined && value !== null) {
        // Ensure no script tags or dangerous content
        const sanitizedValue = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
        
        defineEnv[`process.env.${key}`] = JSON.stringify(sanitizedValue);
      }
    }
  });
  
  // Feature flags object for easier access
  const featureFlags = {};
  Object.keys(env)
    .filter(key => key.startsWith('NEXT_PUBLIC_ENABLE_'))
    .forEach(key => {
      const flagName = key.replace('NEXT_PUBLIC_ENABLE_', '').toLowerCase();
      featureFlags[flagName] = env[key] === 'true';
    });
  
  defineEnv['process.env.FEATURE_FLAGS'] = JSON.stringify(featureFlags);
  
  // Security: Block common secret patterns
  defineEnv['process.env.SECRETS_BLOCKED'] = JSON.stringify(true);
  
  // Micro-frontend URLs object
  const microFrontendUrls = {
    inventory: env.NEXT_PUBLIC_INVENTORY_URL,
    pos: env.NEXT_PUBLIC_POS_URL,
    crm: env.NEXT_PUBLIC_CRM_URL,
    hr: env.NEXT_PUBLIC_HR_URL,
    accounting: env.NEXT_PUBLIC_ACCOUNTING_URL,
    analytics: env.NEXT_PUBLIC_ANALYTICS_URL,
  };
  
  defineEnv['process.env.MICRO_FRONTEND_URLS'] = JSON.stringify(microFrontendUrls);
  
  // Analytics configuration object
  const analyticsConfig = {
    enabled: env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    gaTrackingId: env.NEXT_PUBLIC_GA_TRACKING_ID,
    hotjarId: env.NEXT_PUBLIC_HOTJAR_ID,
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
    clarityId: env.NEXT_PUBLIC_CLARITY_ID,
  };
  
  defineEnv['process.env.ANALYTICS_CONFIG'] = JSON.stringify(analyticsConfig);
  
  // Application configuration object
  const appConfig = {
    name: env.NEXT_PUBLIC_APP_NAME || 'KiTS Hub',
    version: env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: env.NEXT_PUBLIC_APP_DESCRIPTION || 'Business Management Platform',
    url: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    apiUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  };
  
  defineEnv['process.env.APP_CONFIG'] = JSON.stringify(appConfig);
  
  // UI configuration object
  const uiConfig = {
    theme: env.NEXT_PUBLIC_THEME || 'auto',
    primaryColor: env.NEXT_PUBLIC_PRIMARY_COLOR || '#7c3aed',
    locale: env.NEXT_PUBLIC_LOCALE || 'en-US',
    devTools: env.NEXT_PUBLIC_DEV_TOOLS === 'true',
  };
  
  defineEnv['process.env.UI_CONFIG'] = JSON.stringify(uiConfig);
  
  // Supabase configuration (public only)
  const supabaseConfig = {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  
  defineEnv['process.env.SUPABASE_CONFIG'] = JSON.stringify(supabaseConfig);
  
  return defineEnv;
}

/**
 * Create Webpack DefinePlugin with environment configuration
 * @param {Object} env - Process environment variables
 * @returns {webpack.DefinePlugin} - Configured DefinePlugin instance
 */
function createDefinePlugin(env = {}) {
  const defineConfig = getDefinePluginConfig(env);
  return new webpack.DefinePlugin(defineConfig);
}

/**
 * Validate environment variables for security
 * @param {Object} env - Process environment variables
 * @returns {Object} - Validation result with errors and warnings
 */
function validateEnvironment(env = {}) {
  const errors = [];
  const warnings = [];
  
  // Check for required public variables
  const requiredPublicVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  requiredPublicVars.forEach(varName => {
    if (!env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Check for potentially exposed secrets
  const secretPatterns = [
    /SECRET/i,
    /PRIVATE/i,
    /PASSWORD/i,
    /TOKEN/i,
    /KEY/i,
  ];
  
  Object.keys(env).forEach(key => {
    if (!key.startsWith('NEXT_PUBLIC_')) {
      secretPatterns.forEach(pattern => {
        if (pattern.test(key) && env[key]) {
          warnings.push(`Potential secret exposed: ${key} (should be server-only)`);
        }
      });
    }
  });
  
  // Validate URLs
  const urlVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
  ];
  
  urlVars.forEach(varName => {
    const value = env[varName];
    if (value && !isValidUrl(value)) {
      errors.push(`Invalid URL format for ${varName}: ${value}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get environment-specific configuration
 * @param {string} nodeEnv - Node environment (development, production, test)
 * @returns {Object} - Environment-specific overrides
 */
function getEnvironmentOverrides(nodeEnv = 'development') {
  const overrides = {
    development: {
      logLevel: 'debug',
      enableSourceMaps: true,
      enableMinification: false,
      enableDevTools: true,
    },
    production: {
      logLevel: 'warn',
      enableSourceMaps: false,
      enableMinification: true,
      enableDevTools: false,
    },
    test: {
      logLevel: 'error',
      enableSourceMaps: false,
      enableMinification: false,
      enableDevTools: false,
    },
  };
  
  return overrides[nodeEnv] || overrides.development;
}

module.exports = {
  getDefinePluginConfig,
  createDefinePlugin,
  validateEnvironment,
  getEnvironmentOverrides,
  isValidUrl,
};
