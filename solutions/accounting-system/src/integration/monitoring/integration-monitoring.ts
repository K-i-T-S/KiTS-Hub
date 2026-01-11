/**
 * KiTS Hub Integration Monitoring Service
 * Comprehensive monitoring and observability for all integrations
 */

export interface IntegrationMetrics {
  api_calls: number;
  response_times: number[];
  error_rates: number;
  success_rates: number;
  throughput: number;
  uptime: number;
}

export interface HealthCheck {
  service: string;
  healthy: boolean;
  last_check: string;
  response_time?: number;
  error?: string;
  dependencies?: HealthCheck[];
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  service: string;
  message: string;
  details: Record<string, any>;
  created_at: string;
  resolved_at?: string;
  status: AlertStatus;
}

export enum AlertType {
  HIGH_ERROR_RATE = 'high_error_rate',
  SLOW_RESPONSE = 'slow_response',
  SERVICE_DOWN = 'service_down',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  WEBHOOK_FAILURE = 'webhook_failure',
  SYNC_FAILURE = 'sync_failure',
  PAYMENT_FAILURE = 'payment_failure',
  EMAIL_FAILURE = 'email_failure',
  SMS_FAILURE = 'sms_failure'
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed'
}

export interface MonitoringConfig {
  metrics_interval: number;
  health_check_interval: number;
  alert_thresholds: {
    error_rate: number;
    response_time: number;
    uptime: number;
  };
  notification_channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'slack';
  config: Record<string, any>;
  enabled: boolean;
}

export class IntegrationMonitoringService {
  private static instance: IntegrationMonitoringService;
  private metrics: Map<string, IntegrationMetrics> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private config: MonitoringConfig;
  private monitoring = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.startMonitoring();
  }

  static getInstance(): IntegrationMonitoringService {
    if (!IntegrationMonitoringService.instance) {
      IntegrationMonitoringService.instance = new IntegrationMonitoringService();
    }
    return IntegrationMonitoringService.instance;
  }

  /**
   * Start monitoring services
   */
  private startMonitoring(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    
    // Start metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, this.config.metrics_interval);

    // Start health checks
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.health_check_interval);

    // Start alert processing
    setInterval(() => {
      this.processAlerts();
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop monitoring services
   */
  stopMonitoring(): void {
    this.monitoring = false;
  }

  /**
   * Record API call metrics
   */
  recordApiCall(service: string, responseTime: number, success: boolean): void {
    const metrics = this.getOrCreateMetrics(service);
    
    metrics.api_calls++;
    metrics.response_times.push(responseTime);
    
    // Keep only last 1000 response times for memory efficiency
    if (metrics.response_times.length > 1000) {
      metrics.response_times = metrics.response_times.slice(-1000);
    }
    
    if (success) {
      metrics.success_rates = (metrics.success_rates * (metrics.api_calls - 1) + 1) / metrics.api_calls;
    } else {
      metrics.error_rates = (metrics.error_rates * (metrics.api_calls - 1) + 1) / metrics.api_calls;
      metrics.success_rates = 1 - metrics.error_rates;
    }
    
    // Update throughput (calls per second)
    metrics.throughput = metrics.api_calls / (Date.now() / 1000);
  }

  /**
   * Get or create metrics for service
   */
  private getOrCreateMetrics(service: string): IntegrationMetrics {
    if (!this.metrics.has(service)) {
      this.metrics.set(service, {
        api_calls: 0,
        response_times: [],
        error_rates: 0,
        success_rates: 1,
        throughput: 0,
        uptime: 1
      });
    }
    return this.metrics.get(service)!;
  }

  /**
   * Collect metrics from all services
   */
  private collectMetrics(): void {
    for (const [service, metrics] of this.metrics.entries()) {
      // Calculate average response time
      if (metrics.response_times.length > 0) {
        const avgResponseTime = metrics.response_times.reduce((sum, time) => sum + time, 0) / metrics.response_times.length;
        
        // Check for slow response alerts
        if (avgResponseTime > this.config.alert_thresholds.response_time) {
          this.createAlert({
            type: AlertType.SLOW_RESPONSE,
            severity: AlertSeverity.WARNING,
            service,
            message: `Average response time (${avgResponseTime.toFixed(2)}ms) exceeds threshold (${this.config.alert_thresholds.response_time}ms)`,
            details: { avg_response_time: avgResponseTime, threshold: this.config.alert_thresholds.response_time }
          });
        }
      }
      
      // Check for high error rate
      if (metrics.error_rates > this.config.alert_thresholds.error_rate) {
        this.createAlert({
          type: AlertType.HIGH_ERROR_RATE,
          severity: AlertSeverity.WARNING,
          service,
          message: `Error rate (${(metrics.error_rates * 100).toFixed(2)}%) exceeds threshold (${(this.config.alert_thresholds.error_rate * 100).toFixed(2)}%)`,
          details: { error_rate: metrics.error_rates, threshold: this.config.alert_thresholds.error_rate }
        });
      }
    }
  }

  /**
   * Perform health checks on all services
   */
  private async performHealthChecks(): Promise<void> {
    const services = [
      'authentication',
      'webhooks',
      'data_sync',
      'payment_gateway',
      'email_service',
      'sms_service',
      'inventory_api',
      'pos_api',
      'crm_api',
      'analytics_api'
    ];

    for (const service of services) {
      const healthCheck = await this.checkServiceHealth(service);
      this.healthChecks.set(service, healthCheck);
      
      // Create alert if service is down
      if (!healthCheck.healthy) {
        this.createAlert({
          type: AlertType.SERVICE_DOWN,
          severity: AlertSeverity.CRITICAL,
          service,
          message: `Service ${service} is down`,
          details: { error: healthCheck.error, response_time: healthCheck.response_time }
        });
      }
    }
  }

  /**
   * Check health of individual service
   */
  private async checkServiceHealth(service: string): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // In production, this would make actual health check requests
      // For demo, simulating health checks
      
      const responseTime = Math.random() * 1000; // Random response time
      const healthy = Math.random() > 0.05; // 95% uptime simulation
      
      return {
        service,
        healthy,
        last_check: new Date().toISOString(),
        response_time: responseTime,
        error: healthy ? undefined : 'Connection timeout'
      };
    } catch (error) {
      return {
        service,
        healthy: false,
        last_check: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Create alert
   */
  private createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'status'>): void {
    const alert: Alert = {
      ...alertData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      status: AlertStatus.ACTIVE
    };
    
    this.alerts.set(alert.id, alert);
    
    // Send notifications
    this.sendNotifications(alert);
  }

  /**
   * Process active alerts
   */
  private processAlerts(): void {
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.status === AlertStatus.ACTIVE) {
        // Check if alert should be auto-resolved
        if (this.shouldAutoResolveAlert(alert)) {
          this.resolveAlert(alertId);
        }
      }
    }
  }

  /**
   * Check if alert should be auto-resolved
   */
  private shouldAutoResolveAlert(alert: Alert): boolean {
    const metrics = this.metrics.get(alert.service);
    if (!metrics) return false;
    
    switch (alert.type) {
      case AlertType.HIGH_ERROR_RATE:
        return metrics.error_rates < this.config.alert_thresholds.error_rate;
      case AlertType.SLOW_RESPONSE:
        if (metrics.response_times.length === 0) return false;
        const avgResponseTime = metrics.response_times.reduce((sum, time) => sum + time, 0) / metrics.response_times.length;
        return avgResponseTime < this.config.alert_thresholds.response_time;
      case AlertType.SERVICE_DOWN:
        const healthCheck = this.healthChecks.get(alert.service);
        return healthCheck?.healthy || false;
      default:
        return false;
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = AlertStatus.RESOLVED;
      alert.resolved_at = new Date().toISOString();
      
      // Send resolution notification
      this.sendNotifications(alert);
    }
  }

  /**
   * Send notifications for alert
   */
  private sendNotifications(alert: Alert): void {
    for (const channel of this.config.notification_channels) {
      if (!channel.enabled) continue;
      
      switch (channel.type) {
        case 'email':
          this.sendEmailNotification(alert, channel.config);
          break;
        case 'sms':
          this.sendSMSNotification(alert, channel.config);
          break;
        case 'webhook':
          this.sendWebhookNotification(alert, channel.config);
          break;
        case 'slack':
          this.sendSlackNotification(alert, channel.config);
          break;
      }
    }
  }

  /**
   * Send email notification
   */
  private sendEmailNotification(alert: Alert, config: Record<string, any>): void {
    // In production, this would use the email service
    console.log(`Email notification sent for alert ${alert.id}: ${alert.message}`);
  }

  /**
   * Send SMS notification
   */
  private sendSMSNotification(alert: Alert, config: Record<string, any>): void {
    // In production, this would use the SMS service
    console.log(`SMS notification sent for alert ${alert.id}: ${alert.message}`);
  }

  /**
   * Send webhook notification
   */
  private sendWebhookNotification(alert: Alert, config: Record<string, any>): void {
    // In production, this would send HTTP request to webhook URL
    console.log(`Webhook notification sent for alert ${alert.id}: ${alert.message}`);
  }

  /**
   * Send Slack notification
   */
  private sendSlackNotification(alert: Alert, config: Record<string, any>): void {
    // In production, this would send message to Slack channel
    console.log(`Slack notification sent for alert ${alert.id}: ${alert.message}`);
  }

  /**
   * Get metrics for service
   */
  getMetrics(service?: string): Map<string, IntegrationMetrics> | IntegrationMetrics | undefined {
    if (service) {
      return this.metrics.get(service);
    }
    return this.metrics;
  }

  /**
   * Get health checks
   */
  getHealthChecks(service?: string): Map<string, HealthCheck> | HealthCheck | undefined {
    if (service) {
      return this.healthChecks.get(service);
    }
    return this.healthChecks;
  }

  /**
   * Get alerts
   */
  getAlerts(service?: string, status?: AlertStatus): Alert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (service) {
      alerts = alerts.filter(alert => alert.service === service);
    }
    
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }
    
    return alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): {
    overview: {
      total_services: number;
      healthy_services: number;
      active_alerts: number;
      total_api_calls: number;
      avg_response_time: number;
      overall_uptime: number;
    };
    services: Array<{
      name: string;
      healthy: boolean;
      metrics: IntegrationMetrics;
      recent_alerts: number;
    }>;
    recent_alerts: Alert[];
  } {
    const totalServices = this.healthChecks.size;
    const healthyServices = Array.from(this.healthChecks.values()).filter(check => check.healthy).length;
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === AlertStatus.ACTIVE).length;
    
    let totalApiCalls = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    for (const metrics of this.metrics.values()) {
      totalApiCalls += metrics.api_calls;
      if (metrics.response_times.length > 0) {
        totalResponseTime += metrics.response_times.reduce((sum, time) => sum + time, 0);
        responseTimeCount += metrics.response_times.length;
      }
    }
    
    const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    const overallUptime = totalServices > 0 ? healthyServices / totalServices : 0;
    
    const services = Array.from(this.metrics.entries()).map(([name, metrics]) => ({
      name,
      healthy: this.healthChecks.get(name)?.healthy || false,
      metrics,
      recent_alerts: this.getAlerts(name, AlertStatus.ACTIVE).length
    }));
    
    const recentAlerts = this.getAlerts().slice(0, 10);
    
    return {
      overview: {
        total_services: totalServices,
        healthy_services: healthyServices,
        active_alerts: activeAlerts,
        total_api_calls: totalApiCalls,
        avg_response_time: avgResponseTime,
        overall_uptime: overallUptime
      },
      services,
      recent_alerts
    };
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get default monitoring configuration
   */
  private getDefaultConfig(): MonitoringConfig {
    return {
      metrics_interval: 60000, // 1 minute
      health_check_interval: 300000, // 5 minutes
      alert_thresholds: {
        error_rate: 0.05, // 5%
        response_time: 1000, // 1 second
        uptime: 0.99 // 99%
      },
      notification_channels: [
        {
          type: 'email',
          config: {
            to: 'admin@yourcompany.com',
            from: 'monitoring@kits-hub.com'
          },
          enabled: true
        }
      ]
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export monitoring data
   */
  exportData(): {
    metrics: Record<string, IntegrationMetrics>;
    health_checks: Record<string, HealthCheck>;
    alerts: Record<string, Alert>;
    exported_at: string;
  } {
    const metrics: Record<string, IntegrationMetrics> = {};
    const healthChecks: Record<string, HealthCheck> = {};
    const alerts: Record<string, Alert> = {};
    
    for (const [key, value] of this.metrics.entries()) {
      metrics[key] = { ...value };
    }
    
    for (const [key, value] of this.healthChecks.entries()) {
      healthChecks[key] = { ...value };
    }
    
    for (const [key, value] of this.alerts.entries()) {
      alerts[key] = { ...value };
    }
    
    return {
      metrics,
      health_checks,
      alerts,
      exported_at: new Date().toISOString()
    };
  }

  /**
   * Reset all monitoring data
   */
  resetData(): void {
    this.metrics.clear();
    this.healthChecks.clear();
    this.alerts.clear();
  }
}
