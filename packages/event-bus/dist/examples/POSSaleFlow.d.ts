import { EventBus } from '../EventBus';
export declare class POSSaleFlowExample {
    private eventBus;
    constructor();
    /**
     * Set up event handlers for the flow
     */
    private setupHandlers;
    /**
     * Set up cross-solution event handlers that trigger other events
     */
    private setupCrossSolutionHandlers;
    /**
     * Handle POS sale created event - triggers inventory and accounting events
     */
    private handlePOSSaleCreated;
    /**
     * Handle stock removed event - check for low stock alerts
     */
    private handleStockRemoved;
    /**
     * Run the complete POS sale flow example
     */
    runExample(): Promise<void>;
    /**
     * Get the event bus instance for external use
     */
    getEventBus(): EventBus;
}
export declare function runPOSSaleFlowExample(): Promise<void>;
