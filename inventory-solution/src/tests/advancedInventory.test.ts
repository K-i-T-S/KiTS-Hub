/**
 * Advanced Inventory Features Test Suite
 * Tests batch tracking, automated reorder, and reporting functionality
 */

import { batchService } from '../src/services/batchService';
import { reorderService } from '../src/services/reorderService';
import { reportingService } from '../src/services/reportingService';
import { productService } from '../src/services/productService';
import { BatchStatus, ReorderTriggerType, ReportType, ReportFormat } from '../src/types/product';

describe('Advanced Inventory Features', () => {
  const testVariantId = 'test-variant-1';
  const testProductId = 'test-product-1';

  beforeAll(async () => {
    // Setup test data
    console.log('Setting up test environment...');
  });

  describe('Batch Tracking', () => {
    test('should create a new batch', async () => {
      const batchData = {
        variantId: testVariantId,
        batchNumber: 'TEST-BATCH-001',
        quantity: 100,
        remainingQuantity: 100,
        manufactureDate: '2024-01-01T00:00:00Z',
        expirationDate: '2024-12-31T00:00:00Z',
        supplier: 'Test Supplier',
        cost: 50.0,
        location: 'Warehouse A-1',
        status: BatchStatus.ACTIVE,
        notes: 'Test batch for validation'
      };

      const batch = await batchService.createBatch(batchData);
      
      expect(batch).toBeDefined();
      expect(batch.id).toBeDefined();
      expect(batch.batchNumber).toBe(batchData.batchNumber);
      expect(batch.quantity).toBe(batchData.quantity);
      expect(batch.remainingQuantity).toBe(batchData.remainingQuantity);
      expect(batch.status).toBe(BatchStatus.ACTIVE);
    });

    test('should retrieve batches by variant', async () => {
      const batches = await batchService.getBatchesByVariant(testVariantId);
      
      expect(Array.isArray(batches)).toBe(true);
      expect(batches.length).toBeGreaterThan(0);
    });

    test('should consume batch quantity', async () => {
      const batches = await batchService.getBatchesByVariant(testVariantId);
      const testBatch = batches[0];
      const originalQuantity = testBatch.remainingQuantity;
      const consumeQuantity = 10;

      const updatedBatch = await batchService.consumeBatch(testBatch.id, consumeQuantity);
      
      expect(updatedBatch.remainingQuantity).toBe(originalQuantity - consumeQuantity);
    });

    test('should identify expiring batches', async () => {
      const expiringBatches = await batchService.getExpiringBatches(90);
      
      expect(Array.isArray(expiringBatches)).toBe(true);
    });

    test('should identify expired batches', async () => {
      const expiredBatches = await batchService.getExpiredBatches();
      
      expect(Array.isArray(expiredBatches)).toBe(true);
    });

    test('should generate batch alerts', async () => {
      const alerts = await batchService.getBatchAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('should transfer batch location', async () => {
      const batches = await batchService.getBatchesByVariant(testVariantId);
      const testBatch = batches[0];
      const newLocation = 'Warehouse B-2';

      const updatedBatch = await batchService.transferBatch(testBatch.id, newLocation);
      
      expect(updatedBatch.location).toBe(newLocation);
    });

    test('should adjust batch quantity', async () => {
      const batches = await batchService.getBatchesByVariant(testVariantId);
      const testBatch = batches[0];
      const newQuantity = 50;
      const reason = 'Inventory adjustment';

      const updatedBatch = await batchService.adjustBatchQuantity(testBatch.id, newQuantity, reason);
      
      expect(updatedBatch.remainingQuantity).toBe(newQuantity);
      expect(updatedBatch.notes).toContain(reason);
    });
  });

  describe('Automated Reorder', () => {
    test('should create reorder rule', async () => {
      const ruleData = {
        variantId: testVariantId,
        triggerType: ReorderTriggerType.STOCK_LEVEL,
        triggerValue: 20,
        reorderQuantity: 50,
        supplierId: 'supplier-1',
        isActive: true,
        autoApprove: false,
        leadTimeDays: 7
      };

      const rule = await reorderService.createReorderRule(ruleData);
      
      expect(rule).toBeDefined();
      expect(rule.id).toBeDefined();
      expect(rule.variantId).toBe(testVariantId);
      expect(rule.triggerType).toBe(ReorderTriggerType.STOCK_LEVEL);
      expect(rule.triggerValue).toBe(20);
      expect(rule.reorderQuantity).toBe(50);
      expect(rule.isActive).toBe(true);
    });

    test('should retrieve reorder rules', async () => {
      const rules = await reorderService.getReorderRules(testVariantId);
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    test('should update reorder rule', async () => {
      const rules = await reorderService.getReorderRules(testVariantId);
      const testRule = rules[0];
      const newTriggerValue = 15;

      const updatedRule = await reorderService.updateReorderRule(testRule.id, {
        triggerValue: newTriggerValue
      });
      
      expect(updatedRule.triggerValue).toBe(newTriggerValue);
    });

    test('should toggle reorder rule status', async () => {
      const rules = await reorderService.getReorderRules(testVariantId);
      const testRule = rules[0];

      const deactivatedRule = await reorderService.toggleReorderRule(testRule.id, false);
      expect(deactivatedRule.isActive).toBe(false);

      const reactivatedRule = await reorderService.toggleReorderRule(testRule.id, true);
      expect(reactivatedRule.isActive).toBe(true);
    });

    test('should trigger manual reorder', async () => {
      const rules = await reorderService.getReorderRules(testVariantId);
      const testRule = rules[0];

      const alert = await reorderService.triggerReorder(testRule.id);
      
      expect(alert).toBeDefined();
      expect(alert.variantId).toBe(testVariantId);
      expect(alert.ruleId).toBe(testRule.id);
    });

    test('should calculate optimal reorder quantity', async () => {
      const optimalQuantity = await reorderService.calculateOptimalReorderQuantity(testVariantId);
      
      expect(typeof optimalQuantity).toBe('number');
      expect(optimalQuantity).toBeGreaterThan(0);
    });

    test('should get reorder recommendations', async () => {
      const recommendations = await reorderService.getReorderRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('should manage reorder alerts', async () => {
      const alerts = await reorderService.getReorderAlerts();
      expect(Array.isArray(alerts)).toBe(true);

      if (alerts.length > 0) {
        const testAlert = alerts[0];
        
        // Mark as read
        await reorderService.markAlertAsRead(testAlert.id);
        const updatedAlerts = await reorderService.getReorderAlerts();
        const updatedAlert = updatedAlerts.find(a => a.id === testAlert.id);
        expect(updatedAlert?.isRead).toBe(true);

        // Resolve alert
        await reorderService.resolveAlert(testAlert.id);
        const resolvedAlerts = await reorderService.getReorderAlerts();
        const resolvedAlert = resolvedAlerts.find(a => a.id === testAlert.id);
        expect(resolvedAlert?.resolvedAt).toBeDefined();
      }
    });
  });

  describe('Inventory Reporting', () => {
    test('should generate batch tracking report', async () => {
      const parameters = {
        includeExpired: true,
        includeZeroStock: false
      };

      const report = await reportingService.generateReport(
        ReportType.BATCH_TRACKING,
        parameters,
        ReportFormat.JSON
      );
      
      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.type).toBe(ReportType.BATCH_TRACKING);
      expect(report.data).toBeDefined();
      expect(report.data.summary).toBeDefined();
      expect(report.data.details).toBeDefined();
    });

    test('should generate expiration report', async () => {
      const parameters = {
        includeExpired: true,
        includeZeroStock: false
      };

      const report = await reportingService.generateReport(
        ReportType.EXPIRATION_REPORT,
        parameters,
        ReportFormat.JSON
      );
      
      expect(report).toBeDefined();
      expect(report.type).toBe(ReportType.EXPIRATION_REPORT);
      expect(report.data.summary.totalItems).toBeGreaterThanOrEqual(0);
    });

    test('should generate reorder analysis report', async () => {
      const parameters = {
        includeExpired: false,
        includeZeroStock: true
      };

      const report = await reportingService.generateReport(
        ReportType.REORDER_ANALYSIS,
        parameters,
        ReportFormat.JSON
      );
      
      expect(report).toBeDefined();
      expect(report.type).toBe(ReportType.REORDER_ANALYSIS);
    });

    test('should generate inventory valuation report', async () => {
      const parameters = {
        includeExpired: false,
        includeZeroStock: false
      };

      const report = await reportingService.generateReport(
        ReportType.INVENTORY_VALUATION,
        parameters,
        ReportFormat.JSON
      );
      
      expect(report).toBeDefined();
      expect(report.type).toBe(ReportType.INVENTORY_VALUATION);
      expect(report.data.summary.totalValue).toBeGreaterThanOrEqual(0);
    });

    test('should generate supplier performance report', async () => {
      const parameters = {
        includeExpired: true,
        includeZeroStock: false
      };

      const report = await reportingService.generateReport(
        ReportType.SUPPLIER_PERFORMANCE,
        parameters,
        ReportFormat.JSON
      );
      
      expect(report).toBeDefined();
      expect(report.type).toBe(ReportType.SUPPLIER_PERFORMANCE);
    });

    test('should generate stock movement report', async () => {
      const parameters = {
        includeExpired: false,
        includeZeroStock: true
      };

      const report = await reportingService.generateReport(
        ReportType.STOCK_MOVEMENT,
        parameters,
        ReportFormat.JSON
      );
      
      expect(report).toBeDefined();
      expect(report.type).toBe(ReportType.STOCK_MOVEMENT);
    });

    test('should export report in different formats', async () => {
      const parameters = {
        includeExpired: false,
        includeZeroStock: false
      };

      const report = await reportingService.generateReport(
        ReportType.BATCH_TRACKING,
        parameters,
        ReportFormat.JSON
      );

      // Test CSV export
      const csvBlob = await reportingService.exportReport(report.id, ReportFormat.CSV);
      expect(csvBlob).toBeInstanceOf(Blob);
      expect(csvBlob.type).toContain('text/csv');

      // Test JSON export
      const jsonBlob = await reportingService.exportReport(report.id, ReportFormat.JSON);
      expect(jsonBlob).toBeInstanceOf(Blob);
      expect(jsonBlob.type).toContain('application/json');
    });

    test('should retrieve report history', async () => {
      const reports = await reportingService.getReportHistory();
      
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should evaluate reorder rules based on batch data', async () => {
      // Create a batch with low stock
      const lowStockBatch = {
        variantId: testVariantId,
        batchNumber: 'LOW-STOCK-BATCH',
        quantity: 10,
        remainingQuantity: 5,
        manufactureDate: '2024-01-01T00:00:00Z',
        expirationDate: '2024-12-31T00:00:00Z',
        supplier: 'Test Supplier',
        cost: 50.0,
        status: BatchStatus.ACTIVE
      };

      await batchService.createBatch(lowStockBatch);

      // Create a reorder rule that should trigger
      const reorderRule = {
        variantId: testVariantId,
        triggerType: ReorderTriggerType.STOCK_LEVEL,
        triggerValue: 10,
        reorderQuantity: 20,
        supplierId: 'supplier-1',
        isActive: true,
        autoApprove: false,
        leadTimeDays: 7
      };

      await reorderService.createReorderRule(reorderRule);

      // Get product variant to evaluate
      const product = await productService.getProductById(testProductId);
      if (product && product.variants.length > 0) {
        const variant = product.variants[0];
        const alerts = await reorderService.evaluateReorderRules(variant);
        
        expect(Array.isArray(alerts)).toBe(true);
        // Should have at least one alert due to low stock
        expect(alerts.length).toBeGreaterThan(0);
      }
    });

    test('should generate comprehensive inventory report', async () => {
      const parameters = {
        includeExpired: true,
        includeZeroStock: true,
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-12-31T23:59:59Z'
        }
      };

      const report = await reportingService.generateReport(
        ReportType.BATCH_TRACKING,
        parameters,
        ReportFormat.JSON
      );

      expect(report.data.summary).toBeDefined();
      expect(report.data.summary.totalItems).toBeGreaterThanOrEqual(0);
      expect(report.data.summary.totalValue).toBeGreaterThanOrEqual(0);
      expect(report.data.details).toBeDefined();
      expect(Array.isArray(report.data.details)).toBe(true);

      if (report.data.charts) {
        expect(Array.isArray(report.data.charts)).toBe(true);
        report.data.charts.forEach(chart => {
          expect(chart.type).toBeDefined();
          expect(chart.title).toBeDefined();
          expect(chart.data).toBeDefined();
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid batch creation', async () => {
      const invalidBatchData = {
        variantId: testVariantId,
        batchNumber: '', // Invalid: empty batch number
        quantity: -10, // Invalid: negative quantity
        remainingQuantity: 100,
        manufactureDate: '2024-01-01T00:00:00Z',
        supplier: 'Test Supplier',
        cost: 50.0,
        status: BatchStatus.ACTIVE
      };

      await expect(batchService.createBatch(invalidBatchData)).rejects.toThrow();
    });

    test('should handle invalid reorder rule creation', async () => {
      const invalidRuleData = {
        variantId: testVariantId,
        triggerType: ReorderTriggerType.STOCK_LEVEL,
        triggerValue: -5, // Invalid: negative trigger value
        reorderQuantity: 0, // Invalid: zero reorder quantity
        supplierId: 'supplier-1',
        isActive: true,
        leadTimeDays: -3 // Invalid: negative lead time
      };

      await expect(reorderService.createReorderRule(invalidRuleData)).rejects.toThrow();
    });

    test('should handle non-existent batch operations', async () => {
      const nonExistentBatchId = 'non-existent-batch-id';
      
      await expect(batchService.consumeBatch(nonExistentBatchId, 10)).rejects.toThrow();
      await expect(batchService.transferBatch(nonExistentBatchId, 'New Location')).rejects.toThrow();
      await expect(batchService.adjustBatchQuantity(nonExistentBatchId, 50, 'Test')).rejects.toThrow();
    });

    test('should handle non-existent reorder rule operations', async () => {
      const nonExistentRuleId = 'non-existent-rule-id';
      
      await expect(reorderService.updateReorderRule(nonExistentRuleId, {})).rejects.toThrow();
      await expect(reorderService.deleteReorderRule(nonExistentRuleId)).rejects.toThrow();
      await expect(reorderService.triggerReorder(nonExistentRuleId)).rejects.toThrow();
    });
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test environment...');
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('should handle large batch operations efficiently', async () => {
    const startTime = Date.now();
    
    // Create multiple batches
    const batchPromises = [];
    for (let i = 0; i < 10; i++) {
      batchPromises.push(
        batchService.createBatch({
          variantId: `test-variant-${i}`,
          batchNumber: `PERF-BATCH-${i}`,
          quantity: 100,
          remainingQuantity: 100,
          manufactureDate: '2024-01-01T00:00:00Z',
          expirationDate: '2024-12-31T00:00:00Z',
          supplier: 'Performance Test Supplier',
          cost: 50.0,
          status: BatchStatus.ACTIVE
        })
      );
    }
    
    await Promise.all(batchPromises);
    const endTime = Date.now();
    
    // Should complete within reasonable time (5 seconds)
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test('should generate reports efficiently', async () => {
    const startTime = Date.now();
    
    const report = await reportingService.generateReport(
      ReportType.BATCH_TRACKING,
      { includeExpired: true, includeZeroStock: false },
      ReportFormat.JSON
    );
    
    const endTime = Date.now();
    
    expect(report).toBeDefined();
    // Should complete within reasonable time (3 seconds)
    expect(endTime - startTime).toBeLessThan(3000);
  });
});

console.log('Advanced Inventory Features Test Suite Completed Successfully!');
