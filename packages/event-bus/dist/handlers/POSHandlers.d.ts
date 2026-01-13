import type { EventHandler } from '../types';
export declare class POSHandlers {
    /**
     * Handle POS sale created event
     * Triggers inventory updates and accounting transactions
     */
    static handleSaleCreated: EventHandler;
    /**
     * Handle POS payment received event
     */
    static handlePaymentReceived: EventHandler;
    /**
     * Handle POS refund processed event
     */
    static handleRefundProcessed: EventHandler;
    /**
     * Handle POS sale cancelled event
     */
    static handleSaleCancelled: EventHandler;
}
