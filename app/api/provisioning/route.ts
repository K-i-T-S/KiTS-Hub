import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/lib/provisioning'
import { OnboardingFormData } from '@/types/provisioning'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer_id, 
      plan_type, 
      selected_features, 
      supabase_email, 
      supabase_password 
    } = body

    // Validate required fields
    if (!customer_id || !plan_type || !selected_features) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, plan_type, selected_features' },
        { status: 400 }
      )
    }

    // Create partial form data for provisioning
    const formData: Partial<OnboardingFormData> = {
      plan_type,
      selected_features,
      supabase_email,
      supabase_password,
    }

    // Create provisioning request
    const response = await ProvisioningService.createProvisioningRequest(customer_id, formData as OnboardingFormData)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in provisioning API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
