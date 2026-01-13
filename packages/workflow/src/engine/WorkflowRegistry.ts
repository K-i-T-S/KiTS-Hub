import {
  WorkflowDefinition,
  WorkflowAction,
  WorkflowRegistry as IWorkflowRegistry,
  WorkflowStepDefinition,
  StepType,
} from '../types';

export class WorkflowRegistry implements IWorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();
  private actions = new Map<string, WorkflowAction>();

  registerWorkflow(definition: WorkflowDefinition): void {
    this.validateWorkflow(definition);
    this.workflows.set(definition.id, definition);
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  registerAction(name: string, action: WorkflowAction): void {
    this.validateAction(action);
    this.actions.set(name, action);
  }

  getAction(name: string): WorkflowAction | undefined {
    return this.actions.get(name);
  }

  listActions(): string[] {
    return Array.from(this.actions.keys());
  }

  private validateWorkflow(definition: WorkflowDefinition): void {
    if (!definition.id || !definition.name || !definition.version) {
      throw new Error('Workflow must have id, name, and version');
    }

    if (!definition.steps || definition.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate each step
    for (const step of definition.steps) {
      this.validateStep(step);
    }

    // Check for duplicate step IDs
    const stepIds = definition.steps.map(s => s.id);
    const uniqueStepIds = new Set(stepIds);
    if (stepIds.length !== uniqueStepIds.size) {
      throw new Error('Workflow contains duplicate step IDs');
    }
  }

  private validateStep(step: WorkflowStepDefinition): void {
    if (!step.id || !step.name || !step.type) {
      throw new Error('Step must have id, name, and type');
    }

    switch (step.type) {
      case StepType.PARALLEL:
        if (!step.parallelSteps || step.parallelSteps.length === 0) {
          throw new Error('Parallel step must have parallelSteps');
        }
        for (const parallelStep of step.parallelSteps) {
          this.validateStep(parallelStep);
        }
        break;

      case StepType.SEQUENCE:
        if (!step.sequenceSteps || step.sequenceSteps.length === 0) {
          throw new Error('Sequence step must have sequenceSteps');
        }
        for (const sequenceStep of step.sequenceSteps) {
          this.validateStep(sequenceStep);
        }
        break;

      case StepType.CONDITION:
        if (!step.conditions || step.conditions.length === 0) {
          throw new Error('Condition step must have conditions');
        }
        break;

      case StepType.TASK:
        // Task steps must have a corresponding action
        if (!this.getAction(step.name)) {
          throw new Error(`Task step '${step.name}' has no registered action`);
        }
        break;
    }

    // Validate compensation if present
    if (step.compensation) {
      if (!step.compensation.id || !step.compensation.action) {
        throw new Error('Compensation must have id and action');
      }
      if (!this.getAction(step.compensation.action)) {
        throw new Error(`Compensation action '${step.compensation.action}' is not registered`);
      }
    }
  }

  private validateAction(action: WorkflowAction): void {
    if (typeof action.execute !== 'function') {
      throw new Error('Action must have an execute method');
    }
  }
}
