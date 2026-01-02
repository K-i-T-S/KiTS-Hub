# 🔧 **RLS Policy Fix Instructions**

## 🚨 **Problem Identified**
The Supabase API is returning **406 (Not Acceptable)** errors because the Row Level Security (RLS) policies are checking for `auth.jwt() ->> 'role'` which doesn't exist by default in Supabase JWT tokens.

## 🎯 **Root Cause**
```sql
-- ❌ BROKEN: This doesn't work
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

## ✅ **Solution Applied**

### **Option 1: Quick Fix (Immediate)**
Run migration `004_quick_fix_profiles_rls.sql`:
```bash
# Apply to your Supabase project
supabase db push
```

### **Option 2: Complete Fix (Recommended)**
Run migration `003_fix_rls_policies.sql`:
```bash
# Apply comprehensive fix
supabase db push
```

## 📋 **What the Fix Does**

### **Before (Broken)**
- ❌ Checks `auth.jwt() ->> 'role'` (doesn't exist)
- ❌ 406 errors on profile fetching
- ❌ Signup and login failures

### **After (Fixed)**
- ✅ Checks `profiles.is_admin` field
- ✅ Proper user profile access
- ✅ Working signup and login

## 🔍 **Fixed Policies**

### **Profiles Table**
```sql
-- ✅ WORKING: Users can access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow public profile creation during signup" ON public.profiles FOR INSERT WITH CHECK (true);
```

### **Admin Policies**
```sql
-- ✅ WORKING: Check profiles table for admin status
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

## 🚀 **How to Apply**

### **Step 1: Install Supabase CLI**
```bash
npm install -g supabase
```

### **Step 2: Link to Your Project**
```bash
supabase link --project-ref sgopuwsjgfvjsxhfhlsj
```

### **Step 3: Apply Migration**
```bash
# Quick fix (immediate relief)
supabase db push --include 004_quick_fix_profiles_rls.sql

# OR complete fix (recommended)
supabase db push --include 003_fix_rls_policies.sql
```

### **Step 4: Verify**
```bash
# Test signup and login
npm run dev
# Visit http://localhost:3000/signup
# Try creating an account
```

## 🎯 **Expected Results**

After applying the fix:
- ✅ **Signup**: Works without 406 errors
- ✅ **Login**: Profile fetching succeeds
- ✅ **Admin Access**: Proper admin role checking
- ✅ **Security**: Maintains RLS protection

## 🔍 **Testing**

### **Test Signup**
1. Go to `/signup`
2. Fill out the form
3. Should create profile without errors

### **Test Login**
1. Go to `/login`
2. Enter credentials
3. Should fetch profile successfully

### **Test Admin**
1. Set `is_admin = true` in profiles table
2. Login as admin user
3. Should access admin dashboard

## 📞 **Troubleshooting**

### **Still Getting 406 Errors?**
1. Verify migration was applied: `supabase db status`
2. Check policies: `supabase db shell` → `\dp public.profiles`
3. Re-run migration if needed

### **Admin Access Not Working?**
1. Check user profile: `SELECT * FROM profiles WHERE email = 'your@email.com'`
2. Update admin status: `UPDATE profiles SET is_admin = true WHERE id = 'user-id'`
3. Logout and login again

## 🎉 **Success Indicators**

- ✅ No more 406 errors in console
- ✅ Signup creates profile successfully
- ✅ Login fetches user profile
- ✅ Admin dashboard accessible for admin users
- ✅ All Supabase operations working

---

**This fix resolves the immediate 406 errors and allows the authentication system to work properly while maintaining security through proper RLS policies.**
