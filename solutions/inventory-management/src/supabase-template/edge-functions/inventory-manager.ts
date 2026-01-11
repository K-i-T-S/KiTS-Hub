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

    // Verify user authentication and tenant context
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

    // Get user's tenant context
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
      case 'add-stock':
        return await handleAddStock(supabase, data, userData)
      case 'remove-stock':
        return await handleRemoveStock(supabase, data, userData)
      case 'transfer-stock':
        return await handleTransferStock(supabase, data, userData)
      case 'adjust-stock':
        return await handleAdjustStock(supabase, data, userData)
      case 'get-inventory-stats':
        return await getInventoryStats(supabase, userData)
      case 'get-low-stock-items':
        return await getLowStockItems(supabase, userData)
      case 'create-purchase-order':
        return await createPurchaseOrder(supabase, data, userData)
      case 'process-stock-receipt':
        return await processStockReceipt(supabase, data, userData)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Inventory manager error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleAddStock(supabase: any, data: any, userData: any) {
  const { productId, quantity, locationId, batchNumber, supplierId, unitCost, manufactureDate, expirationDate } = data

  // Check permissions
  if (!hasPermission(userData, 'inventory.add')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Start transaction
  const { data: result, error } = await supabase.rpc('add_stock_transaction', {
    p_product_id: productId,
    p_quantity: quantity,
    p_location_id: locationId,
    p_batch_number: batchNumber,
    p_supplier_id: supplierId,
    p_unit_cost: unitCost,
    p_manufacture_date: manufactureDate,
    p_expiration_date: expirationDate,
    p_user_id: userData.id
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ success: true, data: result }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleRemoveStock(supabase: any, data: any, userData: any) {
  const { productId, quantity, locationId, reason, referenceId, referenceType } = data

  if (!hasPermission(userData, 'inventory.remove')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Check if enough stock is available
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('current_stock, track_inventory')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return new Response(
      JSON.stringify({ error: 'Product not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  if (product.track_inventory && product.current_stock < quantity) {
    return new Response(
      JSON.stringify({ error: 'Insufficient stock available' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Create stock movement
  const { data: movement, error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      tenant_id: userData.tenant_id,
      product_id: productId,
      location_id: locationId,
      movement_type: 'adjustment',
      quantity: -quantity,
      reference_id: referenceId,
      reference_type: referenceType,
      notes: reason,
      created_by: userData.id
    })
    .select()
    .single()

  if (movementError) {
    return new Response(
      JSON.stringify({ error: movementError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Update product stock
  await supabase.rpc('update_product_stock', {
    p_product_id: productId,
    p_quantity: -quantity
  })

  return new Response(
    JSON.stringify({ success: true, movement }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleTransferStock(supabase: any, data: any, userData: any) {
  const { productId, quantity, fromLocationId, toLocationId, reason } = data

  if (!hasPermission(userData, 'inventory.transfer')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Check if enough stock is available at source location
  const { data: batches, error: batchError } = await supabase
    .from('product_batches')
    .select('id, quantity_available')
    .eq('product_id', productId)
    .eq('location_id', fromLocationId)
    .eq('is_active', true)

  if (batchError) {
    return new Response(
      JSON.stringify({ error: batchError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const totalAvailable = batches.reduce((sum: number, batch: any) => sum + batch.quantity_available, 0)
  if (totalAvailable < quantity) {
    return new Response(
      JSON.stringify({ error: 'Insufficient stock available for transfer' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Create transfer movements
  const { data: transferOut, error: outError } = await supabase
    .from('stock_movements')
    .insert({
      tenant_id: userData.tenant_id,
      product_id: productId,
      location_id: fromLocationId,
      movement_type: 'transfer_out',
      quantity: -quantity,
      notes: reason || `Transfer to location ${toLocationId}`,
      created_by: userData.id
    })
    .select()
    .single()

  if (outError) {
    return new Response(
      JSON.stringify({ error: outError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const { data: transferIn, error: inError } = await supabase
    .from('stock_movements')
    .insert({
      tenant_id: userData.tenant_id,
      product_id: productId,
      location_id: toLocationId,
      movement_type: 'transfer_in',
      quantity: quantity,
      reference_id: transferOut.id,
      reference_type: 'stock_movement',
      notes: reason || `Transfer from location ${fromLocationId}`,
      created_by: userData.id
    })
    .select()
    .single()

  if (inError) {
    return new Response(
      JSON.stringify({ error: inError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      transfer: { 
        transfer_out: transferOut, 
        transfer_in: transferIn 
      } 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleAdjustStock(supabase: any, data: any, userData: any) {
  const { productId, quantity, locationId, adjustmentType, reason } = data

  if (!hasPermission(userData, 'inventory.adjust')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const movementType = adjustmentType === 'increase' ? 'adjustment' : 'adjustment'
  const adjustedQuantity = adjustmentType === 'increase' ? quantity : -quantity

  // Create stock movement
  const { data: movement, error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      tenant_id: userData.tenant_id,
      product_id: productId,
      location_id: locationId,
      movement_type: movementType,
      quantity: adjustedQuantity,
      notes: reason || `Stock ${adjustmentType}`,
      created_by: userData.id
    })
    .select()
    .single()

  if (movementError) {
    return new Response(
      JSON.stringify({ error: movementError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Update product stock
  await supabase.rpc('update_product_stock', {
    p_product_id: productId,
    p_quantity: adjustedQuantity
  })

  return new Response(
    JSON.stringify({ success: true, movement }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function getInventoryStats(supabase: any, userData: any) {
  if (!hasPermission(userData, 'inventory.view')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const { data: stats, error } = await supabase.rpc('get_inventory_stats', {
    p_tenant_id: userData.tenant_id
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify(stats),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function getLowStockItems(supabase: any, userData: any) {
  if (!hasPermission(userData, 'inventory.view')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const { data: items, error } = await supabase
    .from('products')
    .select(`
      id, name, sku, current_stock, reorder_point, low_stock,
      category:categories(name),
      supplier:suppliers(name)
    `)
    .eq('tenant_id', userData.tenant_id)
    .eq('is_active', true)
    .eq('low_stock', true)
    .order('current_stock', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify(items),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function createPurchaseOrder(supabase: any, data: any, userData: any) {
  if (!hasPermission(userData, 'purchasing.create')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const { supplierId, items, expectedDeliveryDate, notes } = data

  // Create purchase order (this would be a separate table in a full implementation)
  const poNumber = `PO-${Date.now()}`
  
  // For now, we'll just create stock movements for the expected items
  const movements = []
  for (const item of items) {
    const { data: movement } = await supabase
      .from('stock_movements')
      .insert({
        tenant_id: userData.tenant_id,
        product_id: item.productId,
        movement_type: 'purchase',
        quantity: item.quantity,
        reference_type: 'purchase_order',
        notes: `Expected from PO ${poNumber}`,
        created_by: userData.id
      })
      .select()
      .single()
    
    movements.push(movement)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      purchaseOrder: { 
        number: poNumber,
        supplierId,
        expectedDeliveryDate,
        notes,
        movements
      } 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
  )
}

async function processStockReceipt(supabase: any, data: any, userData: any) {
  if (!hasPermission(userData, 'inventory.receive')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const { purchaseOrderId, items, locationId } = data

  const results = []
  
  for (const item of items) {
    // Add stock to inventory
    const { data: result, error } = await supabase.rpc('add_stock_transaction', {
      p_product_id: item.productId,
      p_quantity: item.receivedQuantity,
      p_location_id: locationId,
      p_batch_number: item.batchNumber,
      p_supplier_id: item.supplierId,
      p_unit_cost: item.unitCost,
      p_manufacture_date: item.manufactureDate,
      p_expiration_date: item.expirationDate,
      p_user_id: userData.id
    })

    results.push({
      productId: item.productId,
      success: !error,
      data: result,
      error: error?.message
    })
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

function hasPermission(userData: any, permission: string): boolean {
  if (userData.role === 'admin') return true
  if (userData.permissions?.includes('*')) return true
  if (userData.permissions?.includes(permission)) return true
  
  // Role-based permissions
  const rolePermissions: Record<string, string[]> = {
    'inventory_manager': [
      'inventory.view', 'inventory.add', 'inventory.remove', 
      'inventory.transfer', 'inventory.adjust', 'purchasing.create', 'inventory.receive'
    ],
    'manager': [
      'inventory.view', 'inventory.transfer', 'inventory.adjust'
    ]
  }
  
  return rolePermissions[userData.role]?.includes(permission) || false
}
