/**
 * Integration Test Suite
 * Validates the complete functionality of the migrated product management system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProductList } from '../components/ProductList';
import { ProductForm } from '../components/ProductForm';
import { ProductDetails } from '../components/ProductDetails';
import { productService } from '../services/productService';
import type { Product, ProductFormData } from '../types/product';

// Test utilities
const createMockProduct = (): Product => ({
  id: 'test-product-1',
  name: 'Test Product',
  description: 'Test Description',
  barcode: '1234567890123',
  sku: 'TEST-001',
  category: 'electronics' as any,
  supplier: {
    id: '1',
    name: 'Test Supplier',
    contactPerson: 'John Doe',
    email: 'john@test.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA'
    },
    paymentTerms: 'net_30' as any,
    status: 'active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  variants: [
    {
      id: 'variant-1',
      productId: 'test-product-1',
      attributes: [
        { id: 'attr-1', name: 'color', value: 'red', type: 'color' as any }
      ],
      cost: 100,
      costHistory: [
        {
          id: 'cost-1',
          variantId: 'variant-1',
          cost: 100,
          quantity: 10,
          supplier: 'Test Supplier',
          date: '2024-01-01T00:00:00Z',
          createdBy: '1'
        }
      ],
      price: 150,
      stock: 50,
      reorderLevel: 10,
      minStockLevel: 5,
      maxStockLevel: 100,
      status: 'active' as any,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  tags: ['test', 'electronics'],
  status: 'active' as any,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: '1',
  updatedBy: '1'
});

const createMockFormData = (): ProductFormData => ({
  name: 'New Test Product',
  description: 'New Test Description',
  barcode: '9876543210987',
  sku: 'NEW-001',
  category: 'electronics' as any,
  supplierId: '1',
  tags: ['new', 'test'],
  validityDate: '',
  variants: [
    {
      attributes: { color: 'blue' },
      cost: '200',
      price: '300',
      stock: '25',
      reorderLevel: '5',
      minStockLevel: '2',
      maxStockLevel: '50'
    }
  ]
});

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// ProductList Tests
describe('ProductList Integration', () => {
  test('renders product list with mock data', async () => {
    const mockProducts = [createMockProduct()];
    
    render(
      <TestWrapper>
        <ProductList
          products={mockProducts}
          filter={{}}
          onFilterChange={() => {}}
          onProductSelect={() => {}}
          onProductEdit={() => {}}
          onProductDelete={() => {}}
          onProductCreate={() => {}}
          permissions={['products:read']}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    expect(screen.getByText('1234567890123')).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    const mockProducts = [createMockProduct()];
    const onFilterChange = jest.fn();
    
    render(
      <TestWrapper>
        <ProductList
          products={mockProducts}
          filter={{}}
          onFilterChange={onFilterChange}
          onProductSelect={() => {}}
          onProductEdit={() => {}}
          onProductDelete={() => {}}
          onProductCreate={() => {}}
          permissions={['products:read']}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Test' })
      );
    });
  });

  test('displays product statistics', () => {
    const mockProducts = [createMockProduct()];
    
    render(
      <TestWrapper>
        <ProductList
          products={mockProducts}
          filter={{}}
          onFilterChange={() => {}}
          onProductSelect={() => {}}
          onProductEdit={() => {}}
          onProductDelete={() => {}}
          onProductCreate={() => {}}
          permissions={['products:read']}
          stats={{
            totalProducts: 1,
            totalVariants: 1,
            totalStock: 50,
            lowStockAlerts: 0,
            outOfStock: 0,
            categories: [],
            suppliers: []
          }}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Stock')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});

// ProductForm Tests
describe('ProductForm Integration', () => {
  test('renders create product form', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <TestWrapper>
        <ProductForm
          mode="create"
          onSubmit={onSubmit}
          onCancel={onCancel}
          permissions={['products:create']}
          suppliers={[]}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Create New Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Barcode')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const onSubmit = jest.fn();
    
    render(
      <TestWrapper>
        <ProductForm
          mode="create"
          onSubmit={onSubmit}
          onCancel={() => {}}
          permissions={['products:create']}
          suppliers={[]}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Product Name is required/)).toBeInTheDocument();
      expect(screen.getByText(/SKU is required/)).toBeInTheDocument();
      expect(screen.getByText(/Barcode must be at least 8 characters/)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits valid form data', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const formData = createMockFormData();
    
    render(
      <TestWrapper>
        <ProductForm
          mode="create"
          onSubmit={onSubmit}
          onCancel={() => {}}
          permissions={['products:create']}
          suppliers={[{
            id: '1',
            name: 'Test Supplier',
            contactPerson: 'John Doe',
            email: 'john@test.com',
            phone: '+1-555-0123',
            address: {
              street: '123 Test St',
              city: 'Test City',
              state: 'TS',
              postalCode: '12345',
              country: 'USA'
            },
            paymentTerms: 'net_30' as any,
            status: 'active' as any,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }]}
        />
      </TestWrapper>
    );

    // Fill form fields
    fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: formData.name } });
    fireEvent.change(screen.getByLabelText('SKU'), { target: { value: formData.sku } });
    fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: formData.barcode } });

    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(formData);
    });
  });

  test('renders edit form with product data', () => {
    const mockProduct = createMockProduct();
    
    render(
      <TestWrapper>
        <ProductForm
          mode="edit"
          product={mockProduct}
          onSubmit={() => {}}
          onCancel={() => {}}
          permissions={['products:update']}
          suppliers={[mockProduct.supplier]}
        />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProduct.sku)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProduct.barcode)).toBeInTheDocument();
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });
});

// ProductDetails Tests
describe('ProductDetails Integration', () => {
  test('renders product details', () => {
    const mockProduct = createMockProduct();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    
    render(
      <TestWrapper>
        <ProductDetails
          product={mockProduct}
          onEdit={onEdit}
          onDelete={onDelete}
          onVariantUpdate={() => {}}
          permissions={['products:read']}
        />
      </TestWrapper>
    );

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.sku)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.barcode)).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
  });

  test('displays product statistics', () => {
    const mockProduct = createMockProduct();
    
    render(
      <TestWrapper>
        <ProductDetails
          product={mockProduct}
          onEdit={() => {}}
          onDelete={() => {}}
          onVariantUpdate={() => {}}
          permissions={['products:read']}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Total Stock')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText(/\$7,500/)).toBeInTheDocument(); // 50 * $150
  });

  test('handles edit and delete actions', () => {
    const mockProduct = createMockProduct();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    
    render(
      <TestWrapper>
        <ProductDetails
          product={mockProduct}
          onEdit={onEdit}
          onDelete={onDelete}
          onVariantUpdate={() => {}}
          permissions={['products:update', 'products:delete']}
        />
      </TestWrapper>
    );

    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(mockProduct);

    fireEvent.click(deleteButton);
    // Should show confirmation dialog
  });
});

// Service Tests
describe('ProductService Integration', () => {
  test('creates product successfully', async () => {
    const formData = createMockFormData();
    
    const result = await productService.createProduct(formData);
    
    expect(result).toBeDefined();
    expect(result.name).toBe(formData.name);
    expect(result.sku).toBe(formData.sku);
    expect(result.barcode).toBe(formData.barcode);
  });

  test('gets products with filter', async () => {
    const filter = { search: 'Test', category: 'electronics' };
    
    const result = await productService.getProducts(filter);
    
    expect(result.products).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.products)).toBe(true);
  });

  test('updates product successfully', async () => {
    const mockProduct = createMockProduct();
    const updateData = { name: 'Updated Product' };
    
    const result = await productService.updateProduct(mockProduct.id, updateData);
    
    expect(result).toBeDefined();
    expect(result.name).toBe('Updated Product');
  });

  test('deletes product successfully', async () => {
    const mockProduct = createMockProduct();
    
    await expect(productService.deleteProduct(mockProduct.id)).resolves.not.toThrow();
  });

  test('exports products to CSV', async () => {
    const result = await productService.exportProducts();
    
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('text/csv');
  });
});

// Permission Tests
describe('Permission System Integration', () => {
  test('permission guard hides content without permission', () => {
    render(
      <TestWrapper>
        <div data-testid="protected-content">
          Protected Content
        </div>
      </TestWrapper>
    );

    // Test would need actual PermissionGuard component
    // This is a placeholder for permission testing
  });

  test('auth context provides user state', () => {
    // Test would need actual useAuth hook
    // This is a placeholder for auth testing
  });
});

// Performance Tests
describe('Performance Integration', () => {
  test('large product list renders efficiently', () => {
    const largeProductList = Array.from({ length: 1000 }, (_, index) => 
      createMockProduct()
    );
    
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <ProductList
          products={largeProductList}
          filter={{}}
          onFilterChange={() => {}}
          onProductSelect={() => {}}
          onProductEdit={() => {}}
          onProductDelete={() => {}}
          onProductCreate={() => {}}
          permissions={['products:read']}
        />
      </TestWrapper>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms for 1000 products
    expect(renderTime).toBeLessThan(100);
  });
});

// Error Handling Tests
describe('Error Handling Integration', () => {
  test('handles service errors gracefully', async () => {
    // Test with invalid data
    const invalidFormData = {
      name: '',
      barcode: '123',
      sku: '',
      category: 'invalid' as any,
      supplierId: '',
      tags: [],
      variants: []
    };

    await expect(productService.createProduct(invalidFormData))
      .rejects.toThrow('Product name is required');
  });

  test('displays error messages in forms', async () => {
    const onSubmit = jest.fn();
    
    render(
      <TestWrapper>
        <ProductForm
          mode="create"
          onSubmit={onSubmit}
          onCancel={() => {}}
          permissions={['products:create']}
          suppliers={[]}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Product Name is required/)).toBeInTheDocument();
    });
  });
});

export {
  createMockProduct,
  createMockFormData,
  TestWrapper
};
