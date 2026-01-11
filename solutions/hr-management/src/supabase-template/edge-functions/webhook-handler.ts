import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "./cors.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { action, data } = await req.json()

    switch (action) {
      case 'register-webhook':
        return await registerWebhook(supabase, data)
      case 'trigger-webhook':
        return await triggerWebhook(supabase, data)
      case 'retry-deliveries':
        return await retryFailedDeliveries(supabase)
      case 'webhook-status':
        return await getWebhookStatus(supabase, data)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function registerWebhook(supabase: any, data: any) {
  const { name, url, events, secretKey, headers, retryCount = 3, timeoutSeconds = 30 } = data

  // Validate webhook URL
  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL protocol' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid URL format' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Validate events
  const validEvents = [
    'sale.created', 'sale.completed', 'sale.refunded',
    'product.created', 'product.updated', 'product.low_stock',
    'customer.created', 'customer.updated',
    'inventory.movement', 'alert.created',
    'user.created', 'user.updated'
  ]

  for (const event of events) {
    if (!validEvents.includes(event)) {
      return new Response(
        JSON.stringify({ error: `Invalid event: ${event}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  }

  // Get tenant context from auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid authentication' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  // Get user's tenant
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Set tenant context
  await supabase.rpc('set_tenant_context', { p_tenant_id: userData.tenant_id })

  // Create webhook
  const { data: webhook, error } = await supabase
    .from('webhooks')
    .insert({
      tenant_id: userData.tenant_id,
      name,
      url,
      events,
      secret_key: secretKey || crypto.randomUUID(),
      headers: headers || {},
      retry_count: retryCount,
      timeout_seconds: timeoutSeconds,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ success: true, webhook }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
  )
}

async function triggerWebhook(supabase: any, data: any) {
  const { eventType, eventData, tenantId } = data

  if (!eventType || !eventData || !tenantId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: eventType, eventData, tenantId' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Set tenant context
  await supabase.rpc('set_tenant_context', { p_tenant_id: tenantId })

  // Get active webhooks for this event type
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .contains('events', [eventType])

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const deliveryPromises = webhooks.map(async (webhook: any) => {
    return await deliverWebhook(supabase, webhook, eventType, eventData)
  })

  const results = await Promise.allSettled(deliveryPromises)

  return new Response(
    JSON.stringify({ 
      success: true, 
      triggered: webhooks.length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function deliverWebhook(supabase: any, webhook: any, eventType: string, eventData: any): Promise<any> {
  // Create delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_id: webhook.id,
      event_type: eventType,
      event_data: eventData,
      attempt_number: 1,
      status: 'pending'
    })
    .select()
    .single()

  if (deliveryError) {
    throw new Error(`Failed to create delivery record: ${deliveryError.message}`)
  }

  // Prepare webhook payload
  const payload = {
    id: delivery.id,
    event: eventType,
    data: eventData,
    timestamp: new Date().toISOString(),
    tenant: webhook.tenant_id
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'KiTS-Hub-Webhooks/1.0',
    'X-KITS-Event': eventType,
    'X-KITS-Delivery': delivery.id,
    ...webhook.headers
  }

  // Add signature if secret key exists
  if (webhook.secret_key) {
    const signature = await generateSignature(JSON.stringify(payload), webhook.secret_key)
    headers['X-KITS-Signature'] = `sha256=${signature}`
  }

  try {
    // Make webhook request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000)

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()
    const responseCode = response.status

    // Update delivery record
    const status = responseCode >= 200 && responseCode < 300 ? 'delivered' : 'failed'
    
    await supabase
      .from('webhook_deliveries')
      .update({
        response_code: responseCode,
        response_body: responseText,
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
        next_retry_at: status === 'failed' ? calculateNextRetry(1, webhook.retry_count) : null
      })
      .eq('id', delivery.id)

    return {
      delivery_id: delivery.id,
      webhook_id: webhook.id,
      status,
      response_code: responseCode,
      success: status === 'delivered'
    }
  } catch (error) {
    // Update delivery record with error
    await supabase
      .from('webhook_deliveries')
      .update({
        response_code: 0,
        response_body: error.message,
        status: 'failed',
        next_retry_at: calculateNextRetry(1, webhook.retry_count)
      })
      .eq('id', delivery.id)

    return {
      delivery_id: delivery.id,
      webhook_id: webhook.id,
      status: 'failed',
      error: error.message,
      success: false
    }
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function calculateNextRetry(attempt: number, maxRetries: number): string | null {
  if (attempt >= maxRetries) {
    return null
  }

  // Exponential backoff: 5min, 15min, 30min, 1hr, 2hr, etc.
  const delayMinutes = Math.min(5 * Math.pow(2, attempt - 1), 120)
  const nextRetry = new Date(Date.now() + delayMinutes * 60 * 1000)
  
  return nextRetry.toISOString()
}

async function retryFailedDeliveries(supabase: any) {
  // Get failed deliveries that are ready for retry
  const { data: deliveries, error } = await supabase
    .from('webhook_deliveries')
    .select(`
      *,
      webhook:webhooks(id, url, secret_key, timeout_seconds, retry_count, headers)
    `)
    .eq('status', 'failed')
    .lte('next_retry_at', new Date().toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const retryPromises = deliveries.map(async (delivery: any) => {
    const webhook = delivery.webhook
    
    // Increment attempt number
    const newAttemptNumber = delivery.attempt_number + 1
    
    if (newAttemptNumber > webhook.retry_count) {
      // Max retries reached, mark as permanently failed
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          next_retry_at: null
        })
        .eq('id', delivery.id)
      
      return {
        delivery_id: delivery.id,
        status: 'max_retries_exceeded',
        success: false
      }
    }

    // Retry the webhook
    const payload = {
      id: delivery.id,
      event: delivery.event_type,
      data: delivery.event_data,
      timestamp: new Date().toISOString(),
      tenant: webhook.tenant_id
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'KiTS-Hub-Webhooks/1.0',
      'X-KITS-Event': delivery.event_type,
      'X-KITS-Delivery': delivery.id,
      'X-KITS-Retry-Count': newAttemptNumber.toString(),
      ...webhook.headers
    }

    if (webhook.secret_key) {
      const signature = await generateSignature(JSON.stringify(payload), webhook.secret_key)
      headers['X-KITS-Signature'] = `sha256=${signature}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000)

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseText = await response.text()
      const responseCode = response.status

      const status = responseCode >= 200 && responseCode < 300 ? 'delivered' : 'retrying'
      
      await supabase
        .from('webhook_deliveries')
        .update({
          attempt_number: newAttemptNumber,
          response_code: responseCode,
          response_body: responseText,
          status,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null,
          next_retry_at: status === 'retrying' ? calculateNextRetry(newAttemptNumber, webhook.retry_count) : null
        })
        .eq('id', delivery.id)

      return {
        delivery_id: delivery.id,
        attempt: newAttemptNumber,
        status,
        response_code: responseCode,
        success: status === 'delivered'
      }
    } catch (error) {
      await supabase
        .from('webhook_deliveries')
        .update({
          attempt_number: newAttemptNumber,
          response_code: 0,
          response_body: error.message,
          status: 'retrying',
          next_retry_at: calculateNextRetry(newAttemptNumber, webhook.retry_count)
        })
        .eq('id', delivery.id)

      return {
        delivery_id: delivery.id,
        attempt: newAttemptNumber,
        status: 'retrying',
        error: error.message,
        success: false
      }
    }
  })

  const results = await Promise.allSettled(retryPromises)

  return new Response(
    JSON.stringify({ 
      success: true, 
      retried: deliveries.length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function getWebhookStatus(supabase: any, data: any) {
  const { webhookId, tenantId } = data

  if (!webhookId || !tenantId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: webhookId, tenantId' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Set tenant context
  await supabase.rpc('set_tenant_context', { p_tenant_id: tenantId })

  // Get webhook with recent deliveries
  const { data: webhook, error } = await supabase
    .from('webhooks')
    .select(`
      *,
      webhook_deliveries(
        id,
        event_type,
        status,
        response_code,
        attempt_number,
        created_at,
        delivered_at
      )
    `)
    .eq('id', webhookId)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (!webhook) {
    return new Response(
      JSON.stringify({ error: 'Webhook not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  // Calculate statistics
  const deliveries = webhook.webhook_deliveries || []
  const totalDeliveries = deliveries.length
  const successfulDeliveries = deliveries.filter((d: any) => d.status === 'delivered').length
  const failedDeliveries = deliveries.filter((d: any) => d.status === 'failed').length
  const pendingDeliveries = deliveries.filter((d: any) => d.status === 'pending').length
  const retryingDeliveries = deliveries.filter((d: any) => d.status === 'retrying').length

  const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0

  const status = {
    webhook: {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      is_active: webhook.is_active,
      created_at: webhook.created_at
    },
    statistics: {
      total_deliveries: totalDeliveries,
      successful_deliveries: successfulDeliveries,
      failed_deliveries: failedDeliveries,
      pending_deliveries: pendingDeliveries,
      retrying_deliveries: retryingDeliveries,
      success_rate: Math.round(successRate * 100) / 100
    },
    recent_deliveries: deliveries
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
  }

  return new Response(
    JSON.stringify(status),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}
