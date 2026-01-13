/**
 * Inventory Reports Component
 * Interface for generating and viewing inventory reports
 */

import React, { useState, useEffect } from 'react';
import type { InventoryReport, ReportType, ReportFormat, ReportParameters } from '../../types/product';
import { ReportType as ReportTypeEnum, ReportFormat as ReportFormatEnum } from '../../types/product';
import { reportingService } from '../../services/reportingService';

interface InventoryReportsProps {
  onReportGenerated?: (report: InventoryReport) => void;
}

export const InventoryReports: React.FC<InventoryReportsProps> = ({
  onReportGenerated
}) => {
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InventoryReport | null>(null);

  // Form state
  const [reportType, setReportType] = useState<ReportType>(ReportTypeEnum.BATCH_TRACKING);
  const [reportFormat, setReportFormat] = useState<ReportFormat>(ReportFormatEnum.JSON);
  const [parameters, setParameters] = useState<ReportParameters>({
    includeExpired: true,
    includeZeroStock: true
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportHistory = await reportingService.getReportHistory();
      setReports(reportHistory);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const report = await reportingService.generateReport(reportType, parameters, reportFormat);
      setReports(prev => [report, ...prev]);
      setShowGenerator(false);
      setSelectedReport(report);
      onReportGenerated?.(report);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportId: string, format: ReportFormat) => {
    try {
      const blob = await reportingService.exportReport(reportId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  const getReportTypeDescription = (type: ReportType): string => {
    switch (type) {
      case ReportTypeEnum.BATCH_TRACKING:
        return 'Track inventory batches, expiration dates, and locations';
      case ReportTypeEnum.EXPIRATION_REPORT:
        return 'Monitor expiring and expired inventory batches';
      case ReportTypeEnum.REORDER_ANALYSIS:
        return 'Analyze reorder rules, alerts, and recommendations';
      case ReportTypeEnum.INVENTORY_VALUATION:
        return 'Calculate total inventory value by category and supplier';
      case ReportTypeEnum.SUPPLIER_PERFORMANCE:
        return 'Evaluate supplier performance and metrics';
      case ReportTypeEnum.STOCK_MOVEMENT:
        return 'Track inventory movement and trends';
      default:
        return 'Unknown report type';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Reports</h2>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showGenerator ? 'Cancel' : 'Generate Report'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Report Generator */}
      {showGenerator && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ReportTypeEnum.BATCH_TRACKING}>Batch Tracking</option>
                <option value={ReportTypeEnum.EXPIRATION_REPORT}>Expiration Report</option>
                <option value={ReportTypeEnum.REORDER_ANALYSIS}>Reorder Analysis</option>
                <option value={ReportTypeEnum.INVENTORY_VALUATION}>Inventory Valuation</option>
                <option value={ReportTypeEnum.SUPPLIER_PERFORMANCE}>Supplier Performance</option>
                <option value={ReportTypeEnum.STOCK_MOVEMENT}>Stock Movement</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {getReportTypeDescription(reportType)}
              </p>
            </div>

            {/* Report Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ReportFormatEnum.JSON}>JSON</option>
                <option value={ReportFormatEnum.CSV}>CSV</option>
                <option value={ReportFormatEnum.EXCEL}>Excel</option>
                <option value={ReportFormatEnum.PDF}>PDF</option>
              </select>
            </div>
          </div>

          {/* Parameters */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-900">Report Parameters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={parameters.includeExpired}
                    onChange={(e) => setParameters(prev => ({
                      ...prev,
                      includeExpired: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Include expired items
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={parameters.includeZeroStock}
                    onChange={(e) => setParameters(prev => ({
                      ...prev,
                      includeZeroStock: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Include zero stock items
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={parameters.dateRange?.start || ''}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: e.target.value,
                      end: prev.dateRange?.end || ''
                    }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={parameters.dateRange?.end || ''}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: prev.dateRange?.start || '',
                      end: e.target.value
                    }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowGenerator(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Report Details */}
      {selectedReport && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedReport.name}</h3>
              <p className="text-sm text-gray-500">
                Generated: {formatDate(selectedReport.generatedAt)} by {selectedReport.generatedBy}
              </p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-900">{selectedReport.data.summary.totalItems}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-900">${selectedReport.data.summary.totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">{selectedReport.data.summary.criticalAlerts}</div>
              <div className="text-sm text-gray-500">Critical Alerts</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="text-2xl font-bold text-yellow-600">{selectedReport.data.summary.warnings}</div>
              <div className="text-sm text-gray-500">Warnings</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-900">{selectedReport.type}</div>
              <div className="text-sm text-gray-500">Report Type</div>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500">Export as:</span>
            {Object.values(ReportFormatEnum).map(format => (
              <button
                key={format}
                onClick={() => handleExportReport(selectedReport.id, format)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report History */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report History</h3>
        
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reports generated yet. Create your first report to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        {report.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.generatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.data.summary.totalItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${report.data.summary.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleExportReport(report.id, ReportFormatEnum.CSV)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
