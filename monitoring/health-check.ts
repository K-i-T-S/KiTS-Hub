import { Request, Response } from 'express';
import { performance } from 'perf_hooks';

interface HealthCheck {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  memory: NodeJS.MemoryUsage;
  cpu: {
    usage: NodeJS.CpuUsage;
    loadAverage: number[];
  };
  remotes: RemoteHealth[];
  database: DatabaseHealth;
  cache: CacheHealth;
  dependencies: DependencyHealth[];
}

interface RemoteHealth {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  connectionTime?: number;
  error?: string;
}

interface CacheHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  connectionTime?: number;
  error?: string;
}

interface DependencyHealth {
  name: string;
  type: 'api' | 'database' | 'cache' | 'external';
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

const checkRemoteHealth = async (): Promise<RemoteHealth[]> => {
  const remotes = [
    { name: 'inventoryManagement', url: 'http://localhost:4177/health' },
    { name: 'pointOfSale', url: 'http://localhost:4178/health' },
    { name: 'crmSystem', url: 'http://localhost:4179/health' },
    { name: 'hrManagement', url: 'http://localhost:4180/health' },
    { name: 'accountingSystem', url: 'http://localhost:4181/health' },
    { name: 'analyticsDashboard', url: 'http://localhost:4182/health' },
  ];

  const healthChecks = await Promise.allSettled(
    remotes.map(async (remote) => {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(remote.url, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        const endTime = performance.now();
        
        if (response.ok) {
          return {
            name: remote.name,
            url: remote.url,
            status: 'healthy' as const,
            responseTime: Math.round(endTime - startTime),
          };
        } else {
          return {
            name: remote.name,
            url: remote.url,
            status: 'unhealthy' as const,
            responseTime: Math.round(endTime - startTime),
            error: `HTTP ${response.status}`,
          };
        }
      } catch (error) {
        const endTime = performance.now();
        return {
          name: remote.name,
          url: remote.url,
          status: 'unhealthy' as const,
          responseTime: Math.round(endTime - startTime),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  return healthChecks.map((result) => 
    result.status === 'fulfilled' ? result.value : {
      name: 'unknown',
      url: 'unknown',
      status: 'unhealthy' as const,
      error: 'Promise rejected',
    }
  );
};

const checkDatabaseHealth = async (): Promise<DatabaseHealth> => {
  const startTime = performance.now();
  try {
    // Add your database health check logic here
    // For example, a simple ping to the database
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB check
    const endTime = performance.now();
    
    return {
      status: 'healthy',
      connectionTime: Math.round(endTime - startTime),
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      status: 'unhealthy',
      connectionTime: Math.round(endTime - startTime),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

const checkCacheHealth = async (): Promise<CacheHealth> => {
  const startTime = performance.now();
  try {
    // Add your cache health check logic here
    // For example, a simple ping to Redis
    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate cache check
    const endTime = performance.now();
    
    return {
      status: 'healthy',
      connectionTime: Math.round(endTime - startTime),
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      status: 'unhealthy',
      connectionTime: Math.round(endTime - startTime),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

const checkDependencies = async (): Promise<DependencyHealth[]> => {
  const dependencies = [
    { name: 'Supabase', type: 'api' as const, url: process.env.SUPABASE_URL },
    { name: 'Analytics API', type: 'api' as const, url: 'https://api.analytics.com' },
    { name: 'Payment Gateway', type: 'external' as const, url: 'https://api.payment.com' },
  ];

  const healthChecks = await Promise.allSettled(
    dependencies.map(async (dep) => {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(dep.url || '', {
          method: 'HEAD',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        const endTime = performance.now();
        
        return {
          name: dep.name,
          type: dep.type,
          status: response.ok ? 'healthy' as const : 'unhealthy' as const,
          responseTime: Math.round(endTime - startTime),
        };
      } catch (error) {
        const endTime = performance.now();
        return {
          name: dep.name,
          type: dep.type,
          status: 'unhealthy' as const,
          responseTime: Math.round(endTime - startTime),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  return healthChecks.map((result) => 
    result.status === 'fulfilled' ? result.value : {
      name: 'unknown',
      type: 'api' as const,
      status: 'unhealthy' as const,
      error: 'Promise rejected',
    }
  );
};

export const healthCheck = async (req: Request, res: Response) => {
  const startTime = performance.now();
  
  try {
    const [remotes, database, cache, dependencies] = await Promise.all([
      checkRemoteHealth(),
      checkDatabaseHealth(),
      checkCacheHealth(),
      checkDependencies(),
    ]);

    const unhealthyCount = [
      ...remotes.filter(r => r.status === 'unhealthy'),
      database.status === 'unhealthy' ? 1 : 0,
      cache.status === 'unhealthy' ? 1 : 0,
      ...dependencies.filter(d => d.status === 'unhealthy'),
    ].length;

    const overallStatus = unhealthyCount === 0 ? 'ok' : 
                         unhealthyCount <= 2 ? 'degraded' : 'unhealthy';

    const health: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: require('os').loadavg(),
      },
      remotes,
      database,
      cache,
      dependencies,
    };

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(overallStatus === 'unhealthy' ? 503 : 200).json(health);
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    const [remotes, database] = await Promise.all([
      checkRemoteHealth(),
      checkDatabaseHealth(),
    ]);

    const isReady = remotes.every(r => r.status !== 'unhealthy') && 
                   database.status !== 'unhealthy';

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        remotes: remotes.filter(r => r.status === 'unhealthy').length,
        database: database.status,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const livenessCheck = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
