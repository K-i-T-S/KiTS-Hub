/**
 * Automated Reorder Service
 * Manages reorder rules, alerts, and automated inventory replenishment
 */

import type {
  ReorderRule,
  ReorderAlert,
  ProductVariant,
  Batch
} from '../types/product';
import {
  ReorderTriggerType,
  ReorderAlertType,
  AlertSeverity,
  BatchStatus
} from '../types/product';
import { ProductError } from '../types/product';
import { batchService } from './batchService';

// Mock data for demonstration
const mockReorderRules: ReorderRule[] = [
  {
    id: 'rule-1',
    variantId: '1-1',
    triggerType: ReorderTriggerType.STOCK_LEVEL,
    triggerValue: 10,
    reorderQuantity: 50,
    supplierId: '1',
    isActive: true,
    autoApprove: false,
    minOrderQuantity: 10,
    maxOrderQuantity: 200,
    leadTimeDays: 7,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockReorderAlerts: ReorderAlert[] = [];

export interface ReorderService {
  getReorderRules(variantId?: string): Promise<ReorderRule[]>;
  createReorderRule(rule: Omit<ReorderRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReorderRule>;
  updateReorderRule(id: string, updates: Partial<ReorderRule>): Promise<ReorderRule>;
  deleteReorderRule(id: string): Promise<void>;
  toggleReorderRule(id: string, isActive: boolean): Promise<ReorderRule>;
  
  getReorderAlerts(variantId?: string, unreadOnly?: boolean): Promise<ReorderAlert[]>;
  markAlertAsRead(alertId: string): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  
  evaluateReorderRules(variant: ProductVariant): Promise<ReorderAlert[]>;
  triggerReorder(ruleId: string): Promise<ReorderAlert>;
  calculateOptimalReorderQuantity(variantId: string): Promise<number>;
  getReorderRecommendations(): Promise<ReorderAlert[]>;
}

export class ReorderServiceImpl implements ReorderService {
  private rules: ReorderRule[] = [...mockReorderRules];
  private alerts: ReorderAlert[] = [...mockReorderAlerts];

  async getReorderRules(variantId?: string): Promise<ReorderRule[]> {
    try {
      if (variantId) {
        return this.rules.filter(rule => rule.variantId === variantId);
      }
      return this.rules;
    } catch (error) {
      throw new ProductError(
        `Failed to fetch reorder rules: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_REORDER_RULES_ERROR',
        500
      );
    }
  }

  async createReorderRule(ruleData: Omit<ReorderRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReorderRule> {
    try {
      // Validate rule data
      if (ruleData.triggerValue <= 0) {
        throw new ProductError('Trigger value must be greater than 0', 'INVALID_TRIGGER_VALUE', 400);
      }

      if (ruleData.reorderQuantity <= 0) {
        throw new ProductError('Reorder quantity must be greater than 0', 'INVALID_REORDER_QUANTITY', 400);
      }

      if (ruleData.leadTimeDays <= 0) {
        throw new ProductError('Lead time must be greater than 0', 'INVALID_LEAD_TIME', 400);
      }

      if (ruleData.minOrderQuantity && ruleData.minOrderQuantity > ruleData.reorderQuantity) {
        throw new ProductError('Minimum order quantity cannot exceed reorder quantity', 'INVALID_MIN_ORDER', 400);
      }

      if (ruleData.maxOrderQuantity && ruleData.maxOrderQuantity < ruleData.reorderQuantity) {
        throw new ProductError('Maximum order quantity cannot be less than reorder quantity', 'INVALID_MAX_ORDER', 400);
      }

      const now = new Date().toISOString();
      const newRule: ReorderRule = {
        ...ruleData,
        id: `rule_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };

      this.rules.push(newRule);
      return newRule;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to create reorder rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_REORDER_RULE_ERROR',
        500
      );
    }
  }

  async updateReorderRule(id: string, updates: Partial<ReorderRule>): Promise<ReorderRule> {
    try {
      const ruleIndex = this.rules.findIndex(r => r.id === id);
      if (ruleIndex === -1) {
        throw new ProductError('Reorder rule not found', 'RULE_NOT_FOUND', 404);
      }

      const existingRule = this.rules[ruleIndex];
      
      // Validate updates
      if (updates.triggerValue !== undefined && updates.triggerValue <= 0) {
        throw new ProductError('Trigger value must be greater than 0', 'INVALID_TRIGGER_VALUE', 400);
      }

      if (updates.reorderQuantity !== undefined && updates.reorderQuantity <= 0) {
        throw new ProductError('Reorder quantity must be greater than 0', 'INVALID_REORDER_QUANTITY', 400);
      }

      const updatedRule: ReorderRule = {
        ...existingRule,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.rules[ruleIndex] = updatedRule;
      return updatedRule;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to update reorder rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_REORDER_RULE_ERROR',
        500
      );
    }
  }

  async deleteReorderRule(id: string): Promise<void> {
    try {
      const ruleIndex = this.rules.findIndex(r => r.id === id);
      if (ruleIndex === -1) {
        throw new ProductError('Reorder rule not found', 'RULE_NOT_FOUND', 404);
      }

      this.rules.splice(ruleIndex, 1);
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to delete reorder rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_REORDER_RULE_ERROR',
        500
      );
    }
  }

  async toggleReorderRule(id: string, isActive: boolean): Promise<ReorderRule> {
    return this.updateReorderRule(id, { isActive });
  }

  async getReorderAlerts(variantId?: string, unreadOnly?: boolean): Promise<ReorderAlert[]> {
    try {
      let alerts = this.alerts;

      if (variantId) {
        alerts = alerts.filter(alert => alert.variantId === variantId);
      }

      if (unreadOnly) {
        alerts = alerts.filter(alert => !alert.isRead);
      }

      return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      throw new ProductError(
        `Failed to fetch reorder alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_REORDER_ALERTS_ERROR',
        500
      );
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const alertIndex = this.alerts.findIndex(a => a.id === alertId);
      if (alertIndex === -1) {
        throw new ProductError('Alert not found', 'ALERT_NOT_FOUND', 404);
      }

      this.alerts[alertIndex].isRead = true;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to mark alert as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MARK_ALERT_READ_ERROR',
        500
      );
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const alertIndex = this.alerts.findIndex(a => a.id === alertId);
      if (alertIndex === -1) {
        throw new ProductError('Alert not found', 'ALERT_NOT_FOUND', 404);
      }

      this.alerts[alertIndex].resolvedAt = new Date().toISOString();
      this.alerts[alertIndex].isRead = true;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to resolve alert: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESOLVE_ALERT_ERROR',
        500
      );
    }
  }

  async evaluateReorderRules(variant: ProductVariant): Promise<ReorderAlert[]> {
    try {
      const alerts: ReorderAlert[] = [];
      const variantRules = this.rules.filter(rule => rule.variantId === variant.id && rule.isActive);

      for (const rule of variantRules) {
        let shouldTrigger = false;
        let alertType: ReorderAlertType = ReorderAlertType.LOW_STOCK;
        let severity: AlertSeverity = AlertSeverity.MEDIUM;
        let message = 'Reorder condition met';

        switch (rule.triggerType) {
          case ReorderTriggerType.STOCK_LEVEL:
            const currentStock = variant.stock;
            if (currentStock <= rule.triggerValue) {
              shouldTrigger = true;
              alertType = currentStock === 0 ? ReorderAlertType.OUT_OF_STOCK : ReorderAlertType.LOW_STOCK;
              severity = currentStock === 0 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
              message = `Stock level (${currentStock}) is at or below trigger value (${rule.triggerValue})`;
            }
            break;

          case ReorderTriggerType.BATCH_EXPIRATION:
            const batches = await batchService.getBatchesByVariant(variant.id);
            const expiringBatches = batches.filter(batch => {
              if (!batch.expirationDate || batch.status === BatchStatus.DEPLETED) return false;
              const daysUntilExpiration = Math.ceil(
                (new Date(batch.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysUntilExpiration <= rule.triggerValue;
            });

            if (expiringBatches.length > 0) {
              shouldTrigger = true;
              alertType = ReorderAlertType.BATCH_EXPIRING;
              severity = AlertSeverity.MEDIUM;
              message = `${expiringBatches.length} batch(es) expiring within ${rule.triggerValue} days`;
            }
            break;

          case ReorderTriggerType.DEMAND_FORECAST:
            // Simplified demand forecast - in real implementation, would use historical data
            const forecastedDemand = Math.floor(variant.stock * 0.3); // Mock 30% increase in demand
            if (variant.stock < forecastedDemand) {
              shouldTrigger = true;
              alertType = ReorderAlertType.REORDER_SUGGESTED;
              severity = AlertSeverity.MEDIUM;
              message = `Forecasted demand (${forecastedDemand}) exceeds current stock (${variant.stock})`;
            }
            break;
        }

        if (shouldTrigger) {
          const alert: ReorderAlert = {
            id: `alert_${Date.now()}_${rule.id}`,
            variantId: variant.id,
            ruleId: rule.id,
            alertType,
            severity,
            message: `${message}. Suggested reorder quantity: ${rule.reorderQuantity}`,
            isRead: false,
            createdAt: new Date().toISOString()
          };

          alerts.push(alert);
          this.alerts.push(alert);

          // Update rule's last triggered timestamp
          await this.updateReorderRule(rule.id, { lastTriggered: alert.createdAt });
        }
      }

      return alerts;
    } catch (error) {
      throw new ProductError(
        `Failed to evaluate reorder rules: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EVALUATE_RULES_ERROR',
        500
      );
    }
  }

  async triggerReorder(ruleId: string): Promise<ReorderAlert> {
    try {
      const rule = this.rules.find(r => r.id === ruleId);
      if (!rule) {
        throw new ProductError('Reorder rule not found', 'RULE_NOT_FOUND', 404);
      }

      if (!rule.isActive) {
        throw new ProductError('Cannot trigger inactive reorder rule', 'RULE_INACTIVE', 400);
      }

      const alert: ReorderAlert = {
        id: `alert_${Date.now()}_${ruleId}`,
        variantId: rule.variantId,
        ruleId,
        alertType: ReorderAlertType.REORDER_SUGGESTED,
        severity: AlertSeverity.MEDIUM,
        message: `Manual reorder triggered. Quantity: ${rule.reorderQuantity}, Lead time: ${rule.leadTimeDays} days`,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      this.alerts.push(alert);
      await this.updateReorderRule(ruleId, { lastTriggered: alert.createdAt });

      return alert;
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to trigger reorder: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRIGGER_REORDER_ERROR',
        500
      );
    }
  }

  async calculateOptimalReorderQuantity(variantId: string): Promise<number> {
    try {
      // This is a simplified calculation - in production, would use:
      // - Historical sales data
      // - Seasonal trends
      // - Supplier lead times
      // - Storage costs
      // - Demand forecasting algorithms

      const batches = await batchService.getBatchesByVariant(variantId);
      const totalStock = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
      
      // Simple formula: Average monthly usage * lead time buffer + safety stock
      const averageMonthlyUsage = Math.max(20, totalStock * 0.3); // Mock calculation
      const safetyStock = 10; // Fixed safety stock
      
      const optimalQuantity = Math.ceil(averageMonthlyUsage + safetyStock);
      
      return Math.max(10, Math.min(200, optimalQuantity)); // Clamp between min and max
    } catch (error) {
      throw new ProductError(
        `Failed to calculate optimal reorder quantity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CALCULATE_OPTIMAL_QUANTITY_ERROR',
        500
      );
    }
  }

  async getReorderRecommendations(): Promise<ReorderAlert[]> {
    try {
      const recommendations: ReorderAlert[] = [];
      
      // Get all active rules
      const activeRules = this.rules.filter(rule => rule.isActive);
      
      for (const rule of activeRules) {
        // Calculate optimal quantity based on current conditions
        const optimalQuantity = await this.calculateOptimalReorderQuantity(rule.variantId);
        
        // If optimal quantity differs significantly from rule quantity, create recommendation
        if (Math.abs(optimalQuantity - rule.reorderQuantity) > rule.reorderQuantity * 0.2) {
          const alert: ReorderAlert = {
            id: `recommendation_${Date.now()}_${rule.id}`,
            variantId: rule.variantId,
            ruleId: rule.id,
            alertType: ReorderAlertType.REORDER_SUGGESTED,
            severity: AlertSeverity.LOW,
            message: `Recommendation: Consider adjusting reorder quantity from ${rule.reorderQuantity} to ${optimalQuantity} based on current demand patterns`,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          
          recommendations.push(alert);
        }
      }
      
      return recommendations;
    } catch (error) {
      throw new ProductError(
        `Failed to get reorder recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_RECOMMENDATIONS_ERROR',
        500
      );
    }
  }
}

// Export singleton instance
export const reorderService = new ReorderServiceImpl();
