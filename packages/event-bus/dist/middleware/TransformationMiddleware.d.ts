import type { EventMiddleware } from '../types';
export declare class TransformationMiddleware {
    /**
     * Middleware that enriches events with additional metadata
     */
    static enricher(enrichments: Record<string, any>): EventMiddleware;
    /**
     * Middleware that adds tenant context to events
     */
    static tenantContext(tenantId: string): EventMiddleware;
    /**
     * Middleware that adds user context to events
     */
    static userContext(userId: string, userRole?: string): EventMiddleware;
    /**
     * Middleware that sanitizes sensitive data
     */
    static sanitizer(): EventMiddleware;
    /**
     * Middleware that normalizes event data
     */
    static normalizer(): EventMiddleware;
    /**
     * Middleware that adds correlation IDs if missing
     */
    static correlationManager(): EventMiddleware;
    /**
     * Middleware that transforms events for different targets
     */
    static targetTransformer(target: 'analytics' | 'audit' | 'external'): EventMiddleware;
    /**
     * Transform event for analytics consumption
     */
    private static transformForAnalytics;
    /**
     * Transform event for audit trail
     */
    private static transformForAudit;
    /**
     * Transform event for external systems
     */
    private static transformForExternal;
    /**
     * Recursively sanitize object properties
     */
    private static sanitizeObject;
    /**
     * Recursively normalize string values
     */
    private static normalizeStrings;
    /**
     * Simplify event data for analytics
     */
    private static simplifyForAnalytics;
}
