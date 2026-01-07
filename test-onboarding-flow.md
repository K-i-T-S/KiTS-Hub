# 🧪 Onboarding Flow Test Guide

## ✅ **Current Status: WORKING**

The console errors have been resolved:
- ✅ **Supabase admin client** - Now configured and working
- ✅ **Image aspect ratios** - Fixed in testimonials section  
- ✅ **API endpoints** - All responding correctly
- ✅ **Environment variables** - Loaded after server restart

## 🎯 **Manual Testing Steps**

### **1. Test Complete Customer Journey**

#### **Step 1: Homepage Navigation**
1. Visit: `http://localhost:3000`
2. Click "Get Started Free" button
3. **Expected**: Should navigate to `/onboarding`

#### **Step 2: Email Pre-fill Test**
1. Visit: `http://localhost:3000/onboarding?email=test@example.com`
2. **Expected**: Email field should be pre-filled with "test@example.com"

#### **Step 3: Complete 5-Step Onboarding**
1. **Step 1 - Contact Info**:
   - Fill in: Company Name, Contact Name, Phone, Email
   - Click "Continue"

2. **Step 2 - Plan Selection**:
   - Choose: Basic, Professional, or Enterprise
   - Select billing cycle (Monthly/Yearly)
   - Click "Continue"

3. **Step 3 - Feature Selection**:
   - Select features: Inventory, POS, Analytics, CRM, HR
   - Click "Continue"

4. **Step 4 - Supabase Credentials**:
   - Enter Supabase project URL
   - Enter service role key
   - Click "Test Connection"
   - **Expected**: Should show connection status
   - Click "Continue"

5. **Step 5 - Review & Submit**:
   - Review all information
   - Click "Start Setup"

#### **Step 4: Waiting Screen**
1. **Expected**: Should redirect to `/onboarding/waiting?customer_id=UUID`
2. Check that:
   - Queue position is displayed
   - Progress tracking works
   - Real-time updates function

### **2. Test Admin Portal**

#### **Step 1: Access Admin Dashboard**
1. Visit: `http://localhost:3000/admin/provisioning`
2. **Expected**: Should see provisioning dashboard

#### **Step 2: Queue Management**
1. Look for the customer you just created
2. Check queue position and status
3. Click "Claim Task" to assign to yourself
4. Click "Submit Credentials" to test the modal

### **3. Test API Endpoints**

#### **Customer Creation API**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "company_name": "API Test Company",
    "contact_name": "Test User",
    "phone": "1234567890",
    "plan_type": "basic"
  }'
```

#### **Supabase Connection Test**
```bash
curl -X POST http://localhost:3000/api/test-supabase-connection \
  -H "Content-Type: application/json" \
  -d '{
    "project_url": "https://invalid.supabase.co",
    "service_role_key": "invalid_key"
  }'
```

## 🔍 **Expected Results**

### **Successful Onboarding**
- ✅ Customer account created in database
- ✅ Provisioning request added to queue
- ✅ Email notifications sent (if configured)
- ✅ Redirect to waiting screen with customer ID
- ✅ Real-time queue position tracking

### **Admin Portal Functionality**
- ✅ Dashboard loads with queue data
- ✅ Can claim and manage tasks
- ✅ Credential submission modal works
- ✅ Migration process can be initiated

### **Error Handling**
- ✅ Form validation works on all steps
- ✅ Duplicate email prevention (409 error)
- ✅ Invalid Supabase credentials rejected
- ✅ Network errors handled gracefully

## 🚨 **Troubleshooting**

### **If "Supabase admin client not configured" error:**
1. Restart dev server: `pkill -f "next dev" && npm run dev`
2. Check `.env.local` has required variables
3. Verify Supabase URL and keys are correct

### **If onboarding submission fails:**
1. Check browser console for errors
2. Verify all form fields are valid
3. Ensure Supabase credentials are correct
4. Check network tab for failed API calls

### **If waiting screen doesn't load:**
1. Verify customer_id parameter in URL
2. Check that provisioning request was created
3. Look for JavaScript errors in console

## 📊 **Test Results Template**

Copy and paste this format for your testing results:

```
## 🧪 Test Results - [Date]

### ✅ Working Features
- [ ] Homepage navigation to onboarding
- [ ] Email pre-fill functionality  
- [ ] 5-step onboarding form
- [ ] Form validation
- [ ] Customer creation API
- [ ] Waiting screen loading
- [ ] Admin dashboard access
- [ ] Queue management

### ❌ Issues Found
- [Issue description]
- [Steps to reproduce]

### 🔧 Fixes Applied
- [Fix description]

### 📝 Notes
[Additional observations]
```

## 🎯 **Success Criteria**

The onboarding system is **fully functional** when:
1. ✅ Users can navigate from homepage to onboarding
2. ✅ All 5 steps work correctly
3. ✅ Customer accounts are created successfully
4. ✅ Waiting screen shows real-time updates
5. ✅ Admin portal can manage the queue
6. ✅ All API endpoints respond correctly

---

**Ready for testing!** 🚀
