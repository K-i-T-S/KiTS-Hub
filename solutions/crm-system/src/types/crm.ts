// KiTS CRM System Types
// Standalone SaaS solution with integration capabilities

export interface Contact {
  id: string;
  tenant_id: string;
  contact_type: 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor';
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  size?: string;
  source?: string;
  status: 'active' | 'inactive' | 'converted' | 'lost';
  rating?: 'hot' | 'warm' | 'cold';
  assigned_to?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_to_name?: string;
  opportunities?: Opportunity[];
  communications?: Communication[];
  activities?: Activity[];
}

export interface Opportunity {
  id: string;
  tenant_id: string;
  contact_id: string;
  name: string;
  description?: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  currency: string;
  probability: number;
  expected_close_date: string;
  actual_close_date?: string;
  assigned_to?: string;
  source?: string;
  status: 'active' | 'inactive' | 'won' | 'lost';
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  contact_name?: string;
  assigned_to_name?: string;
  activities?: Activity[];
}

export interface Communication {
  id: string;
  tenant_id: string;
  contact_id?: string;
  opportunity_id?: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'task';
  direction?: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'received' | 'completed';
  scheduled_at?: string;
  completed_at?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  contact_name?: string;
  opportunity_name?: string;
  assigned_to_name?: string;
}

export interface Activity {
  id: string;
  tenant_id: string;
  contact_id?: string;
  opportunity_id?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description?: string;
  status: 'planned' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact_name?: string;
  opportunity_name?: string;
  assigned_to_name?: string;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  type: 'email' | 'social' | 'event' | 'direct_mail' | 'webinar';
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date?: string;
  budget?: number;
  currency: string;
  target_audience?: string;
  metrics?: {
    sent_count?: number;
    open_rate?: number;
    click_rate?: number;
    conversion_rate?: number;
    cost_per_acquisition?: number;
    return_on_investment?: number;
  };
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_to_name?: string;
}

export interface CRMStats {
  total_contacts: number;
  total_opportunities: number;
  total_activities: number;
  pipeline_value: number;
  conversion_rate: number;
  average_deal_size: number;
  sales_cycle_length: number;
  top_performers: Array<{
    user_id: string;
    user_name: string;
    won_deals: number;
    total_value: number;
  }>;
  recent_activities: Activity[];
  upcoming_tasks: Activity[];
  pipeline_by_stage: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
}

export interface CRMFilters {
  contact_type?: string;
  status?: string;
  assigned_to?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
  tags?: string[];
}

// Form types
export interface CreateContactForm {
  contact_type: 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor';
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  size?: string;
  source?: string;
  rating?: 'hot' | 'warm' | 'cold';
  assigned_to?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateContactForm {
  first_name?: string;
  last_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  size?: string;
  status?: 'active' | 'inactive' | 'converted' | 'lost';
  rating?: 'hot' | 'warm' | 'cold';
  assigned_to?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateOpportunityForm {
  contact_id: string;
  name: string;
  description?: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation';
  value: number;
  currency: string;
  probability: number;
  expected_close_date: string;
  assigned_to?: string;
  source?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateCommunicationForm {
  contact_id?: string;
  opportunity_id?: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'task';
  direction?: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  scheduled_at?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

// Integration API
export interface CRMIntegrationAPI {
  getContacts(filters?: CRMFilters): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | null>;
  createContact(contact: CreateContactForm): Promise<Contact>;
  updateContact(id: string, updates: UpdateContactForm): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  getOpportunities(filters?: CRMFilters): Promise<Opportunity[]>;
  createOpportunity(opportunity: CreateOpportunityForm): Promise<Opportunity>;
  getCommunications(contactId?: string): Promise<Communication[]>;
  createCommunication(communication: CreateCommunicationForm): Promise<Communication>;
  getActivities(filters?: CRMFilters): Promise<Activity[]>;
  getCampaigns(): Promise<Campaign[]>;
  getCRMStats(dateRange?: { start: string; end: string }): Promise<CRMStats>;
}

export interface CRMSettings {
  contact_sources: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
  opportunity_stages: Array<{
    id: string;
    name: string;
    probability: number;
    is_closed: boolean;
  }>;
  communication_types: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
  activity_types: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
  general_settings: {
    default_currency: string;
    business_hours: {
      monday: { start: string; end: string };
      tuesday: { start: string; end: string };
      wednesday: { start: string; end: string };
      thursday: { start: string; end: string };
      friday: { start: string; end: string };
    };
    timezone: string;
  };
}
