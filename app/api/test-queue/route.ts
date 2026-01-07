import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const admin = supabaseAdmin
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
    }

    // Check if table exists and get count
    const { count, error } = await admin
      .from('provisioning_queue')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log('🔧 Test Queue Debug: Error checking table:', error)
      return NextResponse.json({ 
        error: 'Table error', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('🔧 Test Queue Debug: Table exists, count:', count)

    // Get all records
    const { data: records, error: recordsError } = await admin
      .from('provisioning_queue')
      .select('*')
      .limit(10)

    if (recordsError) {
      console.log('🔧 Test Queue Debug: Error getting records:', recordsError)
      return NextResponse.json({ 
        error: 'Records error', 
        details: recordsError.message 
      }, { status: 500 })
    }

    console.log('🔧 Test Queue Debug: Records found:', records?.length || 0)

    return NextResponse.json({
      success: true,
      count,
      records: records || []
    })

  } catch (error) {
    console.error('🔧 Test Queue Debug: Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
