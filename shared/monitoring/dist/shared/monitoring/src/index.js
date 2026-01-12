"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRouter = exports.TracingService = exports.errorLogger = exports.requestLogger = exports.KiTSLogger = exports.MetricsCollector = exports.TelemetryService = void 0;
exports.initializeMonitoring = initializeMonitoring;
var telemetry_1 = require("./telemetry");
Object.defineProperty(exports, "TelemetryService", { enumerable: true, get: function () { return telemetry_1.TelemetryService; } });
var metrics_1 = require("./metrics");
Object.defineProperty(exports, "MetricsCollector", { enumerable: true, get: function () { return metrics_1.MetricsCollector; } });
var logger_1 = require("./logger");
Object.defineProperty(exports, "KiTSLogger", { enumerable: true, get: function () { return logger_1.KiTSLogger; } });
Object.defineProperty(exports, "requestLogger", { enumerable: true, get: function () { return logger_1.requestLogger; } });
Object.defineProperty(exports, "errorLogger", { enumerable: true, get: function () { return logger_1.errorLogger; } });
var tracing_1 = require("./tracing");
Object.defineProperty(exports, "TracingService", { enumerable: true, get: function () { return tracing_1.TracingService; } });
var health_check_1 = require("./health-check");
Object.defineProperty(exports, "createHealthRouter", { enumerable: true, get: function () { return health_check_1.createHealthRouter; } });
function initializeMonitoring(config) {
    const telemetry = new TelemetryService(config);
    telemetry.start();
    const meter = telemetry.getMeter('kits-hub');
    const metrics = new MetricsCollector(meter);
    const logger = new KiTSLogger(config.serviceName);
    return {
        telemetry,
        metrics,
        logger,
        healthRouter: createHealthRouter(logger),
    };
}
//# sourceMappingURL=index.js.map