import type { EventHandler, BaseEvent } from '../types';
export declare class AccountingHandlers {
    /**
     * Handle accounting transaction created event
     * Typically triggered by POS sales, purchases, or adjustments
     */
    static handleTransactionCreated: EventHandler;
    /**
     * Handle accounting invoice created event
     */
    static handleInvoiceCreated: EventHandler;
    /**
     * Handle accounting invoice paid event
     */
    static handleInvoicePaid: EventHandler;
    /**
     * Handle accounting payment recorded event
     */
    static handlePaymentRecorded: EventHandler;
    /**
     * Handle accounting journal entry created event
     */
    static handleJournalEntryCreated: EventHandler;
    /**
     * Create accounting transaction from POS sale
     * This is a helper method that would be called by the POS handler
     */
    static createTransactionFromSale(saleEvent: BaseEvent): BaseEvent | null;
}
