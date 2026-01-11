import { supabase } from '@/lib/supabase';
import { 
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PerformanceReview,
  PayrollRecord,
  HRStats,
  HRFilters,
  CreateEmployeeForm,
  UpdateEmployeeForm,
  CreateLeaveRequestForm,
  HRIntegrationAPI,
  HRSettings
} from '@/types/hr';

class HRService implements HRIntegrationAPI {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async getEmployees(filters?: HRFilters): Promise<Employee[]> {
    let query = supabase
      .from('employees')
      .select(`
        *,
        manager:employees(first_name, last_name),
        department:departments(name)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.department) {
      query = query.eq('department', filters.department);
    }

    if (filters?.position) {
      query = query.eq('position', filters.position);
    }

    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        manager:employees(first_name, last_name),
        department:departments(name)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async createEmployee(employee: CreateEmployeeForm): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...employee,
        tenant_id: this.tenantId,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmployee(id: string, updates: UpdateEmployeeForm): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  async getAttendanceRecords(employeeId?: string, dateRange?: { start: string; end: string }): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (dateRange) {
      query = query
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
    let query = supabase
      .from('leave_requests')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createLeaveRequest(leave: CreateLeaveRequestForm): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        ...leave,
        tenant_id: this.tenantId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
    let query = supabase
      .from('performance_reviews')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPayrollRecords(employeeId?: string, dateRange?: { start: string; end: string }): Promise<PayrollRecord[]> {
    let query = supabase
      .from('payroll_records')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (dateRange) {
      query = query
        .gte('pay_period_start', dateRange.start)
        .lte('pay_period_end', dateRange.end);
    }

    const { data, error } = await query.order('pay_period_start', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getHRStats(dateRange?: { start: string; end: string }): Promise<HRStats> {
    const { data, error } = await supabase.rpc('get_hr_stats', {
      p_tenant_id: this.tenantId,
      p_start_date: dateRange?.start,
      p_end_date: dateRange?.end
    });

    if (error) throw error;
    
    return data[0] || {
      total_employees: 0,
      active_employees: 0,
      departments: [],
      attendance_rate: 0,
      average_overtime: 0,
      pending_leave_requests: 0,
      upcoming_reviews: 0,
      payroll_summary: {
        total_payroll: 0,
        average_salary: 0
      }
    };
  }

  async getHRSettings(): Promise<HRSettings | null> {
    const { data, error } = await supabase
      .from('hr_settings')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateHRSettings(settings: Partial<HRSettings>): Promise<HRSettings> {
    const { data, error } = await supabase
      .from('hr_settings')
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

export default HRService;
