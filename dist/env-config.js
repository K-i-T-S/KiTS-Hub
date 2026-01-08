"use strict";
/**
 * Production-ready environment configuration and validation
 * Ensures all required environment variables are present and valid
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
exports.getValidatedEnvironment = getValidatedEnvironment;
exports.isProduction = isProduction;
exports.isDevelopment = isDevelopment;
exports.isTest = isTest;
exports.getEnvironmentConfig = getEnvironmentConfig;
const joi_1 = require("joi");
// Environment variable validation schema
const environmentSchema = joi_1.default.object({
    // Database
    NEXT_PUBLIC_SUPABASE_URL: joi_1.default.string().uri().required(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: joi_1.default.string().required(),
    SUPABASE_SERVICE_ROLE_KEY: joi_1.default.string().required(),
    // Security
    ENCRYPTION_KEY: joi_1.default.string().min(32).required(),
    JWT_SECRET: joi_1.default.string().min(32).required(),
    // Email
    EMAIL_SERVICE: joi_1.default.string().valid('resend', 'sendgrid', 'ses').default('resend'),
    EMAIL_SERVICE_API_KEY: joi_1.default.string().when('EMAIL_SERVICE', {
        is: joi_1.default.exist(),
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional()
    }),
    FROM_EMAIL: joi_1.default.string().email().required(),
    FROM_NAME: joi_1.default.string().min(1).max(100).required(),
    // Application
    NEXT_PUBLIC_APP_URL: joi_1.default.string().uri().required(),
    NODE_ENV: joi_1.default.string().valid('development', 'production', 'test').required(),
    // Optional
    STRIPE_PUBLISHABLE_KEY: joi_1.default.string().optional(),
    STRIPE_SECRET_KEY: joi_1.default.string().optional(),
    STRIPE_WEBHOOK_SECRET: joi_1.default.string().optional(),
    REDIS_URL: joi_1.default.string().uri().optional()
}).unknown();
/**
 * Validates environment variables
 * @returns { isValid: boolean, error?: string, config?: EnvironmentConfig }
 */
function validateEnvironment() {
    try {
        const { error, value: config } = environmentSchema.validate(process.env, {
            allowUnknown: true,
            stripUnknown: true
        });
        if (error) {
            return {
                isValid: false,
                error: `Environment validation failed: ${error.details[0]?.message || error.message}`
            };
        }
        // Additional validations
        if (config.NODE_ENV === 'production') {
            // Production-specific validations
            if (!config.ENCRYPTION_KEY || config.ENCRYPTION_KEY.length < 32) {
                return {
                    isValid: false,
                    error: 'ENCRYPTION_KEY must be at least 32 characters in production'
                };
            }
            if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
                return {
                    isValid: false,
                    error: 'JWT_SECRET must be at least 32 characters in production'
                };
            }
            // Validate URLs
            if (!config.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
                return {
                    isValid: false,
                    error: 'NEXT_PUBLIC_APP_URL must use HTTPS in production'
                };
            }
        }
        return {
            isValid: true,
            config: config
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: `Environment validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
/**
 * Get validated environment configuration
 * @returns {EnvironmentConfig}
 * @throws {Error} If environment validation fails
 */
function getValidatedEnvironment() {
    const validation = validateEnvironment();
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    return validation.config;
}
/**
 * Check if running in production
 * @returns {boolean}
 */
function isProduction() {
    return process.env.NODE_ENV === 'production';
}
/**
 * Check if running in development
 * @returns {boolean}
 */
function isDevelopment() {
    return process.env.NODE_ENV === 'development';
}
/**
 * Check if running in test
 * @returns {boolean}
 */
function isTest() {
    return process.env.NODE_ENV === 'test';
}
/**
 * Get environment-specific configuration
 * @returns {object}
 */
function getEnvironmentConfig() {
    return {
        isProduction: isProduction(),
        isDevelopment: isDevelopment(),
        isTest: isTest(),
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        nodeEnv: process.env.NODE_ENV
    };
}
