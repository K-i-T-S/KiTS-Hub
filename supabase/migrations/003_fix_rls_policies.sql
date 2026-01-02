-- Fix RLS policies to work with actual Supabase auth system
-- The issue is that auth.jwt() ->> 'role' doesn't exist by default
-- We need to check the profiles table for admin status instead

-- Drop existing policies that don't work
DROP POLICY IF EXISTS "Admins can view all visitors" ON public.visitors;
DROP POLICY IF EXISTS "Admins can update all visitors" ON public.visitors;
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all website events" ON public.website_events;
DROP POLICY IF EXISTS "Admins can view all plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.website_settings;
DROP POLICY IF EXISTS "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage all uploads" ON public.uploads;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop original policies that use auth.jwt() ->> 'role'
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all demos" ON public.demos;
DROP POLICY IF EXISTS "Admins can insert demos" ON public.demos;
DROP POLICY IF EXISTS "Admins can update demos" ON public.demos;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

-- Fixed RLS Policies using profiles table for admin check

-- Visitors policies
CREATE POLICY "Admins can view all visitors" ON public.visitors FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can update all visitors" ON public.visitors FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Page views policies
CREATE POLICY "Admins can view all page views" ON public.page_views FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Website events policies
CREATE POLICY "Admins can view all website events" ON public.website_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Plans policies
CREATE POLICY "Admins can view all plans" ON public.plans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Website settings policies
CREATE POLICY "Admins can manage settings" ON public.website_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Newsletter subscriptions policies
CREATE POLICY "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can manage newsletter subscriptions" ON public.newsletter_subscriptions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Contact submissions policies
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can manage contact submissions" ON public.contact_submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Uploads policies
CREATE POLICY "Admins can manage all uploads" ON public.uploads FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Profiles policies - Fixed admin check
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  is_admin = true OR id = auth.uid()
);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Add missing policy for users to insert their own profile during signup
CREATE POLICY "Users can insert own profile on signup" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id AND (
    -- Allow profile creation during signup
    (SELECT COUNT(*) FROM public.profiles WHERE id = auth.uid()) = 0
  )
);

-- Leads policies (fixed)
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can insert leads" ON public.leads FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Contacts policies (fixed)
CREATE POLICY "Admins can view all contacts" ON public.contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can insert contacts" ON public.contacts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can update contacts" ON public.contacts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Demos policies (fixed)
CREATE POLICY "Admins can view all demos" ON public.demos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can insert demos" ON public.demos FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can update demos" ON public.demos FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Subscriptions policies (fixed)
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
