import type { EventMiddleware, BaseEvent } from '../types';

export class LoggingMiddleware {
  /**
   * Middleware that logs all events
   */
  static logger(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📤 Event: ${event.type} from ${event.source}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Correlation ID: ${event.correlationId || 'N/A'}`);
      console.log(`   Causation ID: ${event.causationId || 'N/A'}`);
      
      if (event.metadata && Object.keys(event.metadata).length > 0) {
        console.log(`   Metadata:`, event.metadata);
      }

      await next();
    };
  }

  /**
   * Middleware that logs only errors
   */
  static errorLogger(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      try {
        await next();
      } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ❌ Event Error: ${event.type}`);
        console.error(`   Event ID: ${event.id}`);
        console.error(`   Error:`, error);
        throw error;
      }
    };
  }

  /**
   * Middleware that logs performance metrics
   */
  static performanceLogger(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      const startTime = Date.now();
      const startHrTime = process.hrtime.bigint();

      await next();

      const endTime = Date.now();
      const endHrTime = process.hrtime.bigint();
      const durationMs = endTime - startTime;
      const durationNs = Number(endHrTime - startHrTime);
      const durationMicros = durationNs / 1000;

      console.log(`⏱️ Performance: ${event.type} took ${durationMs}ms (${durationMicros.toFixed(2)}μs)`);
    };
  }

  /**
   * Middleware that logs to external monitoring service
   */
  static monitoringLogger(serviceName: string = 'event-bus'): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      const startTime = Date.now();

      try {
        await next();

        // Log successful event processing
        const logData = {
          service: serviceName,
          event: event.type,
          eventId: event.id,
          source: event.source,
          correlationId: event.correlationId,
          status: 'success',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        // In a real implementation, this would send to monitoring service
        console.log('📊 Monitoring Log:', JSON.stringify(logData, null, 2));

      } catch (error) {
        // Log failed event processing
        const logData = {
          service: serviceName,
          event: event.type,
          eventId: event.id,
          source: event.source,
          correlationId: event.correlationId,
          status: 'error',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };

        console.error('📊 Monitoring Error Log:', JSON.stringify(logData, null, 2));
        throw error;
      }
    };
  }
}
