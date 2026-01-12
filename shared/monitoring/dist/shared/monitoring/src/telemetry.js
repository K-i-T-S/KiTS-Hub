"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const exporter_otlp_http_1 = require("@opentelemetry/exporter-otlp-http");
const exporter_prometheus_1 = require("@opentelemetry/exporter-prometheus");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
class TelemetryService {
    sdk;
    meterProvider;
    constructor(config) {
        const resource = new resources_1.Resource({
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
            [semantic_conventions_1.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_INSTANCE_ID]: config.instanceId || 'unknown',
        });
        this.meterProvider = new sdk_metrics_1.MeterProvider({
            resource,
        });
        const traceExporter = new exporter_otlp_http_1.OTLPTraceExporter({
            url: config.otlpEndpoint || 'http://jaeger:14268/api/traces',
        });
        const prometheusExporter = new exporter_prometheus_1.PrometheusExporter({
            port: config.prometheusPort || 9464,
            endpoint: '/metrics',
        });
        this.sdk = new sdk_node_1.NodeSDK({
            resource,
            traceExporter,
            spanProcessors: [
                new sdk_trace_base_1.BatchSpanProcessor(traceExporter),
                new sdk_trace_base_1.SimpleSpanProcessor(traceExporter),
            ],
            instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
            metricReader: prometheusExporter,
        });
    }
    start() {
        this.sdk.start();
        console.log('OpenTelemetry initialized successfully');
    }
    stop() {
        this.sdk.shutdown();
        console.log('OpenTelemetry shutdown completed');
    }
    getMeter(name) {
        return this.meterProvider.getMeter(name);
    }
}
exports.TelemetryService = TelemetryService;
//# sourceMappingURL=telemetry.js.map