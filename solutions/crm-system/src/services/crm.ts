import { supabase } from '@/lib/supabase';
import { 
  Contact,
  Opportunity,
  Communication,
  Activity,
  Campaign,
  CRMStats,
  CRMFilters,
  CreateContactForm,
  UpdateContactForm,
  CreateOpportunityForm,
  CreateCommunicationForm,
  CRMIntegrationAPI,
  CRMSettings
} from '@/types/crm';

class CRMService implements CRMIntegrationAPI {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async getContacts(filters?: CRMFilters): Promise<Contact[]> {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        assigned_to_user:users(first_name, last_name)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.contact_type) {
      query = query.eq('contact_type', filters.contact_type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getContact(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        assigned_to_user:users(first_name, last_name)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async createContact(contact: CreateContactForm): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contact,
        tenant_id: this.tenantId,
        status: contact.contact_type === 'customer' ? 'active' : 'active',
        opening_balance: 0,
        current_balance: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(id: string, updates: UpdateContactForm): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .update({ status: 'inactive' })
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  async getOpportunities(filters?: CRMFilters): Promise<Opportunity[]> {
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        contact:contacts(first_name, last_name, company),
        assigned_to_user:users(first_name, last_name)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact.first_name.ilike.%${filters.search}%,contact.company.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createOpportunity(opportunity: CreateOpportunityForm): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        ...opportunity,
        tenant_id: this.tenantId,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCommunications(contactId?: string): Promise<Communication[]> {
    let query = supabase
      .from('communications')
      .select(`
        *,
        contact:contacts(first_name, last_name, company),
        opportunity:opportunities(name),
        assigned_to_user:users(first_name, last_name)
      `)
      .eq('tenant_id', this.tenantId);

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCommunication(communication: CreateCommunicationForm): Promise<Communication> {
    const { data, error } = await supabase
      .from('communications')
      .insert({
        ...communication,
        tenant_id: this.tenantId,
        status: communication.scheduled_at ? 'pending' : 'sent'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActivities(filters?: CRMFilters): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select(`
        *,
        contact:contacts(first_name, last_name, company),
        opportunity:opportunities(name),
        assigned_to_user:users(first_name, last_name)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters?.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,contact.first_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        assigned_to_user:users(first_name, last_name)
      `)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCRMStats(dateRange?: { start: string; end: string }): Promise<CRMStats> {
    const { data, error } = await supabase.rpc('get_crm_stats', {
      p_tenant_id: this.tenantId,
      p_start_date: dateRange?.start,
      p_end_date: dateRange?.end
    });

    if (error) throw error;
    
    return data[0] || {
      total_contacts: 0,
      total_opportunities: 0,
      total_activities: 0,
      pipeline_value: 0,
      conversion_rate: 0,
      average_deal_size: 0,
      sales_cycle_length: 0,
      top_performers: [],
      recent_activities: [],
      upcoming_tasks: [],
      pipeline_by_stage: []
    };
  }

  async getCRMSettings(): Promise<CRMSettings | null> {
    const { data, error } = await supabase
      .from('crm_settings')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateCRMSettings(settings: Partial<CRMSettings>): Promise<CRMSettings> {
    const { data, error } = await supabase
      .from('crm_settings')
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

export default CRMService;
