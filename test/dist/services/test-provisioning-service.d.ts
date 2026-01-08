/**
 * Test Provisioning Service
 * Uses mock Supabase client for testing without real database
 */
import { MockCustomer, MockQueueItem } from '../mocks/supabase-mock';
export interface TestQueuePosition {
    position: number;
    estimated_wait_hours: number;
    ahead_in_queue: number;
    status: string;
}
export interface TestProvisioningRequest {
    customer_id: string;
    company_name: string;
    email: string;
    contact_name: string;
    plan_type: 'standard' | 'professional' | 'enterprise';
}
export interface TestApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
declare class TestProvisioningService {
    static createProvisioningRequest(request: TestProvisioningRequest): Promise<TestApiResponse<{
        customer_id: string;
    }>>;
    static getQueuePosition(customerId: string): Promise<TestApiResponse<TestQueuePosition>>;
    static getProvisioningQueue(status?: string): Promise<TestApiResponse<MockQueueItem[]>>;
    static claimTask(queueId: string, adminId: string): Promise<TestApiResponse<MockQueueItem>>;
    static submitCredentials(queueId: string, credentials: any): Promise<TestApiResponse<MockQueueItem>>;
    static startMigration(queueId: string): Promise<TestApiResponse<MockQueueItem>>;
    static completeMigration(queueId: string): Promise<TestApiResponse<MockQueueItem>>;
    static getTestData(): {
        customers: MockCustomer[];
        queue: MockQueueItem[];
        admins: import("../mocks/supabase-mock").MockAdmin[];
    };
    static resetTestData(): void;
    static simulateQueueProcessing(): MockQueueItem[];
}
export default TestProvisioningService;
//# sourceMappingURL=test-provisioning-service.d.ts.map