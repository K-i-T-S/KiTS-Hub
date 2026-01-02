-- Simple fix: disable RLS temporarily and re-enable with basic policies

-- Disable RLS to allow immediate access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't cause recursion
CREATE POLICY "Enable profile access for all users" ON public.profiles FOR ALL USING (true);

-- Note: This allows all authenticated users to access profiles
-- For production, you'll want more restrictive policies
