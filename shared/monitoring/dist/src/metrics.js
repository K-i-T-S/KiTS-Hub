"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
class MetricsCollector {
    meter;
    tenantCounter;
    userCounter;
    apiRequestCounter;
    errorCounter;
    responseTimeHistogram;
    databaseConnectionGauge;
    constructor(meter) {
        this.meter = meter;
        this.initializeMetrics();
    }
    initializeMetrics() {
        // Business metrics
        this.tenantCounter = this.meter.createUpDownCounter('kits_tenants_total', {
            description: 'Total number of active tenants',
        });
        this.userCounter = this.meter.createUpDownCounter('kits_active_users_total', {
            description: 'Total number of active users',
        });
        this.apiRequestCounter = this.meter.createCounter('kits_api_requests_total', {
            description: 'Total API requests',
        });
        this.errorCounter = this.meter.createCounter('kits_errors_total', {
            description: 'Total errors',
        });
        this.responseTimeHistogram = this.meter.createHistogram('kits_api_response_time_seconds', {
            description: 'API response time in seconds',
        });
        // Infrastructure metrics
        this.databaseConnectionGauge = this.meter.createUpDownCounter('kits_db_connections_active', {
            description: 'Active database connections',
        });
    }
    // Business metric methods
    incrementTenantCount(tenantId) {
        this.tenantCounter.add(1, tenantId ? { tenant_id: tenantId } : {});
    }
    decrementTenantCount(tenantId) {
        this.tenantCounter.add(-1, tenantId ? { tenant_id: tenantId } : {});
    }
    incrementActiveUsers(solution, tenantId) {
        const attributes = { solution };
        if (tenantId)
            attributes.tenant_id = tenantId;
        this.userCounter.add(1, attributes);
    }
    decrementActiveUsers(solution, tenantId) {
        const attributes = { solution };
        if (tenantId)
            attributes.tenant_id = tenantId;
        this.userCounter.add(-1, attributes);
    }
    recordApiRequest(method, endpoint, statusCode, tenantId) {
        const attributes = {
            method,
            endpoint,
            status_code: statusCode.toString(),
        };
        if (tenantId)
            attributes.tenant_id = tenantId;
        this.apiRequestCounter.add(1, attributes);
    }
    recordError(errorType, message, tenantId) {
        const attributes = {
            error_type: errorType,
            error_message: message,
        };
        if (tenantId)
            attributes.tenant_id = tenantId;
        this.errorCounter.add(1, attributes);
    }
    recordResponseTime(duration, endpoint, method, tenantId) {
        const attributes = {
            endpoint,
            method,
        };
        if (tenantId)
            attributes.tenant_id = tenantId;
        this.responseTimeHistogram.record(duration, attributes);
    }
    // Infrastructure metric methods
    updateDatabaseConnections(count) {
        this.databaseConnectionGauge.add(count);
    }
    // Custom metrics for specific business processes
    recordTenantProvisioning(duration, success, planType) {
        this.responseTimeHistogram.record(duration, {
            process: 'tenant_provisioning',
            success: success.toString(),
            plan_type: planType,
        });
    }
    recordDatabaseQuery(query, duration, success, tenantId) {
        const attributes = {
            query_type: this.getQueryType(query),
            success: success.toString(),
        };
        if (tenantId)
            attributes.tenant_id = tenantId;
        this.responseTimeHistogram.record(duration, attributes);
    }
    recordCacheOperation(operation, key) {
        this.apiRequestCounter.add(1, {
            cache_operation: operation,
            cache_key: key,
        });
    }
    getQueryType(query) {
        const normalized = query.trim().toLowerCase();
        if (normalized.startsWith('select'))
            return 'select';
        if (normalized.startsWith('insert'))
            return 'insert';
        if (normalized.startsWith('update'))
            return 'update';
        if (normalized.startsWith('delete'))
            return 'delete';
        return 'other';
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=metrics.js.map