import { supabase } from '../supabase';
import { globalEventBus } from '../events/event-bus';
import { 
  CrossSolutionEvent
} from '../events/types';

// Conflict resolution strategies
export type ConflictResolutionStrategy = 
  | 'source_wins' 
  | 'target_wins' 
  | 'merge' 
  | 'timestamp' 
  | 'manual';

// Sync status
export interface SyncStatus {
  lastSync: Date;
  success: boolean;
  error?: string;
  recordCount: number;
  duration: number;
}

// Sync configuration
export interface SyncConfig {
  enableRealTime: boolean;
  conflictResolution: ConflictResolutionStrategy;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  syncInterval: number; // in minutes
}

// Data validation rules
export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'email' | 'phone' | 'date';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

// Sync result
export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsFailed: number;
  errors: Array<{
    recordId: string;
    error: string;
    data: any;
  }>;
  duration: number;
}

export class DataSyncService {
  private config: SyncConfig;
  private syncStatuses: Map<string, SyncStatus> = new Map();
  private validationRules: Map<string, ValidationRule[]> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      enableRealTime: true,
      conflictResolution: 'timestamp',
      retryAttempts: 3,
      retryDelay: 1000,
      batchSize: 100,
      syncInterval: 5,
      ...config,
    };

    this.setupValidationRules();
    this.setupEventListeners();
  }

  /**
   * Synchronize customer data between CRM and other systems
   */
  async syncCustomerData(customerId: string, source: 'crm' | 'pos' | 'web'): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log(`Syncing customer ${customerId} from ${source}`);

      // Get customer data from source
      const customerData = await this.getCustomerFromSource(customerId, source);
      if (!customerData) {
        throw new Error(`Customer ${customerId} not found in ${source}`);
      }

      // Validate customer data
      const validation = this.validateData('customer', customerData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if customer exists in other systems
      const existingCustomers = await this.getCustomerFromAllSystems(customerId);

      // Sync to each target system
      for (const [targetSystem, existingData] of Object.entries(existingCustomers)) {
        if (targetSystem === source) continue;

        try {
          result.recordsProcessed++;

          if (existingData) {
            // Update existing customer
            const updatedData = await this.resolveConflict(
              existingData, 
              customerData, 
              this.config.conflictResolution
            );
            
            await this.updateCustomerInSystem(targetSystem as any, customerId, updatedData);
            result.recordsUpdated++;
          } else {
            // Create new customer
            await this.createCustomerInSystem(targetSystem as any, customerData);
            result.recordsCreated++;
          }
        } catch (error) {
          result.recordsFailed++;
          result.errors.push({
            recordId: customerId,
            error: error instanceof Error ? error.message : String(error),
            data: customerData,
          });
        }
      }

      result.success = result.recordsFailed === 0;

      // Update sync status
      this.updateSyncStatus(`customer_${customerId}`, {
        lastSync: new Date(),
        success: result.success,
        recordCount: result.recordsProcessed,
        duration: Date.now() - startTime,
      });

    } catch (error) {
      result.success = false;
      result.errors.push({
        recordId: customerId,
        error: error instanceof Error ? error.message : String(error),
        data: null,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Synchronize inventory data after sales
   */
  async syncInventoryData(productId: string, quantityChange: number, reason: string): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log(`Syncing inventory for product ${productId}, change: ${quantityChange}`);

      // Get current inventory from all locations
      const inventoryData = await this.getInventoryFromAllSystems(productId);

      // Update inventory in each system
      for (const [system, currentData] of Object.entries(inventoryData)) {
        try {
          result.recordsProcessed++;

          const newQuantity = Math.max(0, (currentData?.quantity || 0) + quantityChange);
          
          await this.updateInventoryInSystem(system, productId, {
            quantity: newQuantity,
            lastUpdated: new Date(),
            updateReason: reason,
            updatedBy: 'system',
          });

          result.recordsUpdated++;

          // Check for low stock and emit alert if needed
          if (newQuantity <= (currentData?.lowStockThreshold || 10)) {
            await this.emitLowStockAlert(productId, newQuantity, currentData?.lowStockThreshold || 10);
          }

        } catch (error) {
          result.recordsFailed++;
          result.errors.push({
            recordId: productId,
            error: error instanceof Error ? error.message : String(error),
            data: { quantityChange, reason },
          });
        }
      }

      result.success = result.recordsFailed === 0;

      // Update sync status
      this.updateSyncStatus(`inventory_${productId}`, {
        lastSync: new Date(),
        success: result.success,
        recordCount: result.recordsProcessed,
        duration: Date.now() - startTime,
      });

    } catch (error) {
      result.success = false;
      result.errors.push({
        recordId: productId,
        error: error instanceof Error ? error.message : String(error),
        data: { quantityChange, reason },
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Synchronize financial data from sales to accounting
   */
  async syncFinancialData(transactionId: string, saleData: any): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log(`Syncing financial data for transaction ${transactionId}`);

      // Create accounting transaction from sale
      const accountingTransaction = this.convertSaleToAccountingTransaction(saleData);

      // Validate transaction data
      const validation = this.validateData('transaction', accountingTransaction);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if transaction already exists in accounting
      const existingTransaction = await this.getTransactionFromAccounting(transactionId);

      if (existingTransaction) {
        // Update existing transaction
        await this.updateTransactionInAccounting(transactionId, accountingTransaction);
        result.recordsUpdated++;
      } else {
        // Create new transaction
        await this.createTransactionInAccounting(accountingTransaction);
        result.recordsCreated++;
      }

      result.recordsProcessed = 1;
      result.success = true;

      // Update sync status
      this.updateSyncStatus(`financial_${transactionId}`, {
        lastSync: new Date(),
        success: result.success,
        recordCount: result.recordsProcessed,
        duration: Date.now() - startTime,
      });

    } catch (error) {
      result.success = false;
      result.errors.push({
        recordId: transactionId,
        error: error instanceof Error ? error.message : String(error),
        data: saleData,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Synchronize employee performance data from HR to Analytics
   */
  async syncEmployeePerformance(employeeId: string, performanceData: any): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log(`Syncing performance data for employee ${employeeId}`);

      // Validate performance data
      const validation = this.validateData('performance', performanceData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Update analytics with performance data
      await this.updateEmployeePerformanceInAnalytics(employeeId, performanceData);
      
      result.recordsProcessed = 1;
      result.recordsUpdated = 1;
      result.success = true;

      // Update sync status
      this.updateSyncStatus(`performance_${employeeId}`, {
        lastSync: new Date(),
        success: result.success,
        recordCount: result.recordsProcessed,
        duration: Date.now() - startTime,
      });

    } catch (error) {
      result.success = false;
      result.errors.push({
        recordId: employeeId,
        error: error instanceof Error ? error.message : String(error),
        data: performanceData,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Get sync status for a specific entity
   */
  getSyncStatus(entityId: string): SyncStatus | undefined {
    return this.syncStatuses.get(entityId);
  }

  /**
   * Get all sync statuses
   */
  getAllSyncStatuses(): Record<string, SyncStatus> {
    return Object.fromEntries(this.syncStatuses);
  }

  /**
   * Setup validation rules for different data types
   */
  private setupValidationRules(): void {
    // Customer validation rules
    this.validationRules.set('customer', [
      { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
      { field: 'email', required: true, type: 'email' },
      { field: 'phone', required: false, type: 'phone' },
      { field: 'address', required: false, type: 'string', maxLength: 500 },
    ]);

    // Transaction validation rules
    this.validationRules.set('transaction', [
      { field: 'amount', required: true, type: 'number' },
      { field: 'type', required: true, type: 'string' },
      { field: 'accountId', required: true, type: 'string' },
      { field: 'categoryId', required: true, type: 'string' },
      { field: 'description', required: false, type: 'string', maxLength: 1000 },
    ]);

    // Performance validation rules
    this.validationRules.set('performance', [
      { field: 'employeeId', required: true, type: 'string' },
      { field: 'period', required: true, type: 'string' },
      { field: 'metrics', required: true, type: 'string' }, // Will be validated with custom rule
    ]);
  }

  /**
   * Setup event listeners for cross-solution events
   */
  private setupEventListeners(): void {
    // Listen for customer events
    globalEventBus.on('customer_created', async (event: CrossSolutionEvent) => {
      if (this.config.enableRealTime && event.type === 'customer_created') {
        const source = event.data.source === 'database' ? 'crm' : event.data.source as 'crm' | 'pos' | 'web';
        await this.syncCustomerData(event.data.customerId, source);
      }
    });

    globalEventBus.on('customer_updated', async (event: CrossSolutionEvent) => {
      if (this.config.enableRealTime && event.type === 'customer_updated') {
        await this.syncCustomerData(event.data.customerId, 'crm');
      }
    });

    // Listen for stock events
    globalEventBus.on('stock_updated', async (event: CrossSolutionEvent) => {
      if (this.config.enableRealTime && event.type === 'stock_updated') {
        const quantityChange = event.data.newStock - event.data.previousStock;
        await this.syncInventoryData(event.data.productId, quantityChange, event.data.reason);
      }
    });

    // Listen for sales events
    globalEventBus.on('sale_processed', async (event: CrossSolutionEvent) => {
      if (this.config.enableRealTime && event.type === 'sale_processed') {
        await this.syncFinancialData(event.data.saleId, event.data);
      }
    });

    // Listen for performance events
    globalEventBus.on('employee_performance_updated', async (event: CrossSolutionEvent) => {
      if (this.config.enableRealTime && event.type === 'employee_performance_updated') {
        await this.syncEmployeePerformance(event.data.employeeId, event.data.metrics);
      }
    });
  }

  /**
   * Validate data against rules
   */
  private validateData(type: string, data: any): { valid: boolean; errors: string[] } {
    const rules = this.validationRules.get(type) || [];
    const errors: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${rule.field} must be a string`);
            } else {
              if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
              }
              if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
              }
              if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${rule.field} format is invalid`);
              }
            }
            break;

          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push(`${rule.field} must be a number`);
            }
            break;

          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${rule.field} must be a valid email`);
            }
            break;

          case 'phone':
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) {
              errors.push(`${rule.field} must be a valid phone number`);
            }
            break;

          case 'date':
            if (!(value instanceof Date) && isNaN(Date.parse(value))) {
              errors.push(`${rule.field} must be a valid date`);
            }
            break;
        }

        if (rule.custom && !rule.custom(value)) {
          errors.push(`${rule.field} failed custom validation`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Resolve conflicts between data sources
   */
  private async resolveConflict(
    sourceData: any, 
    targetData: any, 
    strategy: ConflictResolutionStrategy
  ): Promise<any> {
    switch (strategy) {
      case 'source_wins':
        return sourceData;

      case 'target_wins':
        return targetData;

      case 'timestamp':
        const sourceDate = new Date(sourceData.updatedAt || sourceData.lastUpdated);
        const targetDate = new Date(targetData.updatedAt || targetData.lastUpdated);
        return sourceDate > targetDate ? sourceData : targetData;

      case 'merge':
        return this.mergeData(sourceData, targetData);

      case 'manual':
        // In a real implementation, this would trigger a manual resolution process
        console.warn('Manual conflict resolution not implemented, using source wins');
        return sourceData;

      default:
        return sourceData;
    }
  }

  /**
   * Merge two data objects
   */
  private mergeData(source: any, target: any): any {
    const merged = { ...target };
    
    for (const key in source) {
      if (source[key] !== undefined && source[key] !== null) {
        merged[key] = source[key];
      }
    }

    return merged;
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(entityId: string, status: SyncStatus): void {
    this.syncStatuses.set(entityId, {
      ...status,
      lastSync: new Date(),
    });
  }

  /**
   * Emit low stock alert
   */
  private async emitLowStockAlert(productId: string, currentStock: number, threshold: number): Promise<void> {
    const alertEvent: CrossSolutionEvent = {
      id: `low_stock_${Date.now()}`,
      type: 'low_stock_alert',
      timestamp: new Date(),
      source: 'sync-service',
      tenantId: 'current-tenant', // Should come from context
      userId: 'system',
      data: {
        productId,
        currentStock,
        threshold,
        productName: `Product ${productId}`, // Should fetch actual name
        location: 'default',
      },
    };

    await globalEventBus.emit(alertEvent);
  }

  // Helper methods for system-specific operations
  // These would be implemented based on the actual system APIs

  private async getCustomerFromSource(customerId: string, _source: string): Promise<any> {
    // Implementation would depend on the source system
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (error) throw error;
    return data;
  }

  private async getCustomerFromAllSystems(customerId: string): Promise<Record<string, any>> {
    // For now, just get from the main database
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (error) throw error;
    return { main: data };
  }

  private async updateCustomerInSystem(_system: string, customerId: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update(data)
      .eq('id', customerId);
    
    if (error) throw error;
  }

  private async createCustomerInSystem(_system: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .insert(data);
    
    if (error) throw error;
  }

  private async getInventoryFromAllSystems(productId: string): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('inventory_stock')
      .select('*')
      .eq('product_id', productId);
    
    if (error) throw error;
    
    const result: Record<string, any> = {};
    data?.forEach(item => {
      result[item.location_id || 'default'] = item;
    });
    
    return result;
  }

  private async updateInventoryInSystem(system: string, productId: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('inventory_stock')
      .upsert({
        product_id: productId,
        location_id: system,
        ...data,
      });
    
    if (error) throw error;
  }

  private convertSaleToAccountingTransaction(saleData: any): any {
    return {
      id: saleData.saleId,
      type: 'sale',
      amount: saleData.totalAmount,
      accountId: 'sales-revenue', // Default account
      categoryId: 'sales',
      description: `Sale #${saleData.saleId}`,
      referenceId: saleData.saleId,
      referenceType: 'sale',
      date: new Date().toISOString(),
    };
  }

  private async getTransactionFromAccounting(transactionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('accounting_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    return data;
  }

  private async createTransactionInAccounting(transaction: any): Promise<void> {
    const { error } = await supabase
      .from('accounting_transactions')
      .insert(transaction);
    
    if (error) throw error;
  }

  private async updateTransactionInAccounting(transactionId: string, transaction: any): Promise<void> {
    const { error } = await supabase
      .from('accounting_transactions')
      .update(transaction)
      .eq('id', transactionId);
    
    if (error) throw error;
  }

  private async updateEmployeePerformanceInAnalytics(employeeId: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('employee_performance')
      .upsert({
        employee_id: employeeId,
        ...data,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear all intervals
    for (const interval of this.syncIntervals.values()) {
      clearInterval(interval);
    }
    this.syncIntervals.clear();
  }
}

// Global data sync service instance
export const dataSyncService = new DataSyncService({
  enableRealTime: true,
  conflictResolution: 'timestamp',
  retryAttempts: 3,
  retryDelay: 1000,
  batchSize: 100,
  syncInterval: 5,
});
