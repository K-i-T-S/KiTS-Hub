/**
 * Mock Supabase Client for Testing
 * Simulates Supabase behavior without requiring real database connection
 */

export interface MockCustomer {
  id: string
  company_name: string
  email: string
  contact_name: string
  created_at: string
  plan_type: 'standard' | 'professional' | 'enterprise'
  priority: number
}

export interface MockQueueItem {
  id: string
  customer_id: string
  status: 'pending' | 'in_progress' | 'credentials_received' | 'migrating' | 'completed' | 'failed'
  priority: number
  created_at: string
  assigned_to?: string
  credentials?: {
    supabase_url?: string
    supabase_key?: string
    database_url?: string
  }
  migration_progress?: number
  estimated_completion?: string
}

export interface MockAdmin {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
}

class MockSupabaseClient {
  public customers: Map<string, MockCustomer> = new Map()
  public queue: Map<string, MockQueueItem> = new Map()
  public admins: Map<string, MockAdmin> = new Map()
  private nextId = 1

  constructor() {
    this.initializeTestData()
  }

  private initializeTestData() {
    // Add test customers
    const testCustomers: MockCustomer[] = [
      {
        id: 'cust_1',
        company_name: 'Test Company Alpha',
        email: 'alpha@testcompany.com',
        contact_name: 'John Doe',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        plan_type: 'enterprise',
        priority: 2
      },
      {
        id: 'cust_2',
        company_name: 'Test Company Beta',
        email: 'beta@testcompany.com',
        contact_name: 'Jane Smith',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        plan_type: 'professional',
        priority: 1
      },
      {
        id: 'cust_3',
        company_name: 'Test Company Gamma',
        email: 'gamma@testcompany.com',
        contact_name: 'Bob Wilson',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        plan_type: 'standard',
        priority: 0
      }
    ]

    // Add test queue items
    const testQueue: MockQueueItem[] = [
      {
        id: 'queue_1',
        customer_id: 'cust_1',
        status: 'pending',
        priority: 2,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'queue_2',
        customer_id: 'cust_2',
        status: 'pending',
        priority: 1,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'queue_3',
        customer_id: 'cust_3',
        status: 'pending',
        priority: 0,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]

    // Add test admins
    const testAdmins: MockAdmin[] = [
      {
        id: 'admin_1',
        email: 'admin@kits-hub.com',
        role: 'admin',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    testCustomers.forEach(c => this.customers.set(c.id, c))
    testQueue.forEach(q => this.queue.set(q.id, q))
    testAdmins.forEach(a => this.admins.set(a.id, a))
  }

  // Customer operations
  from(table: string) {
    return new MockQueryBuilder(this, table)
  }

  getCustomerById(id: string): MockCustomer | undefined {
    return this.customers.get(id)
  }

  getCustomerByEmail(email: string): MockCustomer | undefined {
    return Array.from(this.customers.values()).find(c => c.email.toLowerCase() === email.toLowerCase())
  }

  getQueueItems(): MockQueueItem[] {
    return Array.from(this.queue.values())
  }

  getQueueItemByCustomerId(customerId: string): MockQueueItem | undefined {
    return Array.from(this.queue.values()).find(q => q.customer_id === customerId)
  }

  // Admin operations
  getAdminById(id: string): MockAdmin | undefined {
    return this.admins.get(id)
  }

  getAdminByEmail(email: string): MockAdmin | undefined {
    return Array.from(this.admins.values()).find(a => a.email.toLowerCase() === email.toLowerCase())
  }

  // Test utilities
  addCustomer(customer: Omit<MockCustomer, 'id' | 'created_at'>): MockCustomer {
    const newCustomer: MockCustomer = {
      ...customer,
      id: `cust_${this.nextId++}`,
      created_at: new Date().toISOString()
    }
    this.customers.set(newCustomer.id, newCustomer)
    return newCustomer
  }

  addQueueItem(item: Omit<MockQueueItem, 'id' | 'created_at'>): MockQueueItem {
    const newItem: MockQueueItem = {
      ...item,
      id: `queue_${this.nextId++}`,
      created_at: new Date().toISOString()
    }
    this.queue.set(newItem.id, newItem)
    return newItem
  }

  updateQueueStatus(id: string, status: MockQueueItem['status'], updates?: Partial<MockQueueItem>): boolean {
    const item = this.queue.get(id)
    if (!item) return false
    
    Object.assign(item, { status, ...updates })
    return true
  }

  // Simulation methods
  simulateQueueProcessing() {
    const pendingItems = Array.from(this.queue.values()).filter(q => q.status === 'pending')
    
    // Sort by priority and creation time
    pendingItems.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    return pendingItems
  }

  getQueuePosition(customerId: string): { position: number; ahead: number; estimatedWaitHours: number } {
    const customerQueue = this.getQueueItemByCustomerId(customerId)
    if (!customerQueue || customerQueue.status !== 'pending') {
      return { position: 0, ahead: 0, estimatedWaitHours: 0 }
    }

    const pendingItems = this.simulateQueueProcessing()
    const customerIndex = pendingItems.findIndex(q => q.customer_id === customerId)
    
    if (customerIndex === -1) return { position: 0, ahead: 0, estimatedWaitHours: 0 }

    const position = customerIndex + 1
    const ahead = customerIndex
    const estimatedWaitHours = ahead * 0.5 // 30 minutes per item

    return { position, ahead, estimatedWaitHours }
  }

  // Reset for testing
  reset() {
    this.customers.clear()
    this.queue.clear()
    this.admins.clear()
    this.nextId = 1
    this.initializeTestData()
    
    // Set nextId to avoid conflicts with test data
    const maxCustomerId = Math.max(...Array.from(this.customers.keys()).map(id => parseInt(id.replace('cust_', ''))))
    const maxQueueId = Math.max(...Array.from(this.queue.keys()).map(id => parseInt(id.replace('queue_', ''))))
    const maxAdminId = Math.max(...Array.from(this.admins.keys()).map(id => parseInt(id.replace('admin_', ''))))
    this.nextId = Math.max(maxCustomerId, maxQueueId, maxAdminId) + 1
  }

  // Get test data
  getTestData() {
    return {
      customers: Array.from(this.customers.values()),
      queue: Array.from(this.queue.values()),
      admins: Array.from(this.admins.values())
    }
  }
}

class MockQueryBuilder {
  private client: MockSupabaseClient
  private table: string
  private selectFields: string[] = ['*']
  private filters: Array<{ method: string; field: string; value: any }> = []
  private singleResult = false

  constructor(client: MockSupabaseClient, table: string) {
    this.client = client
    this.table = table
  }

  select(fields: string = '*') {
    this.selectFields = fields.split(',').map(f => f.trim())
    return this
  }

  eq(field: string, value: any) {
    this.filters.push({ method: 'eq', field, value })
    return this
  }

  single() {
    this.singleResult = true
    return this
  }

  maybeSingle() {
    this.singleResult = true
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    // For simplicity, we'll handle ordering in the execute method
    return this
  }

  limit(count: number) {
    // For simplicity, we'll handle limiting in the execute method
    return this
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      let data: any[] = []

      // Get data based on table
      switch (this.table) {
        case 'customers':
          data = Array.from(this.client.customers.values())
          break
        case 'provisioning_queue':
          data = Array.from(this.client.queue.values())
          break
        case 'admins':
          data = Array.from(this.client.admins.values())
          break
        default:
          return { data: null, error: { code: 'PGRST116', message: 'Table not found' } }
      }

      // Apply filters
      this.filters.forEach(filter => {
        if (filter.method === 'eq') {
          data = data.filter(item => {
            const value = item[filter.field]
            if (typeof value === 'string') {
              return value.toLowerCase() === filter.value.toLowerCase()
            }
            return value === filter.value
          })
        }
      })

      // Handle single result
      if (this.singleResult) {
        if (data.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'No rows returned' } }
        }
        return { data: data[0], error: null }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: 'Database error occurred' } }
    }
  }

  // Simulate Supabase's Promise-based API
  then(resolve: (value: any) => any, reject?: (reason: any) => any) {
    return this.execute().then(resolve, reject)
  }
}

// Mock admin client
export const mockSupabaseAdmin = new MockSupabaseClient()

// Export for testing
export default MockSupabaseClient
