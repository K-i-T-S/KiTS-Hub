// CDN Configuration for KiTS Hub Micro-Frontend Architecture

export interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'azure';
  domain: string;
  cacheSettings: CacheSettings;
  security: SecuritySettings;
  compression: CompressionSettings;
  optimization: OptimizationSettings;
}

export interface CacheSettings {
  staticAssets: {
    ttl: number; // in seconds
    browserCache: string;
    edgeCache: string;
  };
  apiResponses: {
    ttl: number;
    browserCache: string;
    edgeCache: string;
  };
  remoteEntries: {
    ttl: number;
    browserCache: string;
    edgeCache: string;
  };
  html: {
    ttl: number;
    browserCache: string;
    edgeCache: string;
  };
}

export interface SecuritySettings {
  https: boolean;
  hsts: boolean;
  certificateTransparency: boolean;
  ddosProtection: boolean;
  waf: boolean;
  botManagement: boolean;
}

export interface CompressionSettings {
  gzip: boolean;
  brotli: boolean;
  autoMinify: {
    html: boolean;
    css: boolean;
    js: boolean;
  };
}

export interface OptimizationSettings {
  imageOptimization: boolean;
  webpConversion: boolean;
  lazyLoading: boolean;
  codeMinification: boolean;
  bundleOptimization: boolean;
}

// Cloudflare CDN Configuration
export const cloudflareConfig: CDNConfig = {
  provider: 'cloudflare',
  domain: 'cdn.kits-hub.com',
  cacheSettings: {
    staticAssets: {
      ttl: 31536000, // 1 year
      browserCache: 'public, max-age=31536000, immutable',
      edgeCache: 'public, max-age=31536000, immutable',
    },
    apiResponses: {
      ttl: 300, // 5 minutes
      browserCache: 'public, max-age=300',
      edgeCache: 'public, max-age=300',
    },
    remoteEntries: {
      ttl: 86400, // 24 hours
      browserCache: 'public, max-age=86400',
      edgeCache: 'public, max-age=86400',
    },
    html: {
      ttl: 3600, // 1 hour
      browserCache: 'public, max-age=3600',
      edgeCache: 'public, max-age=3600',
    },
  },
  security: {
    https: true,
    hsts: true,
    certificateTransparency: true,
    ddosProtection: true,
    waf: true,
    botManagement: true,
  },
  compression: {
    gzip: true,
    brotli: true,
    autoMinify: {
      html: true,
      css: true,
      js: true,
    },
  },
  optimization: {
    imageOptimization: true,
    webpConversion: true,
    lazyLoading: true,
    codeMinification: true,
    bundleOptimization: true,
  },
};

// AWS CloudFront Configuration
export const awsConfig: CDNConfig = {
  provider: 'aws',
  domain: 'd1234567890.cloudfront.net',
  cacheSettings: {
    staticAssets: {
      ttl: 31536000, // 1 year
      browserCache: 'public, max-age=31536000, immutable',
      edgeCache: 'public, max-age=31536000, immutable',
    },
    apiResponses: {
      ttl: 300, // 5 minutes
      browserCache: 'public, max-age=300',
      edgeCache: 'public, max-age=300',
    },
    remoteEntries: {
      ttl: 86400, // 24 hours
      browserCache: 'public, max-age=86400',
      edgeCache: 'public, max-age=86400',
    },
    html: {
      ttl: 3600, // 1 hour
      browserCache: 'public, max-age=3600',
      edgeCache: 'public, max-age=3600',
    },
  },
  security: {
    https: true,
    hsts: true,
    certificateTransparency: true,
    ddosProtection: true,
    waf: true,
    botManagement: false,
  },
  compression: {
    gzip: true,
    brotli: true,
    autoMinify: {
      html: true,
      css: true,
      js: true,
    },
  },
  optimization: {
    imageOptimization: true,
    webpConversion: true,
    lazyLoading: true,
    codeMinification: true,
    bundleOptimization: true,
  },
};

// Azure CDN Configuration
export const azureConfig: CDNConfig = {
  provider: 'azure',
  domain: 'azureedge.net',
  cacheSettings: {
    staticAssets: {
      ttl: 31536000, // 1 year
      browserCache: 'public, max-age=31536000, immutable',
      edgeCache: 'public, max-age=31536000, immutable',
    },
    apiResponses: {
      ttl: 300, // 5 minutes
      browserCache: 'public, max-age=300',
      edgeCache: 'public, max-age=300',
    },
    remoteEntries: {
      ttl: 86400, // 24 hours
      browserCache: 'public, max-age=86400',
      edgeCache: 'public, max-age=86400',
    },
    html: {
      ttl: 3600, // 1 hour
      browserCache: 'public, max-age=3600',
      edgeCache: 'public, max-age=3600',
    },
  },
  security: {
    https: true,
    hsts: true,
    certificateTransparency: true,
    ddosProtection: true,
    waf: true,
    botManagement: false,
  },
  compression: {
    gzip: true,
    brotli: true,
    autoMinify: {
      html: true,
      css: true,
      js: true,
    },
  },
  optimization: {
    imageOptimization: true,
    webpConversion: true,
    lazyLoading: true,
    codeMinification: true,
    bundleOptimization: true,
  },
};

// Cache Rules for different content types
export const cacheRules = {
  // Static assets (images, fonts, CSS, JS)
  static: {
    pattern: /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/,
    ttl: 31536000, // 1 year
    browserCache: 'public, max-age=31536000, immutable',
    edgeCache: 'public, max-age=31536000, immutable',
  },
  
  // Remote entry points for micro-frontends
  remoteEntries: {
    pattern: /remoteEntry\.js$/,
    ttl: 86400, // 24 hours
    browserCache: 'public, max-age=86400',
    edgeCache: 'public, max-age=86400',
  },
  
  // HTML pages
  html: {
    pattern: /\.html$/,
    ttl: 3600, // 1 hour
    browserCache: 'public, max-age=3600',
    edgeCache: 'public, max-age=3600',
  },
  
  // API responses
  api: {
    pattern: /\/api\//,
    ttl: 300, // 5 minutes
    browserCache: 'public, max-age=300',
    edgeCache: 'public, max-age=300',
  },
  
  // Health checks
  health: {
    pattern: /\/health$/,
    ttl: 60, // 1 minute
    browserCache: 'no-cache',
    edgeCache: 'no-cache',
  },
};

// Performance optimization settings
export const performanceSettings = {
  // Image optimization
  images: {
    quality: 85,
    webp: true,
    avif: true,
    lazyLoading: true,
    responsiveBreakpoints: [320, 768, 1024, 1440, 1920],
  },
  
  // Code optimization
  code: {
    minification: true,
    treeShaking: true,
    deadCodeElimination: true,
    moduleConcatenation: true,
  },
  
  // Network optimization
  network: {
    http2: true,
    http3: true,
    connectionReuse: true,
    preloadCriticalResources: true,
  },
};

// Security headers
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self';",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Geographic distribution settings
export const geoDistribution = {
  regions: [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'eu-central-1',
    'ap-southeast-1',
    'ap-northeast-1',
  ],
  failover: true,
  latencyBasedRouting: true,
  healthChecks: true,
};

// Monitoring and analytics
export const monitoringSettings = {
  realTimeMetrics: true,
  errorTracking: true,
  performanceMonitoring: true,
  userAnalytics: true,
  customDashboards: true,
  alerts: {
    highLatency: { threshold: 1000, enabled: true },
    errorRate: { threshold: 0.05, enabled: true },
    cacheHitRate: { threshold: 0.9, enabled: true },
  },
};

// Export default configuration
export const defaultCDNConfig = cloudflareConfig;

// Helper functions
export function getCacheHeaders(url: string, config: CDNConfig) {
  const { cacheSettings } = config;
  
  if (cacheRules.static.pattern.test(url)) {
    return {
      'Cache-Control': cacheSettings.staticAssets.browserCache,
      'Edge-Cache-Control': cacheSettings.staticAssets.edgeCache,
    };
  }
  
  if (cacheRules.remoteEntries.pattern.test(url)) {
    return {
      'Cache-Control': cacheSettings.remoteEntries.browserCache,
      'Edge-Cache-Control': cacheSettings.remoteEntries.edgeCache,
    };
  }
  
  if (cacheRules.html.pattern.test(url)) {
    return {
      'Cache-Control': cacheSettings.html.browserCache,
      'Edge-Cache-Control': cacheSettings.html.edgeCache,
    };
  }
  
  if (cacheRules.api.pattern.test(url)) {
    return {
      'Cache-Control': cacheSettings.apiResponses.browserCache,
      'Edge-Cache-Control': cacheSettings.apiResponses.edgeCache,
    };
  }
  
  if (cacheRules.health.pattern.test(url)) {
    return {
      'Cache-Control': 'no-cache',
      'Edge-Cache-Control': 'no-cache',
    };
  }
  
  return {
    'Cache-Control': 'public, max-age=3600',
    'Edge-Cache-Control': 'public, max-age=3600',
  };
}

export function getSecurityHeaders(config: CDNConfig) {
  const headers = { ...securityHeaders };
  
  if (!config.security.https) {
    delete (headers as any)['Strict-Transport-Security'];
  }
  
  return headers;
}

export function getOptimizationHeaders(config: CDNConfig) {
  const headers: Record<string, string> = {};
  
  if (config.compression.gzip) {
    headers['Content-Encoding'] = 'gzip';
  }
  
  if (config.compression.brotli) {
    headers['Content-Encoding'] = 'br';
  }
  
  return headers;
}
