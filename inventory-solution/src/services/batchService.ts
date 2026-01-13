/**
 * Batch Tracking Service
 * Manages inventory batches, expiration tracking, and batch operations
 */

import type {
  Batch,
  ProductVariant,
  ReorderAlert
} from '../types/product';
import {
  BatchStatus,
  ReorderAlertType,
  AlertSeverity
} from '../types/product';
import { ProductError } from '../types/product';

// Mock data for demonstration
const mockBatches: Batch[] = [
  {
    id: 'batch-1',
    variantId: '1-1',
    batchNumber: 'BATCH-001',
    quantity: 100,
    remainingQuantity: 75,
    manufactureDate: '2024-01-01T00:00:00Z',
    expirationDate: '2024-12-31T00:00:00Z',
    supplier: 'TechSupplier Inc',
    cost: 1200,
    location: 'Warehouse A-1',
    status: BatchStatus.ACTIVE,
    notes: 'Initial batch',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'batch-2',
    variantId: '1-1',
    batchNumber: 'BATCH-002',
    quantity: 50,
    remainingQuantity: 50,
    manufactureDate: '2024-06-01T00:00:00Z',
    expirationDate: '2025-06-01T00:00:00Z',
    supplier: 'TechSupplier Inc',
    cost: 1150,
    location: 'Warehouse A-2',
    status: BatchStatus.ACTIVE,
    notes: 'Second batch with better pricing',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z'
  }
];

export interface BatchService {
  getBatchesByVariant(variantId: string): Promise<Batch[]>;
  createBatch(batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Batch>;
  updateBatch(id: string, updates: Partial<Batch>): Promise<Batch>;
  deleteBatch(id: string): Promise<void>;
  consumeBatch(id: string, quantity: number): Promise<Batch>;
  getExpiringBatches(daysThreshold: number): Promise<Batch[]>;
  getExpiredBatches(): Promise<Batch[]>;
  getBatchAlerts(): Promise<ReorderAlert[]>;
  transferBatch(id: string, newLocation: string, quantity?: number): Promise<Batch>;
  adjustBatchQuantity(id: string, newQuantity: number, reason: string): Promise<Batch>;
}

export class BatchServiceImpl implements BatchService {
  private batches: Batch[] = [...mockBatches];

  async getBatchesByVariant(variantId: string): Promise<Batch[]> {
    try {
      return this.batches.filter(batch => batch.variantId === variantId);
    } catch (error) {
      throw new ProductError(
        `Failed to fetch batches: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_BATCHES_ERROR',
        500
      );
    }
  }

  async createBatch(batchData: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Batch> {
    try {
      // Validate batch data
      if (!batchData.batchNumber || batchData.batchNumber.trim().length === 0) {
        throw new ProductError('Batch number is required', 'INVALID_BATCH_NUMBER', 400);
      }

      if (batchData.quantity <= 0) {
        throw new ProductError('Quantity must be greater than 0', 'INVALID_QUANTITY', 400);
      }

      if (batchData.remainingQuantity > batchData.quantity) {
        throw new ProductError('Remaining quantity cannot exceed total quantity', 'INVALID_REMAINING_QUANTITY', 400);
      }

      // Check for duplicate batch number within the same variant
      const existingBatch = this.batches.find(
        b => b.variantId === batchData.variantId && b.batchNumber === batchData.batchNumber
      );
      if (existingBatch) {
        throw new ProductError('Batch number already exists for this variant', 'DUPLICATE_BATCH_NUMBER', 409);
      }

      const now = new Date().toISOString();
      const newBatch: Batch = {
        ...batchData,
        id: `batch_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };

      // Set initial status based on expiration date
      if (batchData.expirationDate) {
        const expirationDate = new Date(batchData.expirationDate);
        const today = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration < 0) {
          newBatch.status = BatchStatus.EXPIRED;
        } else if (daysUntilExpiration <= 30) {
          newBatch.status = BatchStatus.EXPIRING_SOON;
        }
      }

      this.batches.push(newBatch);
      return newBatch;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to create batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_BATCH_ERROR',
        500
      );
    }
  }

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch> {
    try {
      const batchIndex = this.batches.findIndex(b => b.id === id);
      if (batchIndex === -1) {
        throw new ProductError('Batch not found', 'BATCH_NOT_FOUND', 404);
      }

      const existingBatch = this.batches[batchIndex];
      
      // Validate updates
      if (updates.quantity !== undefined && updates.quantity <= 0) {
        throw new ProductError('Quantity must be greater than 0', 'INVALID_QUANTITY', 400);
      }

      if (updates.remainingQuantity !== undefined) {
        const quantity = updates.quantity || existingBatch.quantity;
        if (updates.remainingQuantity > quantity) {
          throw new ProductError('Remaining quantity cannot exceed total quantity', 'INVALID_REMAINING_QUANTITY', 400);
        }
      }

      const updatedBatch: Batch = {
        ...existingBatch,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Recalculate status if expiration date changed
      if (updates.expirationDate) {
        const expirationDate = new Date(updates.expirationDate);
        const today = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration < 0) {
          updatedBatch.status = BatchStatus.EXPIRED;
        } else if (daysUntilExpiration <= 30) {
          updatedBatch.status = BatchStatus.EXPIRING_SOON;
        } else {
          updatedBatch.status = BatchStatus.ACTIVE;
        }
      }

      this.batches[batchIndex] = updatedBatch;
      return updatedBatch;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to update batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_BATCH_ERROR',
        500
      );
    }
  }

  async deleteBatch(id: string): Promise<void> {
    try {
      const batchIndex = this.batches.findIndex(b => b.id === id);
      if (batchIndex === -1) {
        throw new ProductError('Batch not found', 'BATCH_NOT_FOUND', 404);
      }

      const batch = this.batches[batchIndex];
      if (batch.remainingQuantity > 0) {
        throw new ProductError('Cannot delete batch with remaining quantity', 'BATCH_HAS_QUANTITY', 400);
      }

      this.batches.splice(batchIndex, 1);
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to delete batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_BATCH_ERROR',
        500
      );
    }
  }

  async consumeBatch(id: string, quantity: number): Promise<Batch> {
    try {
      if (quantity <= 0) {
        throw new ProductError('Consumption quantity must be greater than 0', 'INVALID_CONSUMPTION_QUANTITY', 400);
      }

      const batchIndex = this.batches.findIndex(b => b.id === id);
      if (batchIndex === -1) {
        throw new ProductError('Batch not found', 'BATCH_NOT_FOUND', 404);
      }

      const batch = this.batches[batchIndex];
      if (batch.remainingQuantity < quantity) {
        throw new ProductError('Insufficient batch quantity', 'INSUFFICIENT_QUANTITY', 400);
      }

      const updatedBatch: Batch = {
        ...batch,
        remainingQuantity: batch.remainingQuantity - quantity,
        updatedAt: new Date().toISOString()
      };

      // Update status if depleted
      if (updatedBatch.remainingQuantity === 0) {
        updatedBatch.status = BatchStatus.DEPLETED;
      }

      this.batches[batchIndex] = updatedBatch;
      return updatedBatch;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to consume batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONSUME_BATCH_ERROR',
        500
      );
    }
  }

  async getExpiringBatches(daysThreshold: number = 30): Promise<Batch[]> {
    try {
      const today = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(today.getDate() + daysThreshold);

      return this.batches.filter(batch => {
        if (!batch.expirationDate || batch.status === BatchStatus.EXPIRED || batch.status === BatchStatus.DEPLETED) {
          return false;
        }

        const expirationDate = new Date(batch.expirationDate);
        return expirationDate <= thresholdDate && expirationDate > today;
      });
    } catch (error) {
      throw new ProductError(
        `Failed to fetch expiring batches: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_EXPIRING_BATCHES_ERROR',
        500
      );
    }
  }

  async getExpiredBatches(): Promise<Batch[]> {
    try {
      const today = new Date();
      return this.batches.filter(batch => {
        if (!batch.expirationDate) return false;
        const expirationDate = new Date(batch.expirationDate);
        return expirationDate <= today && batch.status !== BatchStatus.DEPLETED;
      });
    } catch (error) {
      throw new ProductError(
        `Failed to fetch expired batches: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_EXPIRED_BATCHES_ERROR',
        500
      );
    }
  }

  async getBatchAlerts(): Promise<ReorderAlert[]> {
    try {
      const alerts: ReorderAlert[] = [];
      const today = new Date().toISOString();

      // Check for expired batches
      const expiredBatches = await this.getExpiredBatches();
      expiredBatches.forEach(batch => {
        alerts.push({
          id: `alert_${Date.now()}_${batch.id}`,
          variantId: batch.variantId,
          ruleId: 'batch-expiration',
          alertType: ReorderAlertType.BATCH_EXPIRED,
          severity: AlertSeverity.CRITICAL,
          message: `Batch ${batch.batchNumber} has expired on ${new Date(batch.expirationDate!).toLocaleDateString()}`,
          isRead: false,
          createdAt: today
        });
      });

      // Check for expiring batches
      const expiringBatches = await this.getExpiringBatches(30);
      expiringBatches.forEach(batch => {
        if (batch.expirationDate) {
          const daysUntilExpiration = Math.ceil(
            (new Date(batch.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          alerts.push({
            id: `alert_${Date.now()}_${batch.id}`,
            variantId: batch.variantId,
            ruleId: 'batch-expiration',
            alertType: ReorderAlertType.BATCH_EXPIRING,
            severity: daysUntilExpiration <= 7 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
            message: `Batch ${batch.batchNumber} expires in ${daysUntilExpiration} days`,
            isRead: false,
            createdAt: today
          });
        }
      });

      return alerts;
    } catch (error) {
      throw new ProductError(
        `Failed to fetch batch alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_BATCH_ALERTS_ERROR',
        500
      );
    }
  }

  async transferBatch(id: string, newLocation: string, quantity?: number): Promise<Batch> {
    try {
      const batchIndex = this.batches.findIndex(b => b.id === id);
      if (batchIndex === -1) {
        throw new ProductError('Batch not found', 'BATCH_NOT_FOUND', 404);
      }

      const batch = this.batches[batchIndex];

      if (quantity && quantity > batch.remainingQuantity) {
        throw new ProductError('Transfer quantity exceeds remaining quantity', 'INVALID_TRANSFER_QUANTITY', 400);
      }

      // If partial transfer, create new batch for transferred quantity
      if (quantity && quantity < batch.remainingQuantity) {
        const transferredQuantity = quantity;
        const remainingQuantity = batch.remainingQuantity - transferredQuantity;

        // Update original batch
        const updatedBatch: Batch = {
          ...batch,
          remainingQuantity,
          updatedAt: new Date().toISOString()
        };

        // Create new batch for transferred quantity
        const newBatch: Batch = {
          ...batch,
          id: `batch_${Date.now()}`,
          batchNumber: `${batch.batchNumber}-TRANSFER`,
          quantity: transferredQuantity,
          remainingQuantity: transferredQuantity,
          location: newLocation,
          notes: `Transferred from ${batch.location || 'Unknown location'}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.batches[batchIndex] = updatedBatch;
        this.batches.push(newBatch);

        return newBatch;
      } else {
        // Full transfer
        const updatedBatch: Batch = {
          ...batch,
          location: newLocation,
          updatedAt: new Date().toISOString()
        };

        this.batches[batchIndex] = updatedBatch;
        return updatedBatch;
      }
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to transfer batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRANSFER_BATCH_ERROR',
        500
      );
    }
  }

  async adjustBatchQuantity(id: string, newQuantity: number, reason: string): Promise<Batch> {
    try {
      if (newQuantity < 0) {
        throw new ProductError('Quantity cannot be negative', 'INVALID_QUANTITY', 400);
      }

      const batchIndex = this.batches.findIndex(b => b.id === id);
      if (batchIndex === -1) {
        throw new ProductError('Batch not found', 'BATCH_NOT_FOUND', 404);
      }

      const batch = this.batches[batchIndex];
      
      const updatedBatch: Batch = {
        ...batch,
        remainingQuantity: newQuantity,
        notes: `${batch.notes || ''}\n[${new Date().toLocaleDateString()}] Quantity adjusted: ${batch.remainingQuantity} → ${newQuantity}. Reason: ${reason}`,
        updatedAt: new Date().toISOString()
      };

      // Update status if depleted
      if (newQuantity === 0) {
        updatedBatch.status = BatchStatus.DEPLETED;
      } else if (batch.status === BatchStatus.DEPLETED && newQuantity > 0) {
        updatedBatch.status = BatchStatus.ACTIVE;
      }

      this.batches[batchIndex] = updatedBatch;
      return updatedBatch;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to adjust batch quantity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADJUST_QUANTITY_ERROR',
        500
      );
    }
  }
}

// Export singleton instance
export const batchService = new BatchServiceImpl();
