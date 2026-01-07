import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/lib/provisioning'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customer_id = searchParams.get('customer_id')

    if (!customer_id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Get queue position
    const response = await ProvisioningService.getQueuePosition(customer_id)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in queue position API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
