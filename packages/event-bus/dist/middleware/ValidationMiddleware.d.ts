import type { EventMiddleware } from '../types';
export declare class ValidationMiddleware {
    /**
     * Middleware that validates base event structure
     */
    static baseValidator(): EventMiddleware;
    /**
     * Middleware that validates POS sale events
     */
    static posValidator(): EventMiddleware;
    /**
     * Middleware that validates inventory events
     */
    static inventoryValidator(): EventMiddleware;
    /**
     * Middleware that validates accounting events
     */
    static accountingValidator(): EventMiddleware;
    /**
     * Middleware that validates business rules
     */
    static businessRulesValidator(): EventMiddleware;
    /**
     * Validate POS sale business rules
     */
    private static validatePOSSale;
    /**
     * Validate stock removal business rules
     */
    private static validateStockRemoval;
    /**
     * Validate accounting transaction business rules
     */
    private static validateAccountingTransaction;
}
