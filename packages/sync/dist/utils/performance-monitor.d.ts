import { EventEmitter } from 'eventemitter3';
import { SyncEvent } from '../types';
export interface PerformanceMetrics {
    latency: number;
    throughput: number;
    errorRate: number;
    conflictRate: number;
    averageResponseTime: number;
    peakMemoryUsage: number;
    connectionUptime: number;
}
export interface PerformanceAlert {
    type: 'latency' | 'error_rate' | 'memory' | 'connection' | 'conflict_rate' | 'throughput';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    value: number;
    threshold: number;
}
export declare class SyncPerformanceMonitor extends EventEmitter {
    private metrics;
    private alerts;
    private thresholds;
    private measurements;
    private startTime;
    private lastCleanup;
    constructor();
    private initializeThresholds;
    private startMonitoring;
    recordSyncEvent(event: SyncEvent, responseTime?: number): void;
    private recordMeasurement;
    private updateMetrics;
    private calculateAverage;
    private updateMemoryUsage;
    private checkThresholds;
    private createAlert;
    private cleanupOldData;
    getMetrics(): PerformanceMetrics;
    getAlerts(): PerformanceAlert[];
    getCriticalAlerts(): PerformanceAlert[];
    setThreshold(type: string, value: number): void;
    getThreshold(type: string): number | undefined;
    clearAlerts(): void;
    reset(): void;
    exportData(): {
        metrics: PerformanceMetrics;
        alerts: PerformanceAlert[];
        measurements: Record<string, number[]>;
        thresholds: Record<string, number>;
    };
}
export declare function getPerformanceMonitor(): SyncPerformanceMonitor;
export declare function resetPerformanceMonitor(): void;
