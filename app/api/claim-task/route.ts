import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/lib/provisioning'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queue_id, admin_id } = body

    console.log('🔧 API Debug: Claim task request:', { queue_id, admin_id })

    // Validate required fields
    if (!queue_id || !admin_id) {
      console.log('🔧 API Debug: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: queue_id, admin_id' },
        { status: 400 }
      )
    }

    console.log('🔧 API Debug: Calling ProvisioningService.claimProvisioningTask...')
    // Claim the provisioning task
    const response = await ProvisioningService.claimProvisioningTask(queue_id, admin_id)
    console.log('🔧 API Debug: ProvisioningService response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('🔧 API Debug: Error in claim task API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
