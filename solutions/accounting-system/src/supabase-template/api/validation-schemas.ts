// KiTS Hub API Validation Schemas
// Comprehensive validation rules for all API endpoints

export interface ValidationSchema {
  validate: (data: any) => { isValid: boolean; errors: string[] }
}

// Base validation helpers
const isRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}

const isEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }
  return null
}

const isUUID = (uuid: string): string | null => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    return 'Invalid UUID format'
  }
  return null
}

const isNumber = (value: any, fieldName: string, min?: number, max?: number): string | null => {
  if (isNaN(Number(value))) {
    return `${fieldName} must be a number`
  }
  const num = Number(value)
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`
  }
  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`
  }
  return null
}

const isString = (value: any, fieldName: string, minLength?: number, maxLength?: number): string | null => {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`
  }
  if (minLength !== undefined && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`
  }
  if (maxLength !== undefined && value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`
  }
  return null
}

const isArray = (value: any, fieldName: string): string | null => {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`
  }
  return null
}

const isInEnum = (value: any, enumValues: string[], fieldName: string): string | null => {
  if (!enumValues.includes(value)) {
    return `${fieldName} must be one of: ${enumValues.join(', ')}`
  }
  return null
}

const isJSON = (value: any, fieldName: string): string | null => {
  try {
    JSON.stringify(value)
    return null
  } catch {
    return `${fieldName} must be valid JSON`
  }
}

// User validation schemas
export const createUserSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    const emailError = isRequired(data.email, 'Email')
    if (emailError) errors.push(emailError)
    else errors.push(isEmail(data.email) || '')

    errors.push(isRequired(data.first_name, 'First name') || '')
    errors.push(isRequired(data.last_name, 'Last name') || '')
    errors.push(isString(data.first_name, 'First name', 1, 100) || '')
    errors.push(isString(data.last_name, 'Last name', 1, 100) || '')

    if (data.phone) {
      errors.push(isString(data.phone, 'Phone', 10, 20) || '')
    }

    errors.push(isInEnum(data.role, ['admin', 'manager', 'user', 'viewer', 'inventory_manager', 'sales_staff', 'hr_manager', 'accountant'], 'Role') || '')

    if (data.permissions) {
      errors.push(isArray(data.permissions, 'Permissions') || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

export const updateUserSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    if (data.email !== undefined) {
      errors.push(isEmail(data.email) || '')
    }

    if (data.first_name !== undefined) {
      errors.push(isString(data.first_name, 'First name', 1, 100) || '')
    }

    if (data.last_name !== undefined) {
      errors.push(isString(data.last_name, 'Last name', 1, 100) || '')
    }

    if (data.phone !== undefined) {
      errors.push(isString(data.phone, 'Phone', 10, 20) || '')
    }

    if (data.role !== undefined) {
      errors.push(isInEnum(data.role, ['admin', 'manager', 'user', 'viewer', 'inventory_manager', 'sales_staff', 'hr_manager', 'accountant'], 'Role') || '')
    }

    if (data.permissions !== undefined) {
      errors.push(isArray(data.permissions, 'Permissions') || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Product validation schemas
export const createProductSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.name, 'Product name') || '')
    errors.push(isString(data.name, 'Product name', 1, 200) || '')

    errors.push(isRequired(data.sku, 'SKU') || '')
    errors.push(isString(data.sku, 'SKU', 1, 100) || '')

    if (data.barcode) {
      errors.push(isString(data.barcode, 'Barcode', 1, 50) || '')
    }

    if (data.category_id) {
      errors.push(isUUID(data.category_id) || '')
    }

    if (data.supplier_id) {
      errors.push(isUUID(data.supplier_id) || '')
    }

    errors.push(isString(data.brand, 'Brand', 0, 100) || '')
    errors.push(isString(data.unit, 'Unit', 0, 50) || '')

    errors.push(isNumber(data.cost, 'Cost', 0) || '')
    errors.push(isNumber(data.price, 'Price', 0) || '')

    if (data.weight !== undefined) {
      errors.push(isNumber(data.weight, 'Weight', 0) || '')
    }

    if (data.dimensions) {
      errors.push(isJSON(data.dimensions, 'Dimensions') || '')
    }

    if (data.images) {
      errors.push(isArray(data.images, 'Images') || '')
    }

    if (data.tags) {
      errors.push(isArray(data.tags, 'Tags') || '')
    }

    errors.push(isNumber(data.min_stock_level, 'Minimum stock level', 0) || '')
    errors.push(isNumber(data.max_stock_level, 'Maximum stock level', 0) || '')
    errors.push(isNumber(data.reorder_point, 'Reorder point', 0) || '')
    errors.push(isNumber(data.reorder_quantity, 'Reorder quantity', 0) || '')

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

export const updateProductSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    if (data.name !== undefined) {
      errors.push(isString(data.name, 'Product name', 1, 200) || '')
    }

    if (data.sku !== undefined) {
      errors.push(isString(data.sku, 'SKU', 1, 100) || '')
    }

    if (data.barcode !== undefined) {
      errors.push(isString(data.barcode, 'Barcode', 1, 50) || '')
    }

    if (data.category_id !== undefined) {
      errors.push(isUUID(data.category_id) || '')
    }

    if (data.supplier_id !== undefined) {
      errors.push(isUUID(data.supplier_id) || '')
    }

    if (data.brand !== undefined) {
      errors.push(isString(data.brand, 'Brand', 0, 100) || '')
    }

    if (data.unit !== undefined) {
      errors.push(isString(data.unit, 'Unit', 0, 50) || '')
    }

    if (data.cost !== undefined) {
      errors.push(isNumber(data.cost, 'Cost', 0) || '')
    }

    if (data.price !== undefined) {
      errors.push(isNumber(data.price, 'Price', 0) || '')
    }

    if (data.weight !== undefined) {
      errors.push(isNumber(data.weight, 'Weight', 0) || '')
    }

    if (data.dimensions !== undefined) {
      errors.push(isJSON(data.dimensions, 'Dimensions') || '')
    }

    if (data.images !== undefined) {
      errors.push(isArray(data.images, 'Images') || '')
    }

    if (data.tags !== undefined) {
      errors.push(isArray(data.tags, 'Tags') || '')
    }

    if (data.min_stock_level !== undefined) {
      errors.push(isNumber(data.min_stock_level, 'Minimum stock level', 0) || '')
    }

    if (data.max_stock_level !== undefined) {
      errors.push(isNumber(data.max_stock_level, 'Maximum stock level', 0) || '')
    }

    if (data.reorder_point !== undefined) {
      errors.push(isNumber(data.reorder_point, 'Reorder point', 0) || '')
    }

    if (data.reorder_quantity !== undefined) {
      errors.push(isNumber(data.reorder_quantity, 'Reorder quantity', 0) || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Sale validation schemas
export const createSaleSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    if (data.customer_id) {
      errors.push(isUUID(data.customer_id) || '')
    }

    if (data.location_id) {
      errors.push(isUUID(data.location_id) || '')
    }

    errors.push(isRequired(data.items, 'Sale items') || '')
    errors.push(isArray(data.items, 'Sale items') || '')

    if (data.items && Array.isArray(data.items)) {
      if (data.items.length === 0) {
        errors.push('At least one item is required')
      }

      data.items.forEach((item: any, index: number) => {
        errors.push(isRequired(item.product_id, `Product ID for item ${index + 1}`) || '')
        errors.push(isUUID(item.product_id) || '')

        if (item.variant_id) {
          errors.push(isUUID(item.variant_id) || '')
        }

        if (item.batch_id) {
          errors.push(isUUID(item.batch_id) || '')
        }

        errors.push(isRequired(item.quantity, `Quantity for item ${index + 1}`) || '')
        errors.push(isNumber(item.quantity, `Quantity for item ${index + 1}`, 1) || '')

        errors.push(isNumber(item.unit_price, `Unit price for item ${index + 1}`, 0) || '')
      })
    }

    errors.push(isRequired(data.payment_method, 'Payment method') || '')
    errors.push(isInEnum(data.payment_method, ['cash', 'card', 'check', 'transfer', 'credit', 'other'], 'Payment method') || '')

    if (data.discount_rate !== undefined) {
      errors.push(isNumber(data.discount_rate, 'Discount rate', 0, 1) || '')
    }

    if (data.tax_rate !== undefined) {
      errors.push(isNumber(data.tax_rate, 'Tax rate', 0, 1) || '')
    }

    if (data.notes) {
      errors.push(isString(data.notes, 'Notes', 0, 1000) || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Customer validation schemas
export const createCustomerSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.first_name, 'First name') || '')
    errors.push(isString(data.first_name, 'First name', 1, 100) || '')

    errors.push(isRequired(data.last_name, 'Last name') || '')
    errors.push(isString(data.last_name, 'Last name', 1, 100) || '')

    if (data.email) {
      errors.push(isEmail(data.email) || '')
    }

    if (data.phone) {
      errors.push(isString(data.phone, 'Phone', 10, 20) || '')
    }

    errors.push(isString(data.company, 'Company', 0, 200) || '')
    errors.push(isString(data.address, 'Address', 0, 500) || '')
    errors.push(isString(data.city, 'City', 0, 100) || '')
    errors.push(isString(data.state, 'State', 0, 100) || '')
    errors.push(isString(data.zip_code, 'Zip code', 0, 20) || '')
    errors.push(isString(data.country, 'Country', 0, 100) || '')

    errors.push(isInEnum(data.customer_type, ['individual', 'business', 'non_profit', 'government'], 'Customer type') || '')

    if (data.credit_limit !== undefined) {
      errors.push(isNumber(data.credit_limit, 'Credit limit', 0) || '')
    }

    if (data.tags) {
      errors.push(isArray(data.tags, 'Tags') || '')
    }

    if (data.notes) {
      errors.push(isString(data.notes, 'Notes', 0, 1000) || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Supplier validation schemas
export const createSupplierSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.name, 'Supplier name') || '')
    errors.push(isString(data.name, 'Supplier name', 1, 200) || '')

    errors.push(isString(data.contact_person, 'Contact person', 0, 100) || '')

    if (data.email) {
      errors.push(isEmail(data.email) || '')
    }

    if (data.phone) {
      errors.push(isString(data.phone, 'Phone', 10, 20) || '')
    }

    errors.push(isString(data.address, 'Address', 0, 500) || '')
    errors.push(isString(data.city, 'City', 0, 100) || '')
    errors.push(isString(data.state, 'State', 0, 100) || '')
    errors.push(isString(data.zip_code, 'Zip code', 0, 20) || '')
    errors.push(isString(data.country, 'Country', 0, 100) || '')

    errors.push(isString(data.tax_id, 'Tax ID', 0, 50) || '')
    errors.push(isString(data.payment_terms, 'Payment terms', 0, 200) || '')

    if (data.lead_time_days !== undefined) {
      errors.push(isNumber(data.lead_time_days, 'Lead time days', 0) || '')
    }

    if (data.min_order_amount !== undefined) {
      errors.push(isNumber(data.min_order_amount, 'Minimum order amount', 0) || '')
    }

    if (data.rating !== undefined) {
      errors.push(isNumber(data.rating, 'Rating', 1, 5) || '')
    }

    if (data.notes) {
      errors.push(isString(data.notes, 'Notes', 0, 1000) || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Category validation schemas
export const createCategorySchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.name, 'Category name') || '')
    errors.push(isString(data.name, 'Category name', 1, 100) || '')

    errors.push(isString(data.description, 'Description', 0, 500) || '')

    if (data.parent_id) {
      errors.push(isUUID(data.parent_id) || '')
    }

    if (data.image_url) {
      errors.push(isString(data.image_url, 'Image URL', 0, 500) || '')
    }

    if (data.sort_order !== undefined) {
      errors.push(isNumber(data.sort_order, 'Sort order', 0) || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Location validation schemas
export const createLocationSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.name, 'Location name') || '')
    errors.push(isString(data.name, 'Location name', 1, 100) || '')

    errors.push(isString(data.code, 'Location code', 0, 50) || '')
    errors.push(isString(data.address, 'Address', 0, 500) || '')
    errors.push(isString(data.city, 'City', 0, 100) || '')
    errors.push(isString(data.state, 'State', 0, 100) || '')
    errors.push(isString(data.zip_code, 'Zip code', 0, 20) || '')
    errors.push(isString(data.country, 'Country', 0, 100) || '')

    errors.push(isInEnum(data.location_type, ['warehouse', 'store', 'storage', 'production'], 'Location type') || '')

    if (data.manager_id) {
      errors.push(isUUID(data.manager_id) || '')
    }

    if (data.contact_phone) {
      errors.push(isString(data.contact_phone, 'Contact phone', 10, 20) || '')
    }

    if (data.operating_hours) {
      errors.push(isJSON(data.operating_hours, 'Operating hours') || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Stock movement validation schemas
export const createStockMovementSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.product_id, 'Product ID') || '')
    errors.push(isUUID(data.product_id) || '')

    if (data.variant_id) {
      errors.push(isUUID(data.variant_id) || '')
    }

    if (data.location_id) {
      errors.push(isUUID(data.location_id) || '')
    }

    if (data.batch_id) {
      errors.push(isUUID(data.batch_id) || '')
    }

    errors.push(isRequired(data.movement_type, 'Movement type') || '')
    errors.push(isInEnum(data.movement_type, ['sale', 'purchase', 'adjustment', 'return', 'transfer_in', 'transfer_out', 'damage', 'loss', 'production'], 'Movement type') || '')

    errors.push(isRequired(data.quantity, 'Quantity') || '')
    errors.push(isNumber(data.quantity, 'Quantity', 1) || '')

    if (data.reference_id) {
      errors.push(isUUID(data.reference_id) || '')
    }

    errors.push(isString(data.reference_type, 'Reference type', 0, 100) || '')
    errors.push(isString(data.notes, 'Notes', 0, 1000) || '')

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}

// Query parameter validation
export const validatePagination = (query: any) => {
  const errors: string[] = []

  if (query.page !== undefined) {
    errors.push(isNumber(query.page, 'Page', 1) || '')
  }

  if (query.limit !== undefined) {
    errors.push(isNumber(query.limit, 'Limit', 1, 100) || '')
  }

  if (query.offset !== undefined) {
    errors.push(isNumber(query.offset, 'Offset', 0) || '')
  }

  return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
}

export const validateDateRange = (query: any) => {
  const errors: string[] = []

  if (query.start_date) {
    const startDate = new Date(query.start_date)
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format')
    }
  }

  if (query.end_date) {
    const endDate = new Date(query.end_date)
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format')
    }
  }

  if (query.start_date && query.end_date) {
    const startDate = new Date(query.start_date)
    const endDate = new Date(query.end_date)
    if (startDate > endDate) {
      errors.push('Start date must be before end date')
    }
  }

  return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
}

// Tenant validation schemas
export const createTenantSchema: ValidationSchema = {
  validate: (data: any) => {
    const errors: string[] = []

    errors.push(isRequired(data.name, 'Tenant name') || '')
    errors.push(isString(data.name, 'Tenant name', 1, 200) || '')

    errors.push(isRequired(data.slug, 'Slug') || '')
    errors.push(isString(data.slug, 'Slug', 1, 100) || '')

    errors.push(isString(data.domain, 'Domain', 0, 100) || '')

    errors.push(isRequired(data.plan_type, 'Plan type') || '')
    errors.push(isInEnum(data.plan_type, ['starter', 'basic', 'professional', 'enterprise'], 'Plan type') || '')

    errors.push(isRequired(data.billing_cycle, 'Billing cycle') || '')
    errors.push(isInEnum(data.billing_cycle, ['monthly', 'yearly'], 'Billing cycle') || '')

    errors.push(isInEnum(data.status, ['active', 'suspended', 'cancelled', 'trial'], 'Status') || '')

    if (data.settings) {
      errors.push(isJSON(data.settings, 'Settings') || '')
    }

    if (data.subscription_data) {
      errors.push(isJSON(data.subscription_data, 'Subscription data') || '')
    }

    if (data.usage_limits) {
      errors.push(isJSON(data.usage_limits, 'Usage limits') || '')
    }

    if (data.api_quota !== undefined) {
      errors.push(isNumber(data.api_quota, 'API quota', 0) || '')
    }

    if (data.storage_quota_gb !== undefined) {
      errors.push(isNumber(data.storage_quota_gb, 'Storage quota (GB)', 0) || '')
    }

    if (data.max_users !== undefined) {
      errors.push(isNumber(data.max_users, 'Max users', 1) || '')
    }

    return { isValid: errors.every(e => e === ''), errors: errors.filter(e => e !== '') }
  }
}
