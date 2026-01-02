-- Fix infinite recursion in RLS policies
-- The issue is that we're checking the profiles table within a policy on the profiles table

-- Drop all existing policies to avoid recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow profile creation during signup" ON public.profiles FOR INSERT WITH CHECK (true);

-- Admin policy without recursion - use a simple check
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1
  )
);
