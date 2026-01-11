import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/App'

// Mock cross-solution event bus
const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn()
}

// Mock data sync service
const mockDataSync = {
  syncCustomer: vi.fn(),
  syncProduct: vi.fn(),
  syncSale: vi.fn(),
  syncEmployee: vi.fn(),
  resolveConflict: vi.fn()
}

// Mock real-time subscriptions
const mockRealtime = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  isConnected: vi.fn(() => true)
}

vi.mock('@/lib/events/event-bus', () => ({
  EventBus: mockEventBus
}))

vi.mock('@/lib/sync/data-sync', () => ({
  DataSync: mockDataSync
}))

vi.mock('@/lib/events/realtime', () => ({
  RealtimeSubscription: mockRealtime
}))

// Mock API responses
const mockApiResponses = {
  createCustomer: {
    id: 'customer-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    tenant_id: 'tenant-1'
  },
  createProduct: {
    id: 'product-1',
    name: 'Test Product',
    description: 'A test product',
    price: 99.99,
    stock: 100,
    category_id: 'cat-1',
    tenant_id: 'tenant-1'
  },
  createSale: {
    id: 'sale-1',
    customer_id: 'customer-1',
    items: [
      { product_id: 'product-1', quantity: 2, price: 99.99 }
    ],
    total: 199.98,
    status: 'completed',
    tenant_id: 'tenant-1'
  },
  createEmployee: {
    id: 'employee-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'sales',
    department: 'sales',
    tenant_id: 'tenant-1'
  }
}

// Mock fetch
global.fetch = vi.fn()

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('Cross-Solution Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API responses
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/customers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.createCustomer)
        })
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.createProduct)
        })
      }
      if (url.includes('/api/sales')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.createSale)
        })
      }
      if (url.includes('/api/employees')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.createEmployee)
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Sales Workflow (POS → Inventory → Accounting)', () => {
    it('should execute complete sales workflow', async () => {
      renderApp()
      
      // Navigate to POS
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Create customer
      const createCustomerBtn = screen.getByText(/Create Customer/i)
      fireEvent.click(createCustomerBtn)
      
      // Fill customer form
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'john@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: '+1234567890' }
      })
      
      fireEvent.click(screen.getByText(/Save Customer/i))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/customers'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('John Doe')
          })
        )
      })
      
      // Verify customer_created event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('customer_created', {
        customer: mockApiResponses.createCustomer
      })
      
      // Add products to sale
      fireEvent.click(screen.getByText(/Add Product/i))
      
      // Select product and quantity
      fireEvent.change(screen.getByLabelText(/Product/i), {
        target: { value: 'product-1' }
      })
      fireEvent.change(screen.getByLabelText(/Quantity/i), {
        target: { value: '2' }
      })
      
      fireEvent.click(screen.getByText(/Add to Cart/i))
      
      // Complete sale
      fireEvent.click(screen.getByText(/Complete Sale/i))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/sales'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('customer-1')
          })
        )
      })
      
      // Verify sale_processed event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('sale_processed', {
        sale: mockApiResponses.createSale
      })
      
      // Verify inventory was updated
      expect(mockDataSync.syncProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: 'product-1',
          stock_change: -2
        })
      )
      
      // Verify accounting data was synced
      expect(mockDataSync.syncSale).toHaveBeenCalledWith(
        expect.objectContaining({
          sale_id: 'sale-1',
          total: 199.98
        })
      )
    })

    it('should handle inventory stock depletion', async () => {
      // Mock low stock scenario
      mockDataSync.syncProduct.mockResolvedValue({
        success: false,
        error: 'Insufficient stock',
        current_stock: 1
      })
      
      renderApp()
      
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Try to sell more than available stock
      fireEvent.click(screen.getByText(/Add Product/i))
      fireEvent.change(screen.getByLabelText(/Quantity/i), {
        target: { value: '5' } // More than available
      })
      fireEvent.click(screen.getByText(/Add to Cart/i))
      
      await waitFor(() => {
        expect(screen.getByText(/Insufficient stock/i)).toBeInTheDocument()
      })
      
      // Verify low stock alert was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('low_stock_alert', {
        product_id: 'product-1',
        current_stock: 1,
        requested_quantity: 5
      })
    })
  })

  describe('Customer Creation Workflow (POS → CRM → Analytics)', () => {
    it('should sync customer data across all solutions', async () => {
      renderApp()
      
      // Navigate to POS
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Create customer in POS
      fireEvent.click(screen.getByText(/Create Customer/i))
      
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'john@example.com' }
      })
      
      fireEvent.click(screen.getByText(/Save Customer/i))
      
      await waitFor(() => {
        expect(mockDataSync.syncCustomer).toHaveBeenCalledWith(
          expect.objectContaining({
            customer: mockApiResponses.createCustomer,
            source: 'pos'
          })
        )
      })
      
      // Navigate to CRM to verify sync
      window.history.pushState({}, 'CRM', '/crm')
      
      await waitFor(() => {
        expect(screen.getByText(/CRM System/i)).toBeInTheDocument()
      })
      
      // Search for created customer
      fireEvent.change(screen.getByLabelText(/Search Customers/i), {
        target: { value: 'John Doe' }
      })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })
      
      // Navigate to Analytics to verify metrics update
      window.history.pushState({}, 'Analytics', '/analytics')
      
      await waitFor(() => {
        expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument()
      })
      
      // Verify customer metrics are updated
      expect(screen.getByText(/Total Customers:/i)).toBeInTheDocument()
      expect(screen.getByText(/New Customers This Month:/i)).toBeInTheDocument()
    })

    it('should handle customer data conflicts', async () => {
      // Mock conflict scenario
      mockDataSync.syncCustomer.mockResolvedValue({
        success: false,
        conflict: {
          field: 'email',
          local_value: 'john@example.com',
          remote_value: 'john.doe@example.com',
          timestamp: '2024-01-01T00:00:00Z'
        }
      })
      
      renderApp()
      
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Create customer with conflicting email
      fireEvent.click(screen.getByText(/Create Customer/i))
      
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'john@example.com' }
      })
      
      fireEvent.click(screen.getByText(/Save Customer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/Data Conflict Detected/i)).toBeInTheDocument()
        expect(screen.getByText(/Email already exists/i)).toBeInTheDocument()
      })
      
      // Test conflict resolution options
      fireEvent.click(screen.getByText(/Use Local Data/i))
      
      expect(mockDataSync.resolveConflict).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'source_wins',
          field: 'email',
          value: 'john@example.com'
        })
      )
    })
  })

  describe('Employee Onboarding (HR → All Solutions)', () => {
    it('should onboard employee across all solutions', async () => {
      renderApp()
      
      // Navigate to HR
      window.history.pushState({}, 'HR', '/hr')
      
      await waitFor(() => {
        expect(screen.getByText(/HR Management/i)).toBeInTheDocument()
      })
      
      // Create new employee
      fireEvent.click(screen.getByText(/Add Employee/i))
      
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'Jane Smith' }
      })
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'jane@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/Role/i), {
        target: { value: 'sales' }
      })
      fireEvent.change(screen.getByLabelText(/Department/i), {
        target: { value: 'sales' }
      })
      
      fireEvent.click(screen.getByText(/Create Employee/i))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/employees'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Jane Smith')
          })
        )
      })
      
      // Verify employee_created event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('employee_created', {
        employee: mockApiResponses.createEmployee
      })
      
      // Verify employee was added to all relevant systems
      expect(mockDataSync.syncEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          employee: mockApiResponses.createEmployee,
          systems: ['pos', 'crm', 'analytics', 'accounting']
        })
      )
      
      // Navigate to POS to verify employee access
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Check employee appears in user list
      fireEvent.click(screen.getByText(/Users/i))
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Sales')).toBeInTheDocument()
      })
    })

    it('should handle employee role permissions', async () => {
      // Mock employee with limited permissions
      const limitedEmployee = {
        ...mockApiResponses.createEmployee,
        role: 'cashier',
        permissions: ['sales.read', 'sales.create']
      }
      
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/employees')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(limitedEmployee)
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        })
      })
      
      renderApp()
      
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Verify limited access
      expect(screen.queryByText(/Admin Settings/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Delete Sale/i)).not.toBeInTheDocument()
      
      // Verify allowed actions
      expect(screen.getByText(/Create Sale/i)).toBeInTheDocument()
      expect(screen.getByText(/View Reports/i)).toBeInTheDocument()
    })
  })

  describe('Financial Reporting (All Solutions → Analytics)', () => {
    it('should aggregate financial data from all solutions', async () => {
      // Mock financial data from different solutions
      const financialData = {
        pos_sales: [
          { id: '1', total: 199.98, date: '2024-01-01' },
          { id: '2', total: 299.97, date: '2024-01-02' }
        ],
        accounting_transactions: [
          { id: '1', amount: 199.98, type: 'sale', date: '2024-01-01' },
          { id: '2', amount: 299.97, type: 'sale', date: '2024-01-02' }
        ],
        inventory_costs: [
          { id: '1', cost: 100.00, product_id: 'product-1', date: '2024-01-01' }
        ]
      }
      
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/analytics/financial')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(financialData)
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        })
      })
      
      renderApp()
      
      window.history.pushState({}, 'Analytics', '/analytics')
      
      await waitFor(() => {
        expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument()
      })
      
      // Navigate to financial reports
      fireEvent.click(screen.getByText(/Financial Reports/i))
      
      await waitFor(() => {
        expect(screen.getByText(/Total Revenue:/i)).toBeInTheDocument()
        expect(screen.getByText(/$499.95/i)).toBeInTheDocument() // Sum of sales
        expect(screen.getByText(/Total Costs:/i)).toBeInTheDocument()
        expect(screen.getByText(/$100.00/i)).toBeInTheDocument() // Inventory costs
        expect(screen.getByText(/Net Profit:/i)).toBeInTheDocument()
        expect(screen.getByText(/$399.95/i)).toBeInTheDocument() // Revenue - Costs
      })
      
      // Verify data aggregation events
      expect(mockEventBus.emit).toHaveBeenCalledWith('financial_data_aggregated', {
        total_revenue: 499.95,
        total_costs: 100.00,
        net_profit: 399.95,
        sources: ['pos', 'accounting', 'inventory']
      })
    })

    it('should handle real-time financial updates', async () => {
      renderApp()
      
      window.history.pushState({}, 'Analytics', '/analytics')
      
      await waitFor(() => {
        expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument()
      })
      
      // Simulate real-time sale update
      const saleUpdate = {
        id: 'sale-3',
        total: 149.99,
        timestamp: new Date().toISOString()
      }
      
      // Trigger real-time event
      mockEventBus.emit.mockImplementation((event, data) => {
        if (event === 'sale_processed') {
          // Update UI in real-time
          const revenueElement = screen.getByText(/Total Revenue:/i)
          if (revenueElement) {
            revenueElement.textContent = `Total Revenue: $${data.sale.total}`
          }
        }
      })
      
      mockEventBus.emit('sale_processed', { sale: saleUpdate })
      
      await waitFor(() => {
        expect(screen.getByText(/Total Revenue:/i)).toBeInTheDocument()
        expect(screen.getByText(/\$149\.99/)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle network failures gracefully', async () => {
      // Mock network failure
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))
      
      renderApp()
      
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Try to create customer
      fireEvent.click(screen.getByText(/Create Customer/i))
      fireEvent.click(screen.getByText(/Save Customer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument()
        expect(screen.getByText(/Retry/i)).toBeInTheDocument()
      })
      
      // Test retry functionality
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.createCustomer)
      })
      
      fireEvent.click(screen.getByText(/Retry/i))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2) // Initial attempt + retry
      })
    })

    it('should handle partial system failures', async () => {
      // Mock CRM system failure
      mockDataSync.syncCustomer.mockRejectedValue(new Error('CRM system unavailable'))
      
      renderApp()
      
      window.history.pushState({}, 'POS', '/pos')
      
      await waitFor(() => {
        expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument()
      })
      
      // Create customer
      fireEvent.click(screen.getByText(/Create Customer/i))
      fireEvent.click(screen.getByText(/Save Customer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/Customer created successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/CRM sync failed/i)).toBeInTheDocument()
      })
      
      // Verify local creation succeeded despite sync failure
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/customers'),
        expect.any(Object)
      )
    })
  })
})
