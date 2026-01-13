import type { EventMiddleware, BaseEvent } from '../types';

export class TransformationMiddleware {
  /**
   * Middleware that enriches events with additional metadata
   */
  static enricher(enrichments: Record<string, any>): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      // Add enrichments to event metadata
      event.metadata = {
        ...event.metadata,
        ...enrichments,
        enrichedAt: new Date().toISOString(),
      };

      await next();
    };
  }

  /**
   * Middleware that adds tenant context to events
   */
  static tenantContext(tenantId: string): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      event.metadata = {
        ...event.metadata,
        tenantId,
        tenantContextAddedAt: new Date().toISOString(),
      };

      await next();
    };
  }

  /**
   * Middleware that adds user context to events
   */
  static userContext(userId: string, userRole?: string): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      event.metadata = {
        ...event.metadata,
        userId,
        userRole,
        userContextAddedAt: new Date().toISOString(),
      };

      await next();
    };
  }

  /**
   * Middleware that sanitizes sensitive data
   */
  static sanitizer(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      // Deep clone event to avoid mutation
      const sanitizedEvent = JSON.parse(JSON.stringify(event));

      // Sanitize sensitive fields in metadata
      if (sanitizedEvent.metadata) {
        // Remove or mask sensitive fields
        const sensitiveFields = ['password', 'creditCard', 'ssn', 'apiKey', 'token'];
        
        for (const field of sensitiveFields) {
          if (sanitizedEvent.metadata[field]) {
            sanitizedEvent.metadata[field] = '***REDACTED***';
          }
        }

        // Sanitize nested objects
        this.sanitizeObject(sanitizedEvent.metadata, sensitiveFields);
      }

      // Replace original event with sanitized version
      Object.assign(event, sanitizedEvent);

      await next();
    };
  }

  /**
   * Middleware that normalizes event data
   */
  static normalizer(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      // Normalize timestamps
      if (event.timestamp instanceof Date) {
        // Already a Date object, keep as is
      } else if (typeof event.timestamp === 'string') {
        event.timestamp = new Date(event.timestamp);
      } else if (typeof event.timestamp === 'number') {
        event.timestamp = new Date(event.timestamp);
      }

      // Normalize currency amounts to 2 decimal places
      if (event.metadata?.amount) {
        event.metadata.amount = Number(Number(event.metadata.amount).toFixed(2));
      }
      if (event.metadata?.totalAmount) {
        event.metadata.totalAmount = Number(Number(event.metadata.totalAmount).toFixed(2));
      }
      if (event.metadata?.taxAmount) {
        event.metadata.taxAmount = Number(Number(event.metadata.taxAmount).toFixed(2));
      }

      // Normalize strings (trim whitespace)
      this.normalizeStrings(event);

      await next();
    };
  }

  /**
   * Middleware that adds correlation IDs if missing
   */
  static correlationManager(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      // Add correlation ID if missing
      if (!event.correlationId) {
        event.correlationId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      await next();
    };
  }

  /**
   * Middleware that transforms events for different targets
   */
  static targetTransformer(target: 'analytics' | 'audit' | 'external'): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      switch (target) {
        case 'analytics':
          await this.transformForAnalytics(event);
          break;
        case 'audit':
          await this.transformForAudit(event);
          break;
        case 'external':
          await this.transformForExternal(event);
          break;
      }

      await next();
    };
  }

  /**
   * Transform event for analytics consumption
   */
  private static async transformForAnalytics(event: BaseEvent): Promise<void> {
    // Add analytics-friendly metadata
    event.metadata = {
      ...event.metadata,
      analyticsTimestamp: event.timestamp.toISOString(),
      eventType: event.type,
      source: event.source,
      // Simplify data for analytics
      simplifiedData: this.simplifyForAnalytics(event),
    };
  }

  /**
   * Transform event for audit trail
   */
  private static async transformForAudit(event: BaseEvent): Promise<void> {
    // Add audit-specific metadata
    event.metadata = {
      ...event.metadata,
      auditTimestamp: event.timestamp.toISOString(),
      auditEventId: event.id,
      auditSource: event.source,
      auditType: event.type,
      // Keep full data for audit
      fullEventData: JSON.stringify(event),
    };
  }

  /**
   * Transform event for external systems
   */
  private static async transformForExternal(event: BaseEvent): Promise<void> {
    // Remove internal metadata for external consumption
    const externalMetadata = { ...event.metadata };
    delete externalMetadata.internalFields;
    delete externalMetadata.debugInfo;

    event.metadata = {
      ...externalMetadata,
      externalTimestamp: event.timestamp.toISOString(),
      externalEventId: event.id,
    };
  }

  /**
   * Recursively sanitize object properties
   */
  private static sanitizeObject(obj: any, sensitiveFields: string[]): void {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object') {
          this.sanitizeObject(obj[key], sensitiveFields);
        }
      }
    }
  }

  /**
   * Recursively normalize string values
   */
  private static normalizeStrings(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === 'object') {
          this.normalizeStrings(obj[key]);
        }
      }
    }
  }

  /**
   * Simplify event data for analytics
   */
  private static simplifyForAnalytics(event: BaseEvent): any {
    const simplified: any = {
      eventType: event.type,
      source: event.source,
      timestamp: event.timestamp.toISOString(),
    };

    // Add key metrics based on event type
    if (event.metadata?.saleData) {
      simplified.totalAmount = event.metadata.saleData.totalAmount;
      simplified.itemCount = event.metadata.saleData.items?.length || 0;
    }

    if (event.metadata?.quantity) {
      simplified.quantity = event.metadata.quantity;
    }

    if (event.metadata?.amount) {
      simplified.amount = event.metadata.amount;
    }

    return simplified;
  }
}
