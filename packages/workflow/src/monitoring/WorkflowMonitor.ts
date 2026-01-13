import { EventEmitter } from 'eventemitter3';
import {
  WorkflowExecution,
  StepExecution,
  WorkflowEvent,
  WorkflowMetrics,
  WorkflowHealth,
  WorkflowStatus,
  StepStatus,
  WorkflowStore,
} from '../types';

export interface WorkflowMonitorEvents {
  'metrics.updated': (metrics: WorkflowMetrics) => void;
  'health.updated': (health: WorkflowHealth) => void;
  'alert.triggered': (alert: WorkflowAlert, workflowExecutionId?: string) => void;
}

export interface WorkflowAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  workflowExecutionId?: string;
  stepExecutionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: WorkflowMetrics, health: WorkflowHealth) => boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  enabled: boolean;
}

export class WorkflowMonitor extends EventEmitter<WorkflowMonitorEvents> {
  private store: WorkflowStore;
  private metrics = new Map<string, WorkflowMetrics>();
  private health: WorkflowHealth;
  private alertRules: AlertRule[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private readonly DEFAULT_INTERVAL = 5000; // 5 seconds

  constructor(store: WorkflowStore) {
    super();
    this.store = store;
    this.health = this.initializeHealth();
    this.setupDefaultAlertRules();
  }

  startMonitoring(intervalMs: number = this.DEFAULT_INTERVAL): void {
    if (this.monitoringInterval) {
      return;
    }

    this.monitoringInterval = setInterval(async () => {
      await this.updateMetrics();
      await this.updateHealth();
      await this.checkAlerts();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  async updateMetrics(): Promise<void> {
    // This would typically query the store for all executions
    // For now, we'll update metrics for specific workflow executions
    const updatedMetrics = new Map<string, WorkflowMetrics>();

    for (const [workflowId, existingMetrics] of this.metrics) {
      const newMetrics = await this.calculateWorkflowMetrics(workflowId);
      updatedMetrics.set(workflowId, newMetrics);
      
      // Emit event if metrics changed significantly
      if (this.metricsChanged(existingMetrics, newMetrics)) {
        this.emit('metrics.updated', newMetrics);
      }
    }

    this.metrics = updatedMetrics;
  }

  async updateHealth(): Promise<void> {
    const newHealth = await this.calculateOverallHealth();
    
    if (this.healthChanged(newHealth)) {
      this.health = newHealth;
      this.emit('health.updated', newHealth);
    }
  }

  async checkAlerts(): Promise<void> {
    for (const rule of this.alertRules.filter(r => r.enabled)) {
      for (const metrics of this.metrics.values()) {
        if (rule.condition(metrics, this.health)) {
          const alert: WorkflowAlert = {
            id: `alert-${Date.now()}-${Math.random()}`,
            type: rule.severity,
            message: rule.message,
            workflowExecutionId: metrics.workflowExecutionId,
            timestamp: new Date(),
          };

          this.emit('alert.triggered', alert, metrics.workflowExecutionId);
        }
      }
    }
  }

  async calculateWorkflowMetrics(workflowExecutionId: string): Promise<WorkflowMetrics> {
    const execution = await this.store.getExecution(workflowExecutionId);
    if (!execution) {
      throw new Error(`Workflow execution not found: ${workflowExecutionId}`);
    }

    const stepExecutions = await this.store.getStepExecutions(workflowExecutionId);

    const totalSteps = stepExecutions.length;
    const completedSteps = stepExecutions.filter(s => s.status === StepStatus.COMPLETED).length;
    const failedSteps = stepExecutions.filter(s => s.status === StepStatus.FAILED).length;
    const duration = execution.endTime ? 
      execution.endTime.getTime() - execution.startTime.getTime() :
      Date.now() - execution.startTime.getTime();

    const averageStepDuration = completedSteps > 0 ? 
      stepExecutions
        .filter(s => s.status === StepStatus.COMPLETED && s.endTime)
        .reduce((sum, s) => sum + (s.endTime!.getTime() - s.startTime.getTime()), 0) / completedSteps :
      0;

    const retryCount = stepExecutions.reduce((sum, s) => sum + s.attempts, 0) - totalSteps;
    const compensationCount = stepExecutions.filter(s => s.compensationExecuted).length;

    return {
      workflowExecutionId,
      totalSteps,
      completedSteps,
      failedSteps,
      duration,
      averageStepDuration,
      retryCount,
      compensationCount,
    };
  }

  async calculateOverallHealth(): Promise<WorkflowHealth> {
    // This would typically aggregate data from all workflow executions
    // For now, we'll use the current metrics
    const allMetrics = Array.from(this.metrics.values());
    
    const totalWorkflows = allMetrics.length;
    const runningWorkflows = allMetrics.filter(() => {
      // This would need to be determined from the execution status
      return true; // Placeholder
    }).length;
    
    const completedWorkflows = allMetrics.filter(m => 
      m.completedSteps === m.totalSteps && m.failedSteps === 0
    ).length;
    
    const failedWorkflows = allMetrics.filter(m => m.failedSteps > 0).length;

    const averageDuration = totalWorkflows > 0 ?
      allMetrics.reduce((sum, m) => sum + m.duration, 0) / totalWorkflows :
      0;

    const successRate = totalWorkflows > 0 ?
      (completedWorkflows / totalWorkflows) * 100 :
      0;

    return {
      totalWorkflows,
      runningWorkflows,
      completedWorkflows,
      failedWorkflows,
      averageDuration,
      successRate,
      lastUpdated: new Date(),
    };
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  removeAlertRule(ruleId: string): void {
    this.alertRules = this.alertRules.filter(r => r.id !== ruleId);
  }

  enableAlertRule(ruleId: string): void {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  disableAlertRule(ruleId: string): void {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  getMetrics(workflowExecutionId: string): WorkflowMetrics | undefined {
    return this.metrics.get(workflowExecutionId);
  }

  getAllMetrics(): WorkflowMetrics[] {
    return Array.from(this.metrics.values());
  }

  getHealth(): WorkflowHealth {
    return this.health;
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  private initializeHealth(): WorkflowHealth {
    return {
      totalWorkflows: 0,
      runningWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      averageDuration: 0,
      successRate: 0,
      lastUpdated: new Date(),
    };
  }

  private setupDefaultAlertRules(): void {
    // High failure rate alert
    this.addAlertRule({
      id: 'high-failure-rate',
      name: 'High Failure Rate',
      condition: (metrics) => {
        const failureRate = metrics.totalSteps > 0 ? 
          (metrics.failedSteps / metrics.totalSteps) * 100 : 0;
        return failureRate > 20; // More than 20% failure rate
      },
      severity: 'warning',
      message: 'Workflow has high failure rate',
      enabled: true,
    });

    // Long running workflow alert
    this.addAlertRule({
      id: 'long-running-workflow',
      name: 'Long Running Workflow',
      condition: (metrics) => metrics.duration > 300000, // 5 minutes
      severity: 'warning',
      message: 'Workflow is taking longer than expected',
      enabled: true,
    });

    // High retry count alert
    this.addAlertRule({
      id: 'high-retry-count',
      name: 'High Retry Count',
      condition: (metrics) => metrics.retryCount > 5,
      severity: 'error',
      message: 'Workflow has excessive retry attempts',
      enabled: true,
    });

    // Overall system health alert
    this.addAlertRule({
      id: 'system-health',
      name: 'System Health',
      condition: (_, health) => health.successRate < 80, // Less than 80% success rate
      severity: 'error',
      message: 'Overall system health is degraded',
      enabled: true,
    });
  }

  private metricsChanged(old: WorkflowMetrics, updated: WorkflowMetrics): boolean {
    return (
      old.completedSteps !== updated.completedSteps ||
      old.failedSteps !== updated.failedSteps ||
      old.duration !== updated.duration ||
      old.retryCount !== updated.retryCount ||
      old.compensationCount !== updated.compensationCount
    );
  }

  private healthChanged(newHealth: WorkflowHealth): boolean {
    return (
      this.health.totalWorkflows !== newHealth.totalWorkflows ||
      this.health.runningWorkflows !== newHealth.runningWorkflows ||
      this.health.completedWorkflows !== newHealth.completedWorkflows ||
      this.health.failedWorkflows !== newHealth.failedWorkflows ||
      this.health.successRate !== newHealth.successRate
    );
  }

  // Utility method to track a new workflow execution
  trackWorkflow(workflowExecutionId: string): void {
    // Initialize metrics for new workflow
    this.metrics.set(workflowExecutionId, {
      workflowExecutionId,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      duration: 0,
      averageStepDuration: 0,
      retryCount: 0,
      compensationCount: 0,
    });
  }

  // Utility method to stop tracking a workflow execution
  untrackWorkflow(workflowExecutionId: string): void {
    this.metrics.delete(workflowExecutionId);
  }
}
