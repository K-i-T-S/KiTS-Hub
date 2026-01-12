export interface TelemetryConfig {
    serviceName: string;
    serviceVersion: string;
    environment: string;
    instanceId?: string;
    otlpEndpoint?: string;
    prometheusPort?: number;
}
export declare class TelemetryService {
    private sdk;
    private meterProvider;
    constructor(config: TelemetryConfig);
    start(): void;
    stop(): void;
    getMeter(name: string): import("@opentelemetry/api").Meter;
}
//# sourceMappingURL=telemetry.d.ts.map