// KiTS Analytics Dashboard Types
// Standalone SaaS solution with integration capabilities

export interface Dashboard {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  layout: 'grid' | 'list' | 'custom';
  widgets: Widget[];
  is_default: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Widget {
  id: string;
  dashboard_id: string;
  widget_type: 'metric' | 'chart' | 'table' | 'list' | 'calendar' | 'gauge';
  title: string;
  description?: string;
  data_source: string;
  query?: string;
  config: WidgetConfig;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refresh_interval?: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface WidgetConfig {
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'gauge' | 'funnel';
  metric?: {
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
    field: string;
    format?: string;
  };
  axes?: {
    x: string;
    y: string;
    group_by?: string;
  };
  filters?: Record<string, any>;
  colors?: string[];
  legend?: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  table?: {
    columns: Array<{
      field: string;
      label: string;
      format?: string;
      sortable?: boolean;
    }>;
    pagination?: boolean;
    page_size?: number;
  };
}

export interface KPI {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  target_value?: number;
  current_value: number;
  previous_value?: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage?: number;
  data_source: string;
  calculation?: {
    metric: string;
    aggregation: string;
    filters?: Record<string, any>;
  };
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  report_type: 'summary' | 'detailed' | 'trend' | 'comparison' | 'custom';
  data_source: string;
  query?: string;
  parameters?: ReportParameter[];
  schedule?: ReportSchedule;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  delivery_method?: 'email' | 'download' | 'webhook';
  recipients?: string[];
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportParameter {
  id: string;
  report_id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  default_value?: any;
  options?: string[];
  description?: string;
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  timezone: string;
  is_active: boolean;
  next_run?: string;
  last_run?: string;
}

export interface Insight {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  insight_type: 'anomaly' | 'trend' | 'opportunity' | 'warning' | 'milestone';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  data_source: string;
  metrics: Array<{
    name: string;
    value: number;
    previous_value?: number;
    trend?: string;
  }>;
  recommendations?: string[];
  action_items?: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    assigned_to?: string;
  }>;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface AnalyticsStats {
  total_dashboards: number;
  total_widgets: number;
  total_kpis: number;
  total_reports: number;
  active_insights: number;
  data_sources: Array<{
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    last_sync?: string;
  }>;
  recent_activity: Array<{
    type: 'dashboard_viewed' | 'report_generated' | 'insight_created';
    timestamp: string;
    user?: string;
    details?: string;
  }>;
  performance_metrics: {
    avg_load_time: number;
    error_rate: number;
    data_freshness: number;
  };
}

export interface AnalyticsFilters {
  date_range?: {
    start: string;
    end: string;
  };
  category?: string;
  data_source?: string;
  created_by?: string;
  is_public?: boolean;
  search?: string;
}

// Form types
export interface CreateDashboardForm {
  name: string;
  description?: string;
  layout: 'grid' | 'list' | 'custom';
  widgets?: Array<{
    widget_type: string;
    title: string;
    data_source: string;
    config: WidgetConfig;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  is_public?: boolean;
}

export interface CreateWidgetForm {
  dashboard_id: string;
  widget_type: 'metric' | 'chart' | 'table' | 'list' | 'calendar' | 'gauge';
  title: string;
  description?: string;
  data_source: string;
  config: WidgetConfig;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refresh_interval?: number;
}

export interface CreateKPIForm {
  name: string;
  description?: string;
  category: string;
  unit: string;
  target_value?: number;
  data_source: string;
  calculation?: {
    metric: string;
    aggregation: string;
    filters?: Record<string, any>;
  };
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface CreateReportForm {
  name: string;
  description?: string;
  report_type: 'summary' | 'detailed' | 'trend' | 'comparison' | 'custom';
  data_source: string;
  parameters?: ReportParameter[];
  schedule?: ReportSchedule;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  delivery_method?: 'email' | 'download' | 'webhook';
  recipients?: string[];
  is_public?: boolean;
}

// Integration API
export interface AnalyticsIntegrationAPI {
  getDashboards(filters?: AnalyticsFilters): Promise<Dashboard[]>;
  createDashboard(dashboard: CreateDashboardForm): Promise<Dashboard>;
  getWidgets(dashboardId: string): Promise<Widget[]>;
  createWidget(widget: CreateWidgetForm): Promise<Widget>;
  getKPIs(filters?: AnalyticsFilters): Promise<KPI[]>;
  createKPI(kpi: CreateKPIForm): Promise<KPI>;
  getReports(filters?: AnalyticsFilters): Promise<Report[]>;
  createReport(report: CreateReportForm): Promise<Report>;
  getInsights(filters?: AnalyticsFilters): Promise<Insight[]>;
  getAnalyticsStats(): Promise<AnalyticsStats>;
  generateReport(reportId: string, parameters?: Record<string, any>): Promise<any>;
  getWidgetData(widgetId: string, filters?: Record<string, any>): Promise<any>;
}

export interface AnalyticsSettings {
  data_sources: Array<{
    id: string;
    name: string;
    type: 'database' | 'api' | 'file' | 'stream';
    connection_config: Record<string, any>;
    is_active: boolean;
    sync_frequency: number;
  }>;
  widget_templates: Array<{
    id: string;
    name: string;
    widget_type: string;
    default_config: WidgetConfig;
    is_system: boolean;
  }>;
  kpi_templates: Array<{
    id: string;
    name: string;
    category: string;
    unit: string;
    default_calculation: {
      metric: string;
      aggregation: string;
    };
    is_system: boolean;
  }>;
  notification_settings: {
    insight_alerts: boolean;
    report_delivery: boolean;
    data_quality_alerts: boolean;
  };
  performance_settings: {
    cache_duration: number;
    max_concurrent_queries: number;
    query_timeout: number;
  };
}
