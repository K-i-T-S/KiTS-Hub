-- Create user in Supabase auth system
-- Run this in Supabase SQL Editor to fix the authentication issue

-- First, let's check if the user exists in auth.users
SELECT * FROM auth.users WHERE email = 'ahmad.khoder2332@gmail.com';

-- If the user doesn't exist in auth.users, we need to create it
-- This requires using the service role key or creating the user through the auth API

-- For now, let's create a new user properly through the auth system
-- You'll need to go to Authentication > Users in Supabase dashboard and:
-- 1. Click "Add user"
-- 2. Email: ahmad.khoder2332@gmail.com
-- 3. Password: Test12345
-- 4. Auto-confirm: ON
-- 5. Click "Save"

-- After creating the user, make sure the profile is linked
UPDATE public.profiles 
SET email = 'ahmad.khoder2332@gmail.com'
WHERE id = 'e1e557ac-6df2-4f1c-b9bd-c4872d217b4b';

-- Verify the user exists
SELECT 
  u.id as auth_id,
  u.email as auth_email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.email as profile_email,
  p.is_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'ahmad.khoder2332@gmail.com';
