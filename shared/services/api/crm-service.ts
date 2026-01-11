import { BaseService } from './base-service';
import { supabase } from '../../lib/supabase';
import { Customer, Lead, Opportunity, Communication, CustomerStatus, LeadStatus, OpportunityStage } from '../../types';

export class CRMService extends BaseService {
  constructor() {
    super('customers');
  }

  // Customer Management
  async getCustomers(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: CustomerStatus;
      source?: string;
      search?: string;
    }
  ) {
    const queryFilters: Record<string, any> = {};
    
    if (filters) {
      if (filters.status) queryFilters.status = filters.status;
      if (filters.source) queryFilters.source = filters.source;
      if (filters.search) {
        return this.search(filters.search, ['name', 'email', 'phone', 'company'], page, perPage);
      }
    }

    return this.getAll<Customer>(page, perPage, queryFilters);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.getById<Customer>(id);
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    // Generate customer number if not provided
    if (!customerData.customer_number) {
      customerData.customer_number = await this.generateCustomerNumber();
    }

    return this.create<Customer>(customerData);
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    return this.update<Customer>(id, customerData);
  }

  // Lead Management
  async getLeads(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: LeadStatus;
      priority?: string;
      assigned_to?: string;
      search?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    let filteredData = data || [];
    
    // Apply filters
    if (filters) {
      if (filters.status) {
        filteredData = filteredData.filter(lead => lead.status === filters.status);
      }
      if (filters.priority) {
        filteredData = filteredData.filter(lead => lead.priority === filters.priority);
      }
      if (filters.assigned_to) {
        filteredData = filteredData.filter(lead => lead.assigned_to === filters.assigned_to);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(lead => 
          lead.title.toLowerCase().includes(searchLower) ||
          lead.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredData.length / perPage),
    };
  }

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    // Set default values
    if (!leadData.status) {
      leadData.status = 'new';
    }
    if (!leadData.priority) {
      leadData.priority = 'medium';
    }

    return this.create<Lead>(leadData);
  }

  async convertLeadToCustomer(leadId: string, customerId: string): Promise<void> {
    // Update lead status
    await supabase
      .from('leads')
      .update({ 
        status: 'converted',
        customer_id: customerId,
        converted_at: new Date().toISOString()
      })
      .eq('id', leadId);
  }

  // Opportunity Management
  async getOpportunities(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      stage?: OpportunityStage;
      assigned_to?: string;
      search?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch opportunities: ${error.message}`);
    }

    let filteredData = data || [];
    
    // Apply filters
    if (filters) {
      if (filters.stage) {
        filteredData = filteredData.filter(opp => opp.stage === filters.stage);
      }
      if (filters.assigned_to) {
        filteredData = filteredData.filter(opp => opp.assigned_to === filters.assigned_to);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(opp => 
          opp.name.toLowerCase().includes(searchLower) ||
          opp.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredData.length / perPage),
    };
  }

  async createOpportunity(opportunityData: Partial<Opportunity>): Promise<Opportunity> {
    // Set default values
    if (!opportunityData.stage) {
      opportunityData.stage = 'prospecting';
    }
    if (!opportunityData.probability) {
      opportunityData.probability = 25; // Default probability
    }

    return this.create<Opportunity>(opportunityData);
  }

  // Communication Management
  async getCommunications(
    customerId?: string,
    page: number = 1,
    perPage: number = 20
  ) {
    let query = supabase.from('communications').select('*');
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch communications: ${error.message}`);
    }

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = (data || []).slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: (data || []).length,
      page,
      per_page: perPage,
      total_pages: Math.ceil((data || []).length / perPage),
    };
  }

  async createCommunication(communicationData: Partial<Communication>): Promise<Communication> {
    // Set default values
    if (!communicationData.status) {
      communicationData.status = 'draft';
    }
    if (!communicationData.direction) {
      communicationData.direction = 'outbound';
    }

    return this.create<Communication>(communicationData);
  }

  async sendCommunication(communicationId: string): Promise<void> {
    // Update communication status to sent
    const { error } = await supabase
      .from('communications')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', communicationId);

    if (error) {
      throw new Error(`Failed to send communication: ${error.message}`);
    }
  }

  // Analytics and Reports
  async getCustomerMetrics(): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    churnedCustomersThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const { data: customers, error } = await supabase
      .from('customers')
      .select('status, created_at');

    if (error) {
      throw new Error(`Failed to fetch customer metrics: ${error.message}`);
    }

    const totalCustomers = customers?.length || 0;
    const newCustomersThisMonth = customers?.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length || 0;
    const activeCustomers = customers?.filter(c => c.status === 'active').length || 0;
    const churnedCustomersThisMonth = customers?.filter(c => 
      c.status === 'churned' && new Date(c.created_at) >= startOfLastMonth
    ).length || 0;

    return {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      churnedCustomersThisMonth,
    };
  }

  async getSalesPipeline(): Promise<{
    totalLeads: number;
    leadsByStage: Record<LeadStatus, number>;
    conversionRate: number;
  }> {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status');

    if (error) {
      throw new Error(`Failed to fetch sales pipeline: ${error.message}`);
    }

    const totalLeads = leads?.length || 0;
    const leadsByStage = leads?.reduce((stages: any, lead: any) => {
      stages[lead.status] = (stages[lead.status] || 0) + 1;
      return stages;
    }, {} as Record<string, number>);
    
    const convertedLeads = leadsByStage.converted || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      leadsByStage,
      conversionRate,
    };
  }

  // Utility Methods
  private async generateCustomerNumber(): Promise<string> {
    const { data, error } = await supabase
      .from('customers')
      .select('customer_number')
      .order('customer_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to generate customer number: ${error.message}`);
    }

    const lastNumber = data?.[0]?.customer_number || 'CUST0000';
    const numericPart = parseInt(lastNumber.replace('CUST', '')) + 1;
    return `CUST${numericPart.toString().padStart(4, '0')}`;
  }

  async exportCustomersToCSV(filters?: any): Promise<string> {
    const customers = await this.getCustomers(1, 10000, filters);
    
    const headers = ['Customer Number', 'Name', 'Email', 'Phone', 'Company', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...customers.data.map(customer => [
        customer.customer_number,
        customer.name,
        customer.email || '',
        customer.phone || '',
        customer.company || '',
        customer.status,
        customer.created_at
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}
