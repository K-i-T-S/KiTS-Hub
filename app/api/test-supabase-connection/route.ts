import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_url, service_role_key } = body

    // Validate required fields
    const missingFields = []
    if (!project_url || project_url.trim() === '') {
      missingFields.push('project_url')
    }
    if (!service_role_key || service_role_key.trim() === '') {
      missingFields.push('service_role_key')
    }
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Create test client
    const testClient = createClient(project_url, service_role_key)

    // Test connection by trying to query a non-existent table
    // We expect an error here since the table doesn't exist, but it proves connection works
    const { data, error } = await testClient.from('_test_connection').select('*').limit(1)

    // Check if error is about table not existing (which is expected and good)
    if (error) {
      // If the error is about table not existing, connection is working
      if (error.message.includes('does not exist') || error.message.includes('relation "_test_connection" does not exist')) {
        return NextResponse.json({ 
          success: true, 
          message: 'Connection successful - credentials are valid' 
        })
      }
      
      // If it's an authentication error, credentials are invalid
      if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Invalid Supabase credentials. Please check your project URL and service role key.' },
          { status: 200 } // Return 200 with clear error message
        )
      }
      
      // For other errors, return a clear message
      console.error('Supabase connection error:', error)
      return NextResponse.json(
        { error: `Connection failed: ${error.message}` },
        { status: 200 } // Return 200 with error details
      )
    }

    // If we get here, connection is working
    return NextResponse.json({ 
      success: true, 
      message: 'Connection successful' 
    })

  } catch (error) {
    console.error('Error testing Supabase connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
