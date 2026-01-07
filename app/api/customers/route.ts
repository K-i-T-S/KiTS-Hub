import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }
  return supabaseAdmin
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, company_name, contact_name, phone, plan_type } = body

    // Validate required fields
    if (!email || !company_name || !contact_name || !plan_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Check if customer already exists
    const { data: existingCustomer } = await admin
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    // Create new customer
    const { data: customer, error } = await admin
      .from('customers')
      .insert({
        email,
        company_name,
        contact_name,
        phone,
        plan_type,
        status: 'trial'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      customer_id: customer.id 
    })

  } catch (error) {
    console.error('Error in customers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    const { data: customer, error } = await admin
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching customer:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      customer 
    })

  } catch (error) {
    console.error('Error in customers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
