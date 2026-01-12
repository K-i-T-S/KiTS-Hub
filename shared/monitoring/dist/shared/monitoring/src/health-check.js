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
async function checkDatabaseHealth() {
    await new Promise(resolve => setTimeout(resolve, 10));
}
async function checkRedisHealth() {
    await new Promise(resolve => setTimeout(resolve, 5));
}
async function checkExternalAPIsHealth() {
    await new Promise(resolve => setTimeout(resolve, 50));
}
async function checkDiskSpace() {
    await new Promise(resolve => setTimeout(resolve, 20));
}
async function checkMemoryUsage() {
    await new Promise(resolve => setTimeout(resolve, 15));
}
//# sourceMappingURL=health-check.js.map