// KiTS HR Management Types
// Standalone SaaS solution with integration capabilities

export interface Employee {
  id: string;
  tenant_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  hire_date: string;
  department?: string;
  position?: string;
  manager_id?: string;
  salary?: number;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  work_schedule?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  manager_name?: string;
  department_name?: string;
  attendance_records?: AttendanceRecord[];
  performance_reviews?: PerformanceReview[];
}

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  employee_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  overtime_hours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  tenant_id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReview {
  id: string;
  tenant_id: string;
  employee_id: string;
  reviewer_id: string;
  review_period_start: string;
  review_period_end: string;
  overall_rating: number;
  goals_achievement: number;
  communication: number;
  teamwork: number;
  leadership?: number;
  technical_skills: number;
  strengths?: string[];
  areas_for_improvement?: string[];
  goals?: string[];
  comments?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  tenant_id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_salary: number;
  overtime_pay: number;
  bonuses: number;
  deductions: number;
  tax_deductions: number;
  net_pay: number;
  payment_date?: string;
  payment_method?: string;
  status: 'draft' | 'processed' | 'paid';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HRStats {
  total_employees: number;
  active_employees: number;
  departments: Array<{
    name: string;
    employee_count: number;
  }>;
  attendance_rate: number;
  average_overtime: number;
  pending_leave_requests: number;
  upcoming_reviews: number;
  payroll_summary: {
    total_payroll: number;
    average_salary: number;
  };
}

export interface HRFilters {
  department?: string;
  position?: string;
  employment_type?: string;
  is_active?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Form types
export interface CreateEmployeeForm {
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  hire_date: string;
  department?: string;
  position?: string;
  manager_id?: string;
  salary?: number;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  work_schedule?: string;
}

export interface UpdateEmployeeForm {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  department?: string;
  position?: string;
  manager_id?: string;
  salary?: number;
  work_schedule?: string;
  is_active?: boolean;
}

export interface CreateLeaveRequestForm {
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  start_date: string;
  end_date: string;
  reason?: string;
}

// Integration API
export interface HRIntegrationAPI {
  getEmployees(filters?: HRFilters): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;
  createEmployee(employee: CreateEmployeeForm): Promise<Employee>;
  updateEmployee(id: string, updates: UpdateEmployeeForm): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  getAttendanceRecords(employeeId?: string, dateRange?: { start: string; end: string }): Promise<AttendanceRecord[]>;
  getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]>;
  createLeaveRequest(leave: CreateLeaveRequestForm): Promise<LeaveRequest>;
  getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]>;
  getPayrollRecords(employeeId?: string, dateRange?: { start: string; end: string }): Promise<PayrollRecord[]>;
  getHRStats(dateRange?: { start: string; end: string }): Promise<HRStats>;
}

export interface HRSettings {
  departments: Array<{
    id: string;
    name: string;
    manager_id?: string;
    is_active: boolean;
  }>;
  leave_policies: Array<{
    leave_type: string;
    days_per_year: number;
    requires_approval: boolean;
    can_carry_over: boolean;
    max_carry_over: number;
  }>;
  work_schedules: Array<{
    id: string;
    name: string;
    monday: { start: string; end: string; break?: { start: string; end: string } };
    tuesday: { start: string; end: string; break?: { start: string; end: string } };
    wednesday: { start: string; end: string; break?: { start: string; end: string } };
    thursday: { start: string; end: string; break?: { start: string; end: string } };
    friday: { start: string; end: string; break?: { start: string; end: string } };
    saturday?: { start: string; end: string; break?: { start: string; end: string } };
    sunday?: { start: string; end: string; break?: { start: string; end: string } };
  }>;
  payroll_settings: {
    currency: string;
    pay_frequency: 'weekly' | 'bi_weekly' | 'monthly';
    tax_rate: number;
    overtime_rate: number;
  };
}
