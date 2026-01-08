/**
 * Comprehensive Test Suite for Provisioning System
 * Tests both admin and user workflows without requiring real database
 */

import TestProvisioningService, { TestProvisioningRequest, TestApiResponse } from '../services/test-provisioning-service'
import { mockSupabaseAdmin } from '../mocks/supabase-mock'

export interface TestResult {
  testName: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

export interface TestSuite {
  name: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
}

class ProvisioningTestSuite {
  private results: TestResult[] = []

  // Utility methods
  private async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now()
    let passed = false
    let error: string | undefined

    try {
      await testFn()
      passed = true
      console.log(`✅ ${testName}`)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
      console.log(`❌ ${testName}: ${error}`)
    }

    const duration = Date.now() - startTime
    const result: TestResult = { testName, passed, duration, error }
    this.results.push(result)
    return result
  }

  private assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(message)
    }
  }

  private assertEqual<T>(actual: T, expected: T, message: string) {
    if (actual !== expected) {
      throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`)
    }
  }

  private assertNotNull<T>(value: T | null | undefined, message: string) {
    if (value === null || value === undefined) {
      throw new Error(message)
    }
  }

  // Test: Customer Creation
  async testCustomerCreation(): Promise<void> {
    const testRequest: TestProvisioningRequest = {
      customer_id: '',
      company_name: 'Test Company',
      email: 'new-test@company.com', // Use unique email
      contact_name: 'Test Contact',
      plan_type: 'professional'
    }

    const result = await TestProvisioningService.createProvisioningRequest(testRequest)
    
    this.assert(result.success, 'Customer creation should succeed')
    this.assertNotNull(result.data, 'Customer data should be returned')
    this.assertNotNull(result.data?.customer_id, 'Customer ID should be generated')

    // Verify customer was created in mock
    const customer = mockSupabaseAdmin.getCustomerByEmail(testRequest.email)
    this.assertNotNull(customer, 'Customer should exist in mock database')
    this.assertEqual(customer?.company_name, testRequest.company_name, 'Company name should match')
    this.assertEqual(customer?.plan_type, testRequest.plan_type, 'Plan type should match')

    // Verify queue item was created
    const queueItem = mockSupabaseAdmin.getQueueItemByCustomerId(result.data!.customer_id)
    this.assertNotNull(queueItem, 'Queue item should be created')
    this.assertEqual(queueItem?.status, 'pending', 'Queue item should be pending')
    
    // Check that the priority matches the plan type
    const expectedPriority = testRequest.plan_type === 'enterprise' ? 2 : testRequest.plan_type === 'professional' ? 1 : 0
    this.assertEqual(queueItem?.priority, expectedPriority, `${testRequest.plan_type} plan should have priority ${expectedPriority}`)
  }

  // Test: Duplicate Customer Creation
  async testDuplicateCustomerCreation(): Promise<void> {
    const testRequest: TestProvisioningRequest = {
      customer_id: '',
      company_name: 'Duplicate Company',
      email: 'beta@testcompany.com', // Use existing test email from mock data
      contact_name: 'Duplicate Contact',
      plan_type: 'standard'
    }

    const result = await TestProvisioningService.createProvisioningRequest(testRequest)
    
    this.assert(!result.success, 'Duplicate customer creation should fail')
    this.assertNotNull(result.error, 'Error message should be provided')
    this.assert(result.error !== undefined && result.error.includes('already exists'), 'Error should mention existing customer')
  }

  // Test: Queue Position Calculation
  async testQueuePositionCalculation(): Promise<void> {
    // Get position for the customer we just created in the previous test
    const customer = mockSupabaseAdmin.getCustomerByEmail('new-test@company.com')
    this.assertNotNull(customer, 'Test customer should exist')

    const result = await TestProvisioningService.getQueuePosition(customer!.id)
    
    this.assert(result.success, 'Queue position calculation should succeed')
    this.assertNotNull(result.data, 'Position data should be returned')
    this.assert(result.data!.position > 0, 'Position should be greater than 0')
    this.assert(result.data!.estimated_wait_hours >= 0, 'Wait time should be non-negative')
    this.assertEqual(result.data!.status, 'pending', 'Status should be pending')
  }

  // Test: Queue Processing Order
  async testQueueProcessingOrder(): Promise<void> {
    const queueItems = TestProvisioningService.simulateQueueProcessing()
    
    this.assert(queueItems.length >= 2, 'Should have multiple queue items')
    
    // Verify priority ordering (enterprise first, then professional, then standard)
    for (let i = 0; i < queueItems.length - 1; i++) {
      const current = queueItems[i]
      const next = queueItems[i + 1]
      
      if (current.priority === next.priority) {
        // Same priority: earlier creation time first
        this.assert(
          new Date(current.created_at) <= new Date(next.created_at),
          'Same priority items should be ordered by creation time'
        )
      } else {
        // Different priority: higher priority first
        this.assert(
          current.priority > next.priority,
          'Higher priority items should come first'
        )
      }
    }
  }

  // Test: Admin Task Claiming
  async testAdminTaskClaiming(): Promise<void> {
    // Find a pending task
    const queueItems = mockSupabaseAdmin.getQueueItems()
    const pendingTask = queueItems.find(item => item.status === 'pending')
    
    this.assertNotNull(pendingTask, 'Should have pending tasks')
    
    const adminId = 'admin_1'
    const result = await TestProvisioningService.claimTask(pendingTask!.id, adminId)
    
    this.assert(result.success, 'Task claiming should succeed')
    this.assertNotNull(result.data, 'Updated task should be returned')
    this.assertEqual(result.data!.status, 'in_progress', 'Task should be in progress')
    this.assertEqual(result.data!.assigned_to, adminId, 'Task should be assigned to admin')
  }

  // Test: Credentials Submission
  async testCredentialsSubmission(): Promise<void> {
    // Find an in-progress task
    const queueItems = mockSupabaseAdmin.getQueueItems()
    const inProgressTask = queueItems.find(item => item.status === 'in_progress')
    
    this.assertNotNull(inProgressTask, 'Should have in-progress tasks')
    
    const credentials = {
      supabase_url: 'https://test.supabase.co',
      supabase_key: 'test-key',
      database_url: 'postgresql://test'
    }
    
    const result = await TestProvisioningService.submitCredentials(inProgressTask!.id, credentials)
    
    this.assert(result.success, 'Credentials submission should succeed')
    this.assertNotNull(result.data, 'Updated task should be returned')
    this.assertEqual(result.data!.status, 'credentials_received', 'Task should be in credentials_received state')
    this.assert(result.data!.credentials !== undefined, 'Credentials should be stored')
  }

  // Test: Migration Process
  async testMigrationProcess(): Promise<void> {
    // Find a credentials_received task
    const queueItems = mockSupabaseAdmin.getQueueItems()
    const credentialsTask = queueItems.find(item => item.status === 'credentials_received')
    
    if (!credentialsTask) {
      // Create one for testing
      const testRequest: TestProvisioningRequest = {
        customer_id: '',
        company_name: 'Migration Test Company',
        email: 'migration@test.com',
        contact_name: 'Migration Test',
        plan_type: 'enterprise'
      }
      
      const createResult = await TestProvisioningService.createProvisioningRequest(testRequest)
      const queueItem = mockSupabaseAdmin.getQueueItemByCustomerId(createResult.data!.customer_id)
      
      await TestProvisioningService.claimTask(queueItem!.id, 'admin_1')
      await TestProvisioningService.submitCredentials(queueItem!.id, { test: 'credentials' })
      
      const updatedQueue = mockSupabaseAdmin.getQueueItems()
      const credentialsTask = updatedQueue.find(item => item.status === 'credentials_received')
    }
    
    this.assertNotNull(credentialsTask, 'Should have credentials_received tasks')
    
    // Start migration
    const startResult = await TestProvisioningService.startMigration(credentialsTask!.id)
    this.assert(startResult.success, 'Migration start should succeed')
    this.assertEqual(startResult.data!.status, 'migrating', 'Task should be migrating')
    this.assertEqual(startResult.data!.migration_progress, 0, 'Progress should start at 0')
    
    // Complete migration
    const completeResult = await TestProvisioningService.completeMigration(credentialsTask!.id)
    this.assert(completeResult.success, 'Migration completion should succeed')
    this.assertEqual(completeResult.data!.status, 'completed', 'Task should be completed')
    this.assertEqual(completeResult.data!.migration_progress, 100, 'Progress should be 100')
    this.assert(completeResult.data!.estimated_completion !== undefined, 'Completion time should be set')
  }

  // Test: Queue Status Retrieval
  async testQueueStatusRetrieval(): Promise<void> {
    // Test all statuses
    const allStatusResult = await TestProvisioningService.getProvisioningQueue('all')
    this.assert(allStatusResult.success, 'All queue retrieval should succeed')
    this.assert(allStatusResult.data!.length > 0, 'Should have queue items')
    
    // Test pending status
    const pendingResult = await TestProvisioningService.getProvisioningQueue('pending')
    this.assert(pendingResult.success, 'Pending queue retrieval should succeed')
    
    // Verify all returned items have correct status
    pendingResult.data!.forEach(item => {
      this.assertEqual(item.status, 'pending', 'All items should be pending')
    })
    
    // Test completed status
    const completedResult = await TestProvisioningService.getProvisioningQueue('completed')
    this.assert(completedResult.success, 'Completed queue retrieval should succeed')
    
    // Verify all returned items have correct status
    completedResult.data!.forEach(item => {
      this.assertEqual(item.status, 'completed', 'All items should be completed')
    })
  }

  // Test: Error Handling
  async testErrorHandling(): Promise<void> {
    // Test invalid queue ID
    const invalidClaimResult = await TestProvisioningService.claimTask('invalid_id', 'admin_1')
    this.assert(!invalidClaimResult.success, 'Invalid queue ID should fail')
    this.assert(invalidClaimResult.error !== undefined && invalidClaimResult.error.includes('not found'), 'Error should mention not found')
    
    // Test claiming already claimed task
    const queueItems = mockSupabaseAdmin.getQueueItems()
    const inProgressTask = queueItems.find(item => item.status === 'in_progress')
    
    if (inProgressTask) {
      const doubleClaimResult = await TestProvisioningService.claimTask(inProgressTask.id, 'admin_1')
      this.assert(!doubleClaimResult.success, 'Double claiming should fail')
      this.assert(doubleClaimResult.error !== undefined && doubleClaimResult.error.includes('not in pending status'), 'Error should mention status')
    }
    
    // Test invalid customer for queue position
    const invalidPositionResult = await TestProvisioningService.getQueuePosition('invalid_customer_id')
    this.assert(!invalidPositionResult.success, 'Invalid customer should fail')
    this.assert(invalidPositionResult.error !== undefined && invalidPositionResult.error.includes('not found'), 'Error should mention not found')
  }

  // Test: Plan Priority System
  async testPlanPrioritySystem(): Promise<void> {
    // Create customers with different plans
    const enterpriseRequest: TestProvisioningRequest = {
      customer_id: '',
      company_name: 'Enterprise Corp',
      email: 'enterprise@test.com',
      contact_name: 'Enterprise Contact',
      plan_type: 'enterprise'
    }
    
    const professionalRequest: TestProvisioningRequest = {
      customer_id: '',
      company_name: 'Professional LLC',
      email: 'professional@test.com',
      contact_name: 'Professional Contact',
      plan_type: 'professional'
    }
    
    const standardRequest: TestProvisioningRequest = {
      customer_id: '',
      company_name: 'Standard Inc',
      email: 'standard@test.com',
      contact_name: 'Standard Contact',
      plan_type: 'standard'
    }
    
    const enterpriseResult = await TestProvisioningService.createProvisioningRequest(enterpriseRequest)
    const professionalResult = await TestProvisioningService.createProvisioningRequest(professionalRequest)
    const standardResult = await TestProvisioningService.createProvisioningRequest(standardRequest)
    
    // Verify priorities
    const enterpriseQueue = mockSupabaseAdmin.getQueueItemByCustomerId(enterpriseResult.data!.customer_id)
    const professionalQueue = mockSupabaseAdmin.getQueueItemByCustomerId(professionalResult.data!.customer_id)
    const standardQueue = mockSupabaseAdmin.getQueueItemByCustomerId(standardResult.data!.customer_id)
    
    this.assertEqual(enterpriseQueue!.priority, 2, 'Enterprise should have priority 2')
    this.assertEqual(professionalQueue!.priority, 1, 'Professional should have priority 1')
    this.assertEqual(standardQueue!.priority, 0, 'Standard should have priority 0')
    
    // Verify queue ordering
    const queueItems = TestProvisioningService.simulateQueueProcessing()
    const enterpriseIndex = queueItems.findIndex(item => item.customer_id === enterpriseResult.data!.customer_id)
    const professionalIndex = queueItems.findIndex(item => item.customer_id === professionalResult.data!.customer_id)
    const standardIndex = queueItems.findIndex(item => item.customer_id === standardResult.data!.customer_id)
    
    this.assert(enterpriseIndex < professionalIndex, 'Enterprise should come before professional')
    this.assert(professionalIndex < standardIndex, 'Professional should come before standard')
  }

  // Run all tests
  async runAllTests(): Promise<TestSuite> {
    console.log('🧪 Starting Provisioning System Test Suite...\n')
    
    this.results = []
    
    const tests = [
      { name: 'Customer Creation', fn: () => this.testCustomerCreation() },
      { name: 'Duplicate Customer Creation', fn: () => this.testDuplicateCustomerCreation() },
      { name: 'Queue Position Calculation', fn: () => this.testQueuePositionCalculation() },
      { name: 'Queue Processing Order', fn: () => this.testQueueProcessingOrder() },
      { name: 'Admin Task Claiming', fn: () => this.testAdminTaskClaiming() },
      { name: 'Credentials Submission', fn: () => this.testCredentialsSubmission() },
      { name: 'Migration Process', fn: () => this.testMigrationProcess() },
      { name: 'Queue Status Retrieval', fn: () => this.testQueueStatusRetrieval() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() },
      { name: 'Plan Priority System', fn: () => this.testPlanPrioritySystem() }
    ]
    
    for (const test of tests) {
      await this.runTest(test.name, test.fn)
    }
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    
    console.log('\n🧪 Test Suite Complete!')
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    console.log(`Duration: ${totalDuration}ms`)
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.testName}: ${r.error}`)
      })
    }
    
    return {
      name: 'Provisioning System Test Suite',
      tests: this.results,
      totalTests,
      passedTests,
      failedTests,
      totalDuration
    }
  }

  // Reset test data
  resetTestData(): void {
    TestProvisioningService.resetTestData()
    console.log('🧪 Test data reset')
  }
}

export default ProvisioningTestSuite
