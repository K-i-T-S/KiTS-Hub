import {
  WorkflowExecution,
  StepExecution,
  WorkflowEvent,
  WorkflowStore,
} from '../types';

export class MemoryWorkflowStore implements WorkflowStore {
  private executions = new Map<string, WorkflowExecution>();
  private stepExecutions = new Map<string, StepExecution[]>();
  private events = new Map<string, WorkflowEvent[]>();

  async saveExecution(execution: WorkflowExecution): Promise<void> {
    this.executions.set(execution.id, { ...execution });
  }

  async getExecution(id: string): Promise<WorkflowExecution | null> {
    const execution = this.executions.get(id);
    return execution ? { ...execution } : null;
  }

  async updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<void> {
    const execution = this.executions.get(id);
    if (!execution) {
      throw new Error(`Workflow execution not found: ${id}`);
    }
    this.executions.set(id, { ...execution, ...updates });
  }

  async saveStepExecution(stepExecution: StepExecution): Promise<void> {
    const workflowId = stepExecution.workflowExecutionId;
    const existing = this.stepExecutions.get(workflowId) || [];
    existing.push({ ...stepExecution });
    this.stepExecutions.set(workflowId, existing);
  }

  async getStepExecutions(workflowExecutionId: string): Promise<StepExecution[]> {
    const executions = this.stepExecutions.get(workflowExecutionId) || [];
    return executions.map(e => ({ ...e }));
  }

  async updateStepExecution(id: string, updates: Partial<StepExecution>): Promise<void> {
    // Find and update the step execution
    for (const [workflowId, executions] of this.stepExecutions.entries()) {
      const index = executions.findIndex(e => e.id === id);
      if (index !== -1) {
        executions[index] = { ...executions[index], ...updates };
        this.stepExecutions.set(workflowId, executions);
        return;
      }
    }
    throw new Error(`Step execution not found: ${id}`);
  }

  async saveEvent(event: WorkflowEvent): Promise<void> {
    const workflowId = event.workflowExecutionId;
    const existing = this.events.get(workflowId) || [];
    existing.push({ ...event });
    this.events.set(workflowId, existing);
  }

  async getEvents(workflowExecutionId: string): Promise<WorkflowEvent[]> {
    const events = this.events.get(workflowExecutionId) || [];
    return events.map(e => ({ ...e }));
  }

  // Utility methods for testing and debugging
  clear(): void {
    this.executions.clear();
    this.stepExecutions.clear();
    this.events.clear();
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values()).map(e => ({ ...e }));
  }

  getAllStepExecutions(): StepExecution[] {
    const all: StepExecution[] = [];
    for (const executions of this.stepExecutions.values()) {
      all.push(...executions.map(e => ({ ...e })));
    }
    return all;
  }

  getAllEvents(): WorkflowEvent[] {
    const all: WorkflowEvent[] = [];
    for (const events of this.events.values()) {
      all.push(...events.map(e => ({ ...e })));
    }
    return all;
  }
}
