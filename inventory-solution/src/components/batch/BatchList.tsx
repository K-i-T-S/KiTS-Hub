/**
 * Batch Management Component
 * Displays and manages inventory batches with tracking capabilities
 */

import React, { useState, useEffect } from 'react';
import type { Batch } from '../../types/product';
import { BatchStatus } from '../../types/product';
import { batchService } from '../../services/batchService';

interface BatchListProps {
  variantId: string;
  onBatchSelect?: (batch: Batch) => void;
  onBatchEdit?: (batch: Batch) => void;
  onBatchDelete?: (batchId: string) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export const BatchList: React.FC<BatchListProps> = ({
  variantId,
  onBatchSelect,
  onBatchEdit,
  onBatchDelete,
  allowEdit = false,
  allowDelete = false
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBatches();
  }, [variantId]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const batchData = await batchService.getBatchesByVariant(variantId);
      setBatches(batchData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BatchStatus): string => {
    switch (status) {
      case BatchStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case BatchStatus.EXPIRING_SOON:
        return 'bg-yellow-100 text-yellow-800';
      case BatchStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case BatchStatus.DEPLETED:
        return 'bg-gray-100 text-gray-800';
      case BatchStatus.QUARANTINE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiration = (expirationDate?: string): number | null => {
    if (!expirationDate) return null;
    const today = new Date();
    const expiration = new Date(expirationDate);
    return Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredBatches = batches.filter(batch => {
    if (filter === 'all') return true;
    return batch.status === filter;
  });

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
          onClick={loadBatches}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Batches</option>
          <option value={BatchStatus.ACTIVE}>Active</option>
          <option value={BatchStatus.EXPIRING_SOON}>Expiring Soon</option>
          <option value={BatchStatus.EXPIRED}>Expired</option>
          <option value={BatchStatus.DEPLETED}>Depleted</option>
          <option value={BatchStatus.QUARANTINE}>Quarantine</option>
        </select>
      </div>

      {/* Batch List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBatches.map((batch) => {
              const daysUntilExpiration = getDaysUntilExpiration(batch.expirationDate);
              
              return (
                <tr
                  key={batch.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onBatchSelect?.(batch)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {batch.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                      {batch.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.remainingQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.expirationDate ? (
                      <div>
                        <div>{new Date(batch.expirationDate).toLocaleDateString()}</div>
                        {daysUntilExpiration !== null && (
                          <div className={`text-xs ${daysUntilExpiration <= 0 ? 'text-red-600' : daysUntilExpiration <= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {daysUntilExpiration <= 0 ? 'Expired' : `${daysUntilExpiration} days`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiration</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.location || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${batch.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {allowEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBatchEdit?.(batch);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBatchDelete?.(batch.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No batches found for the selected filter.
        </div>
      )}
    </div>
  );
};
