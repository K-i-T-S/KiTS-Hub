-- Immediate fix for RLS recursion issue
-- Run this directly in Supabase SQL Editor

-- Drop all problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable profile access for all users" ON public.profiles;

-- Create simple policy that allows all authenticated users
CREATE POLICY "Allow all authenticated users" ON public.profiles FOR ALL USING (auth.uid() IS NOT NULL);
