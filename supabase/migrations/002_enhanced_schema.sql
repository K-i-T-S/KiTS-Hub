-- Enhanced schema for KiTS Hub with analytics, audit logs, and website usage tracking

-- Additional enums
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'view', 'download', 'signup', 'purchase', 'cancel');
CREATE TYPE visitor_type AS ENUM ('anonymous', 'authenticated', 'admin');
CREATE TYPE page_category AS ENUM ('home', 'about', 'pricing', 'contact', 'dashboard', 'admin', 'blog', 'other');

-- Website analytics and visitor tracking
CREATE TABLE public.visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  ip_address inet,
  user_agent text,
  referrer text,
  landing_page text,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  visitor_type visitor_type DEFAULT 'anonymous' NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_seen_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  total_visits integer DEFAULT 1 NOT NULL,
  total_duration_seconds integer DEFAULT 0 NOT NULL
);

-- Page views tracking
CREATE TABLE public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE CASCADE NOT NULL,
  page_url text NOT NULL,
  page_title text,
  page_category page_category DEFAULT 'other' NOT NULL,
  time_on_page_seconds integer,
  scrolled_percentage numeric(3,2) DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit logs for all user actions
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Website events tracking
CREATE TABLE public.website_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_name text NOT NULL,
  properties jsonb,
  page_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Plans and pricing
CREATE TABLE public.plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  stripe_price_id text UNIQUE,
  amount integer NOT NULL, -- in cents
  currency text DEFAULT 'usd' NOT NULL,
  interval text NOT NULL, -- 'month', 'year'
  trial_period_days integer DEFAULT 0,
  features jsonb,
  is_active boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhanced profiles with role management
ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user' NOT NULL;
ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
ALTER TABLE public.profiles ADD COLUMN last_login_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN login_count integer DEFAULT 0 NOT NULL;

-- Website settings and configuration
CREATE TABLE public.website_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Newsletter subscriptions
CREATE TABLE public.newsletter_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  is_active boolean DEFAULT true NOT NULL,
  subscribed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  unsubscribed_at timestamp with time zone,
  source text DEFAULT 'website' NOT NULL
);

-- Contact form submissions
CREATE TABLE public.contact_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'normal' NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- File uploads and assets
CREATE TABLE public.uploads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  filename text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  storage_path text NOT NULL,
  public_url text,
  is_public boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for new tables
CREATE INDEX idx_visitors_session_id ON public.visitors(session_id);
CREATE INDEX idx_visitors_user_id ON public.visitors(user_id);
CREATE INDEX idx_visitors_first_seen_at ON public.visitors(first_seen_at);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_page_views_page_url ON public.page_views(page_url);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_website_events_visitor_id ON public.website_events(visitor_id);
CREATE INDEX idx_website_events_event_type ON public.website_events(event_type);
CREATE INDEX idx_website_events_created_at ON public.website_events(created_at);
CREATE INDEX idx_plans_stripe_price_id ON public.plans(stripe_price_id);
CREATE INDEX idx_plans_is_active ON public.plans(is_active);
CREATE INDEX idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);

-- Enable Row Level Security for new tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables

-- Visitors policies
CREATE POLICY "Anonymous users can insert own visitor data" ON public.visitors FOR INSERT WITH CHECK (visitor_type = 'anonymous');
CREATE POLICY "Admins can view all visitors" ON public.visitors FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update all visitors" ON public.visitors FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Page views policies
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all page views" ON public.page_views FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Website events policies
CREATE POLICY "Anyone can insert website events" ON public.website_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all website events" ON public.website_events FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Plans policies
CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all plans" ON public.plans FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Website settings policies
CREATE POLICY "Anyone can view public settings" ON public.website_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can manage settings" ON public.website_settings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Newsletter subscriptions policies
CREATE POLICY "Anyone can insert newsletter subscriptions" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage newsletter subscriptions" ON public.newsletter_subscriptions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Contact submissions policies
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage contact submissions" ON public.contact_submissions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Uploads policies
CREATE POLICY "Users can view own uploads" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON public.uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON public.uploads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all uploads" ON public.uploads FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Anyone can view public uploads" ON public.uploads FOR SELECT USING (is_public = true);

-- Update existing profiles policies to include admin role
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR is_admin = true);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin' OR is_admin = true);

-- Create triggers for new tables
CREATE TRIGGER handle_visitors_updated_at BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_page_views_updated_at BEFORE UPDATE ON public.page_views FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_audit_logs_updated_at BEFORE UPDATE ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_website_events_updated_at BEFORE UPDATE ON public.website_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_website_settings_updated_at BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_newsletter_subscriptions_updated_at BEFORE UPDATE ON public.newsletter_subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();
CREATE TRIGGER handle_uploads_updated_at BEFORE UPDATE ON public.uploads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_column();

-- Function to automatically create audit logs
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, table_name, record_id, new_values)
    VALUES ('create', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (action, table_name, record_id, old_values, new_values)
    VALUES ('update', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, table_name, record_id, old_values)
    VALUES ('delete', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_leads_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_contacts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Insert default website settings
INSERT INTO public.website_settings (key, value, description, is_public) VALUES
('site_name', '"KiTS Hub"', 'Website name', true),
('site_description', '"Comprehensive business management platform"', 'Website description', true),
('contact_email', '"contact@kitshub.com"', 'Contact email', true),
('maintenance_mode', 'false', 'Maintenance mode toggle', true),
('analytics_enabled', 'true', 'Enable analytics tracking', false),
('newsletter_enabled', 'true', 'Enable newsletter subscriptions', true),
('demo_requests_enabled', 'true', 'Enable demo request form', true);

-- Insert default plans
INSERT INTO public.plans (name, description, amount, interval, features, sort_order) VALUES
('Starter', 'Perfect for small businesses getting started', 2900, 'month', '{"users": 5, "storage": "10GB", "support": "email", "features": ["Basic CRM", "Lead tracking", "Email templates"]}', 1),
('Professional', 'Ideal for growing businesses', 9900, 'month', '{"users": 25, "storage": "100GB", "support": "priority", "features": ["Advanced CRM", "Automation", "Analytics", "API access", "Custom integrations"]}', 2),
('Enterprise', 'For large organizations with custom needs', 29900, 'month', '{"users": "unlimited", "storage": "unlimited", "support": "24/7 dedicated", "features": ["Everything in Pro", "Custom workflows", "White-label options", "Dedicated account manager", "SLA guarantee"]}', 3);
