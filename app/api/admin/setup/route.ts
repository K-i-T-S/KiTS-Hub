import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/clients/admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const adminClient = getSupabaseAdminClient()
    
    // First, get the user from auth
    const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 })
    }
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Profile check failed' }, { status: 500 })
    }
    
    if (existingProfile) {
      // Update existing profile to be admin
      const { data: updatedProfile, error: updateError } = await adminClient
        .from('profiles')
        .update({ 
          is_admin: true,
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        message: 'Profile updated to admin',
        profile: updatedProfile 
      })
    } else {
      // Create new admin profile
      const { data: newProfile, error: createError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Admin User',
          is_admin: true,
          role: 'admin',
          login_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        message: 'Admin profile created',
        profile: newProfile 
      })
    }
    
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminClient = getSupabaseAdminClient()
    
    // Get all admin profiles
    const { data: adminProfiles, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('is_admin', true)
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch admin profiles' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Admin profiles fetched',
      count: adminProfiles?.length || 0,
      profiles: adminProfiles 
    })
    
  } catch (error) {
    console.error('Admin list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
