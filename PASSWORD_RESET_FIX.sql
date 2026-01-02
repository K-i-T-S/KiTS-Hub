-- Fix password issue by updating user password
-- Run this in Supabase SQL Editor to set a known password

-- Update the user's password to "Test12345"
-- This uses the service role to bypass email confirmation
UPDATE auth.users 
SET encrypted_password = crypt('Test12345', gen_salt('bf'))
WHERE email = 'ahmad.khoder2332@gmail.com';

-- Also update the user's metadata to reflect the correct name
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{full_name}', 
  '"Ahmad Khoder"'
)
WHERE email = 'ahmad.khoder2332@gmail.com';

-- Verify the changes
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'ahmad.khoder2332@gmail.com';
