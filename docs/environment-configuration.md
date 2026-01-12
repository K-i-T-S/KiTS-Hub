# Environment Configuration Guide

## Overview

This guide provides comprehensive documentation for the KiTS Hub environment configuration system. The system ensures secure, type-safe access to environment variables across the micro-frontend architecture while preventing secret leakage to the browser.

## Architecture

### Configuration Package Structure

```
packages/config/
├── src/
│   ├── index.ts          # Main exports
│   ├── schema.ts         # Zod validation schemas
│   ├── client.ts         # Browser-safe configuration
│   └── server.ts         # Server-side configuration
├── package.json
├── tsconfig.json
└── rollup.config.js
```

### Security Model

- **Browser (Client)**: Only `NEXT_PUBLIC_*` variables are exposed
- **Server**: All environment variables are available
- **Build-time**: Variables are injected via Webpack DefinePlugin
- **Runtime**: Validation ensures required variables are present

## Environment Variables

### Core Environment Variables

#### Environment Identification
- `NODE_ENV` - Environment (development, production, test)
  - **Required**: Yes
  - **Browser**: Yes
  - **Default**: `development`

#### Application URLs
- `NEXT_PUBLIC_APP_URL` - Main application URL
  - **Required**: Yes
  - **Browser**: Yes
  - **Example**: `https://app.kitshub.com`

- `NEXT_PUBLIC_API_URL` - API endpoint URL
  - **Required**: Yes
  - **Browser**: Yes
  - **Example**: `https://api.kitshub.com`

### Supabase Configuration

#### Public (Browser-Safe)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - **Required**: Yes
  - **Browser**: Yes
  - **Format**: `https://your-project.supabase.co`

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - **Required**: Yes
  - **Browser**: Yes
  - **Security**: Public key, safe for browser

#### Server-Only
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
  - **Required**: Yes (Server)
  - **Browser**: No
  - **Security**: Admin key, never expose to browser

### Database Configuration (Server-Only)

- `DATABASE_URL` - PostgreSQL connection string
  - **Required**: Yes (Server)
  - **Format**: `postgresql://user:password@host:port/database`
  - **Example**: `postgresql://postgres:password@localhost:5432/kits_hub`

- `DATABASE_POOL_SIZE` - Connection pool size
  - **Required**: No
  - **Default**: `10`
  - **Type**: Number

- `DATABASE_TIMEOUT` - Query timeout in milliseconds
  - **Required**: No
  - **Default**: `30000` (30 seconds)

### Redis Configuration (Server-Only, Optional)

- `REDIS_URL` - Redis connection URL
  - **Required**: No
  - **Example**: `redis://localhost:6379`

- `REDIS_PASSWORD` - Redis password
  - **Required**: No
  - **Security**: Only if Redis requires authentication

- `REDIS_TTL` - Default TTL in seconds
  - **Required**: No
  - **Default**: `3600` (1 hour)

### Security Configuration (Server-Only)

#### Authentication
- `JWT_SECRET` - JWT signing secret
  - **Required**: Yes (Server)
  - **Minimum**: 32 characters
  - **Security**: Generate with `openssl rand -base64 32`

- `JWT_EXPIRES_IN` - JWT expiration time
  - **Required**: No
  - **Default**: `7d`
  - **Format**: Duration string (e.g., `7d`, `24h`, `30m`)

- `API_KEY_SECRET` - API authentication secret
  - **Required**: Yes (Server)
  - **Minimum**: 16 characters

- `SESSION_SECRET` - Session management secret
  - **Required**: Yes (Server)
  - **Minimum**: 32 characters

- `SESSION_TTL` - Session timeout in milliseconds
  - **Required**: No
  - **Default**: `86400000` (24 hours)

#### Webhooks
- `WEBHOOK_SECRET` - Webhook signature verification
  - **Required**: Yes (Server)
  - **Minimum**: 16 characters

- `WEBHOOK_TIMEOUT` - Webhook timeout in milliseconds
  - **Required**: No
  - **Default**: `10000` (10 seconds)

### Email Configuration (Server-Only, Optional)

- `SMTP_HOST` - SMTP server hostname
  - **Required**: No
  - **Example**: `smtp.gmail.com`

- `SMTP_PORT` - SMTP server port
  - **Required**: No
  - **Default**: `587`

- `SMTP_USER` - SMTP username
  - **Required**: No

- `SMTP_PASS` - SMTP password or app password
  - **Required**: No

- `SMTP_FROM` - Default from email address
  - **Required**: No
  - **Format**: Valid email address

### File Storage Configuration (Server-Only, Optional)

- `AWS_ACCESS_KEY_ID` - AWS access key
  - **Required**: No

- `AWS_SECRET_ACCESS_KEY` - AWS secret key
  - **Required**: No

- `AWS_REGION` - AWS region
  - **Required**: No
  - **Default**: `us-east-1`

- `AWS_S3_BUCKET` - S3 bucket name
  - **Required**: No

### Payment Configuration (Server-Only, Optional)

- `STRIPE_SECRET_KEY` - Stripe secret key
  - **Required**: No
  - **Format**: `sk_test_...` or `sk_live_...`

- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
  - **Required**: No

- `PAYPAL_CLIENT_SECRET` - PayPal client secret
  - **Required**: No

### Feature Flags (Public)

- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics tracking
  - **Required**: No
  - **Default**: `false`
  - **Type**: Boolean

- `NEXT_PUBLIC_ENABLE_ERROR_REPORTING` - Enable error reporting
  - **Required**: No
  - **Default**: `true`
  - **Type**: Boolean

- `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring
  - **Required**: No
  - **Default**: `true`
  - **Type**: Boolean

- `NEXT_PUBLIC_ENABLE_FEATURE_X` - Enable experimental feature X
  - **Required**: No
  - **Default**: `false`
  - **Type**: Boolean

- `NEXT_PUBLIC_ENABLE_BETA_FEATURES` - Enable beta features
  - **Required**: No
  - **Default**: `false`
  - **Type**: Boolean

### Analytics and Tracking (Public)

- `NEXT_PUBLIC_GA_TRACKING_ID` - Google Analytics tracking ID
  - **Required**: No
  - **Format**: `G-XXXXXXXXXX`

- `NEXT_PUBLIC_HOTJAR_ID` - Hotjar site ID
  - **Required**: No
  - **Format**: Numeric ID

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN
  - **Required**: No
  - **Format**: URL

- `NEXT_PUBLIC_CLARITY_ID` - Microsoft Clarity ID
  - **Required**: No

### Micro-Frontend URLs (Public)

- `NEXT_PUBLIC_INVENTORY_URL` - Inventory Management URL
  - **Required**: No
  - **Default**: `http://localhost:4177`

- `NEXT_PUBLIC_POS_URL` - Point of Sale URL
  - **Required**: No
  - **Default**: `http://localhost:4178`

- `NEXT_PUBLIC_CRM_URL` - CRM System URL
  - **Required**: No
  - **Default**: `http://localhost:4179`

- `NEXT_PUBLIC_HR_URL` - HR Management URL
  - **Required**: No
  - **Default**: `http://localhost:4180`

- `NEXT_PUBLIC_ACCOUNTING_URL` - Accounting System URL
  - **Required**: No
  - **Default**: `http://localhost:4181`

- `NEXT_PUBLIC_ANALYTICS_URL` - Analytics Dashboard URL
  - **Required**: No
  - **Default**: `http://localhost:4182`

### Application Configuration (Public)

- `NEXT_PUBLIC_APP_NAME` - Application name
  - **Required**: No
  - **Default**: `KiTS Hub`

- `NEXT_PUBLIC_APP_VERSION` - Application version
  - **Required**: No
  - **Default**: `1.0.0`

- `NEXT_PUBLIC_APP_DESCRIPTION` - Application description
  - **Required**: No
  - **Default**: `Business Management Platform`

### UI Configuration (Public)

- `NEXT_PUBLIC_THEME` - UI theme
  - **Required**: No
  - **Default**: `auto`
  - **Options**: `light`, `dark`, `auto`

- `NEXT_PUBLIC_PRIMARY_COLOR` - Primary theme color
  - **Required**: No
  - **Default**: `#7c3aed`
  - **Format**: Hex color code

- `NEXT_PUBLIC_LOCALE` - Application locale
  - **Required**: No
  - **Default**: `en-US`
  - **Format**: Language-region code

### Development Configuration (Public)

- `NEXT_PUBLIC_DEV_TOOLS` - Enable development tools
  - **Required**: No
  - **Default**: `false` (production), `true` (development)
  - **Type**: Boolean

- `NEXT_PUBLIC_LOG_LEVEL` - Client-side log level
  - **Required**: No
  - **Default**: `info`
  - **Options**: `error`, `warn`, `info`, `debug`

### Cache Configuration (Public)

- `NEXT_PUBLIC_CACHE_TTL` - Cache TTL in milliseconds
  - **Required**: No
  - **Default**: `300000` (5 minutes)
  - **Type**: Number

- `NEXT_PUBLIC_ENABLE_CACHE` - Enable client-side caching
  - **Required**: No
  - **Default**: `true`
  - **Type**: Boolean

## Usage Examples

### Client-Side Configuration

```typescript
import { getClientConfig } from '@kits-hub/config/client';

// Initialize configuration
const config = getClientConfig();

// Access configuration values
const supabaseUrl = config.supabaseUrl;
const analyticsEnabled = config.analyticsEnabled;
const appTheme = config.theme;

// Check if feature is enabled
if (config.isFeatureEnabled('analytics')) {
  // Initialize analytics
}

// Get micro-frontend URL
const inventoryUrl = config.getMicroFrontendUrl('inventory');
```

### Server-Side Configuration

```typescript
import { getServerConfig } from '@kits-hub/config/server';

// Initialize configuration
const config = getServerConfig();

// Access server-only values
const databaseUrl = config.databaseUrl;
const jwtSecret = config.jwtSecret;

// Get configuration objects
const dbConfig = config.getDatabaseConfig();
const supabaseConfig = config.getSupabaseConfig();
const emailConfig = config.getEmailConfig();

// Validate required secrets
const secretsValidation = config.validateRequiredSecrets();
if (!secretsValidation.valid) {
  console.error('Missing secrets:', secretsValidation.missing);
}

// Check optional services
const servicesStatus = config.getOptionalServicesStatus();
if (servicesStatus.redis) {
  // Initialize Redis client
}
```

### Environment-Specific Configurations

#### Development Environment
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXT_PUBLIC_DEV_TOOLS=true
LOG_LEVEL=debug
```

#### Production Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.kitshub.com
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
DATABASE_URL=postgresql://user:pass@prod-db.supabase.co:5432/postgres
NEXT_PUBLIC_DEV_TOOLS=false
LOG_LEVEL=warn
CORS_ORIGIN=https://app.kitshub.com
```

## Webpack Integration

### Using the Environment Configuration

```javascript
// webpack.config.cjs
const { createDefinePlugin } = require('./webpack.env.config.cjs');

module.exports = (env = {}) => {
  return {
    // ... other webpack config
    plugins: [
      // Secure environment variable injection
      createDefinePlugin(process.env),
      
      // ... other plugins
    ],
  };
};
```

### Available Build-Time Objects

- `process.env.FEATURE_FLAGS` - Object with all feature flags
- `process.env.APP_CONFIG` - Application configuration object
- `process.env.UI_CONFIG` - UI configuration object
- `process.env.ANALYTICS_CONFIG` - Analytics configuration object
- `process.env.SUPABASE_CONFIG` - Supabase configuration object
- `process.env.MICRO_FRONTEND_URLS` - Micro-frontend URLs object

## Security Considerations

### Secret Protection

1. **Never** commit real secrets to version control
2. **Always** use different values for different environments
3. **Only** expose `NEXT_PUBLIC_*` variables to browser
4. **Validate** environment variables on startup
5. **Rotate** secrets regularly

### Environment Variable Validation

The configuration system includes runtime validation:

```typescript
// Client-side validation
import { validateClientEnvironment } from '@kits-hub/config/client';

try {
  const config = validateClientEnvironment(process.env);
  // Configuration is valid
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

// Server-side validation
import { validateServerEnvironment } from '@kits-hub/config/server';

try {
  const config = validateServerEnvironment(process.env);
  // Configuration is valid
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

### Security Checklist

- ✅ No secrets in browser bundles
- ✅ Server-only variables properly isolated
- ✅ Strong secrets (minimum 32 characters)
- ✅ HTTPS URLs in production
- ✅ Specific CORS origins in production
- ✅ Environment-specific configurations
- ✅ Regular secret rotation
- ✅ Runtime validation enabled

## Local Development Setup

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Fill in Development Values

Edit `.env` with your development configuration:

```bash
# Core configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (local development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Database (local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Development features
NEXT_PUBLIC_DEV_TOOLS=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### 3. Start Development Services

```bash
# Start local Supabase
npx supabase start

# Install dependencies
npm install

# Start development server
npm run dev
```

## Troubleshooting

### Common Issues

#### Missing Environment Variables
**Error**: `NEXT_PUBLIC_SUPABASE_URL is required but not set`

**Solution**: Ensure all required variables are in your `.env` file

#### Invalid URL Format
**Error**: `Invalid URL format for NEXT_PUBLIC_APP_URL`

**Solution**: Check URL format, include protocol (http/https)

#### Server Secret in Browser
**Warning**: `Potential secret exposed: JWT_SECRET`

**Solution**: Remove `NEXT_PUBLIC_` prefix from server-only variables

#### Configuration Validation Failed
**Error**: `❌ Environment Validation Failed`

**Solution**: Check validation error details and fix missing/invalid variables

### Debug Mode

Enable debug logging to troubleshoot configuration issues:

```bash
# Enable debug logging
NEXT_PUBLIC_LOG_LEVEL=debug

# Check loaded configuration
node -e "console.log(JSON.stringify(require('./packages/config/src/client.js').getClientConfig().getAll(), null, 2))"
```

## Best Practices

### 1. Environment Management
- Use separate `.env` files for each environment
- Never commit `.env` files to version control
- Use environment-specific prefixes (`.env.development`, `.env.production`)
- Validate environments in CI/CD pipelines

### 2. Secret Management
- Use secret management services in production
- Rotate secrets regularly
- Use different secrets for different environments
- Monitor for secret leaks

### 3. Configuration Validation
- Always validate on application startup
- Provide clear error messages
- Fail fast on configuration errors
- Log configuration (without secrets) for debugging

### 4. Performance Optimization
- Use environment-specific optimizations
- Minimize bundle size in production
- Enable source maps only in development
- Cache configuration appropriately

## Migration Guide

### From Direct process.env Usage

**Before:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const jwtSecret = process.env.JWT_SECRET; // Unsafe in browser
```

**After:**
```typescript
// Client-side
import { getClientConfig } from '@kits-hub/config/client';
const config = getClientConfig();
const supabaseUrl = config.supabaseUrl;

// Server-side
import { getServerConfig } from '@kits-hub/config/server';
const serverConfig = getServerConfig();
const jwtSecret = serverConfig.jwtSecret;
```

### Benefits of Migration

1. **Type Safety**: Full TypeScript support with autocomplete
2. **Validation**: Runtime validation of required variables
3. **Security**: Automatic secret protection
4. **Defaults**: Sensible defaults for optional variables
5. **Error Handling**: Clear error messages for missing variables
6. **Documentation**: Self-documenting configuration

## API Reference

### Client Configuration API

#### getClientConfig()
Returns the singleton client configuration instance.

#### ClientConfig Methods
- `getAll(): ClientEnvironment` - Get all configuration
- `isDevelopment: boolean` - Check if in development
- `isProduction: boolean` - Check if in production
- `isTest: boolean` - Check if in test
- `supabaseUrl: string` - Supabase URL
- `supabaseAnonKey: string` - Supabase anonymous key
- `analyticsEnabled: boolean` - Analytics enabled flag
- `getMicroFrontendUrl(name: string): string` - Get micro-frontend URL
- `isFeatureEnabled(feature: string): boolean` - Check feature flag
- `getAnalyticsConfig(): object` - Get analytics configuration
- `getUiConfig(): object` - Get UI configuration

### Server Configuration API

#### getServerConfig()
Returns the singleton server configuration instance.

#### ServerConfig Methods
- `getAll(): ServerConfigType` - Get all configuration
- `databaseUrl: string` - Database URL
- `jwtSecret: string` - JWT secret
- `supabaseServiceRoleKey: string` - Supabase service role key
- `getDatabaseConfig(): object` - Get database configuration
- `getSupabaseConfig(): object` - Get Supabase configuration
- `getEmailConfig(): object` - Get email configuration
- `getAwsConfig(): object` - Get AWS configuration
- `getPaymentConfig(): object` - Get payment configuration
- `validateRequiredSecrets(): object` - Validate required secrets
- `getOptionalServicesStatus(): object` - Check optional services

## Support

For issues with the environment configuration system:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review the [security checklist](#security-checklist)
3. Validate your [environment setup](#local-development-setup)
4. Check the [API reference](#api-reference)

For additional support, refer to the KiTS Hub documentation or create an issue in the repository.
