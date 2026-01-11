import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Filter, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockReports = [
      {
        id: '1',
        name: 'Inventory Summary',
        type: 'inventory',
        generated_at: '2024-01-15T10:00:00Z',
        file_url: '/reports/inventory-summary.pdf',
        size: 245760
      },
      {
        id: '2',
        name: 'Sales Report',
        type: 'sales',
        generated_at: '2024-01-14T09:30:00Z',
        file_url: '/reports/sales-report.pdf',
        size: 1234567
      },
      {
        id: '3',
        name: 'Low Stock Alert',
        type: 'alert',
        generated_at: '2024-01-10T14:20:00Z',
        file_url: '/reports/low-stock-alert.pdf',
        size: 87654
      }
    ];
    setReports(mockReports);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes('') || true; // No search filter for now
    return matchesSearch;
  });

  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'sales', label: 'Sales' },
    { value: 'alert', label: 'Alerts' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
        
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedReport || 'all'}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="kits-input px-3 py-2"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="kits-button kits-button-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </button>
            <button className="kits-button kits-button-primary">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="kits-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <BarChart3 className="h-6 w-6 text-kits-primary" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.type.toUpperCase()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Generated: {new Date(report.generated_at).toLocaleDateString()}</span>
                <span>Size: {(report.size / 1024).toFixed(2)} KB</span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <button className="text-kits-primary hover:text-kits-primary-hover">
                  <Download className="h-4 w-4 mr-2" />
                </button>
                <button className="text-kits-secondary hover:text-kits-secondary-hover">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500">
            Generate your first report to get started.
          </p>
          <button className="kits-button kits-button-primary mt-4">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}
