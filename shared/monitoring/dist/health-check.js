"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRouter = createHealthRouter;
const express_1 = require("express");
function createHealthRouter() {
    const router = (0, express_1.Router)();
    router.get('/health', async (_, res) => {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            checks: {
                database: { status: 'healthy' },
                redis: { status: 'healthy' },
                external_apis: { status: 'healthy' },
                disk_space: { status: 'healthy' },
                memory: { status: 'healthy' }
            }
        };
        try {
            // Database health check
            const dbStart = Date.now();
            await checkDatabaseHealth();
            health.checks.database = {
                status: 'healthy',
                responseTime: Date.now() - dbStart,
            };
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            health.checks.external_apis = {
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
            health.status = 'degraded';
        }
        try {
            // Disk space health check
            const diskStart = Date.now();
            await checkDiskSpace();
            health.checks.disk_space = {
                status: 'healthy',
                responseTime: Date.now() - diskStart,
            };
        }
        catch (error) {
            health.checks.disk_space = {
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
            health.status = 'degraded';
        }
        try {
            // Memory usage health check
            const memStart = Date.now();
            await checkMemoryUsage();
            health.checks.memory = {
                status: 'healthy',
                responseTime: Date.now() - memStart,
            };
        }
        catch (error) {
            health.checks.memory = {
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
            health.status = 'degraded';
        }
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    });
    return router;
}
// Health check functions
async function checkDatabaseHealth() {
    // Simulate database health check
    await new Promise(resolve => setTimeout(resolve, 10));
}
async function checkRedisHealth() {
    // Simulate Redis health check
    await new Promise(resolve => setTimeout(resolve, 5));
}
async function checkExternalAPIsHealth() {
    // Simulate external API health check
    await new Promise(resolve => setTimeout(resolve, 50));
}
async function checkDiskSpace() {
    // Simulate disk space check
    await new Promise(resolve => setTimeout(resolve, 20));
}
async function checkMemoryUsage() {
    // Simulate memory usage check
    await new Promise(resolve => setTimeout(resolve, 15));
}
//# sourceMappingURL=health-check.js.map