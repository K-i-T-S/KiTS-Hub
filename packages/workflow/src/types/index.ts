import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Base workflow types
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMPENSATING = 'compensating',
}

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  COMPENSATING = 'compensating',
  COMPENSATED = 'compensated',
}

export enum StepType {
  TASK = 'task',
  PARALLEL = 'parallel',
  SEQUENCE = 'sequence',
  CONDITION = 'condition',
  COMPENSATION = 'compensation',
}

// Base schemas
export const WorkflowContextSchema = z.record(z.any());
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;

export const StepInputSchema = z.record(z.any());
export type StepInput = z.infer<typeof StepInputSchema>;

export const StepOutputSchema = z.record(z.any());
export type StepOutput = z.infer<typeof StepOutputSchema>;

// Workflow definition
export const WorkflowStepDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(StepType),
  description: z.string().optional(),
  input: StepInputSchema.optional(),
  compensation: z.object({
    id: z.string(),
    action: z.string(),
  }).optional(),
  retryPolicy: z.object({
    maxAttempts: z.number().default(3),
    delay: z.number().default(1000),
    backoffMultiplier: z.number().default(2),
  }).optional(),
  timeout: z.number().optional(),
  conditions: z.array(z.string()).optional(),
  parallelSteps: z.array(z.lazy(() => WorkflowStepDefinitionSchema)).optional(),
  sequenceSteps: z.array(z.lazy(() => WorkflowStepDefinitionSchema)).optional(),
});

export type WorkflowStepDefinition = z.infer<typeof WorkflowStepDefinitionSchema>;

export const WorkflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  steps: z.array(WorkflowStepDefinitionSchema),
  compensationStrategy: z.enum(['sequential', 'parallel', 'custom']).default('sequential'),
  retryPolicy: z.object({
    maxAttempts: z.number().default(3),
    delay: z.number().default(1000),
    backoffMultiplier: z.number().default(2),
  }).optional(),
  timeout: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

// Runtime types
export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: z.nativeEnum(WorkflowStatus),
  context: WorkflowContextSchema,
  startTime: z.date(),
  endTime: z.date().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;

export const StepExecutionSchema = z.object({
  id: z.string(),
  stepId: z.string(),
  workflowExecutionId: z.string(),
  status: z.nativeEnum(StepStatus),
  input: StepInputSchema.optional(),
  output: StepOutputSchema.optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  error: z.string().optional(),
  attempts: z.number().default(0),
  compensationExecuted: z.boolean().default(false),
});

export type StepExecution = z.infer<typeof StepExecutionSchema>;

// Event types
export const WorkflowEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  workflowExecutionId: z.string(),
  stepExecutionId: z.string().optional(),
  timestamp: z.date(),
  data: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;

// Compensation types
export const CompensationActionSchema = z.object({
  stepId: z.string(),
  action: z.string(),
  input: StepInputSchema.optional(),
  order: z.number(),
});

export type CompensationAction = z.infer<typeof CompensationActionSchema>;

export const CompensationPlanSchema = z.object({
  workflowExecutionId: z.string(),
  actions: z.array(CompensationActionSchema),
  strategy: z.enum(['sequential', 'parallel', 'custom']),
});

export type CompensationPlan = z.infer<typeof CompensationPlanSchema>;

// Monitoring types
export const WorkflowMetricsSchema = z.object({
  workflowExecutionId: z.string(),
  totalSteps: z.number(),
  completedSteps: z.number(),
  failedSteps: z.number(),
  duration: z.number(),
  averageStepDuration: z.number(),
  retryCount: z.number(),
  compensationCount: z.number(),
});

export type WorkflowMetrics = z.infer<typeof WorkflowMetricsSchema>;

export const WorkflowHealthSchema = z.object({
  totalWorkflows: z.number(),
  runningWorkflows: z.number(),
  completedWorkflows: z.number(),
  failedWorkflows: z.number(),
  averageDuration: z.number(),
  successRate: z.number(),
  lastUpdated: z.date(),
});

export type WorkflowHealth = z.infer<typeof WorkflowHealthSchema>;

// Action types
export interface WorkflowAction {
  execute(input: StepInput, context: WorkflowContext): Promise<StepOutput>;
  compensate?(input: StepInput, context: WorkflowContext): Promise<void>;
  validate?(input: StepInput): boolean;
}

export interface WorkflowMiddleware {
  name: string;
  beforeStep?(step: WorkflowStepDefinition, context: WorkflowContext): Promise<void>;
  afterStep?(step: WorkflowStepDefinition, output: StepOutput, context: WorkflowContext): Promise<void>;
  onError?(error: Error, step: WorkflowStepDefinition, context: WorkflowContext): Promise<void>;
}

// Registry types
export interface WorkflowRegistry {
  registerWorkflow(definition: WorkflowDefinition): void;
  getWorkflow(id: string): WorkflowDefinition | undefined;
  listWorkflows(): WorkflowDefinition[];
  registerAction(name: string, action: WorkflowAction): void;
  getAction(name: string): WorkflowAction | undefined;
}

// Store types
export interface WorkflowStore {
  saveExecution(execution: WorkflowExecution): Promise<void>;
  getExecution(id: string): Promise<WorkflowExecution | null>;
  updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<void>;
  saveStepExecution(stepExecution: StepExecution): Promise<void>;
  getStepExecutions(workflowExecutionId: string): Promise<StepExecution[]>;
  updateStepExecution(id: string, updates: Partial<StepExecution>): Promise<void>;
  saveEvent(event: WorkflowEvent): Promise<void>;
  getEvents(workflowExecutionId: string): Promise<WorkflowEvent[]>;
}
