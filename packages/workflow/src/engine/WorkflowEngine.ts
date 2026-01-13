import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStepDefinition,
  StepExecution,
  WorkflowContext,
  StepInput,
  StepOutput,
  WorkflowStatus,
  StepStatus,
  StepType,
  WorkflowEvent,
  WorkflowAction,
  WorkflowMiddleware,
  WorkflowStore,
  WorkflowRegistry,
  CompensationPlan,
  CompensationAction,
} from '../types';

export class WorkflowEngine extends EventEmitter {
  private store: WorkflowStore;
  private registry: WorkflowRegistry;
  private middleware: WorkflowMiddleware[] = [];
  private runningWorkflows = new Map<string, WorkflowExecution>();

  constructor(store: WorkflowStore, registry: WorkflowRegistry) {
    super();
    this.store = store;
    this.registry = registry;
  }

  addMiddleware(middleware: WorkflowMiddleware): void {
    this.middleware.push(middleware);
  }

  async executeWorkflow(workflowId: string, initialContext: WorkflowContext = {}): Promise<WorkflowExecution> {
    const workflow = this.registry.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId,
      status: WorkflowStatus.PENDING,
      context: { ...initialContext },
      startTime: new Date(),
      metadata: {},
    };

    await this.store.saveExecution(execution);
    this.runningWorkflows.set(execution.id, execution);

    await this.emitEvent('workflow.started', execution.id, { workflow });

    try {
      await this.executeWorkflowSteps(workflow, execution);
      execution.status = WorkflowStatus.COMPLETED;
      execution.endTime = new Date();
      await this.store.updateExecution(execution.id, execution);
      await this.emitEvent('workflow.completed', execution.id, { execution });
    } catch (error) {
      execution.status = WorkflowStatus.FAILED;
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = new Date();
      await this.store.updateExecution(execution.id, execution);
      await this.emitEvent('workflow.failed', execution.id, { error, execution });
      throw error;
    } finally {
      this.runningWorkflows.delete(execution.id);
      
      // Return the updated execution from store
      const updatedExecution = await this.store.getExecution(execution.id);
      return updatedExecution || execution;
    }
  }

  private async executeWorkflowSteps(workflow: WorkflowDefinition, execution: WorkflowExecution): Promise<void> {
    execution.status = WorkflowStatus.RUNNING;
    await this.store.updateExecution(execution.id, execution);

    for (const step of workflow.steps) {
      const stepExecution = await this.executeStep(step, execution);
      
      if (stepExecution.status === StepStatus.FAILED) {
        throw new Error(`Step ${step.id} failed: ${stepExecution.error}`);
      }
    }
  }

  private async executeStep(step: WorkflowStepDefinition, execution: WorkflowExecution): Promise<StepExecution> {
    const stepExecution: StepExecution = {
      id: uuidv4(),
      stepId: step.id,
      workflowExecutionId: execution.id,
      status: StepStatus.PENDING,
      startTime: new Date(),
      attempts: 0,
      compensationExecuted: false,
    };

    await this.store.saveStepExecution(stepExecution);
    await this.emitEvent('step.started', execution.id, { step, stepExecution });

    try {
      // Execute middleware before step
      for (const middleware of this.middleware) {
        if (middleware.beforeStep) {
          await middleware.beforeStep(step, execution.context);
        }
      }

      stepExecution.status = StepStatus.RUNNING;
      await this.store.updateStepExecution(stepExecution.id, stepExecution);

      let output: StepOutput;

      switch (step.type) {
        case StepType.TASK:
          output = await this.executeTask(step, execution.context);
          break;
        case StepType.PARALLEL:
          output = await this.executeParallelSteps(step, execution);
          break;
        case StepType.SEQUENCE:
          output = await this.executeSequenceSteps(step, execution);
          break;
        case StepType.CONDITION:
          output = await this.executeCondition(step, execution.context);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      stepExecution.status = StepStatus.COMPLETED;
      stepExecution.output = output;
      stepExecution.endTime = new Date();

      // Update execution context with step output
      Object.assign(execution.context, output);
      
      // Persist the updated context
      await this.store.updateExecution(execution.id, { context: execution.context });

      await this.store.updateStepExecution(stepExecution.id, stepExecution);
      await this.emitEvent('step.completed', execution.id, { step, stepExecution, output });

      // Execute middleware after step
      for (const middleware of this.middleware) {
        if (middleware.afterStep) {
          await middleware.afterStep(step, output, execution.context);
        }
      }

      return stepExecution;
    } catch (error) {
      stepExecution.status = StepStatus.FAILED;
      stepExecution.error = error instanceof Error ? error.message : String(error);
      stepExecution.endTime = new Date();
      stepExecution.attempts += 1;

      await this.store.updateStepExecution(stepExecution.id, stepExecution);
      await this.emitEvent('step.failed', execution.id, { step, stepExecution, error });

      // Execute middleware error handlers
      for (const middleware of this.middleware) {
        if (middleware.onError) {
          await middleware.onError(error instanceof Error ? error : new Error(String(error)), step, execution.context);
        }
      }

      // Handle retry logic
      if (step.retryPolicy && stepExecution.attempts < step.retryPolicy.maxAttempts) {
        const delay = step.retryPolicy.delay * Math.pow(step.retryPolicy.backoffMultiplier, stepExecution.attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeStep(step, execution);
      }

      return stepExecution;
    }
  }

  private async executeTask(step: WorkflowStepDefinition, context: WorkflowContext): Promise<StepOutput> {
    const action = this.registry.getAction(step.name);
    if (!action) {
      throw new Error(`Action not found: ${step.name}`);
    }

    const input = { ...step.input, ...context };
    
    if (action.validate && !action.validate(input)) {
      throw new Error(`Invalid input for step ${step.id}`);
    }

    return action.execute(input, context);
  }

  private async executeParallelSteps(step: WorkflowStepDefinition, execution: WorkflowExecution): Promise<StepOutput> {
    if (!step.parallelSteps) {
      throw new Error(`Parallel step ${step.id} has no parallel steps defined`);
    }

    const promises = step.parallelSteps.map((parallelStep: WorkflowStepDefinition) => 
      this.executeStep(parallelStep, execution)
    );

    const results = await Promise.allSettled(promises);
    const output: StepOutput = {};

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const parallelStep = step.parallelSteps![i];
      
      if (result.status === 'fulfilled') {
        output[parallelStep.id] = result.value.output;
      } else {
        throw new Error(`Parallel step ${parallelStep.id} failed: ${result.reason}`);
      }
    }

    return output;
  }

  private async executeSequenceSteps(step: WorkflowStepDefinition, execution: WorkflowExecution): Promise<StepOutput> {
    if (!step.sequenceSteps) {
      throw new Error(`Sequence step ${step.id} has no sequence steps defined`);
    }

    const output: StepOutput = {};

    for (const sequenceStep of step.sequenceSteps) {
      const result = await this.executeStep(sequenceStep, execution);
      
      if (result.status === StepStatus.FAILED) {
        throw new Error(`Sequence step ${sequenceStep.id} failed: ${result.error}`);
      }

      if (result.output) {
        output[sequenceStep.id] = result.output;
      }
    }

    return output;
  }

  private async executeCondition(step: WorkflowStepDefinition, context: WorkflowContext): Promise<StepOutput> {
    if (!step.conditions || step.conditions.length === 0) {
      throw new Error(`Condition step ${step.id} has no conditions defined`);
    }

    for (const condition of step.conditions) {
      const action = this.registry.getAction(condition);
      if (!action) {
        throw new Error(`Condition action not found: ${condition}`);
      }

      const result = await action.execute({}, context);
      
      if (result.result === true) {
        return result;
      }
    }

    throw new Error(`No condition matched for step ${step.id}`);
  }

  async compensateWorkflow(executionId: string): Promise<void> {
    const execution = await this.store.getExecution(executionId);
    if (!execution) {
      throw new Error(`Workflow execution not found: ${executionId}`);
    }

    const workflow = this.registry.getWorkflow(execution.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${execution.workflowId}`);
    }

    execution.status = WorkflowStatus.COMPENSATING;
    await this.store.updateExecution(execution.id, execution);
    await this.emitEvent('workflow.compensation.started', execution.id, { execution });

    const stepExecutions = await this.store.getStepExecutions(executionId);
    const compensationPlan = this.createCompensationPlan(workflow, stepExecutions);

    try {
      await this.executeCompensationPlan(compensationPlan, execution);
      
      execution.status = WorkflowStatus.COMPLETED;
      execution.endTime = new Date();
      await this.store.updateExecution(execution.id, execution);
      await this.emitEvent('workflow.compensation.completed', execution.id, { execution });
    } catch (error) {
      execution.status = WorkflowStatus.FAILED;
      execution.error = error instanceof Error ? error.message : String(error);
      await this.store.updateExecution(execution.id, execution);
      await this.emitEvent('workflow.compensation.failed', execution.id, { error, execution });
      throw error;
    }
  }

  private createCompensationPlan(workflow: WorkflowDefinition, stepExecutions: StepExecution[]): CompensationPlan {
    const actions: CompensationAction[] = [];
    const completedSteps = stepExecutions
      .filter(step => step.status === StepStatus.COMPLETED && !step.compensationExecuted)
      .reverse(); // Execute in reverse order

    for (const stepExecution of completedSteps) {
      const step = workflow.steps.find(s => s.id === stepExecution.stepId);
      if (step?.compensation) {
        actions.push({
          stepId: step.id,
          action: step.compensation.action,
          input: stepExecution.input,
          order: actions.length,
        });
      }
    }

    return {
      workflowExecutionId: stepExecutions[0]?.workflowExecutionId || '',
      actions,
      strategy: workflow.compensationStrategy,
    };
  }

  private async executeCompensationPlan(plan: CompensationPlan, execution: WorkflowExecution): Promise<void> {
    if (plan.strategy === 'parallel') {
      const promises = plan.actions.map(action => this.executeCompensationAction(action, execution));
      await Promise.all(promises);
    } else {
      for (const action of plan.actions) {
        await this.executeCompensationAction(action, execution);
      }
    }
  }

  private async executeCompensationAction(action: CompensationAction, execution: WorkflowExecution): Promise<void> {
    const actionImpl = this.registry.getAction(action.action);
    if (!actionImpl || !actionImpl.compensate) {
      throw new Error(`Compensation action not found: ${action.action}`);
    }

    try {
      await actionImpl.compensate(action.input || {}, execution.context);
      
      // Mark step as compensated
      const stepExecutions = await this.store.getStepExecutions(execution.id);
      const stepExecution = stepExecutions.find(s => s.stepId === action.stepId);
      if (stepExecution) {
        stepExecution.compensationExecuted = true;
        await this.store.updateStepExecution(stepExecution.id, stepExecution);
      }

      await this.emitEvent('step.compensated', execution.id, { action });
    } catch (error) {
      await this.emitEvent('step.compensation.failed', execution.id, { action, error });
      throw error;
    }
  }

  async cancelWorkflow(executionId: string): Promise<void> {
    const execution = this.runningWorkflows.get(executionId);
    if (!execution) {
      throw new Error(`Workflow not running: ${executionId}`);
    }

    execution.status = WorkflowStatus.CANCELLED;
    execution.endTime = new Date();
    await this.store.updateExecution(execution.id, execution);
    await this.emitEvent('workflow.cancelled', execution.id, { execution });
    
    this.runningWorkflows.delete(executionId);
  }

  private async emitEvent(type: string, workflowExecutionId: string, data: any): Promise<void> {
    const event: WorkflowEvent = {
      id: uuidv4(),
      type,
      workflowExecutionId,
      timestamp: new Date(),
      data,
    };

    await this.store.saveEvent(event);
    this.emit(type, event);
  }

  getRunningWorkflows(): WorkflowExecution[] {
    return Array.from(this.runningWorkflows.values());
  }

  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    return this.store.getExecution(executionId);
  }

  async getStepExecutions(executionId: string): Promise<StepExecution[]> {
    return this.store.getStepExecutions(executionId);
  }
}
