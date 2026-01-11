import { Router } from 'express';
import { KiTSLogger } from './logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    external_apis: HealthCheck;
    disk_space: HealthCheck;
    memory: HealthCheck;
  };
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  message?: string;
  responseTime?: number;
  details?: any;
}

export function createHealthRouter(logger: KiTSLogger): Router {
  const router = Router();

  router.get('/health', async (req, res) => {
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {},
    };

    try {
      // Database health check
      const dbStart = Date.now();
      await checkDatabaseHealth();
      health.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      health.checks.database = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      health.status = 'degraded';
    }

    try {
      // Redis health check
      const redisStart = Date.now();
      await checkRedisHealth();
      health.checks.redis = {
        status: 'healthy',
        responseTime: Date.now() - redisStart,
      };
    } catch (error) {
      health.checks.redis = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      health.status = 'degraded';
    }

    try {
      // External APIs health check
      const apiStart = Date.now();
      await checkExternalAPIsHealth();
      health.checks.external_apis = {
        status: 'healthy',
        responseTime: Date.now() - apiStart,
      };
    } catch (error) {
      health.checks.external_apis = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      health.status = 'degraded';
    }

    try {
      // Check disk space
      const diskUsage = await checkDiskSpace();
      health.checks.disk_space = {
        status: diskUsage.percentage < 80 ? 'healthy' : 'degraded',
        message: `Disk usage: ${diskUsage.percentage}%`,
        details: diskUsage,
      };
      if (diskUsage.percentage >= 90) {
        health.status = 'unhealthy';
      }
    } catch (error) {
      health.checks.disk_space = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      health.status = 'degraded';
    }

    try {
      // Check memory usage
      const memoryUsage = await checkMemoryUsage();
      health.checks.memory = {
        status: memoryUsage.percentage < 80 ? 'healthy' : 'degraded',
        message: `Memory usage: ${memoryUsage.percentage}%`,
        details: memoryUsage,
      };
      if (memoryUsage.percentage >= 90) {
        health.status = 'unhealthy';
      }
    } catch (error) {
      health.checks.memory = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      health.status = 'degraded';
    }

    // Overall status based on individual checks
    const unhealthyChecks = Object.values(health.checks)
      .filter(check => check.status === 'unhealthy').length;
    
    if (unhealthyChecks > 0) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    logger.info('Health check completed', {
      status: health.status,
      checks: health.checks,
    });

    res.status(statusCode).json(health);
  });

  // Readiness probe (lighter version)
  router.get('/ready', async (req, res) => {
    try {
      // Check critical dependencies only
      await checkDatabaseHealth();
      await checkRedisHealth();
      
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Liveness probe (very light)
  router.get('/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

async function checkDatabaseHealth(): Promise<void> {
  // This should be implemented based on your database setup
  // Example implementation:
  try {
    // const result = await pool.query('SELECT 1');
    // if (!result) {
    //   throw new Error('Database query failed');
    // }
  } catch (error) {
    throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function checkRedisHealth(): Promise<void> {
  // This should be implemented based on your Redis setup
  // Example implementation:
  try {
    // const redis = require('redis').createClient();
    // await redis.ping();
  } catch (error) {
    throw new Error(`Redis health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function checkExternalAPIsHealth(): Promise<void> {
  // Check critical external APIs
  const criticalAPIs = [
    process.env.PAYMENT_API_URL,
    process.env.NOTIFICATION_API_URL,
    process.env.EMAIL_SERVICE_URL,
  ].filter(Boolean);

  const promises = criticalAPIs.map(async (url) => {
    try {
      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      throw new Error(`API ${url} health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  await Promise.all(promises);
}

async function checkDiskSpace(): Promise<{ percentage: number; used: number; total: number }> {
  try {
    const fs = require('fs');
    const stats = await fs.promises.statfs('/');
    const used = stats.blocks - stats.bfree;
    const percentage = (used / stats.blocks) * 100;
    return { percentage, used: used * stats.bsize, total: stats.blocks * stats.bsize };
  } catch (error) {
    throw new Error(`Disk space check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function checkMemoryUsage(): Promise<{ percentage: number; used: number; total: number }> {
  try {
    const used = process.memoryUsage();
    const total = require('os').totalmem();
    const percentage = (used.heapUsed / total) * 100;
    return { percentage, used: used.heapUsed, total };
  } catch (error) {
    throw new Error(`Memory usage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
