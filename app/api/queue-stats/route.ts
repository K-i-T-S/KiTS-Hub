import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/lib/provisioning'

export async function GET(request: NextRequest) {
  try {
    // Get queue statistics
    const response = await ProvisioningService.getQueueStats()

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in queue stats API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
