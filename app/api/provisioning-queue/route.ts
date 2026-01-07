import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/lib/provisioning'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    // Get provisioning queue
    const response = await ProvisioningService.getProvisioningQueue(status)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in provisioning queue API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
