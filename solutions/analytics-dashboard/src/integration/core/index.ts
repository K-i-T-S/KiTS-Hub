/**
 * KiTS Hub Integration Core - Main Entry Point
 * Exports all integration services and utilities
 */

// Core types and interfaces
export * from './types';

// Authentication service
export * from './auth';

// HTTP client for API communication
export * from './http-client';

// Webhook service
export * from './webhook-service';

// Data synchronization service
export * from './data-sync';

// External integrations
export * from '../external/payment-gateway';
export * from '../external/email-service';
export * from '../external/sms-service';

// Convenience exports
export { AuthService } from './auth';
export { HttpClient } from './http-client';
export { WebhookService } from './webhook-service';
export { DataSyncService } from './data-sync';
export { PaymentGateway } from '../external/payment-gateway';
export { EmailService } from '../external/email-service';
export { SMSService } from '../external/sms-service';
