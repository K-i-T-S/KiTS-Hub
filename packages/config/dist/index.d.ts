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
export * from './schema';
export * from './client';
export * from './server';
export { getClientConfig, initClientConfig, clientConfigGetters } from './client';
export { getServerConfig, initServerConfig, serverConfigGetters } from './server';
export declare const CONFIG_PACKAGE_VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map