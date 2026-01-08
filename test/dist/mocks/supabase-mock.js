"use strict";
/**
 * Mock Supabase Client for Testing
 * Simulates Supabase behavior without requiring real database connection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSupabaseAdmin = void 0;
class MockSupabaseClient {
    constructor() {
        this.customers = new Map();
        this.queue = new Map();
        this.admins = new Map();
        this.nextId = 1;
        this.initializeTestData();
    }
    initializeTestData() {
        // Add test customers
        const testCustomers = [
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
        ];
        // Add test queue items
        const testQueue = [
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
        ];
        // Add test admins
        const testAdmins = [
            {
                id: 'admin_1',
                email: 'admin@kits-hub.com',
                role: 'admin',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        testCustomers.forEach(c => this.customers.set(c.id, c));
        testQueue.forEach(q => this.queue.set(q.id, q));
        testAdmins.forEach(a => this.admins.set(a.id, a));
    }
    // Customer operations
    from(table) {
        return new MockQueryBuilder(this, table);
    }
    getCustomerById(id) {
        return this.customers.get(id);
    }
    getCustomerByEmail(email) {
        return Array.from(this.customers.values()).find(c => c.email.toLowerCase() === email.toLowerCase());
    }
    getQueueItems() {
        return Array.from(this.queue.values());
    }
    getQueueItemByCustomerId(customerId) {
        return Array.from(this.queue.values()).find(q => q.customer_id === customerId);
    }
    // Admin operations
    getAdminById(id) {
        return this.admins.get(id);
    }
    getAdminByEmail(email) {
        return Array.from(this.admins.values()).find(a => a.email.toLowerCase() === email.toLowerCase());
    }
    // Test utilities
    addCustomer(customer) {
        const newCustomer = {
            ...customer,
            id: `cust_${this.nextId++}`,
            created_at: new Date().toISOString()
        };
        this.customers.set(newCustomer.id, newCustomer);
        return newCustomer;
    }
    addQueueItem(item) {
        const newItem = {
            ...item,
            id: `queue_${this.nextId++}`,
            created_at: new Date().toISOString()
        };
        this.queue.set(newItem.id, newItem);
        return newItem;
    }
    updateQueueStatus(id, status, updates) {
        const item = this.queue.get(id);
        if (!item)
            return false;
        Object.assign(item, { status, ...updates });
        return true;
    }
    // Simulation methods
    simulateQueueProcessing() {
        const pendingItems = Array.from(this.queue.values()).filter(q => q.status === 'pending');
        // Sort by priority and creation time
        pendingItems.sort((a, b) => {
            if (a.priority !== b.priority)
                return b.priority - a.priority;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        return pendingItems;
    }
    getQueuePosition(customerId) {
        const customerQueue = this.getQueueItemByCustomerId(customerId);
        if (!customerQueue || customerQueue.status !== 'pending') {
            return { position: 0, ahead: 0, estimatedWaitHours: 0 };
        }
        const pendingItems = this.simulateQueueProcessing();
        const customerIndex = pendingItems.findIndex(q => q.customer_id === customerId);
        if (customerIndex === -1)
            return { position: 0, ahead: 0, estimatedWaitHours: 0 };
        const position = customerIndex + 1;
        const ahead = customerIndex;
        const estimatedWaitHours = ahead * 0.5; // 30 minutes per item
        return { position, ahead, estimatedWaitHours };
    }
    // Reset for testing
    reset() {
        this.customers.clear();
        this.queue.clear();
        this.admins.clear();
        this.nextId = 1;
        this.initializeTestData();
        // Set nextId to avoid conflicts with test data
        const maxCustomerId = Math.max(...Array.from(this.customers.keys()).map(id => parseInt(id.replace('cust_', ''))));
        const maxQueueId = Math.max(...Array.from(this.queue.keys()).map(id => parseInt(id.replace('queue_', ''))));
        const maxAdminId = Math.max(...Array.from(this.admins.keys()).map(id => parseInt(id.replace('admin_', ''))));
        this.nextId = Math.max(maxCustomerId, maxQueueId, maxAdminId) + 1;
    }
    // Get test data
    getTestData() {
        return {
            customers: Array.from(this.customers.values()),
            queue: Array.from(this.queue.values()),
            admins: Array.from(this.admins.values())
        };
    }
}
class MockQueryBuilder {
    constructor(client, table) {
        this.selectFields = ['*'];
        this.filters = [];
        this.singleResult = false;
        this.client = client;
        this.table = table;
    }
    select(fields = '*') {
        this.selectFields = fields.split(',').map(f => f.trim());
        return this;
    }
    eq(field, value) {
        this.filters.push({ method: 'eq', field, value });
        return this;
    }
    single() {
        this.singleResult = true;
        return this;
    }
    maybeSingle() {
        this.singleResult = true;
        return this;
    }
    order(field, options) {
        // For simplicity, we'll handle ordering in the execute method
        return this;
    }
    limit(count) {
        // For simplicity, we'll handle limiting in the execute method
        return this;
    }
    async execute() {
        try {
            let data = [];
            // Get data based on table
            switch (this.table) {
                case 'customers':
                    data = Array.from(this.client.customers.values());
                    break;
                case 'provisioning_queue':
                    data = Array.from(this.client.queue.values());
                    break;
                case 'admins':
                    data = Array.from(this.client.admins.values());
                    break;
                default:
                    return { data: null, error: { code: 'PGRST116', message: 'Table not found' } };
            }
            // Apply filters
            this.filters.forEach(filter => {
                if (filter.method === 'eq') {
                    data = data.filter(item => {
                        const value = item[filter.field];
                        if (typeof value === 'string') {
                            return value.toLowerCase() === filter.value.toLowerCase();
                        }
                        return value === filter.value;
                    });
                }
            });
            // Handle single result
            if (this.singleResult) {
                if (data.length === 0) {
                    return { data: null, error: { code: 'PGRST116', message: 'No rows returned' } };
                }
                return { data: data[0], error: null };
            }
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: { message: 'Database error occurred' } };
        }
    }
    // Simulate Supabase's Promise-based API
    then(resolve, reject) {
        return this.execute().then(resolve, reject);
    }
}
// Mock admin client
exports.mockSupabaseAdmin = new MockSupabaseClient();
// Export for testing
exports.default = MockSupabaseClient;
//# sourceMappingURL=supabase-mock.js.map