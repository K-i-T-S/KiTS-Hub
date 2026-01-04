export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          is_admin: boolean
          last_login_at: string | null
          login_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          is_admin?: boolean
          last_login_at?: string | null
          login_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          is_admin?: boolean
          last_login_at?: string | null
          login_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          phone: string | null
          message: string | null
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          message?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          message?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
          source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          lead_id: string | null
          email: string
          full_name: string | null
          company: string | null
          phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          email: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          email?: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      demos: {
        Row: {
          id: string
          lead_id: string
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          meeting_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          meeting_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          meeting_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          price_id: string
          quantity: number
          current_period_start: string
          current_period_end: string
          trial_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          price_id: string
          quantity?: number
          current_period_start: string
          current_period_end: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          price_id?: string
          quantity?: number
          current_period_start?: string
          current_period_end?: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      visitors: {
        Row: {
          id: string
          session_id: string
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          landing_page: string | null
          country: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          visitor_type: 'anonymous' | 'authenticated' | 'admin'
          user_id: string | null
          first_seen_at: string
          last_seen_at: string
          total_visits: number
          total_duration_seconds: number
        }
        Insert: {
          id?: string
          session_id: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          landing_page?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          visitor_type?: 'anonymous' | 'authenticated' | 'admin'
          user_id?: string | null
          first_seen_at?: string
          last_seen_at?: string
          total_visits?: number
          total_duration_seconds?: number
        }
        Update: {
          id?: string
          session_id?: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          landing_page?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          visitor_type?: 'anonymous' | 'authenticated' | 'admin'
          user_id?: string | null
          first_seen_at?: string
          last_seen_at?: string
          total_visits?: number
          total_duration_seconds?: number
        }
      }
      page_views: {
        Row: {
          id: string
          visitor_id: string
          page_url: string
          page_title: string | null
          page_category: 'home' | 'about' | 'pricing' | 'contact' | 'dashboard' | 'admin' | 'blog' | 'other'
          time_on_page_seconds: number | null
          scrolled_percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          page_url: string
          page_title?: string | null
          page_category?: 'home' | 'about' | 'pricing' | 'contact' | 'dashboard' | 'admin' | 'blog' | 'other'
          time_on_page_seconds?: number | null
          scrolled_percentage?: number
          created_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          page_url?: string
          page_title?: string | null
          page_category?: 'home' | 'about' | 'pricing' | 'contact' | 'dashboard' | 'admin' | 'blog' | 'other'
          time_on_page_seconds?: number | null
          scrolled_percentage?: number
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          visitor_id: string | null
          action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'signup' | 'purchase' | 'cancel'
          table_name: string | null
          record_id: string | null
          old_values: any | null
          new_values: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          visitor_id?: string | null
          action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'signup' | 'purchase' | 'cancel'
          table_name?: string | null
          record_id?: string | null
          old_values?: any | null
          new_values?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          visitor_id?: string | null
          action?: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'signup' | 'purchase' | 'cancel'
          table_name?: string | null
          record_id?: string | null
          old_values?: any | null
          new_values?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      website_events: {
        Row: {
          id: string
          visitor_id: string
          event_type: string
          event_name: string
          properties: any | null
          page_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          event_type: string
          event_name: string
          properties?: any | null
          page_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          event_type?: string
          event_name?: string
          properties?: any | null
          page_url?: string | null
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          stripe_price_id: string | null
          amount: number
          currency: string
          interval: string
          trial_period_days: number
          features: any
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          stripe_price_id?: string | null
          amount: number
          currency?: string
          interval: string
          trial_period_days?: number
          features?: any
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          stripe_price_id?: string | null
          amount?: number
          currency?: string
          interval?: string
          trial_period_days?: number
          features?: any
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      website_settings: {
        Row: {
          id: string
          key: string
          value: any
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
          source: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          source?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          source?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          company: string | null
          phone: string | null
          subject: string
          message: string
          priority: string
          status: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string | null
          phone?: string | null
          subject: string
          message: string
          priority?: string
          status?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string | null
          phone?: string | null
          subject?: string
          message?: string
          priority?: string
          status?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          user_id: string | null
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          storage_path: string
          public_url: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          storage_path: string
          public_url?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          public_url?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      feature_requests: {
        Row: {
          id: string
          title: string
          description: string
          category: 'feature' | 'bug_fix' | 'enhancement' | 'integration' | 'ui_ux' | 'performance' | 'security' | 'other'
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'pending' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected' | 'duplicate'
          requester_name: string
          requester_email: string
          company: string | null
          use_case: string | null
          expected_impact: string | null
          technical_details: string | null
          attachments: any[]
          upvotes: number
          views: number
          admin_notes: string | null
          assigned_to: string | null
          estimated_timeline: string | null
          actual_completion_date: string | null
          duplicate_of: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'feature' | 'bug_fix' | 'enhancement' | 'integration' | 'ui_ux' | 'performance' | 'security' | 'other'
          priority: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected' | 'duplicate'
          requester_name: string
          requester_email: string
          company?: string | null
          use_case?: string | null
          expected_impact?: string | null
          technical_details?: string | null
          attachments?: any[]
          upvotes?: number
          views?: number
          admin_notes?: string | null
          assigned_to?: string | null
          estimated_timeline?: string | null
          actual_completion_date?: string | null
          duplicate_of?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'feature' | 'bug_fix' | 'enhancement' | 'integration' | 'ui_ux' | 'performance' | 'security' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected' | 'duplicate'
          requester_name?: string
          requester_email?: string
          company?: string | null
          use_case?: string | null
          expected_impact?: string | null
          technical_details?: string | null
          attachments?: any[]
          upvotes?: number
          views?: number
          admin_notes?: string | null
          assigned_to?: string | null
          estimated_timeline?: string | null
          actual_completion_date?: string | null
          duplicate_of?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feature_request_upvotes: {
        Row: {
          id: string
          feature_request_id: string
          user_email: string
          user_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          feature_request_id: string
          user_email: string
          user_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          feature_request_id?: string
          user_email?: string
          user_name?: string | null
          created_at?: string
        }
      }
      feature_request_comments: {
        Row: {
          id: string
          feature_request_id: string
          author_name: string
          author_email: string
          comment: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          feature_request_id: string
          author_name: string
          author_email: string
          comment: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          feature_request_id?: string
          author_name?: string
          author_email?: string
          comment?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
      demo_status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
      subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
      audit_action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'signup' | 'purchase' | 'cancel'
      visitor_type: 'anonymous' | 'authenticated' | 'admin'
      page_category: 'home' | 'about' | 'pricing' | 'contact' | 'dashboard' | 'admin' | 'blog' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
