/**
 * Mock Supabase Client for Testing
 * Simulates Supabase behavior without requiring real database connection
 */
export interface MockCustomer {
    id: string;
    company_name: string;
    email: string;
    contact_name: string;
    created_at: string;
    plan_type: 'standard' | 'professional' | 'enterprise';
    priority: number;
}
export interface MockQueueItem {
    id: string;
    customer_id: string;
    status: 'pending' | 'in_progress' | 'credentials_received' | 'migrating' | 'completed' | 'failed';
    priority: number;
    created_at: string;
    assigned_to?: string;
    credentials?: {
        supabase_url?: string;
        supabase_key?: string;
        database_url?: string;
    };
    migration_progress?: number;
    estimated_completion?: string;
}
export interface MockAdmin {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    created_at: string;
}
declare class MockSupabaseClient {
    customers: Map<string, MockCustomer>;
    queue: Map<string, MockQueueItem>;
    admins: Map<string, MockAdmin>;
    private nextId;
    constructor();
    private initializeTestData;
    from(table: string): MockQueryBuilder;
    getCustomerById(id: string): MockCustomer | undefined;
    getCustomerByEmail(email: string): MockCustomer | undefined;
    getQueueItems(): MockQueueItem[];
    getQueueItemByCustomerId(customerId: string): MockQueueItem | undefined;
    getAdminById(id: string): MockAdmin | undefined;
    getAdminByEmail(email: string): MockAdmin | undefined;
    addCustomer(customer: Omit<MockCustomer, 'id' | 'created_at'>): MockCustomer;
    addQueueItem(item: Omit<MockQueueItem, 'id' | 'created_at'>): MockQueueItem;
    updateQueueStatus(id: string, status: MockQueueItem['status'], updates?: Partial<MockQueueItem>): boolean;
    simulateQueueProcessing(): MockQueueItem[];
    getQueuePosition(customerId: string): {
        position: number;
        ahead: number;
        estimatedWaitHours: number;
    };
    reset(): void;
    getTestData(): {
        customers: MockCustomer[];
        queue: MockQueueItem[];
        admins: MockAdmin[];
    };
}
declare class MockQueryBuilder {
    private client;
    private table;
    private selectFields;
    private filters;
    private singleResult;
    constructor(client: MockSupabaseClient, table: string);
    select(fields?: string): this;
    eq(field: string, value: any): this;
    single(): this;
    maybeSingle(): this;
    order(field: string, options?: {
        ascending?: boolean;
    }): this;
    limit(count: number): this;
    execute(): Promise<{
        data: any;
        error: any;
    }>;
    then(resolve: (value: any) => any, reject?: (reason: any) => any): Promise<any>;
}
export declare const mockSupabaseAdmin: MockSupabaseClient;
export default MockSupabaseClient;
//# sourceMappingURL=supabase-mock.d.ts.map