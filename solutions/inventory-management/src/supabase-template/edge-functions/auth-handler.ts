import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "./cors.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { action, data } = await req.json()

    switch (action) {
      case 'login':
        return await handleLogin(supabase, data)
      case 'register':
        return await handleRegister(supabase, data)
      case 'reset-password':
        return await handlePasswordReset(supabase, data)
      case 'refresh-token':
        return await handleTokenRefresh(supabase, data)
      case 'set-tenant-context':
        return await setTenantContext(supabase, data)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Auth handler error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleLogin(supabase: any, data: any) {
  const { email, password, tenantSlug } = data

  // First, get tenant info
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, status, plan_type')
    .eq('slug', tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return new Response(
      JSON.stringify({ error: 'Invalid tenant' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  if (tenant.status !== 'active') {
    return new Response(
      JSON.stringify({ error: 'Tenant account is not active' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Set tenant context
  await supabase.rpc('set_tenant_context', { p_tenant_id: tenant.id })

  // Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    return new Response(
      JSON.stringify({ error: authError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  // Get user details with tenant info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, permissions, is_active')
    .eq('email', email)
    .eq('tenant_id', tenant.id)
    .single()

  if (userError || !userData || !userData.is_active) {
    return new Response(
      JSON.stringify({ error: 'User account not found or inactive' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  // Update last login
  await supabase
    .from('users')
    .update({ 
      last_login: new Date().toISOString(),
      login_count: supabase.rpc('increment_login_count', { p_user_id: userData.id })
    })
    .eq('id', userData.id)

  // Create session record
  await supabase
    .from('user_sessions')
    .insert({
      user_id: userData.id,
      session_token: authData.session.access_token,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      expires_at: authData.session.expires_at
    })

  return new Response(
    JSON.stringify({
      user: userData,
      session: authData.session,
      tenant: {
        id: tenant.id,
        slug: tenantSlug,
        plan_type: tenant.plan_type
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleRegister(supabase: any, data: any) {
  const { email, password, firstName, lastName, tenantSlug, companyName } = data

  // Check if tenant exists and is accepting registrations
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, status, plan_type, max_users')
    .eq('slug', tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return new Response(
      JSON.stringify({ error: 'Invalid tenant' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Check user limit
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  if (userCount >= tenant.max_users) {
    return new Response(
      JSON.stringify({ error: 'User limit reached for this tenant' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        tenant_id: tenant.id
      }
    }
  })

  if (authError) {
    return new Response(
      JSON.stringify({ error: authError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Set tenant context
  await supabase.rpc('set_tenant_context', { p_tenant_id: tenant.id })

  // Create user record
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      tenant_id: tenant.id,
      email,
      password_hash: '', // Handled by Supabase Auth
      first_name: firstName,
      last_name: lastName,
      role: userCount === 0 ? 'admin' : 'user', // First user becomes admin
      permissions: userCount === 0 ? ['*'] : [],
      is_active: true,
      email_verified: false
    })
    .select()
    .single()

  if (userError) {
    // Rollback auth user creation
    await supabase.auth.admin.deleteUser(authData.user.id)
    return new Response(
      JSON.stringify({ error: userError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Create customer record if this is a business registration
  if (companyName) {
    await supabase
      .from('customers')
      .insert({
        tenant_id: tenant.id,
        first_name: firstName,
        last_name: lastName,
        company: companyName,
        email,
        customer_type: 'business'
      })
  }

  return new Response(
    JSON.stringify({
      user: userData,
      message: 'Registration successful. Please check your email to verify your account.'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
  )
}

async function handlePasswordReset(supabase: any, data: any) {
  const { email, tenantSlug } = data

  // Get tenant info
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return new Response(
      JSON.stringify({ error: 'Invalid tenant' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Check if user exists in this tenant
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .single()

  if (userError || !userData) {
    // Don't reveal if user exists or not
    return new Response(
      JSON.stringify({ message: 'If an account exists, a password reset link has been sent.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }

  // Send password reset email
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${req.headers.get('origin')}/reset-password?tenant=${tenantSlug}`
  })

  if (resetError) {
    return new Response(
      JSON.stringify({ error: resetError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Password reset link sent successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleTokenRefresh(supabase: any, data: any) {
  const { refreshToken } = data

  const { data: authData, error: authError } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  })

  if (authError) {
    return new Response(
      JSON.stringify({ error: 'Invalid refresh token' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  return new Response(
    JSON.stringify({ session: authData.session }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function setTenantContext(supabase: any, data: any) {
  const { tenantId } = data

  // Verify tenant exists and is active
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, status')
    .eq('id', tenantId)
    .eq('status', 'active')
    .single()

  if (tenantError || !tenant) {
    return new Response(
      JSON.stringify({ error: 'Invalid or inactive tenant' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Set tenant context
  await supabase.rpc('set_tenant_context', { p_tenant_id: tenantId })

  return new Response(
    JSON.stringify({ message: 'Tenant context set successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}
