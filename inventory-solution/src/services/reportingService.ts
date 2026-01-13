/**
 * Inventory Reporting Service
 * Generates comprehensive inventory reports with analytics and insights
 */

import type {
  InventoryReport,
  ReportParameters,
  ReportData,
  ReportSummary,
  ChartData,
  ProductStats,
  BatchStats,
  ReorderStats,
  Product,
  Batch,
  ReorderRule,
  ReorderAlert
} from '../types/product';
import {
  ReportType,
  ReportFormat,
  BatchStatus,
  AlertSeverity
} from '../types/product';
import { ProductError } from '../types/product';
import { productService } from './productService';
import { batchService } from './batchService';
import { reorderService } from './reorderService';

export interface ReportingService {
  generateReport(type: ReportType, parameters: ReportParameters, format: ReportFormat): Promise<InventoryReport>;
  getBatchTrackingReport(parameters: ReportParameters): Promise<InventoryReport>;
  getExpirationReport(parameters: ReportParameters): Promise<InventoryReport>;
  getReorderAnalysisReport(parameters: ReportParameters): Promise<InventoryReport>;
  getInventoryValuationReport(parameters: ReportParameters): Promise<InventoryReport>;
  getSupplierPerformanceReport(parameters: ReportParameters): Promise<InventoryReport>;
  getStockMovementReport(parameters: ReportParameters): Promise<InventoryReport>;
  exportReport(reportId: string, format: ReportFormat): Promise<Blob>;
  getReportHistory(): Promise<InventoryReport[]>;
}

export class ReportingServiceImpl implements ReportingService {
  private reports: InventoryReport[] = [];

  async generateReport(type: ReportType, parameters: ReportParameters, format: ReportFormat): Promise<InventoryReport> {
    try {
      switch (type) {
        case ReportType.BATCH_TRACKING:
          return this.getBatchTrackingReport(parameters);
        case ReportType.EXPIRATION_REPORT:
          return this.getExpirationReport(parameters);
        case ReportType.REORDER_ANALYSIS:
          return this.getReorderAnalysisReport(parameters);
        case ReportType.INVENTORY_VALUATION:
          return this.getInventoryValuationReport(parameters);
        case ReportType.SUPPLIER_PERFORMANCE:
          return this.getSupplierPerformanceReport(parameters);
        case ReportType.STOCK_MOVEMENT:
          return this.getStockMovementReport(parameters);
        default:
          throw new ProductError('Unsupported report type', 'UNSUPPORTED_REPORT_TYPE', 400);
      }
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATE_REPORT_ERROR',
        500
      );
    }
  }

  async getBatchTrackingReport(parameters: ReportParameters): Promise<InventoryReport> {
    try {
      const productsResponse = await productService.getProducts();
      const allBatches: Batch[] = [];

      // Collect all batches from all variants
      for (const product of productsResponse.products) {
        for (const variant of product.variants) {
          const batches = await batchService.getBatchesByVariant(variant.id);
          allBatches.push(...batches);
        }
      }

      // Filter batches based on parameters
      let filteredBatches = allBatches;
      if (parameters.dateRange) {
        const startDate = new Date(parameters.dateRange.start);
        const endDate = new Date(parameters.dateRange.end);
        filteredBatches = filteredBatches.filter(batch => {
          const batchDate = new Date(batch.manufactureDate);
          return batchDate >= startDate && batchDate <= endDate;
        });
      }

      if (!parameters.includeExpired) {
        filteredBatches = filteredBatches.filter(batch => batch.status !== BatchStatus.EXPIRED);
      }

      // Calculate summary
      const summary: ReportSummary = {
        totalItems: filteredBatches.length,
        totalValue: filteredBatches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.cost), 0),
        criticalAlerts: filteredBatches.filter(b => b.status === BatchStatus.EXPIRED).length,
        warnings: filteredBatches.filter(b => b.status === BatchStatus.EXPIRING_SOON).length,
        generatedAt: new Date().toISOString()
      };

      // Generate charts
      const charts: ChartData[] = [
        {
          type: 'pie',
          title: 'Batch Status Distribution',
          data: [
            { name: 'Active', value: filteredBatches.filter(b => b.status === BatchStatus.ACTIVE).length },
            { name: 'Expiring Soon', value: filteredBatches.filter(b => b.status === BatchStatus.EXPIRING_SOON).length },
            { name: 'Expired', value: filteredBatches.filter(b => b.status === BatchStatus.EXPIRED).length },
            { name: 'Depleted', value: filteredBatches.filter(b => b.status === BatchStatus.DEPLETED).length }
          ]
        },
        {
          type: 'bar',
          title: 'Batch Value by Location',
          data: this.calculateBatchValueByLocation(filteredBatches)
        }
      ];

      const reportData: ReportData = {
        summary,
        details: filteredBatches,
        charts
      };

      const report: InventoryReport = {
        id: `report_${Date.now()}`,
        name: 'Batch Tracking Report',
        type: ReportType.BATCH_TRACKING,
        parameters,
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
        data: reportData,
        format: ReportFormat.JSON
      };

      this.reports.push(report);
      return report;
    } catch (error) {
      throw new ProductError(
        `Failed to generate batch tracking report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BATCH_TRACKING_REPORT_ERROR',
        500
      );
    }
  }

  async getExpirationReport(parameters: ReportParameters): Promise<InventoryReport> {
    try {
      const expiringBatches = await batchService.getExpiringBatches(90);
      const expiredBatches = await batchService.getExpiredBatches();

      const allRelevantBatches = [...expiringBatches, ...expiredBatches];

      // Group by expiration month
      const expirationGroups = this.groupBatchesByExpirationMonth(allRelevantBatches);

      const summary: ReportSummary = {
        totalItems: allRelevantBatches.length,
        totalValue: allRelevantBatches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.cost), 0),
        criticalAlerts: expiredBatches.length,
        warnings: expiringBatches.length,
        generatedAt: new Date().toISOString()
      };

      const charts: ChartData[] = [
        {
          type: 'bar',
          title: 'Expiring Batches by Month',
          data: expirationGroups,
          labels: expirationGroups.map(g => g.month)
        },
        {
          type: 'line',
          title: 'Expiration Trend',
          data: this.calculateExpirationTrend(allRelevantBatches)
        }
      ];

      const reportData: ReportData = {
        summary,
        details: allRelevantBatches.sort((a, b) => {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        }),
        charts
      };

      const report: InventoryReport = {
        id: `report_${Date.now()}`,
        name: 'Expiration Report',
        type: ReportType.EXPIRATION_REPORT,
        parameters,
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
        data: reportData,
        format: ReportFormat.JSON
      };

      this.reports.push(report);
      return report;
    } catch (error) {
      throw new ProductError(
        `Failed to generate expiration report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXPIRATION_REPORT_ERROR',
        500
      );
    }
  }

  async getReorderAnalysisReport(parameters: ReportParameters): Promise<InventoryReport> {
    try {
      const allRules = await reorderService.getReorderRules();
      const allAlerts = await reorderService.getReorderAlerts();
      const activeRules = allRules.filter(rule => rule.isActive);
      const criticalAlerts = allAlerts.filter(alert => alert.severity === AlertSeverity.CRITICAL);

      // Calculate reorder statistics
      const reorderStats: ReorderStats = {
        activeRules: activeRules.length,
        pendingAlerts: allAlerts.filter(a => !a.isRead).length,
        criticalAlerts: criticalAlerts.length,
        avgLeadTime: activeRules.reduce((sum, rule) => sum + rule.leadTimeDays, 0) / activeRules.length || 0,
        monthlyReorders: this.calculateMonthlyReorders(allAlerts)
      };

      const summary: ReportSummary = {
        totalItems: activeRules.length,
        totalValue: criticalAlerts.length * 1000, // Estimated cost of stockouts
        criticalAlerts: criticalAlerts.length,
        warnings: allAlerts.filter(a => a.severity === AlertSeverity.HIGH).length,
        generatedAt: new Date().toISOString()
      };

      const charts: ChartData[] = [
        {
          type: 'pie',
          title: 'Alert Severity Distribution',
          data: [
            { name: 'Critical', value: allAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length },
            { name: 'High', value: allAlerts.filter(a => a.severity === AlertSeverity.HIGH).length },
            { name: 'Medium', value: allAlerts.filter(a => a.severity === AlertSeverity.MEDIUM).length },
            { name: 'Low', value: allAlerts.filter(a => a.severity === AlertSeverity.LOW).length }
          ]
        },
        {
          type: 'bar',
          title: 'Reorder Rules by Trigger Type',
          data: this.groupRulesByTriggerType(activeRules)
        }
      ];

      const reportData: ReportData = {
        summary,
        details: [...activeRules, ...allAlerts],
        charts
      };

      const report: InventoryReport = {
        id: `report_${Date.now()}`,
        name: 'Reorder Analysis Report',
        type: ReportType.REORDER_ANALYSIS,
        parameters,
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
        data: reportData,
        format: ReportFormat.JSON
      };

      this.reports.push(report);
      return report;
    } catch (error) {
      throw new ProductError(
        `Failed to generate reorder analysis report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REORDER_ANALYSIS_REPORT_ERROR',
        500
      );
    }
  }

  async getInventoryValuationReport(parameters: ReportParameters): Promise<InventoryReport> {
    try {
      const productsResponse = await productService.getProducts();
      const allBatches: Batch[] = [];

      // Collect all batches
      for (const product of productsResponse.products) {
        for (const variant of product.variants) {
          const batches = await batchService.getBatchesByVariant(variant.id);
          allBatches.push(...batches);
        }
      }

      // Calculate inventory valuation
      const totalValue = allBatches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.cost), 0);
      const totalCost = allBatches.reduce((sum, batch) => sum + (batch.quantity * batch.cost), 0);
      const totalStock = allBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);

      // Group by category
      const valuationByCategory = await this.calculateValuationByCategory(productsResponse.products, allBatches);

      const summary: ReportSummary = {
        totalItems: allBatches.length,
        totalValue,
        criticalAlerts: allBatches.filter(b => b.status === BatchStatus.EXPIRED).length,
        warnings: allBatches.filter(b => b.status === BatchStatus.EXPIRING_SOON).length,
        generatedAt: new Date().toISOString()
      };

      const charts: ChartData[] = [
        {
          type: 'pie',
          title: 'Inventory Value by Category',
          data: valuationByCategory
        },
        {
          type: 'bar',
          title: 'Top 10 Most Valuable Products',
          data: await this.getTopValuableProducts(productsResponse.products, allBatches)
        }
      ];

      const reportData: ReportData = {
        summary,
        details: allBatches,
        charts
      };

      const report: InventoryReport = {
        id: `report_${Date.now()}`,
        name: 'Inventory Valuation Report',
        type: ReportType.INVENTORY_VALUATION,
        parameters,
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
        data: reportData,
        format: ReportFormat.JSON
      };

      this.reports.push(report);
      return report;
    } catch (error) {
      throw new ProductError(
        `Failed to generate inventory valuation report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INVENTORY_VALUATION_REPORT_ERROR',
        500
      );
    }
  }

  async getSupplierPerformanceReport(parameters: ReportParameters): Promise<InventoryReport> {
    try {
      const productsResponse = await productService.getProducts();
      const allBatches: Batch[] = [];

      // Collect all batches
      for (const product of productsResponse.products) {
        for (const variant of product.variants) {
          const batches = await batchService.getBatchesByVariant(variant.id);
          allBatches.push(...batches);
        }
      }

      // Group by supplier
      const supplierPerformance = this.calculateSupplierPerformance(allBatches);

      const summary: ReportSummary = {
        totalItems: supplierPerformance.length,
        totalValue: allBatches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.cost), 0),
        criticalAlerts: 0, // Would be calculated based on supplier metrics
        warnings: 0,
        generatedAt: new Date().toISOString()
      };

      const charts: ChartData[] = [
        {
          type: 'bar',
          title: 'Supplier Performance Score',
          data: supplierPerformance.map(s => ({ name: s.supplier, value: s.performanceScore }))
        },
        {
          type: 'pie',
          title: 'Inventory Value by Supplier',
          data: supplierPerformance.map(s => ({ name: s.supplier, value: s.totalValue }))
        }
      ];

      const reportData: ReportData = {
        summary,
        details: supplierPerformance,
        charts
      };

      const report: InventoryReport = {
        id: `report_${Date.now()}`,
        name: 'Supplier Performance Report',
        type: ReportType.SUPPLIER_PERFORMANCE,
        parameters,
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
        data: reportData,
        format: ReportFormat.JSON
      };

      this.reports.push(report);
      return report;
    } catch (error) {
      throw new ProductError(
        `Failed to generate supplier performance report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SUPPLIER_PERFORMANCE_REPORT_ERROR',
        500
      );
    }
  }

  async getStockMovementReport(parameters: ReportParameters): Promise<InventoryReport> {
    try {
      // Mock stock movement data - in real implementation would track historical movements
      const stockMovements = this.generateMockStockMovements(parameters);

      const summary: ReportSummary = {
        totalItems: stockMovements.length,
        totalValue: stockMovements.reduce((sum, movement) => sum + movement.value, 0),
        criticalAlerts: 0,
        warnings: 0,
        generatedAt: new Date().toISOString()
      };

      const charts: ChartData[] = [
        {
          type: 'line',
          title: 'Stock Movement Trend',
          data: this.calculateStockMovementTrend(stockMovements)
        },
        {
          type: 'bar',
          title: 'Movements by Type',
          data: this.groupMovementsByType(stockMovements)
        }
      ];

      const reportData: ReportData = {
        summary,
        details: stockMovements,
        charts
      };

      const report: InventoryReport = {
        id: `report_${Date.now()}`,
        name: 'Stock Movement Report',
        type: ReportType.STOCK_MOVEMENT,
        parameters,
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
        data: reportData,
        format: ReportFormat.JSON
      };

      this.reports.push(report);
      return report;
    } catch (error) {
      throw new ProductError(
        `Failed to generate stock movement report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STOCK_MOVEMENT_REPORT_ERROR',
        500
      );
    }
  }

  async exportReport(reportId: string, format: ReportFormat): Promise<Blob> {
    try {
      const report = this.reports.find(r => r.id === reportId);
      if (!report) {
        throw new ProductError('Report not found', 'REPORT_NOT_FOUND', 404);
      }

      let content: string;
      let mimeType: string;

      switch (format) {
        case ReportFormat.CSV:
          content = this.convertToCSV(report);
          mimeType = 'text/csv';
          break;
        case ReportFormat.JSON:
          content = JSON.stringify(report, null, 2);
          mimeType = 'application/json';
          break;
        case ReportFormat.EXCEL:
          // Mock Excel export - would use a library like xlsx in production
          content = this.convertToCSV(report);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case ReportFormat.PDF:
          // Mock PDF export - would use a library like jsPDF in production
          content = JSON.stringify(report, null, 2);
          mimeType = 'application/pdf';
          break;
        default:
          throw new ProductError('Unsupported export format', 'UNSUPPORTED_FORMAT', 400);
      }

      return new Blob([content], { type: mimeType });
    } catch (error) {
      if (error instanceof ProductError) {
        throw error;
      }
      throw new ProductError(
        `Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXPORT_REPORT_ERROR',
        500
      );
    }
  }

  async getReportHistory(): Promise<InventoryReport[]> {
    try {
      return this.reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    } catch (error) {
      throw new ProductError(
        `Failed to fetch report history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FETCH_REPORT_HISTORY_ERROR',
        500
      );
    }
  }

  // Helper methods
  private calculateBatchValueByLocation(batches: Batch[]): any[] {
    const locationMap = new Map<string, number>();
    
    batches.forEach(batch => {
      const location = batch.location || 'Unknown';
      const value = batch.remainingQuantity * batch.cost;
      locationMap.set(location, (locationMap.get(location) || 0) + value);
    });

    return Array.from(locationMap.entries()).map(([location, value]) => ({ name: location, value }));
  }

  private groupBatchesByExpirationMonth(batches: Batch[]): any[] {
    const monthMap = new Map<string, number>();
    
    batches.forEach(batch => {
      if (batch.expirationDate) {
        const month = new Date(batch.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      }
    });

    return Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }));
  }

  private calculateExpirationTrend(batches: Batch[]): any[] {
    // Mock trend data - would use historical data in production
    return [
      { month: 'Jan', expiring: 5 },
      { month: 'Feb', expiring: 8 },
      { month: 'Mar', expiring: 12 },
      { month: 'Apr', expiring: 15 },
      { month: 'May', expiring: 10 },
      { month: 'Jun', expiring: 7 }
    ];
  }

  private calculateMonthlyReorders(alerts: ReorderAlert[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return alerts.filter(alert => {
      const alertDate = new Date(alert.createdAt);
      return alertDate.getMonth() === currentMonth && alertDate.getFullYear() === currentYear;
    }).length;
  }

  private groupRulesByTriggerType(rules: ReorderRule[]): any[] {
    const typeMap = new Map<string, number>();
    
    rules.forEach(rule => {
      typeMap.set(rule.triggerType, (typeMap.get(rule.triggerType) || 0) + 1);
    });

    return Array.from(typeMap.entries()).map(([type, count]) => ({ name: type, count }));
  }

  private async calculateValuationByCategory(products: Product[], batches: Batch[]): Promise<any[]> {
    const categoryMap = new Map<string, number>();
    
    products.forEach(product => {
      const productBatches = batches.filter(batch => {
        return product.variants.some(variant => variant.id === batch.variantId);
      });
      
      const value = productBatches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.cost), 0);
      categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + value);
    });

    return Array.from(categoryMap.entries()).map(([category, value]) => ({ name: category, value }));
  }

  private async getTopValuableProducts(products: Product[], batches: Batch[]): Promise<any[]> {
    const productValues = products.map(product => {
      const productBatches = batches.filter(batch => {
        return product.variants.some(variant => variant.id === batch.variantId);
      });
      
      const value = productBatches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.cost), 0);
      return { name: product.name, value };
    });

    return productValues.sort((a, b) => b.value - a.value).slice(0, 10);
  }

  private calculateSupplierPerformance(batches: Batch[]): any[] {
    const supplierMap = new Map<string, { totalValue: number; batchCount: number; expiredCount: number }>();
    
    batches.forEach(batch => {
      const current = supplierMap.get(batch.supplier) || { totalValue: 0, batchCount: 0, expiredCount: 0 };
      const value = batch.remainingQuantity * batch.cost;
      const isExpired = batch.status === BatchStatus.EXPIRED;
      
      supplierMap.set(batch.supplier, {
        totalValue: current.totalValue + value,
        batchCount: current.batchCount + 1,
        expiredCount: current.expiredCount + (isExpired ? 1 : 0)
      });
    });

    return Array.from(supplierMap.entries()).map(([supplier, stats]) => ({
      supplier,
      totalValue: stats.totalValue,
      batchCount: stats.batchCount,
      expiredCount: stats.expiredCount,
      performanceScore: Math.max(0, 100 - (stats.expiredCount / stats.batchCount * 100))
    }));
  }

  private generateMockStockMovements(parameters: ReportParameters): any[] {
    // Mock stock movement data
    return [
      { date: '2024-01-01', type: 'IN', product: 'Laptop Pro', quantity: 50, value: 60000 },
      { date: '2024-01-05', type: 'OUT', product: 'Laptop Pro', quantity: 10, value: 12000 },
      { date: '2024-01-10', type: 'IN', product: 'Mouse Wireless', quantity: 100, value: 2000 },
      { date: '2024-01-15', type: 'OUT', product: 'Mouse Wireless', quantity: 25, value: 500 }
    ];
  }

  private calculateStockMovementTrend(movements: any[]): any[] {
    // Mock trend calculation
    return [
      { date: '2024-01-01', in: 50, out: 10 },
      { date: '2024-01-02', in: 30, out: 20 },
      { date: '2024-01-03', in: 45, out: 15 },
      { date: '2024-01-04', in: 60, out: 25 },
      { date: '2024-01-05', in: 40, out: 30 }
    ];
  }

  private groupMovementsByType(movements: any[]): any[] {
    const typeMap = new Map<string, number>();
    
    movements.forEach(movement => {
      typeMap.set(movement.type, (typeMap.get(movement.type) || 0) + movement.quantity);
    });

    return Array.from(typeMap.entries()).map(([type, quantity]) => ({ name: type, quantity }));
  }

  private convertToCSV(report: InventoryReport): string {
    const headers = ['Report ID', 'Name', 'Type', 'Generated At', 'Total Items', 'Total Value'];
    const rows = [
      headers.join(','),
      [
        report.id,
        report.name,
        report.type,
        report.generatedAt,
        report.data.summary.totalItems,
        report.data.summary.totalValue
      ].join(',')
    ];

    return rows.join('\n');
  }
}

// Export singleton instance
export const reportingService = new ReportingServiceImpl();
