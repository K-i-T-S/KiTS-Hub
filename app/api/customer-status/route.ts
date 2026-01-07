import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/lib/provisioning'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // Validate email parameter
    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email address is required',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Please enter a valid email address',
          code: 'INVALID_EMAIL_FORMAT'
        },
        { status: 400 }
      )
    }

    // Check if Supabase admin is available
    if (!supabaseAdmin) {
      console.error('🔧 Customer Status API: Supabase admin not configured')
      return NextResponse.json(
        { 
          success: false,
          error: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      )
    }

    console.log('🔧 Customer Status API: Looking up customer for email:', email.toLowerCase())

    // Get customer by email
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, company_name, email, contact_name, created_at')
      .eq('email', email.toLowerCase())
      .single()

    if (customerError) {
      console.error('🔧 Customer Status API: Database error:', customerError)
      
      if (customerError.code === 'PGRST116') {
        // No rows returned - customer not found
        return NextResponse.json(
          { 
            success: false,
            error: 'No account found with this email address. Please check your email or sign up for a new account.',
            code: 'CUSTOMER_NOT_FOUND'
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error occurred. Please try again later.',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      )
    }

    if (!customer) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No account found with this email address. Please check your email or sign up for a new account.',
          code: 'CUSTOMER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    console.log('🔧 Customer Status API: Found customer:', customer.id)

    // Get queue position for this customer
    const queueResponse = await ProvisioningService.getQueuePosition(customer.id)

    if (!queueResponse.success) {
      console.error('🔧 Customer Status API: Queue position error:', queueResponse.error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Unable to retrieve queue status. Please try again later.',
          code: 'QUEUE_STATUS_ERROR'
        },
        { status: 500 }
      )
    }

    console.log('🔧 Customer Status API: Queue status retrieved successfully')

    // Return status with customer info
    return NextResponse.json({
      success: true,
      data: {
        ...queueResponse.data,
        customer: {
          company_name: customer.company_name,
          email: customer.email,
          contact_name: customer.contact_name,
          created_at: customer.created_at
        }
      },
      message: 'Status retrieved successfully'
    })

  } catch (error) {
    console.error('🔧 Customer Status API: Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
