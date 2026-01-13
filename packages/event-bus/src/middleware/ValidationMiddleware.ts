import type { EventMiddleware, BaseEvent } from '../types';
import { BaseEventSchema, POSSaleEventSchema, InventoryStockEventSchema, AccountingTransactionEventSchema } from '../types';

export class ValidationMiddleware {
  /**
   * Middleware that validates base event structure
   */
  static baseValidator(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      try {
        BaseEventSchema.parse(event);
        await next();
      } catch (error) {
        console.error(`❌ Base Event Validation Failed for ${event.type}:`, error instanceof Error ? error.message : String(error));
        throw new Error(`Invalid event structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
  }

  /**
   * Middleware that validates POS sale events
   */
  static posValidator(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      if (event.type.startsWith('pos.')) {
        try {
          if (event.type === 'pos.sale.created') {
            POSSaleEventSchema.parse(event);
          }
          await next();
        } catch (error) {
          console.error(`❌ POS Event Validation Failed for ${event.type}:`, error);
          throw new Error(`Invalid POS event structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        await next();
      }
    };
  }

  /**
   * Middleware that validates inventory events
   */
  static inventoryValidator(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      if (event.type.startsWith('inventory.')) {
        try {
          if (event.type === 'inventory.stock.removed') {
            InventoryStockEventSchema.parse(event);
          }
          await next();
        } catch (error) {
          console.error(`❌ Inventory Event Validation Failed for ${event.type}:`, error);
          throw new Error(`Invalid inventory event structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        await next();
      }
    };
  }

  /**
   * Middleware that validates accounting events
   */
  static accountingValidator(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      if (event.type.startsWith('accounting.')) {
        try {
          if (event.type === 'accounting.transaction.created') {
            AccountingTransactionEventSchema.parse(event);
          }
          await next();
        } catch (error) {
          console.error(`❌ Accounting Event Validation Failed for ${event.type}:`, error);
          throw new Error(`Invalid accounting event structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        await next();
      }
    };
  }

  /**
   * Middleware that validates business rules
   */
  static businessRulesValidator(): EventMiddleware {
    return async (event: BaseEvent, next: () => void | Promise<void>) => {
      // Validate business rules based on event type
      switch (event.type) {
        case 'pos.sale.created':
          await this.validatePOSSale(event);
          break;
        case 'inventory.stock.removed':
          await this.validateStockRemoval(event);
          break;
        case 'accounting.transaction.created':
          await this.validateAccountingTransaction(event);
          break;
      }

      await next();
    };
  }

  /**
   * Validate POS sale business rules
   */
  private static async validatePOSSale(event: BaseEvent): Promise<void> {
    const data = event.metadata?.saleData;
    if (!data) return;

    // Rule: Sale must have at least one item
    if (!data.items || data.items.length === 0) {
      throw new Error('POS sale must contain at least one item');
    }

    // Rule: Total amount must be positive
    if (data.totalAmount <= 0) {
      throw new Error('POS sale total amount must be positive');
    }

    // Rule: Item quantities must be positive
    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new Error(`Item ${item.productId} quantity must be positive`);
      }
      if (item.unitPrice < 0) {
        throw new Error(`Item ${item.productId} unit price cannot be negative`);
      }
    }

    // Rule: Tax amount cannot be negative
    if (data.taxAmount < 0) {
      throw new Error('Tax amount cannot be negative');
    }

    // Rule: Discount cannot exceed total amount
    if (data.discountAmount > data.totalAmount) {
      throw new Error('Discount amount cannot exceed total amount');
    }
  }

  /**
   * Validate stock removal business rules
   */
  private static async validateStockRemoval(event: BaseEvent): Promise<void> {
    const data = event.metadata;
    if (!data) return;

    // Rule: Quantity must be positive
    if (data.quantity <= 0) {
      throw new Error('Stock removal quantity must be positive');
    }

    // Rule: Must have sufficient stock
    if (data.newStock < 0) {
      throw new Error('Insufficient stock for removal');
    }

    // Rule: Must provide reason
    if (!data.reason) {
      throw new Error('Stock removal must include a reason');
    }
  }

  /**
   * Validate accounting transaction business rules
   */
  private static async validateAccountingTransaction(event: BaseEvent): Promise<void> {
    const data = event.metadata?.transactionData;
    if (!data) return;

    // Rule: Must have at least two entries
    if (!data.entries || data.entries.length < 2) {
      throw new Error('Accounting transaction must have at least two entries');
    }

    // Rule: Amount must be positive
    if (data.amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    // Rule: Must balance (debits = credits)
    const totalDebits = data.entries.reduce((sum: number, entry: any) => sum + (entry.debitAmount || 0), 0);
    const totalCredits = data.entries.reduce((sum: number, entry: any) => sum + (entry.creditAmount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Transaction must balance: debits ($${totalDebits.toFixed(2)}) != credits ($${totalCredits.toFixed(2)})`);
    }

    // Rule: Each entry must have either debit or credit, not both
    for (const entry of data.entries) {
      if (entry.debitAmount > 0 && entry.creditAmount > 0) {
        throw new Error('Each entry must have either debit or credit amount, not both');
      }
      if (entry.debitAmount <= 0 && entry.creditAmount <= 0) {
        throw new Error('Each entry must have a positive debit or credit amount');
      }
    }
  }
}
