-- Quick fix for profiles RLS issue
-- Temporarily disable RLS for profiles table to allow signup to work
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable with simpler policies that work
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies that work for auth
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow public profile creation during signup" ON public.profiles FOR INSERT WITH CHECK (true);

-- Admin policy (simplified)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
