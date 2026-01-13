import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  CompensationPlan,
  CompensationAction,
  WorkflowExecution,
  StepExecution,
  WorkflowDefinition,
  WorkflowStepDefinition,
  WorkflowStore,
  WorkflowRegistry,
  WorkflowContext,
  StepOutput,
  WorkflowStatus,
  StepStatus,
} from '../types';

export interface CompensationEvents {
  'compensation.started': (executionId: string, plan: CompensationPlan) => void;
  'compensation.completed': (executionId: string) => void;
  'compensation.failed': (executionId: string, error: Error) => void;
  'step.compensation.started': (executionId: string, action: CompensationAction) => void;
  'step.compensation.completed': (executionId: string, action: CompensationAction) => void;
  'step.compensation.failed': (executionId: string, action: CompensationAction, error: Error) => void;
}

export interface CompensationStrategy {
  name: string;
  execute(plan: CompensationPlan, context: CompensationContext): Promise<void>;
}

export interface CompensationContext {
  workflowExecution: WorkflowExecution;
  workflowDefinition: WorkflowDefinition;
  stepExecutions: StepExecution[];
  store: WorkflowStore;
  registry: WorkflowRegistry;
}

export class CompensationManager extends EventEmitter<CompensationEvents> {
  private strategies = new Map<string, CompensationStrategy>();
  private store: WorkflowStore;
  private registry: WorkflowRegistry;

  constructor(store: WorkflowStore, registry: WorkflowRegistry) {
    super();
    this.store = store;
    this.registry = registry;
    this.setupDefaultStrategies();
  }

  registerStrategy(strategy: CompensationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  async executeCompensation(executionId: string): Promise<void> {
    const execution = await this.store.getExecution(executionId);
    if (!execution) {
      throw new Error(`Workflow execution not found: ${executionId}`);
    }

    const workflow = this.registry.getWorkflow(execution.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${execution.workflowId}`);
    }

    const stepExecutions = await this.store.getStepExecutions(executionId);
    const compensationPlan = this.createCompensationPlan(workflow, stepExecutions);
    
    if (compensationPlan.actions.length === 0) {
      return; // Nothing to compensate
    }

    const context: CompensationContext = {
      workflowExecution: execution,
      workflowDefinition: workflow,
      stepExecutions,
      store: this.store,
      registry: this.registry,
    };

    await this.store.updateExecution(executionId, {
      status: WorkflowStatus.COMPENSATING,
    });

    this.emit('compensation.started', executionId, compensationPlan);

    try {
      const strategy = this.strategies.get(compensationPlan.strategy);
      if (!strategy) {
        throw new Error(`Compensation strategy not found: ${compensationPlan.strategy}`);
      }

      await strategy.execute(compensationPlan, context);

      await this.store.updateExecution(executionId, {
        status: WorkflowStatus.COMPLETED,
        endTime: new Date(),
      });

      this.emit('compensation.completed', executionId);
    } catch (error) {
      await this.store.updateExecution(executionId, {
        status: WorkflowStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
        endTime: new Date(),
      });

      this.emit('compensation.failed', executionId, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  createCompensationPlan(workflow: WorkflowDefinition, stepExecutions: StepExecution[]): CompensationPlan {
    const actions: CompensationAction[] = [];
    
    // Get completed steps that haven't been compensated yet
    const completedSteps = stepExecutions
      .filter(step => step.status === StepStatus.COMPLETED && !step.compensationExecuted)
      .reverse(); // Execute in reverse order for compensation

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

  async executeCompensationAction(
    action: CompensationAction, 
    context: CompensationContext
  ): Promise<void> {
    const actionImpl = this.registry.getAction(action.action);
    if (!actionImpl || !actionImpl.compensate) {
      throw new Error(`Compensation action not found: ${action.action}`);
    }

    this.emit('step.compensation.started', context.workflowExecution.id, action);

    try {
      await actionImpl.compensate(action.input || {}, context.workflowExecution.context);
      
      // Mark step as compensated
      const stepExecution = context.stepExecutions.find(s => s.stepId === action.stepId);
      if (stepExecution) {
        stepExecution.compensationExecuted = true;
        await this.store.updateStepExecution(stepExecution.id, stepExecution);
      }

      this.emit('step.compensation.completed', context.workflowExecution.id, action);
    } catch (error) {
      this.emit('step.compensation.failed', context.workflowExecution.id, action, 
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  private setupDefaultStrategies(): void {
    // Sequential compensation strategy
    this.registerStrategy({
      name: 'sequential',
      execute: async (plan: CompensationPlan, context: CompensationContext) => {
        for (const action of plan.actions) {
          await this.executeCompensationAction(action, context);
        }
      },
    });

    // Parallel compensation strategy
    this.registerStrategy({
      name: 'parallel',
      execute: async (plan: CompensationPlan, context: CompensationContext) => {
        const promises = plan.actions.map(action => 
          this.executeCompensationAction(action, context)
        );
        await Promise.all(promises);
      },
    });

    // Custom compensation strategy with retry logic
    this.registerStrategy({
      name: 'custom',
      execute: async (plan: CompensationPlan, context: CompensationContext) => {
        // Custom strategy: Execute sequentially with retry logic
        for (const action of plan.actions) {
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            try {
              await this.executeCompensationAction(action, context);
              break; // Success, move to next action
            } catch (error) {
              attempts++;
              if (attempts >= maxAttempts) {
                throw error; // Re-throw after max attempts
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
          }
        }
      },
    });
  }

  // Utility methods for compensation analysis
  async getCompensationHistory(executionId: string): Promise<CompensationAction[]> {
    const stepExecutions = await this.store.getStepExecutions(executionId);
    return stepExecutions
      .filter(step => step.compensationExecuted)
      .map(step => ({
        stepId: step.stepId,
        action: '', // This would need to be stored separately
        input: step.input,
        order: 0,
      }));
  }

  async canCompensate(executionId: string): Promise<boolean> {
    const execution = await this.store.getExecution(executionId);
    if (!execution) {
      return false;
    }

    const workflow = this.registry.getWorkflow(execution.workflowId);
    if (!workflow) {
      return false;
    }

    const stepExecutions = await this.store.getStepExecutions(executionId);
    const plan = this.createCompensationPlan(workflow, stepExecutions);
    
    return plan.actions.length > 0;
  }

  async getCompensationPlan(executionId: string): Promise<CompensationPlan | null> {
    const execution = await this.store.getExecution(executionId);
    if (!execution) {
      return null;
    }

    const workflow = this.registry.getWorkflow(execution.workflowId);
    if (!workflow) {
      return null;
    }

    const stepExecutions = await this.store.getStepExecutions(executionId);
    return this.createCompensationPlan(workflow, stepExecutions);
  }

  // Validation methods
  validateCompensationPlan(plan: CompensationPlan): boolean {
    if (!plan.workflowExecutionId || !plan.actions || !plan.strategy) {
      return false;
    }

    // Check if strategy exists
    if (!this.strategies.has(plan.strategy)) {
      return false;
    }

    // Check if all actions have valid implementations
    for (const action of plan.actions) {
      const actionImpl = this.registry.getAction(action.action);
      if (!actionImpl || !actionImpl.compensate) {
        return false;
      }
    }

    return true;
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
