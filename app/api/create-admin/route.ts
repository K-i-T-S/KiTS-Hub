import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const admin = supabaseAdmin
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
    }

    // Get existing admin users
    const { data, error } = await admin
      .from('admin_users')
      .select('*')
      .limit(10)

    if (error) {
      console.log('🔧 Get Admins Debug: Error getting admins:', error)
      return NextResponse.json({ 
        error: 'Failed to get admins', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('🔧 Get Admins Debug: Admins found:', data?.length || 0)

    return NextResponse.json({
      success: true,
      admins: data || []
    })

  } catch (error) {
    console.error('🔧 Get Admins Debug: Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
