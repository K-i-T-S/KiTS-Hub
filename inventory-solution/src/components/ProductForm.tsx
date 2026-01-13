/**
 * Product Form Component
 * Migrated and refactored with TypeScript best practices and validation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

import type {
  Product,
  ProductFormData,
  ProductVariantFormData,
  ProductFormProps,
  Supplier,
  AttributeType,
  FormValidationResult,
  ValidationError
} from '../types/product';
import { ProductStatus, VariantStatus, ProductCategory } from '../types/product';
import { PermissionGuard } from './PermissionGuard';

// Validation utilities
const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED'
    };
  }
  return null;
};

const validateNumber = (value: string, fieldName: string, min = 0): ValidationError | null => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`,
      code: 'INVALID_NUMBER'
    };
  }
  if (num < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min}`,
      code: 'MIN_VALUE'
    };
  }
  return null;
};

const validateEmail = (value: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_EMAIL'
    };
  }
  return null;
};

const validateBarcode = (value: string): ValidationError | null => {
  if (value.length < 8) {
    return {
      field: 'barcode',
      message: 'Barcode must be at least 8 characters',
      code: 'INVALID_BARCODE'
    };
  }
  return null;
};

// Form validation function
const validateProductForm = (data: ProductFormData): FormValidationResult => {
  const errors: ValidationError[] = [];

  // Validate required fields
  const nameError = validateRequired(data.name, 'name');
  if (nameError) errors.push(nameError);

  const barcodeError = validateBarcode(data.barcode);
  if (barcodeError) errors.push(barcodeError);

  const skuError = validateRequired(data.sku, 'sku');
  if (skuError) errors.push(skuError);

  // Validate variants
  if (data.variants.length === 0) {
    errors.push({
      field: 'variants',
      message: 'At least one variant is required',
      code: 'NO_VARIANTS'
    });
  }

  data.variants.forEach((variant, index) => {
    const costError = validateNumber(variant.cost, `variants[${index}].cost`, 0);
    if (costError) errors.push(costError);

    const priceError = validateNumber(variant.price, `variants[${index}].price`, 0);
    if (priceError) errors.push(priceError);

    const stockError = validateNumber(variant.stock, `variants[${index}].stock`, 0);
    if (stockError) errors.push(stockError);

    const reorderError = validateNumber(variant.reorderLevel, `variants[${index}].reorderLevel`, 0);
    if (reorderError) errors.push(reorderError);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility Components
const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = React.memo(({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    )}
  </div>
));

FormField.displayName = 'FormField';

const VariantForm: React.FC<{
  variant: ProductVariantFormData;
  index: number;
  onChange: (index: number, variant: ProductVariantFormData) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  errors: ValidationError[];
}> = React.memo(({ variant, index, onChange, onRemove, canRemove, errors }) => {
  const getVariantError = (field: string): string | undefined => {
    const error = errors.find(e => e.field === `variants[${index}].${field}`);
    return error?.message;
  };

  const updateVariant = useCallback((updates: Partial<ProductVariantFormData>) => {
    onChange(index, { ...variant, ...updates });
  }, [variant, index, onChange]);

  const addAttribute = useCallback(() => {
    const newAttributes = { ...variant.attributes };
    const key = `attr_${Date.now()}`;
    newAttributes[key] = '';
    updateVariant({ attributes: newAttributes });
  }, [variant.attributes, updateVariant]);

  const updateAttribute = useCallback((key: string, value: string) => {
    const newAttributes = { ...variant.attributes };
    if (value.trim() === '') {
      delete newAttributes[key];
    } else {
      newAttributes[key] = value;
    }
    updateVariant({ attributes: newAttributes });
  }, [variant.attributes, updateVariant]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Variant {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Cost"
          required
          error={getVariantError('cost')}
        >
          <input
            type="number"
            step="0.01"
            min="0"
            value={variant.cost}
            onChange={(e) => updateVariant({ cost: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </FormField>

        <FormField
          label="Price"
          required
          error={getVariantError('price')}
        >
          <input
            type="number"
            step="0.01"
            min="0"
            value={variant.price}
            onChange={(e) => updateVariant({ price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </FormField>

        <FormField
          label="Stock"
          required
          error={getVariantError('stock')}
        >
          <input
            type="number"
            min="0"
            value={variant.stock}
            onChange={(e) => updateVariant({ stock: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </FormField>

        <FormField
          label="Reorder Level"
          required
          error={getVariantError('reorderLevel')}
        >
          <input
            type="number"
            min="0"
            value={variant.reorderLevel}
            onChange={(e) => updateVariant({ reorderLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </FormField>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Attributes</label>
          <button
            type="button"
            onClick={addAttribute}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            Add Attribute
          </button>
        </div>
        <div className="space-y-2">
          {Object.entries(variant.attributes).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key.startsWith('attr_') ? '' : key}
                onChange={(e) => {
                  const newKey = e.target.value || `attr_${Date.now()}`;
                  const newAttributes = { ...variant.attributes };
                  delete newAttributes[key];
                  newAttributes[newKey] = value;
                  updateVariant({ attributes: newAttributes });
                }}
                placeholder="Attribute name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => updateAttribute(key, e.target.value)}
                placeholder="Attribute value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VariantForm.displayName = 'VariantForm';

// Main Component
export const ProductForm: React.FC<ProductFormProps> = React.memo(({
  product,
  mode,
  loading = false,
  error,
  onSubmit,
  onCancel,
  permissions,
  suppliers
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    category: ProductCategory.OTHER,
    supplierId: '',
    tags: [],
    validityDate: '',
    variants: [
      {
        attributes: {},
        cost: '',
        price: '',
        stock: '',
        reorderLevel: '',
        minStockLevel: '',
        maxStockLevel: ''
      }
    ]
  });

  const [validation, setValidation] = useState<FormValidationResult>({ isValid: true, errors: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        description: product.description || '',
        barcode: product.barcode,
        sku: product.sku,
        category: product.category,
        supplierId: product.supplier.id,
        tags: product.tags || [],
        validityDate: product.validityDate || '',
        variants: product.variants.map(v => ({
          id: v.id,
          attributes: v.attributes.reduce((acc, attr) => ({
            ...acc,
            [attr.name]: attr.value
          }), {}),
          cost: v.cost.toString(),
          price: v.price.toString(),
          stock: v.stock.toString(),
          reorderLevel: v.reorderLevel.toString(),
          minStockLevel: v.minStockLevel.toString(),
          maxStockLevel: v.maxStockLevel.toString()
        }))
      });
    }
  }, [product, mode]);

  // Validate form when data changes
  useEffect(() => {
    const validationResult = validateProductForm(formData);
    setValidation(validationResult);
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = validateProductForm(formData);
    setValidation(validationResult);
    
    if (!validationResult.isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  const updateFormData = useCallback((updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const addVariant = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          attributes: {},
          cost: '',
          price: '',
          stock: '',
          reorderLevel: '',
          minStockLevel: '',
          maxStockLevel: ''
        }
      ]
    }));
  }, []);

  const updateVariant = useCallback((index: number, variant: ProductVariantFormData) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? variant : v)
    }));
  }, []);

  const removeVariant = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  }, []);

  const getFieldError = (field: string): string | undefined => {
    return validation.errors.find(e => e.field === field)?.message;
  };

  const isFormValid = validation.isValid && !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-25" onClick={onCancel} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Create New Product' : 'Edit Product'}
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Product Name"
                  required
                  error={getFieldError('name')}
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </FormField>

                <FormField
                  label="SKU"
                  required
                  error={getFieldError('sku')}
                >
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => updateFormData({ sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter SKU"
                  />
                </FormField>

                <FormField
                  label="Barcode"
                  required
                  error={getFieldError('barcode')}
                >
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => updateFormData({ barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter barcode"
                  />
                </FormField>

                <FormField
                  label="Category"
                  required
                >
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData({ category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.values(ProductCategory).map(category => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Supplier"
                  required
                >
                  <select
                    value={formData.supplierId}
                    onChange={(e) => updateFormData({ supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Validity Date"
                >
                  <input
                    type="date"
                    value={formData.validityDate}
                    onChange={(e) => updateFormData({ validityDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>
              </div>

              <FormField
                label="Description"
              >
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </FormField>

              <FormField
                label="Tags"
              >
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => updateFormData({ 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </FormField>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-900">Product Variants</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <VariantForm
                    key={index}
                    variant={variant}
                    index={index}
                    onChange={updateVariant}
                    onRemove={removeVariant}
                    canRemove={formData.variants.length > 1}
                    errors={validation.errors}
                  />
                ))}
              </div>

              {getFieldError('variants') && (
                <div className="text-sm text-red-600">
                  {getFieldError('variants')}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <PermissionGuard permission="products:create">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {mode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {mode === 'create' ? 'Create Product' : 'Update Product'}
                    </>
                  )}
                </button>
              </PermissionGuard>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
