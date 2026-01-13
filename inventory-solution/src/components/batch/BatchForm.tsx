/**
 * Batch Form Component
 * Form for creating and editing inventory batches
 */

import React, { useState, useEffect } from 'react';
import type { Batch } from '../../types/product';
import { BatchStatus } from '../../types/product';
import { batchService } from '../../services/batchService';

interface BatchFormProps {
  variantId: string;
  batch?: Batch;
  mode: 'create' | 'edit';
  onSubmit: (batch: Batch) => void;
  onCancel: () => void;
}

interface BatchFormData {
  batchNumber: string;
  quantity: string;
  remainingQuantity: string;
  manufactureDate: string;
  expirationDate: string;
  supplier: string;
  cost: string;
  location: string;
  status: BatchStatus;
  notes: string;
}

export const BatchForm: React.FC<BatchFormProps> = ({
  variantId,
  batch,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<BatchFormData>({
    batchNumber: '',
    quantity: '',
    remainingQuantity: '',
    manufactureDate: '',
    expirationDate: '',
    supplier: '',
    cost: '',
    location: '',
    status: BatchStatus.ACTIVE,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch && mode === 'edit') {
      setFormData({
        batchNumber: batch.batchNumber,
        quantity: batch.quantity.toString(),
        remainingQuantity: batch.remainingQuantity.toString(),
        manufactureDate: batch.manufactureDate.split('T')[0],
        expirationDate: batch.expirationDate ? batch.expirationDate.split('T')[0] : '',
        supplier: batch.supplier,
        cost: batch.cost.toString(),
        location: batch.location || '',
        status: batch.status,
        notes: batch.notes || ''
      });
    }
  }, [batch, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.remainingQuantity || parseFloat(formData.remainingQuantity) < 0) {
      newErrors.remainingQuantity = 'Remaining quantity cannot be negative';
    }

    if (parseFloat(formData.remainingQuantity) > parseFloat(formData.quantity)) {
      newErrors.remainingQuantity = 'Remaining quantity cannot exceed total quantity';
    }

    if (!formData.manufactureDate) {
      newErrors.manufactureDate = 'Manufacture date is required';
    }

    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    }

    if (formData.expirationDate && formData.manufactureDate) {
      const expDate = new Date(formData.expirationDate);
      const mfgDate = new Date(formData.manufactureDate);
      if (expDate <= mfgDate) {
        newErrors.expirationDate = 'Expiration date must be after manufacture date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const batchData = {
        variantId,
        batchNumber: formData.batchNumber.trim(),
        quantity: parseFloat(formData.quantity),
        remainingQuantity: parseFloat(formData.remainingQuantity),
        manufactureDate: new Date(formData.manufactureDate).toISOString(),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
        supplier: formData.supplier.trim(),
        cost: parseFloat(formData.cost),
        location: formData.location.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined
      };

      let savedBatch: Batch;
      if (mode === 'create') {
        savedBatch = await batchService.createBatch(batchData);
      } else {
        savedBatch = await batchService.updateBatch(batch!.id, batchData);
      }

      onSubmit(savedBatch);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save batch' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BatchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batch Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Number *
          </label>
          <input
            type="text"
            value={formData.batchNumber}
            onChange={(e) => handleInputChange('batchNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.batchNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., BATCH-001"
          />
          {errors.batchNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.batchNumber}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as BatchStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={BatchStatus.ACTIVE}>Active</option>
            <option value={BatchStatus.EXPIRING_SOON}>Expiring Soon</option>
            <option value={BatchStatus.EXPIRED}>Expired</option>
            <option value={BatchStatus.DEPLETED}>Depleted</option>
            <option value={BatchStatus.QUARANTINE}>Quarantine</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Quantity *
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
            step="1"
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        {/* Remaining Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remaining Quantity *
          </label>
          <input
            type="number"
            value={formData.remainingQuantity}
            onChange={(e) => handleInputChange('remainingQuantity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.remainingQuantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
            step="1"
          />
          {errors.remainingQuantity && (
            <p className="mt-1 text-sm text-red-600">{errors.remainingQuantity}</p>
          )}
        </div>

        {/* Manufacture Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manufacture Date *
          </label>
          <input
            type="date"
            value={formData.manufactureDate}
            onChange={(e) => handleInputChange('manufactureDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.manufactureDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.manufactureDate && (
            <p className="mt-1 text-sm text-red-600">{errors.manufactureDate}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            value={formData.expirationDate}
            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.expirationDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expirationDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
          )}
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier *
          </label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) => handleInputChange('supplier', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Supplier name"
          />
        </div>

        {/* Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost per Unit *
          </label>
          <input
            type="number"
            value={formData.cost}
            onChange={(e) => handleInputChange('cost', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cost ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.cost && (
            <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Storage Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Warehouse A-1"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes about this batch..."
        />
      </div>

      {/* Form Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Batch' : 'Update Batch'}
        </button>
      </div>
    </form>
  );
};
