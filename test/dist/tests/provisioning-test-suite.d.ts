/**
 * Comprehensive Test Suite for Provisioning System
 * Tests both admin and user workflows without requiring real database
 */
export interface TestResult {
    testName: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: any;
}
export interface TestSuite {
    name: string;
    tests: TestResult[];
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
}
declare class ProvisioningTestSuite {
    private results;
    private runTest;
    private assert;
    private assertEqual;
    private assertNotNull;
    testCustomerCreation(): Promise<void>;
    testDuplicateCustomerCreation(): Promise<void>;
    testQueuePositionCalculation(): Promise<void>;
    testQueueProcessingOrder(): Promise<void>;
    testAdminTaskClaiming(): Promise<void>;
    testCredentialsSubmission(): Promise<void>;
    testMigrationProcess(): Promise<void>;
    testQueueStatusRetrieval(): Promise<void>;
    testErrorHandling(): Promise<void>;
    testPlanPrioritySystem(): Promise<void>;
    runAllTests(): Promise<TestSuite>;
    resetTestData(): void;
}
export default ProvisioningTestSuite;
//# sourceMappingURL=provisioning-test-suite.d.ts.map