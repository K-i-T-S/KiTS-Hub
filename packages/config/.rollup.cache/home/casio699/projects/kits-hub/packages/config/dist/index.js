/**
 * KiTS Hub Environment Configuration Package
 *
 * This package provides a secure, type-safe environment configuration system
 * for the KiTS Hub micro-frontend architecture.
 *
 * Features:
 * - Runtime validation with Zod schemas
 * - Type-safe access to environment variables
 * - Separate client and server configurations
 * - Fail-fast validation on startup
 * - Comprehensive error handling
 */
// Export main schemas and types
export * from './schema';
// Export client-side configuration
export * from './client';
// Export server-side configuration
export * from './server';
// Re-export commonly used utilities for convenience
export { getClientConfig, initClientConfig, clientConfigGetters } from './client';
export { getServerConfig, initServerConfig, serverConfigGetters } from './server';
// Package version
export const CONFIG_PACKAGE_VERSION = '1.0.0';
//# sourceMappingURL=index.js.map