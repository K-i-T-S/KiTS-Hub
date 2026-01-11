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

    // Verify authentication
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

    // Get user context
    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id, role, permissions')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Set tenant context
    await supabase.rpc('set_tenant_context', { p_tenant_id: userData.tenant_id })

    switch (action) {
      case 'create-sale':
        return await createSale(supabase, data, userData)
      case 'process-payment':
        return await processPayment(supabase, data, userData)
      case 'refund-sale':
        return await refundSale(supabase, data, userData)
      case 'void-sale':
        return await voidSale(supabase, data, userData)
      case 'get-sales-report':
        return await getSalesReport(supabase, data, userData)
      case 'get-daily-summary':
        return await getDailySummary(supabase, userData)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Sales processor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function createSale(supabase: any, data: any, userData: any) {
  const { customerId, locationId, items, paymentMethod, discountRate = 0, taxRate = 0, notes } = data

  if (!hasPermission(userData, 'sales.create')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Validate items and check stock
  for (const item of items) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('current_stock, track_inventory, allow_partial_sales, price')
      .eq('id', item.productId)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: `Product ${item.productId} not found` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (product.track_inventory && product.current_stock < item.quantity) {
      if (!product.allow_partial_sales) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for product ${item.productId}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      // Adjust quantity to available stock for partial sales
      item.quantity = product.current_stock
    }

    // Set unit price if not provided
    if (!item.unitPrice) {
      item.unitPrice = product.price
    }
  }

  // Generate sale number
  const { data: saleNumberData } = await supabase.rpc('generate_sale_number', {
    p_tenant_id: userData.tenant_id
  })

  // Calculate totals
  let subtotal = 0
  const saleItems = []

  for (const item of items) {
    const totalPrice = item.unitPrice * item.quantity
    const discountAmount = totalPrice * discountRate
    const taxAmount = (totalPrice - discountAmount) * taxRate
    const finalPrice = totalPrice - discountAmount + taxAmount

    subtotal += totalPrice

    saleItems.push({
      product_id: item.productId,
      variant_id: item.variantId || null,
      batch_id: item.batchId || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: totalPrice,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      notes: item.notes || null
    })
  }

  const totalDiscountAmount = subtotal * discountRate
  const totalTaxAmount = (subtotal - totalDiscountAmount) * taxRate
  const totalAmount = subtotal - totalDiscountAmount + totalTaxAmount

  // Create sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      tenant_id: userData.tenant_id,
      sale_number: saleNumberData,
      customer_id: customerId || null,
      location_id: locationId || null,
      user_id: userData.id,
      status: 'completed',
      subtotal,
      tax_amount: totalTaxAmount,
      discount_amount: totalDiscountAmount,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: 'paid',
      tax_rate: taxRate,
      discount_rate: discountRate,
      notes
    })
    .select()
    .single()

  if (saleError) {
    return new Response(
      JSON.stringify({ error: saleError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Create sale items
  const { data: createdItems, error: itemsError } = await supabase
    .from('sale_items')
    .insert(
      saleItems.map(item => ({
        ...item,
        sale_id: sale.id,
        cost: 0 // Would be calculated from product cost
      }))
    )
    .select()

  if (itemsError) {
    // Rollback sale creation
    await supabase.from('sales').delete().eq('id', sale.id)
    return new Response(
      JSON.stringify({ error: itemsError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Update stock levels
  for (const item of items) {
    if (item.quantity > 0) {
      // Create stock movement
      await supabase
        .from('stock_movements')
        .insert({
          tenant_id: userData.tenant_id,
          product_id: item.productId,
          location_id: locationId || null,
          movement_type: 'sale',
          quantity: -item.quantity,
          reference_id: sale.id,
          reference_type: 'sale',
          created_by: userData.id
        })

      // Update product stock
      await supabase.rpc('update_product_stock', {
        p_product_id: item.productId,
        p_quantity: -item.quantity
      })
    }
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      tenant_id: userData.tenant_id,
      sale_id: sale.id,
      payment_method: paymentMethod,
      amount: totalAmount,
      status: 'completed',
      processed_by: userData.id
    })
    .select()
    .single()

  // Update customer statistics
  if (customerId) {
    await supabase.rpc('update_customer_statistics', { 
      customer_id: customerId 
    })
  }

  // Log analytics event
  await supabase
    .from('analytics_events')
    .insert({
      tenant_id: userData.tenant_id,
      event_type: 'sale_completed',
      event_data: {
        sale_id: sale.id,
        total_amount: totalAmount,
        item_count: items.length,
        payment_method: paymentMethod
      },
      user_id: userData.id
    })

  return new Response(
    JSON.stringify({
      success: true,
      sale,
      items: createdItems,
      payment
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
  )
}

async function processPayment(supabase: any, data: any, userData: any) {
  const { saleId, paymentMethod, amount, transactionId, gatewayResponse } = data

  if (!hasPermission(userData, 'payments.process')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Get sale details
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('total_amount, payment_status')
    .eq('id', saleId)
    .single()

  if (saleError || !sale) {
    return new Response(
      JSON.stringify({ error: 'Sale not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      tenant_id: userData.tenant_id,
      sale_id: saleId,
      payment_method: paymentMethod,
      amount,
      status: 'completed',
      transaction_id: transactionId,
      gateway_response: gatewayResponse,
      processed_by: userData.id
    })
    .select()
    .single()

  if (paymentError) {
    return new Response(
      JSON.stringify({ error: paymentError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Update sale payment status
  const { data: existingPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('sale_id', saleId)
    .eq('status', 'completed')

  const totalPaid = existingPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0

  let newPaymentStatus = 'partial'
  if (totalPaid >= sale.total_amount) {
    newPaymentStatus = 'paid'
  } else if (totalPaid === 0) {
    newPaymentStatus = 'pending'
  }

  await supabase
    .from('sales')
    .update({ payment_status: newPaymentStatus })
    .eq('id', saleId)

  return new Response(
    JSON.stringify({ success: true, payment, payment_status: newPaymentStatus }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function refundSale(supabase: any, data: any, userData: any) {
  const { saleId, refundAmount, refundReason, refundItems } = data

  if (!hasPermission(userData, 'sales.refund')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Get sale details
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('status, total_amount, payment_status')
    .eq('id', saleId)
    .single()

  if (saleError || !sale) {
    return new Response(
      JSON.stringify({ error: 'Sale not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  if (sale.status !== 'completed') {
    return new Response(
      JSON.stringify({ error: 'Sale cannot be refunded' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Process refund items - return stock to inventory
  if (refundItems && refundItems.length > 0) {
    for (const refundItem of refundItems) {
      // Return stock
      await supabase.rpc('update_product_stock', {
        p_product_id: refundItem.productId,
        p_quantity: refundItem.quantity
      })

      // Create stock movement for return
      await supabase
        .from('stock_movements')
        .insert({
          tenant_id: userData.tenant_id,
          product_id: refundItem.productId,
          movement_type: 'return',
          quantity: refundItem.quantity,
          reference_id: saleId,
          reference_type: 'sale',
          notes: refundReason || 'Sale refund',
          created_by: userData.id
        })
    }
  }

  // Create refund payment
  const { data: refundPayment, error: refundError } = await supabase
    .from('payments')
    .insert({
      tenant_id: userData.tenant_id,
      sale_id: saleId,
      payment_method: 'refund',
      amount: -refundAmount,
      status: 'completed',
      refund_reason: refundReason,
      processed_by: userData.id
    })
    .select()
    .single()

  if (refundError) {
    return new Response(
      JSON.stringify({ error: refundError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Update sale status
  await supabase
    .from('sales')
    .update({ status: 'refunded' })
    .eq('id', saleId)

  return new Response(
    JSON.stringify({ success: true, refund_payment: refundPayment }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function voidSale(supabase: any, data: any, userData: any) {
  const { saleId, voidReason } = data

  if (!hasPermission(userData, 'sales.void')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Get sale items to return stock
  const { data: saleItems, error: itemsError } = await supabase
    .from('sale_items')
    .select('product_id, quantity')
    .eq('sale_id', saleId)

  if (itemsError) {
    return new Response(
      JSON.stringify({ error: itemsError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Return all items to stock
  for (const item of saleItems) {
    await supabase.rpc('update_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity
    })

    await supabase
      .from('stock_movements')
      .insert({
        tenant_id: userData.tenant_id,
        product_id: item.product_id,
        movement_type: 'return',
        quantity: item.quantity,
        reference_id: saleId,
        reference_type: 'sale',
        notes: voidReason || 'Sale voided',
        created_by: userData.id
      })
  }

  // Void payments
  await supabase
    .from('payments')
    .update({ status: 'void' })
    .eq('sale_id', saleId)

  // Update sale status
  await supabase
    .from('sales')
    .update({ 
      status: 'void',
      notes: voidReason || 'Sale voided'
    })
    .eq('id', saleId)

  return new Response(
    JSON.stringify({ success: true, message: 'Sale voided successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function getSalesReport(supabase: any, data: any, userData: any) {
  const { startDate, endDate, locationId, customerId } = data

  if (!hasPermission(userData, 'reports.view')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  let query = supabase
    .from('sales')
    .select(`
      *,
      customer:customers(first_name, last_name, company),
      location:locations(name),
      user:users(first_name, last_name),
      sale_items(
        product_id,
        quantity,
        unit_price,
        total_price,
        product:products(name, sku)
      )
    `)
    .eq('tenant_id', userData.tenant_id)
    .eq('status', 'completed')

  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  if (locationId) {
    query = query.eq('location_id', locationId)
  }
  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data: sales, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify(sales),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function getDailySummary(supabase: any, userData: any) {
  if (!hasPermission(userData, 'dashboard.view')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const today = new Date().toISOString().split('T')[0]

  // Get today's sales summary
  const { data: todaySales, error: salesError } = await supabase
    .from('sales')
    .select('total_amount, payment_status')
    .eq('tenant_id', userData.tenant_id)
    .eq('status', 'completed')
    .gte('created_at', today)

  // Get top selling products
  const { data: topProducts, error: productsError } = await supabase
    .from('sale_items')
    .select(`
      quantity,
      total_price,
      product:products(name, sku)
    `)
    .gte('created_at', today)

  if (salesError || productsError) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate summary' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const totalSales = todaySales?.reduce((sum: number, sale: any) => sum + sale.total_amount, 0) || 0
  const salesCount = todaySales?.length || 0

  // Aggregate product sales
  const productSales = new Map()
  topProducts?.forEach((item: any) => {
    const key = item.product?.name || 'Unknown'
    const existing = productSales.get(key) || { quantity: 0, revenue: 0 }
    productSales.set(key, {
      quantity: existing.quantity + item.quantity,
      revenue: existing.revenue + item.total_price,
      sku: item.product?.sku
    })
  })

  const topSellingProducts = Array.from(productSales.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return new Response(
    JSON.stringify({
      total_sales: totalSales,
      sales_count: salesCount,
      top_products: topSellingProducts,
      date: today
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

function hasPermission(userData: any, permission: string): boolean {
  if (userData.role === 'admin') return true
  if (userData.permissions?.includes('*')) return true
  if (userData.permissions?.includes(permission)) return true
  
  const rolePermissions: Record<string, string[]> = {
    'sales_staff': [
      'sales.create', 'payments.process', 'dashboard.view'
    ],
    'manager': [
      'sales.create', 'sales.refund', 'sales.void', 'payments.process', 
      'reports.view', 'dashboard.view'
    ]
  }
  
  return rolePermissions[userData.role]?.includes(permission) || false
}
