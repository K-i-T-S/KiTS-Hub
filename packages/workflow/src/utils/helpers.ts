import {
  WorkflowDefinition,
  WorkflowExecution,
  StepExecution,
  WorkflowStatus,
  StepStatus,
  WorkflowMetrics,
  WorkflowAction,
  WorkflowContext,
  StepInput,
  StepOutput,
} from '../types';

// Helper function to create a simple workflow action
export function createAction(
  name: string,
  executeFn: (input: StepInput, context: WorkflowContext) => Promise<StepOutput>,
  compensateFn?: (input: StepInput, context: WorkflowContext) => Promise<void>,
  validateFn?: (input: StepInput) => boolean
): WorkflowAction {
  return {
    execute: executeFn,
    compensate: compensateFn,
    validate: validateFn,
  };
}

// Helper function to create a simple async action
export function createAsyncAction<T>(
  name: string,
  asyncFn: (input: StepInput, context: WorkflowContext) => Promise<T>,
  compensateFn?: (input: StepInput, context: WorkflowContext) => Promise<void>
): WorkflowAction {
  return createAction(
    name,
    async (input, context) => ({ result: await asyncFn(input, context) }),
    compensateFn
  );
}

// Helper function to create a synchronous action
export function createSyncAction<T>(
  name: string,
  syncFn: (input: StepInput, context: WorkflowContext) => T,
  compensateFn?: (input: StepInput, context: WorkflowContext) => Promise<void>
): WorkflowAction {
  return createAction(
    name,
    async (input, context) => ({ result: syncFn(input, context) }),
    compensateFn
  );
}

// Helper function to check if a workflow is running
export function isWorkflowRunning(execution: WorkflowExecution): boolean {
  return execution.status === WorkflowStatus.RUNNING;
}

// Helper function to check if a workflow is completed
export function isWorkflowCompleted(execution: WorkflowExecution): boolean {
  return execution.status === WorkflowStatus.COMPLETED;
}

// Helper function to check if a workflow failed
export function isWorkflowFailed(execution: WorkflowExecution): boolean {
  return execution.status === WorkflowStatus.FAILED;
}

// Helper function to check if a workflow is compensating
export function isWorkflowCompensating(execution: WorkflowExecution): boolean {
  return execution.status === WorkflowStatus.COMPENSATING;
}

// Helper function to get workflow duration
export function getWorkflowDuration(execution: WorkflowExecution): number {
  const endTime = execution.endTime || new Date();
  return endTime.getTime() - execution.startTime.getTime();
}

// Helper function to get step duration
export function getStepDuration(stepExecution: StepExecution): number | null {
  if (!stepExecution.endTime) {
    return null;
  }
  return stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
}

// Helper function to calculate success rate
export function calculateSuccessRate(metrics: WorkflowMetrics[]): number {
  if (metrics.length === 0) {
    return 0;
  }
  
  const successfulWorkflows = metrics.filter(m => m.failedSteps === 0).length;
  return (successfulWorkflows / metrics.length) * 100;
}

// Helper function to calculate average duration
export function calculateAverageDuration(metrics: WorkflowMetrics[]): number {
  if (metrics.length === 0) {
    return 0;
  }
  
  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  return totalDuration / metrics.length;
}

// Helper function to format duration
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Helper function to validate workflow definition
export function validateWorkflowDefinition(workflow: WorkflowDefinition): string[] {
  const errors: string[] = [];
  
  if (!workflow.id) {
    errors.push('Workflow ID is required');
  }
  
  if (!workflow.name) {
    errors.push('Workflow name is required');
  }
  
  if (!workflow.version) {
    errors.push('Workflow version is required');
  }
  
  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push('Workflow must have at least one step');
  } else {
    // Check for duplicate step IDs
    const stepIds = workflow.steps.map(s => s.id);
    const uniqueStepIds = new Set(stepIds);
    if (stepIds.length !== uniqueStepIds.size) {
      errors.push('Workflow contains duplicate step IDs');
    }
    
    // Validate each step
    workflow.steps.forEach((step, index) => {
      if (!step.id) {
        errors.push(`Step ${index + 1} is missing ID`);
      }
      
      if (!step.name) {
        errors.push(`Step ${index + 1} is missing name`);
      }
      
      if (!step.type) {
        errors.push(`Step ${index + 1} is missing type`);
      }
    });
  }
  
  return errors;
}

// Helper function to create a retry delay
export function createRetryDelay(attempt: number, baseDelay: number, backoffMultiplier: number = 2): number {
  return baseDelay * Math.pow(backoffMultiplier, attempt - 1);
}

// Helper function to create a timeout promise
export function createTimeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

// Helper function to retry an async function
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = createRetryDelay(attempt, baseDelay, backoffMultiplier);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Helper function to create a workflow context
export function createWorkflowContext(initialData: Record<string, any> = {}): WorkflowContext {
  return {
    ...initialData,
    timestamp: new Date().toISOString(),
  };
}

// Helper function to merge contexts
export function mergeContexts(...contexts: WorkflowContext[]): WorkflowContext {
  return contexts.reduce((merged, context) => ({
    ...merged,
    ...context,
  }), {});
}

// Helper function to extract data from context
export function extractFromContext<T>(context: WorkflowContext, key: string): T | undefined {
  return context[key] as T;
}

// Helper function to set data in context
export function setInContext(context: WorkflowContext, key: string, value: any): WorkflowContext {
  return {
    ...context,
    [key]: value,
  };
}

// Helper function to create a workflow execution summary
export function createExecutionSummary(execution: WorkflowExecution, steps: StepExecution[]): {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  duration: number;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  successRate: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
} {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === StepStatus.COMPLETED).length;
  const failedSteps = steps.filter(s => s.status === StepStatus.FAILED).length;
  const successRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const duration = getWorkflowDuration(execution);
  
  return {
    id: execution.id,
    workflowId: execution.workflowId,
    status: execution.status,
    duration,
    totalSteps,
    completedSteps,
    failedSteps,
    successRate,
    startTime: execution.startTime,
    endTime: execution.endTime || undefined,
    error: execution.error || undefined,
  };
}

// Helper function to filter workflows by status
export function filterWorkflowsByStatus(executions: WorkflowExecution[], status: WorkflowStatus): WorkflowExecution[] {
  return executions.filter(execution => execution.status === status);
}

// Helper function to get workflow statistics
export function getWorkflowStatistics(executions: WorkflowExecution[]): {
  total: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  compensating: number;
  averageDuration: number;
  successRate: number;
} {
  const total = executions.length;
  const running = executions.filter(e => e.status === WorkflowStatus.RUNNING).length;
  const completed = executions.filter(e => e.status === WorkflowStatus.COMPLETED).length;
  const failed = executions.filter(e => e.status === WorkflowStatus.FAILED).length;
  const cancelled = executions.filter(e => e.status === WorkflowStatus.CANCELLED).length;
  const compensating = executions.filter(e => e.status === WorkflowStatus.COMPENSATING).length;
  
  const completedExecutions = executions.filter(e => e.endTime);
  const averageDuration = completedExecutions.length > 0
    ? completedExecutions.reduce((sum, e) => sum + getWorkflowDuration(e), 0) / completedExecutions.length
    : 0;
  
  const successRate = total > 0 ? (completed / total) * 100 : 0;
  
  return {
    total,
    running,
    completed,
    failed,
    cancelled,
    compensating,
    averageDuration,
    successRate,
  };
}
