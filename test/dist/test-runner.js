"use strict";
/**
 * Test Runner for Provisioning System
 * Executes all tests and provides detailed reporting
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const provisioning_test_suite_1 = __importDefault(require("./tests/provisioning-test-suite"));
const test_provisioning_service_1 = __importDefault(require("./services/test-provisioning-service"));
const supabase_mock_1 = require("./mocks/supabase-mock");
class TestRunner {
    constructor() {
        this.testSuite = new provisioning_test_suite_1.default();
    }
    async runFullTestSuite() {
        console.log('🚀 Starting KiTS Hub Provisioning System Test Suite');
        console.log('='.repeat(60));
        const startTime = Date.now();
        // Reset test data before running
        this.testSuite.resetTestData();
        // Run all tests
        const results = await this.testSuite.runAllTests();
        const endTime = Date.now();
        const totalDuration = endTime - startTime;
        // Get final test data state
        const testData = test_provisioning_service_1.default.getTestData();
        const report = {
            suiteName: results.name,
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: results.totalTests,
                passedTests: results.passedTests,
                failedTests: results.failedTests,
                successRate: results.totalTests > 0 ? (results.passedTests / results.totalTests) * 100 : 0,
                totalDuration: results.totalDuration
            },
            testResults: results.tests,
            testData: {
                customers: testData.customers,
                queueItems: testData.queue,
                admins: testData.admins
            }
        };
        this.printReport(report);
        return report;
    }
    async runUserWorkflowTest() {
        console.log('👤 Testing User Workflow...');
        console.log('-'.repeat(40));
        // Reset for clean test
        test_provisioning_service_1.default.resetTestData();
        try {
            // Step 1: User signs up
            console.log('1. Creating new customer account...');
            const signupResult = await test_provisioning_service_1.default.createProvisioningRequest({
                customer_id: '',
                company_name: 'User Test Company',
                email: 'user@test.com',
                contact_name: 'Test User',
                plan_type: 'professional'
            });
            if (!signupResult.success) {
                throw new Error(`Signup failed: ${signupResult.error}`);
            }
            console.log('✅ Customer account created successfully');
            // Step 2: User checks queue position
            console.log('2. Checking queue position...');
            const positionResult = await test_provisioning_service_1.default.getQueuePosition(signupResult.data.customer_id);
            if (!positionResult.success) {
                throw new Error(`Position check failed: ${positionResult.error}`);
            }
            console.log(`✅ Queue position: #${positionResult.data.position}`);
            console.log(`✅ Estimated wait time: ${positionResult.data.estimated_wait_hours} hours`);
            // Step 3: Simulate queue processing
            console.log('3. Simulating queue status changes...');
            // Admin claims task
            const queueItems = supabase_mock_1.mockSupabaseAdmin.getQueueItems();
            const userQueueItem = queueItems.find(item => item.customer_id === signupResult.data.customer_id);
            if (userQueueItem) {
                await test_provisioning_service_1.default.claimTask(userQueueItem.id, 'admin_1');
                console.log('✅ Task claimed by admin');
                await test_provisioning_service_1.default.submitCredentials(userQueueItem.id, {
                    supabase_url: 'https://user.supabase.co',
                    supabase_key: 'user-key'
                });
                console.log('✅ Credentials submitted');
                await test_provisioning_service_1.default.startMigration(userQueueItem.id);
                console.log('✅ Migration started');
                await test_provisioning_service_1.default.completeMigration(userQueueItem.id);
                console.log('✅ Migration completed');
                // Check final status
                const finalPosition = await test_provisioning_service_1.default.getQueuePosition(signupResult.data.customer_id);
                console.log(`✅ Final status: ${finalPosition.data.status}`);
            }
            console.log('🎉 User workflow test completed successfully!');
        }
        catch (error) {
            console.error('❌ User workflow test failed:', error);
            throw error;
        }
    }
    async runAdminWorkflowTest() {
        console.log('👨‍💼 Testing Admin Workflow...');
        console.log('-'.repeat(40));
        try {
            // Step 1: Admin views queue
            console.log('1. Retrieving provisioning queue...');
            const queueResult = await test_provisioning_service_1.default.getProvisioningQueue('pending');
            if (!queueResult.success) {
                throw new Error(`Queue retrieval failed: ${queueResult.error}`);
            }
            console.log(`✅ Found ${queueResult.data.length} pending items`);
            // Step 2: Admin claims a task
            if (queueResult.data.length > 0) {
                const firstTask = queueResult.data[0];
                console.log(`2. Claiming task for customer: ${firstTask.customer_id}`);
                const claimResult = await test_provisioning_service_1.default.claimTask(firstTask.id, 'admin_1');
                if (!claimResult.success) {
                    throw new Error(`Task claim failed: ${claimResult.error}`);
                }
                console.log('✅ Task claimed successfully');
                // Step 3: Admin submits credentials
                console.log('3. Submitting credentials...');
                const credentialsResult = await test_provisioning_service_1.default.submitCredentials(firstTask.id, {
                    supabase_url: 'https://admin.supabase.co',
                    supabase_key: 'admin-key',
                    database_url: 'postgresql://admin'
                });
                if (!credentialsResult.success) {
                    throw new Error(`Credentials submission failed: ${credentialsResult.error}`);
                }
                console.log('✅ Credentials submitted successfully');
                // Step 4: Admin starts migration
                console.log('4. Starting migration...');
                const migrationResult = await test_provisioning_service_1.default.startMigration(firstTask.id);
                if (!migrationResult.success) {
                    throw new Error(`Migration start failed: ${migrationResult.error}`);
                }
                console.log('✅ Migration started successfully');
                // Step 5: Admin completes migration
                console.log('5. Completing migration...');
                const completeResult = await test_provisioning_service_1.default.completeMigration(firstTask.id);
                if (!completeResult.success) {
                    throw new Error(`Migration completion failed: ${completeResult.error}`);
                }
                console.log('✅ Migration completed successfully');
                // Step 6: Check updated queue
                console.log('6. Checking updated queue status...');
                const updatedQueue = await test_provisioning_service_1.default.getProvisioningQueue('completed');
                console.log(`✅ Found ${updatedQueue.data.length} completed items`);
            }
            console.log('🎉 Admin workflow test completed successfully!');
        }
        catch (error) {
            console.error('❌ Admin workflow test failed:', error);
            throw error;
        }
    }
    async runIntegrationTest() {
        console.log('🔗 Testing Integration Scenarios...');
        console.log('-'.repeat(40));
        try {
            // Test 1: Multiple customers with different priorities
            console.log('1. Testing priority-based queue ordering...');
            // Create enterprise customer
            const enterpriseResult = await test_provisioning_service_1.default.createProvisioningRequest({
                customer_id: '',
                company_name: 'Enterprise Priority Co',
                email: 'enterprise@priority.com',
                contact_name: 'Enterprise Contact',
                plan_type: 'enterprise'
            });
            // Create standard customer
            const standardResult = await test_provisioning_service_1.default.createProvisioningRequest({
                customer_id: '',
                company_name: 'Standard Priority Co',
                email: 'standard@priority.com',
                contact_name: 'Standard Contact',
                plan_type: 'standard'
            });
            // Check queue ordering
            const queueItems = test_provisioning_service_1.default.simulateQueueProcessing();
            const enterpriseIndex = queueItems.findIndex(item => item.customer_id === enterpriseResult.data.customer_id);
            const standardIndex = queueItems.findIndex(item => item.customer_id === standardResult.data.customer_id);
            if (enterpriseIndex < standardIndex) {
                console.log('✅ Priority-based queue ordering works correctly');
            }
            else {
                throw new Error('Priority ordering failed');
            }
            // Test 2: Queue position calculation accuracy
            console.log('2. Testing queue position calculation...');
            const positionResult = await test_provisioning_service_1.default.getQueuePosition(standardResult.data.customer_id);
            const expectedPosition = standardIndex + 1;
            if (positionResult.data.position === expectedPosition) {
                console.log('✅ Queue position calculation is accurate');
            }
            else {
                throw new Error(`Position calculation failed. Expected: ${expectedPosition}, Actual: ${positionResult.data.position}`);
            }
            // Test 3: Wait time estimation
            console.log('3. Testing wait time estimation...');
            const expectedWaitTime = standardIndex * 0.5; // 30 minutes per person ahead
            const actualWaitTime = positionResult.data.estimated_wait_hours;
            if (Math.abs(actualWaitTime - expectedWaitTime) < 0.01) {
                console.log('✅ Wait time estimation is accurate');
            }
            else {
                throw new Error(`Wait time estimation failed. Expected: ${expectedWaitTime}, Actual: ${actualWaitTime}`);
            }
            console.log('🎉 Integration test completed successfully!');
        }
        catch (error) {
            console.error('❌ Integration test failed:', error);
            throw error;
        }
    }
    printReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('🧪 TEST REPORT');
        console.log('='.repeat(60));
        console.log(`Suite: ${report.suiteName}`);
        console.log(`Timestamp: ${report.timestamp}`);
        console.log(`Duration: ${report.summary.totalDuration}ms`);
        console.log('\n📊 SUMMARY:');
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Passed: ${report.summary.passedTests}`);
        console.log(`Failed: ${report.summary.failedTests}`);
        console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
        if (report.summary.failedTests > 0) {
            console.log('\n❌ FAILED TESTS:');
            report.testResults
                .filter(test => !test.passed)
                .forEach(test => {
                console.log(`  - ${test.testName}: ${test.error}`);
            });
        }
        console.log('\n📋 TEST DATA STATE:');
        console.log(`Customers: ${report.testData.customers.length}`);
        console.log(`Queue Items: ${report.testData.queueItems.length}`);
        console.log(`Admins: ${report.testData.admins.length}`);
        console.log('\n🎯 QUEUE STATUS BREAKDOWN:');
        const statusBreakdown = report.testData.queueItems.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});
        Object.entries(statusBreakdown).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
        console.log('\n' + '='.repeat(60));
        if (report.summary.successRate === 100) {
            console.log('🎉 ALL TESTS PASSED! System is ready for deployment.');
        }
        else {
            console.log('⚠️  Some tests failed. Please review and fix issues.');
        }
    }
    async runAllTests() {
        try {
            await this.runFullTestSuite();
            await this.runUserWorkflowTest();
            await this.runAdminWorkflowTest();
            await this.runIntegrationTest();
            console.log('\n🚀 ALL TEST WORKFLOWS COMPLETED SUCCESSFULLY!');
        }
        catch (error) {
            console.error('\n💥 TEST SUITE FAILED:', error);
            process.exit(1);
        }
    }
}
// Export for use in test scripts
exports.default = TestRunner;
// Run tests if this file is executed directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests();
}
//# sourceMappingURL=test-runner.js.map