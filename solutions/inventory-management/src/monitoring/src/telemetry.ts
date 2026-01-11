import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { MeterProvider } from '@opentelemetry/sdk-metrics';

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  instanceId?: string;
  otlpEndpoint?: string;
  prometheusPort?: number;
}

export class TelemetryService {
  private sdk: NodeSDK;
  private meterProvider: MeterProvider;

  constructor(config: TelemetryConfig) {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
      [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: config.instanceId || 'unknown',
    });

    // Initialize metrics provider
    this.meterProvider = new MeterProvider({
      resource,
    });

    // Initialize trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: config.otlpEndpoint || 'http://jaeger:14268/api/traces',
    });

    // Initialize Prometheus exporter
    const prometheusExporter = new PrometheusExporter({
      port: config.prometheusPort || 9464,
      endpoint: '/metrics',
    });

    // Initialize SDK
    this.sdk = new NodeSDK({
      resource,
      traceExporter,
      spanProcessors: [
        new BatchSpanProcessor(traceExporter),
        new SimpleSpanProcessor(traceExporter),
      ],
      instrumentations: [getNodeAutoInstrumentations()],
      metricReader: prometheusExporter,
    });
  }

  start(): void {
    this.sdk.start();
    console.log('OpenTelemetry initialized successfully');
  }

  stop(): void {
    this.sdk.shutdown();
    console.log('OpenTelemetry shutdown completed');
  }

  getMeter(name: string) {
    return this.meterProvider.getMeter(name);
  }
}
