/**
 * Reorder Management Component
 * Displays and manages automated reorder rules and alerts
 */

import React, { useState, useEffect } from 'react';
import type { ReorderRule, ReorderAlert, ProductVariant } from '../../types/product';
import {
  ReorderTriggerType,
  AlertSeverity,
  ReorderAlertType
} from '../../types/product';
import { reorderService } from '../../services/reorderService';

interface ReorderManagementProps {
  variantId: string;
  variant?: ProductVariant;
  onRuleCreate?: () => void;
  onRuleEdit?: (rule: ReorderRule) => void;
}

export const ReorderManagement: React.FC<ReorderManagementProps> = ({
  variantId,
  variant,
  onRuleCreate,
  onRuleEdit
}) => {
  const [rules, setRules] = useState<ReorderRule[]>([]);
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'alerts'>('rules');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [variantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, alertsData] = await Promise.all([
        reorderService.getReorderRules(variantId),
        reorderService.getReorderAlerts(variantId)
      ]);
      
      setRules(rulesData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reorder data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await reorderService.toggleReorderRule(ruleId, isActive);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle rule');
    }
  };

  const handleTriggerReorder = async (ruleId: string) => {
    try {
      await reorderService.triggerReorder(ruleId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger reorder');
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await reorderService.markAlertAsRead(alertId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark alert as read');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await reorderService.resolveAlert(alertId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
      case AlertSeverity.HIGH:
        return 'bg-orange-100 text-orange-800';
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case AlertSeverity.LOW:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeColor = (type: ReorderAlertType): string => {
    switch (type) {
      case ReorderAlertType.OUT_OF_STOCK:
        return 'bg-red-100 text-red-800';
      case ReorderAlertType.LOW_STOCK:
        return 'bg-orange-100 text-orange-800';
      case ReorderAlertType.BATCH_EXPIRED:
        return 'bg-red-100 text-red-800';
      case ReorderAlertType.BATCH_EXPIRING:
        return 'bg-yellow-100 text-yellow-800';
      case ReorderAlertType.REORDER_SUGGESTED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = showUnreadOnly 
    ? alerts.filter(alert => !alert.isRead)
    : alerts;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reorder Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alerts ({alerts.filter(a => !a.isRead).length} unread)
          </button>
        </nav>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Reorder Rules</h3>
            <button
              onClick={onRuleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Rule
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reorder rules configured. Create a rule to enable automated reordering.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trigger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{rule.triggerType.replace('_', ' ')}</div>
                          {rule.lastTriggered && (
                            <div className="text-xs text-gray-500">
                              Last triggered: {new Date(rule.lastTriggered).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.triggerType === ReorderTriggerType.STOCK_LEVEL && (
                          `Stock ≤ ${rule.triggerValue}`
                        )}
                        {rule.triggerType === ReorderTriggerType.BATCH_EXPIRATION && (
                          `Expires in ≤ ${rule.triggerValue} days`
                        )}
                        {rule.triggerType === ReorderTriggerType.DEMAND_FORECAST && (
                          `Demand ≥ ${rule.triggerValue}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.reorderQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.leadTimeDays} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onRuleEdit?.(rule)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleRule(rule.id, !rule.isActive)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleTriggerReorder(rule.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Trigger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Reorder Alerts</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="mr-2"
              />
              Show unread only
            </label>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {showUnreadOnly ? 'No unread alerts.' : 'No alerts found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAlertTypeColor(alert.alertType)}`}>
                          {alert.alertType.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {!alert.isRead && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(alert.createdAt).toLocaleString()}
                        {alert.resolvedAt && (
                          <span className="ml-4">
                            Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAlertAsRead(alert.id)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Mark Read
                        </button>
                      )}
                      {!alert.resolvedAt && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
