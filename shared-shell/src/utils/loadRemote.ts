import { ComponentType } from 'react';

// Remote configuration interface
interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
}

// Loading states
type RemoteLoadingState = 'idle' | 'loading' | 'loaded' | 'error' | 'retrying';

// Remote loading error
class RemoteLoadError extends Error {
  constructor(
    message: string,
    public remoteName: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'RemoteLoadError';
  }
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

// Development vs production URL handling
function getRemoteUrl(remoteName: string, devUrl: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return devUrl;
  }
  
  // Production URLs - these should be configured based on your deployment
  const productionUrls: Record<string, string> = {
    inventoryManagement: 'https://inventory.kits-hub.com/remoteEntry.js',
    pointOfSale: 'https://pos.kits-hub.com/remoteEntry.js',
    crmSystem: 'https://crm.kits-hub.com/remoteEntry.js',
    hrManagement: 'https://hr.kits-hub.com/remoteEntry.js',
    accountingSystem: 'https://accounting.kits-hub.com/remoteEntry.js',
    analyticsDashboard: 'https://analytics.kits-hub.com/remoteEntry.js',
  };
  
  return productionUrls[remoteName] || devUrl;
}

// Exponential backoff delay calculation
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

// Check if remote is available (development mode helper)
async function isRemoteAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Load remote module with retry logic
async function loadRemoteWithRetry(
  config: RemoteConfig,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<ComponentType<any>> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
    try {
      // Check if remote is available (development mode)
      if (process.env.NODE_ENV === 'development') {
        const isAvailable = await isRemoteAvailable(config.url);
        if (!isAvailable) {
          throw new RemoteLoadError(
            `Remote ${config.scope} is not available at ${config.url}`,
            config.scope
          );
        }
      }
      
      // Initialize remote container
      await (window as any).__webpack_init_sharing__('default');
      const container = await (window as any)[config.scope];
      
      // Initialize container sharing
      await container.init((window as any).__webpack_share_scopes__.default);
      
      // Get the factory for the module
      const factory = await container.get(config.module);
      
      // Execute factory to get the module
      const Module = factory();
      
      return Module;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this is the last attempt, throw the error
      if (attempt > retryConfig.maxRetries) {
        throw new RemoteLoadError(
          `Failed to load remote ${config.scope} after ${retryConfig.maxRetries + 1} attempts`,
          config.scope,
          lastError
        );
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt, retryConfig);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new RemoteLoadError('Unknown error loading remote', config.scope);
}

// Main remote loading function
export async function loadRemote(
  remoteName: string,
  module: string,
  retryConfig?: Partial<RetryConfig>
): Promise<ComponentType<any>> {
  const finalRetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  
  // Development URLs
  const devUrls: Record<string, string> = {
    inventoryManagement: 'http://localhost:4177/remoteEntry.js',
    pointOfSale: 'http://localhost:4178/remoteEntry.js',
    crmSystem: 'http://localhost:4179/remoteEntry.js',
    hrManagement: 'http://localhost:4180/remoteEntry.js',
    accountingSystem: 'http://localhost:4181/remoteEntry.js',
    analyticsDashboard: 'http://localhost:4182/remoteEntry.js',
  };
  
  const devUrl = devUrls[remoteName];
  if (!devUrl) {
    throw new RemoteLoadError(`Unknown remote: ${remoteName}`, remoteName);
  }
  
  const url = getRemoteUrl(remoteName, devUrl);
  
  const config: RemoteConfig = {
    url,
    scope: remoteName,
    module,
  };
  
  return loadRemoteWithRetry(config, finalRetryConfig);
}

// Preload remote (useful for prefetching)
export async function preloadRemote(
  _remoteName: string,
  module: string
): Promise<void> {
  try {
    // Note: remoteName parameter kept for API consistency but not used in this implementation
    await loadRemote(_remoteName, module, { maxRetries: 0 });
  } catch {
    // Silently fail preloading
  }
}

// Batch preload multiple remotes
export async function preloadRemotes(
  remotes: Array<{ remoteName: string; module: string }>
): Promise<void> {
  const promises = remotes.map(({ remoteName, module }) =>
    preloadRemote(remoteName, module).catch(() => {
      // Silently fail individual preloads
    })
  );
  
  await Promise.allSettled(promises);
}

// Get remote loading state (for UI feedback)
export function getRemoteLoadingState(_remoteName: string): RemoteLoadingState {
  // This could be enhanced with actual state tracking
  return 'idle';
}

// Check if remote should be available in current environment
export function isRemoteSupported(_remoteName: string): boolean {
  // Add logic to check if remote is supported in current environment
  // For example, based on user permissions, feature flags, etc.
  return true;
}

// Export types for use in components
export type { RemoteLoadingState, RemoteConfig, RetryConfig };
export { RemoteLoadError };
