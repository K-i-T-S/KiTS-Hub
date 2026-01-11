/**
 * API Gateway with Advanced Routing and Middleware
 * Provides unified entry point for all integration services
 */

export interface Route {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  handler: RouteHandler;
  middleware?: Middleware[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  cache?: {
    ttl: number;
    key?: string;
  };
  auth?: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
  };
  version?: string;
  deprecated?: boolean;
  tags?: string[];
}

export interface Middleware {
  name: string;
  priority: number;
  execute: (context: RequestContext, next: () => Promise<Response>) => Promise<Response>;
}

export interface RequestContext {
  request: any;
  response: any;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: any;
  user?: any;
  tenant?: any;
  traceId: string;
  startTime: number;
  metadata: Record<string, any>;
}

export interface RouteHandler {
  (context: RequestContext): Promise<Response>;
}

export interface APIGatewayConfig {
  prefix?: string;
  version?: string;
  enableCORS?: boolean;
  enableCompression?: boolean;
  enableRateLimiting?: boolean;
  enableCaching?: boolean;
  enableAuth?: boolean;
  enableMetrics?: boolean;
  enableLogging?: boolean;
  defaultRateLimit?: {
    windowMs: number;
    max: number;
  };
  corsConfig?: {
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
  };
}

export interface GatewayMetrics {
  totalRequests: number;
  requestsByMethod: Record<string, number>;
  requestsByPath: Record<string, number>;
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  statusCodes: Record<string, number>;
  errors: number;
  cacheHits: number;
  cacheMisses: number;
}

export class APIGateway {
  private routes: Route[] = [];
  private middleware: Middleware[] = [];
  private config: APIGatewayConfig;
  private metrics: GatewayMetrics;
  private responseTimes: number[] = [];

  constructor(config: APIGatewayConfig = {}) {
    this.config = {
      prefix: '/api',
      version: 'v1',
      enableCORS: true,
      enableCompression: true,
      enableRateLimiting: true,
      enableCaching: true,
      enableAuth: true,
      enableMetrics: true,
      enableLogging: true,
      defaultRateLimit: {
        windowMs: 60000, // 1 minute
        max: 1000 // 1000 requests per minute
      },
      corsConfig: {
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
      },
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      requestsByMethod: {},
      requestsByPath: {},
      responseTime: { avg: 0, p50: 0, p95: 0, p99: 0 },
      statusCodes: {},
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.setupDefaultMiddleware();
  }

  private setupDefaultMiddleware(): void {
    // CORS middleware
    if (this.config.enableCORS) {
      this.use({
        name: 'cors',
        priority: 100,
        execute: async (context, next) => {
          const origin = context.headers['origin'];
          const corsConfig = this.config.corsConfig!;

          if (corsConfig.origins.includes('*') || corsConfig.origins.includes(origin)) {
            context.response.headers.set('Access-Control-Allow-Origin', origin || '*');
            context.response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
            context.response.headers.set('Access-Control-Allow-Headers', corsConfig.headers.join(', '));
            context.response.headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
          }

          if (context.request.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers: context.response.headers });
          }

          return next();
        }
      });
    }

    // Request logging middleware
    if (this.config.enableLogging) {
      this.use({
        name: 'request-logging',
        priority: 90,
        execute: async (context, next) => {
          const startTime = Date.now();
          
          try {
            const response = await next();
            const duration = Date.now() - startTime;
            
            this.logRequest(context, response, duration);
            this.updateMetrics(context, response, duration);
            
            return response;
          } catch (error) {
            const duration = Date.now() - startTime;
            this.logError(context, error as Error, duration);
            this.updateErrorMetrics(context, error as Error, duration);
            
            throw error;
          }
        }
      });
    }

    // Authentication middleware
    if (this.config.enableAuth) {
      this.use({
        name: 'authentication',
        priority: 80,
        execute: async (context, next) => {
          const authHeader = context.headers['authorization'];
          
          if (!authHeader) {
            return new Response(
              JSON.stringify({ error: 'Missing authorization header' }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
          }

          try {
            // In a real implementation, this would validate JWT or API key
            const token = authHeader.replace('Bearer ', '');
            const payload = this.validateToken(token);
            
            context.user = payload.user;
            context.tenant = payload.tenant;
            
            return next();
          } catch (error) {
            return new Response(
              JSON.stringify({ error: 'Invalid token' }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      });
    }

    // Rate limiting middleware
    if (this.config.enableRateLimiting) {
      this.use({
        name: 'rate-limiting',
        priority: 70,
        execute: async (context, next) => {
          const clientId = context.headers['x-forwarded-for'] || 
                         context.headers['x-real-ip'] || 
                         'unknown';
          
          // In a real implementation, this would use a proper rate limiter
          const key = `rate-limit:${clientId}`;
          const limit = this.config.defaultRateLimit!;
          
          // Mock rate limiting check
          const allowed = true; // Would check actual rate limit
          
          if (!allowed) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded' }),
              { 
                status: 429, 
                headers: { 
                  'Content-Type': 'application/json',
                  'Retry-After': '60'
                } 
              }
            );
          }

          return next();
        }
      });
    }

    // Compression middleware
    if (this.config.enableCompression) {
      this.use({
        name: 'compression',
        priority: 60,
        execute: async (context, next) => {
          const acceptEncoding = context.headers['accept-encoding'] || '';
          
          if (acceptEncoding.includes('gzip')) {
            const response = await next();
            // In a real implementation, this would compress the response
            context.response.headers.set('Content-Encoding', 'gzip');
            return response;
          }

          return next();
        }
      });
    }
  }

  use(middleware: Middleware): void {
    this.middleware.push(middleware);
    this.middleware.sort((a, b) => b.priority - a.priority);
  }

  register(route: Route): void {
    // Add default middleware to route if not specified
    if (!route.middleware) {
      route.middleware = [];
    }

    // Add route-specific rate limiting
    if (route.rateLimit && this.config.enableRateLimiting) {
      route.middleware.push({
        name: 'route-rate-limit',
        priority: 75,
        execute: async (context, next) => {
          // Route-specific rate limiting logic
          return next();
        }
      });
    }

    // Add route-specific caching
    if (route.cache && this.config.enableCaching) {
      route.middleware.push({
        name: 'route-cache',
        priority: 65,
        execute: async (context, next) => {
          // Route-specific caching logic
          return next();
        }
      });
    }

    this.routes.push(route);
  }

  get(path: string, handler: RouteHandler, options: Partial<Route> = {}): void {
    this.register({ ...options, path, method: 'GET', handler });
  }

  post(path: string, handler: RouteHandler, options: Partial<Route> = {}): void {
    this.register({ ...options, path, method: 'POST', handler });
  }

  put(path: string, handler: RouteHandler, options: Partial<Route> = {}): void {
    this.register({ ...options, path, method: 'PUT', handler });
  }

  delete(path: string, handler: RouteHandler, options: Partial<Route> = {}): void {
    this.register({ ...options, path, method: 'DELETE', handler });
  }

  patch(path: string, handler: RouteHandler, options: Partial<Route> = {}): void {
    this.register({ ...options, path, method: 'PATCH', handler });
  }

  async handle(request: any): Promise<Response> {
    const context = this.createContext(request);
    
    try {
      const route = this.findRoute(context);
      
      if (!route) {
        return new Response(
          JSON.stringify({ error: 'Route not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check route-specific authentication
      if (route.auth?.required && !context.user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check route-specific roles
      if (route.auth?.roles && context.user) {
        const hasRole = route.auth.roles.some(role => 
          context.user.roles.includes(role)
        );
        
        if (!hasRole) {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Execute route middleware and handler
      return this.executeRoute(route, context);

    } catch (error) {
      return this.handleError(error as Error, context);
    }
  }

  private createContext(request: any): RequestContext {
    const url = new URL(request.url);
    
    return {
      request,
      response: {
        headers: new Headers()
      },
      params: this.extractParams(request.url),
      query: this.extractQuery(url.search),
      headers: this.extractHeaders(request.headers),
      body: null, // Would be parsed based on content type
      traceId: this.generateTraceId(),
      startTime: Date.now(),
      metadata: {}
    };
  }

  private findRoute(context: RequestContext): Route | undefined {
    const method = context.request.method;
    const path = new URL(context.request.url).pathname;
    
    return this.routes.find(route => {
      if (route.method !== method) return false;
      
      // Simple path matching - in real implementation, would support parameters
      const routePath = `${this.config.prefix}${this.config.version ? '/' + this.config.version : ''}${route.path}`;
      return path === routePath;
    });
  }

  private async executeRoute(route: Route, context: RequestContext): Promise<Response> {
    let middlewareChain = [...this.middleware, ...(route.middleware || [])];
    
    const executeNext = async (index: number = 0): Promise<Response> => {
      if (index >= middlewareChain.length) {
        return route.handler(context);
      }
      
      const middleware = middlewareChain[index];
      return middleware.execute(context, () => executeNext(index + 1));
    };

    return executeNext();
  }

  private handleError(error: Error, context: RequestContext): Response {
    this.logError(context, error, Date.now() - context.startTime);
    this.updateErrorMetrics(context, error, Date.now() - context.startTime);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        traceId: context.traceId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  private extractParams(url: string): Record<string, string> {
    // In a real implementation, would extract path parameters
    return {};
  }

  private extractQuery(search: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(search);
    
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }

  private extractHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    
    // In a real implementation, would extract from actual headers object
    return result;
  }

  private validateToken(token: string): any {
    // In a real implementation, would validate JWT or API key
    return {
      user: { id: 'user123', roles: ['user'] },
      tenant: { id: 'tenant123' }
    };
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private logRequest(context: RequestContext, response: Response, duration: number): void {
    // In a real implementation, would send to logging system
    console.log(`${context.request.method} ${context.request.url} - ${response.status} - ${duration}ms`);
  }

  private logError(context: RequestContext, error: Error, duration: number): void {
    // In a real implementation, would send to error tracking system
    console.error(`Error in ${context.request.method} ${context.request.url}: ${error.message}`);
  }

  private updateMetrics(context: RequestContext, response: Response, duration: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalRequests++;
    this.responseTimes.push(duration);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    const method = context.request.method;
    const path = new URL(context.request.url).pathname;
    const status = response.status;

    this.metrics.requestsByMethod[method] = (this.metrics.requestsByMethod[method] || 0) + 1;
    this.metrics.requestsByPath[path] = (this.metrics.requestsByPath[path] || 0) + 1;
    this.metrics.statusCodes[status] = (this.metrics.statusCodes[status] || 0) + 1;

    if (status >= 400) {
      this.metrics.errors++;
    }

    this.calculateResponseTimeMetrics();
  }

  private updateErrorMetrics(context: RequestContext, error: Error, duration: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalRequests++;
    this.metrics.errors++;
    this.responseTimes.push(duration);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    const method = context.request.method;
    const path = new URL(context.request.url).pathname;

    this.metrics.requestsByMethod[method] = (this.metrics.requestsByMethod[method] || 0) + 1;
    this.metrics.requestsByPath[path] = (this.metrics.requestsByPath[path] || 0) + 1;
    this.metrics.statusCodes['500'] = (this.metrics.statusCodes['500'] || 0) + 1;

    this.calculateResponseTimeMetrics();
  }

  private calculateResponseTimeMetrics(): void {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);

    this.metrics.responseTime = {
      avg: sum / this.responseTimes.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  getMetrics(): GatewayMetrics {
    return { ...this.metrics };
  }

  getRoutes(): Route[] {
    return [...this.routes];
  }

  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: {},
      requestsByPath: {},
      responseTime: { avg: 0, p50: 0, p95: 0, p99: 0 },
      statusCodes: {},
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.responseTimes = [];
  }
}
