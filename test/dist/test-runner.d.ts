/**
 * Test Runner for Provisioning System
 * Executes all tests and provides detailed reporting
 */
export interface TestReport {
    suiteName: string;
    timestamp: string;
    summary: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        successRate: number;
        totalDuration: number;
    };
    testResults: Array<{
        testName: string;
        passed: boolean;
        duration: number;
        error?: string;
    }>;
    testData: {
        customers: any[];
        queueItems: any[];
        admins: any[];
    };
}
declare class TestRunner {
    private testSuite;
    constructor();
    runFullTestSuite(): Promise<TestReport>;
    runUserWorkflowTest(): Promise<void>;
    runAdminWorkflowTest(): Promise<void>;
    runIntegrationTest(): Promise<void>;
    private printReport;
    runAllTests(): Promise<void>;
}
export default TestRunner;
//# sourceMappingURL=test-runner.d.ts.map