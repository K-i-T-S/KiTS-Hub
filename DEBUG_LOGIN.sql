-- Debug login issues - check user status
-- Run this in Supabase SQL Editor to see what's happening

-- Check if user exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  phone,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'ahmad.khoder2332@gmail.com';

-- Check if profile exists and is linked
SELECT 
  p.id as profile_id,
  p.email as profile_email,
  p.is_admin,
  p.created_at as profile_created,
  u.id as auth_id,
  u.email as auth_email,
  u.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'ahmad.khoder2332@gmail.com' OR u.email = 'ahmad.khoder2332@gmail.com';

-- Check recent authentication attempts
SELECT 
  created_at,
  level,
  msg,
  error_code,
  user_id
FROM auth.audit_log_entries
WHERE email = 'ahmad.khoder2332@gmail.com'
ORDER BY created_at DESC
LIMIT 10;

-- If email_confirmed_at is NULL, the user needs email confirmation
-- You can manually confirm the email with:
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'ahmad.khoder2332@gmail.com';
