import type { EventHandler } from '../types';
export declare class InventoryHandlers {
    /**
     * Handle inventory stock removal event
     * Typically triggered by POS sales
     */
    static handleStockRemoved: EventHandler;
    /**
     * Handle inventory stock added event
     */
    static handleStockAdded: EventHandler;
    /**
     * Handle low stock alert event
     */
    static handleLowStockAlert: EventHandler;
    /**
     * Handle inventory stock transferred event
     */
    static handleStockTransferred: EventHandler;
    /**
     * Handle inventory item created event
     */
    static handleItemCreated: EventHandler;
    /**
     * Handle inventory item updated event
     */
    static handleItemUpdated: EventHandler;
}
