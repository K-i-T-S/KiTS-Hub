"use strict";
/**
 * Test Provisioning Service
 * Uses mock Supabase client for testing without real database
 */
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_mock_1 = require("../mocks/supabase-mock");
class TestProvisioningService {
    static async createProvisioningRequest(request) {
        try {
            console.log('🧪 Test: Creating provisioning request for', request.email);
            // Check if customer already exists
            const existingCustomer = supabase_mock_1.mockSupabaseAdmin.getCustomerByEmail(request.email);
            if (existingCustomer) {
                return {
                    success: false,
                    error: 'Customer with this email already exists'
                };
            }
            // Create customer
            const customer = supabase_mock_1.mockSupabaseAdmin.addCustomer({
                company_name: request.company_name,
                email: request.email,
                contact_name: request.contact_name,
                plan_type: request.plan_type,
                priority: request.plan_type === 'enterprise' ? 2 : request.plan_type === 'professional' ? 1 : 0
            });
            // Create queue item
            const queueItem = supabase_mock_1.mockSupabaseAdmin.addQueueItem({
                customer_id: customer.id,
                status: 'pending',
                priority: customer.priority
            });
            console.log('🧪 Test: Created customer and queue item', { customer_id: customer.id, queue_id: queueItem.id });
            return {
                success: true,
                data: { customer_id: customer.id }
            };
        }
        catch (error) {
            console.error('🧪 Test: Error creating provisioning request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getQueuePosition(customerId) {
        try {
            console.log('🧪 Test: Getting queue position for customer', customerId);
            const position = supabase_mock_1.mockSupabaseAdmin.getQueuePosition(customerId);
            const queueItem = supabase_mock_1.mockSupabaseAdmin.getQueueItemByCustomerId(customerId);
            if (!queueItem) {
                return {
                    success: false,
                    error: 'Customer not found in queue'
                };
            }
            console.log('🧪 Test: Queue position calculated', position);
            return {
                success: true,
                data: {
                    position: position.position,
                    estimated_wait_hours: position.estimatedWaitHours,
                    ahead_in_queue: position.ahead,
                    status: queueItem.status
                }
            };
        }
        catch (error) {
            console.error('🧪 Test: Error getting queue position:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getProvisioningQueue(status) {
        try {
            console.log('🧪 Test: Getting provisioning queue', status ? `with status: ${status}` : 'all statuses');
            let queueItems = supabase_mock_1.mockSupabaseAdmin.getQueueItems();
            if (status && status !== 'all') {
                queueItems = queueItems.filter((item) => item.status === status);
            }
            // Sort by priority and creation time
            queueItems.sort((a, b) => {
                if (a.priority !== b.priority)
                    return b.priority - a.priority;
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });
            console.log('🧪 Test: Retrieved queue items', queueItems.length);
            return {
                success: true,
                data: queueItems
            };
        }
        catch (error) {
            console.error('🧪 Test: Error getting provisioning queue:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async claimTask(queueId, adminId) {
        try {
            console.log('🧪 Test: Claiming task', { queueId, adminId });
            const queueItems = supabase_mock_1.mockSupabaseAdmin.getQueueItems();
            const queueItem = queueItems.find((item) => item.id === queueId);
            if (!queueItem) {
                return {
                    success: false,
                    error: 'Queue item not found'
                };
            }
            if (queueItem.status !== 'pending') {
                return {
                    success: false,
                    error: 'Task is not in pending status'
                };
            }
            const updated = supabase_mock_1.mockSupabaseAdmin.updateQueueStatus(queueId, 'in_progress', {
                assigned_to: adminId
            });
            if (!updated) {
                return {
                    success: false,
                    error: 'Failed to update queue item'
                };
            }
            const updatedItem = supabase_mock_1.mockSupabaseAdmin.getQueueItems().find((item) => item.id === queueId);
            console.log('🧪 Test: Task claimed successfully', { queueId, adminId });
            return {
                success: true,
                data: updatedItem
            };
        }
        catch (error) {
            console.error('🧪 Test: Error claiming task:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async submitCredentials(queueId, credentials) {
        try {
            console.log('🧪 Test: Submitting credentials for queue item', queueId);
            const updated = supabase_mock_1.mockSupabaseAdmin.updateQueueStatus(queueId, 'credentials_received', {
                credentials
            });
            if (!updated) {
                return {
                    success: false,
                    error: 'Failed to update queue item'
                };
            }
            const updatedItem = supabase_mock_1.mockSupabaseAdmin.getQueueItems().find((item) => item.id === queueId);
            console.log('🧪 Test: Credentials submitted successfully', queueId);
            return {
                success: true,
                data: updatedItem
            };
        }
        catch (error) {
            console.error('🧪 Test: Error submitting credentials:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async startMigration(queueId) {
        try {
            console.log('🧪 Test: Starting migration for queue item', queueId);
            const updated = supabase_mock_1.mockSupabaseAdmin.updateQueueStatus(queueId, 'migrating', {
                migration_progress: 0
            });
            if (!updated) {
                return {
                    success: false,
                    error: 'Failed to update queue item'
                };
            }
            const updatedItem = supabase_mock_1.mockSupabaseAdmin.getQueueItems().find((item) => item.id === queueId);
            console.log('🧪 Test: Migration started successfully', queueId);
            return {
                success: true,
                data: updatedItem
            };
        }
        catch (error) {
            console.error('🧪 Test: Error starting migration:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async completeMigration(queueId) {
        try {
            console.log('🧪 Test: Completing migration for queue item', queueId);
            const updated = supabase_mock_1.mockSupabaseAdmin.updateQueueStatus(queueId, 'completed', {
                migration_progress: 100,
                estimated_completion: new Date().toISOString()
            });
            if (!updated) {
                return {
                    success: false,
                    error: 'Failed to update queue item'
                };
            }
            const updatedItem = supabase_mock_1.mockSupabaseAdmin.getQueueItems().find((item) => item.id === queueId);
            console.log('🧪 Test: Migration completed successfully', queueId);
            return {
                success: true,
                data: updatedItem
            };
        }
        catch (error) {
            console.error('🧪 Test: Error completing migration:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // Test utilities
    static getTestData() {
        return supabase_mock_1.mockSupabaseAdmin.getTestData();
    }
    static resetTestData() {
        supabase_mock_1.mockSupabaseAdmin.reset();
        console.log('🧪 Test: Test data reset');
    }
    static simulateQueueProcessing() {
        return supabase_mock_1.mockSupabaseAdmin.simulateQueueProcessing();
    }
}
exports.default = TestProvisioningService;
//# sourceMappingURL=test-provisioning-service.js.map