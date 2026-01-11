import { supabase } from '@/lib/supabase';
import { 
  Dashboard,
  Widget,
  KPI,
  Report,
  ReportParameter,
  ReportSchedule,
  Insight,
  AnalyticsStats,
  AnalyticsFilters,
  CreateDashboardForm,
  CreateWidgetForm,
  CreateKPIForm,
  CreateReportForm,
  AnalyticsIntegrationAPI,
  AnalyticsSettings
} from '@/types/analytics';

class AnalyticsService implements AnalyticsIntegrationAPI {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async getDashboards(filters?: AnalyticsFilters): Promise<Dashboard[]> {
    let query = supabase
      .from('dashboards')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createDashboard(dashboard: CreateDashboardForm): Promise<Dashboard> {
    const { data, error } = await supabase
      .from('dashboards')
      .insert({
        ...dashboard,
        tenant_id: this.tenantId,
        layout: dashboard.layout || 'grid',
        is_default: false
      })
      .select()
      .single();

    if (error) throw error;

    // Create widgets if provided
    if (dashboard.widgets && dashboard.widgets.length > 0) {
      const widgets = dashboard.widgets.map(widget => ({
        ...widget,
        dashboard_id: data.id,
        is_visible: true
      }));

      const { error: widgetError } = await supabase
        .from('widgets')
        .insert(widgets);

      if (widgetError) throw widgetError;
    }

    return data;
  }

  async getWidgets(dashboardId: string): Promise<Widget[]> {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('is_visible', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async createWidget(widget: CreateWidgetForm): Promise<Widget> {
    const { data, error } = await supabase
      .from('widgets')
      .insert({
        ...widget,
        is_visible: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getKPIs(filters?: AnalyticsFilters): Promise<KPI[]> {
    let query = supabase
      .from('kpis')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data || [];
  }

  async createKPI(kpi: CreateKPIForm): Promise<KPI> {
    const { data, error } = await supabase
      .from('kpis')
      .insert({
        ...kpi,
        tenant_id: this.tenantId,
        current_value: 0,
        trend: 'stable',
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getReports(filters?: AnalyticsFilters): Promise<Report[]> {
    let query = supabase
      .from('reports')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createReport(report: CreateReportForm): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...report,
        tenant_id: this.tenantId,
        created_by: 'current-user' // This would come from auth context
      })
      .select()
      .single();

    if (error) throw error;

    // Create parameters if provided
    if (report.parameters && report.parameters.length > 0) {
      const parameters = report.parameters.map(param => ({
        ...param,
        report_id: data.id
      }));

      const { error: paramError } = await supabase
        .from('report_parameters')
        .insert(parameters);

      if (paramError) throw paramError;
    }

    // Create schedule if provided
    if (report.schedule) {
      const { error: scheduleError } = await supabase
        .from('report_schedules')
        .insert({
          ...report.schedule,
          report_id: data.id,
          is_active: true
        });

      if (scheduleError) throw scheduleError;
    }

    return data;
  }

  async getInsights(filters?: AnalyticsFilters): Promise<Insight[]> {
    let query = supabase
      .from('insights')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_resolved', false);

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAnalyticsStats(): Promise<AnalyticsStats> {
    const { data, error } = await supabase.rpc('get_analytics_stats', {
      p_tenant_id: this.tenantId
    });

    if (error) throw error;
    
    return data[0] || {
      total_dashboards: 0,
      total_widgets: 0,
      total_kpis: 0,
      total_reports: 0,
      active_insights: 0,
      data_sources: [],
      recent_activity: [],
      performance_metrics: {
        avg_load_time: 0,
        error_rate: 0,
        data_freshness: 0
      }
    };
  }

  async generateReport(reportId: string, parameters?: Record<string, any>): Promise<any> {
    // This would execute the report query with parameters
    // For now, return mock data
    return {
      report_id: reportId,
      generated_at: new Date().toISOString(),
      data: [],
      metadata: {
        total_rows: 0,
        execution_time: 0
      }
    };
  }

  async getWidgetData(widgetId: string, filters?: Record<string, any>): Promise<any> {
    // This would execute the widget query with filters
    // For now, return mock data
    return {
      widget_id: widgetId,
      data: [],
      metadata: {
        total_rows: 0,
        execution_time: 0
      }
    };
  }

  async getAnalyticsSettings(): Promise<AnalyticsSettings | null> {
    const { data, error } = await supabase
      .from('analytics_settings')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateAnalyticsSettings(settings: Partial<AnalyticsSettings>): Promise<AnalyticsSettings> {
    const { data, error } = await supabase
      .from('analytics_settings')
      .upsert({
        ...settings,
        tenant_id: this.tenantId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default AnalyticsService;
