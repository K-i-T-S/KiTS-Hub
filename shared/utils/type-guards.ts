/**
 * Type Validation and Utilities for KiTS Hub
 * Comprehensive type guards, validators, and utility functions for shared types
 */

import { 
  User, 
  Tenant, 
  UserRole, 
  SubscriptionPlan,
  Product,
  Customer,
  Employee,
  Invoice,
  Sale,
  ApiResponse,
  PaginatedResponse,
  Address,
  FormField,
  NavigationItem,
  Theme
} from '../types'

// ============ TYPE GUARDS ============

/**
 * Type guard functions for runtime type checking
 */

export const isValidUserRole = (role: string): role is UserRole => {
  return ['super_admin', 'tenant_admin', 'manager', 'employee', 'cashier', 'sales_rep', 'accountant', 'viewer'].includes(role)
}

export const isValidSubscriptionPlan = (plan: string): plan is SubscriptionPlan => {
  return ['starter', 'professional', 'business', 'enterprise'].includes(plan)
}

export const isValidUser = (user: any): user is User => {
  return (
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    isValidUserRole(user.role) &&
    typeof user.tenant_id === 'string'
  )
}

export const isValidTenant = (tenant: any): tenant is Tenant => {
  return (
    typeof tenant === 'object' &&
    typeof tenant.id === 'string' &&
    typeof tenant.name === 'string' &&
    isValidSubscriptionPlan(tenant.plan) &&
    typeof tenant.settings === 'object'
  )
}

export const isValidAddress = (address: any): address is Address => {
  return (
    typeof address === 'object' &&
    (address.street === undefined || typeof address.street === 'string') &&
    (address.city === undefined || typeof address.city === 'string') &&
    (address.country === undefined || typeof address.country === 'string') &&
    (address.postal_code === undefined || typeof address.postal_code === 'string')
  )
}

export const isValidProduct = (product: any): product is Product => {
  return (
    typeof product === 'object' &&
    typeof product.id === 'string' &&
    typeof product.tenant_id === 'string' &&
    typeof product.sku === 'string' &&
    typeof product.name === 'string' &&
    typeof product.unit_price === 'number' &&
    typeof product.cost_price === 'number' &&
    typeof product.stock_quantity === 'number'
  )
}

export const isValidCustomer = (customer: any): customer is Customer => {
  return (
    typeof customer === 'object' &&
    typeof customer.id === 'string' &&
    typeof customer.tenant_id === 'string' &&
    typeof customer.customer_number === 'string' &&
    typeof customer.name === 'string' &&
    (customer.address === undefined || isValidAddress(customer.address))
  )
}

export const isValidEmployee = (employee: any): employee is Employee => {
  return (
    typeof employee === 'object' &&
    typeof employee.id === 'string' &&
    typeof employee.tenant_id === 'string' &&
    typeof employee.employee_number === 'string' &&
    typeof employee.first_name === 'string' &&
    typeof employee.last_name === 'string' &&
    (employee.address === undefined || isValidAddress(employee.address))
  )
}

// ============ VALIDATION SCHEMAS ============

/**
 * Validation schemas for form validation and data integrity
 */

export const userValidationSchema = {
  email: {
    required: true,
    type: 'email' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  name: {
    required: true,
    type: 'text' as const,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters'
  },
  role: {
    required: true,
    type: 'select' as const,
    options: [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'tenant_admin', label: 'Tenant Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'employee', label: 'Employee' },
      { value: 'cashier', label: 'Cashier' },
      { value: 'sales_rep', label: 'Sales Representative' },
      { value: 'accountant', label: 'Accountant' },
      { value: 'viewer', label: 'Viewer' }
    ]
  }
}

export const productValidationSchema = {
  sku: {
    required: true,
    type: 'text' as const,
    minLength: 3,
    maxLength: 50,
    pattern: /^[A-Z0-9-_]+$/,
    message: 'SKU must be uppercase letters, numbers, hyphens, and underscores only'
  },
  name: {
    required: true,
    type: 'text' as const,
    minLength: 1,
    maxLength: 200,
    message: 'Product name is required'
  },
  unit_price: {
    required: true,
    type: 'number' as const,
    min: 0,
    message: 'Unit price must be a positive number'
  },
  cost_price: {
    required: true,
    type: 'number' as const,
    min: 0,
    message: 'Cost price must be a positive number'
  },
  stock_quantity: {
    required: true,
    type: 'number' as const,
    min: 0,
    message: 'Stock quantity must be a non-negative number'
  }
}

export const customerValidationSchema = {
  customer_number: {
    required: true,
    type: 'text' as const,
    minLength: 3,
    maxLength: 50,
    message: 'Customer number is required'
  },
  name: {
    required: true,
    type: 'text' as const,
    minLength: 2,
    maxLength: 100,
    message: 'Customer name is required'
  },
  email: {
    required: false,
    type: 'email' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    required: false,
    type: 'text' as const,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  }
}

export const employeeValidationSchema = {
  employee_number: {
    required: true,
    type: 'text' as const,
    minLength: 3,
    maxLength: 50,
    message: 'Employee number is required'
  },
  first_name: {
    required: true,
    type: 'text' as const,
    minLength: 2,
    maxLength: 50,
    message: 'First name is required'
  },
  last_name: {
    required: true,
    type: 'text' as const,
    minLength: 2,
    maxLength: 50,
    message: 'Last name is required'
  },
  email: {
    required: false,
    type: 'email' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  }
}

// ============ VALIDATION FUNCTIONS ============

/**
 * Validation functions for runtime data validation
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

export const validateUser = (user: Partial<User>): ValidationResult => {
  const errors: Record<string, string[]> = {}

  if (!user.email) {
    errors.email = ['Email is required']
  } else if (!userValidationSchema.email.pattern.test(user.email)) {
    errors.email = ['Please enter a valid email address']
  }

  if (!user.name) {
    errors.name = ['Name is required']
  } else if (user.name.length < 2) {
    errors.name = ['Name must be at least 2 characters']
  } else if (user.name.length > 100) {
    errors.name = ['Name must be less than 100 characters']
  }

  if (!user.role) {
    errors.role = ['Role is required']
  } else if (!isValidUserRole(user.role)) {
    errors.role = ['Invalid role selected']
  }

  if (!user.tenant_id) {
    errors.tenant_id = ['Tenant ID is required']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateProduct = (product: Partial<Product>): ValidationResult => {
  const errors: Record<string, string[]> = {}

  if (!product.sku) {
    errors.sku = ['SKU is required']
  } else if (!productValidationSchema.sku.pattern?.test(product.sku)) {
    errors.sku = ['SKU must be uppercase letters, numbers, hyphens, and underscores only']
  }

  if (!product.name) {
    errors.name = ['Product name is required']
  } else if (product.name.length < 1) {
    errors.name = ['Product name cannot be empty']
  } else if (product.name.length > 200) {
    errors.name = ['Product name must be less than 200 characters']
  }

  if (typeof product.unit_price !== 'number' || product.unit_price < 0) {
    errors.unit_price = ['Unit price must be a positive number']
  }

  if (typeof product.cost_price !== 'number' || product.cost_price < 0) {
    errors.cost_price = ['Cost price must be a positive number']
  }

  if (typeof product.stock_quantity !== 'number' || product.stock_quantity < 0) {
    errors.stock_quantity = ['Stock quantity must be a non-negative number']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateCustomer = (customer: Partial<Customer>): ValidationResult => {
  const errors: Record<string, string[]> = {}

  if (!customer.customer_number) {
    errors.customer_number = ['Customer number is required']
  } else if (customer.customer_number.length < 3) {
    errors.customer_number = ['Customer number must be at least 3 characters']
  }

  if (!customer.name) {
    errors.name = ['Customer name is required']
  } else if (customer.name.length < 2) {
    errors.name = ['Customer name must be at least 2 characters']
  }

  if (customer.email && !customerValidationSchema.email.pattern?.test(customer.email)) {
    errors.email = ['Please enter a valid email address']
  }

  if (customer.phone && !customerValidationSchema.phone.pattern?.test(customer.phone)) {
    errors.phone = ['Please enter a valid phone number']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateEmployee = (employee: Partial<Employee>): ValidationResult => {
  const errors: Record<string, string[]> = {}

  if (!employee.employee_number) {
    errors.employee_number = ['Employee number is required']
  }

  if (!employee.first_name) {
    errors.first_name = ['First name is required']
  } else if (employee.first_name.length < 2) {
    errors.first_name = ['First name must be at least 2 characters']
  }

  if (!employee.last_name) {
    errors.last_name = ['Last name is required']
  } else if (employee.last_name.length < 2) {
    errors.last_name = ['Last name must be at least 2 characters']
  }

  if (employee.email && !employeeValidationSchema.email.pattern?.test(employee.email)) {
    errors.email = ['Please enter a valid email address']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// ============ TYPE TRANSFORMATIONS ============

/**
 * Type transformation utilities for data conversion and formatting
 */

export const transformUser = (data: any): User | null => {
  if (!isValidUser(data)) return null

  return {
    ...data,
    created_at: new Date(data.created_at as string).toISOString(),
    updated_at: new Date(data.updated_at as string).toISOString(),
    last_sign_in_at: data.last_sign_in_at ? new Date(data.last_sign_in_at as string).toISOString() : undefined
  }
}

export const transformProduct = (data: any): Product | null => {
  if (!isValidProduct(data)) return null

  return {
    ...data,
    created_at: new Date(data.created_at as string).toISOString(),
    updated_at: new Date(data.updated_at as string).toISOString(),
    unit_price: parseFloat(String(data.unit_price)),
    cost_price: parseFloat(String(data.cost_price)),
    stock_quantity: parseInt(String(data.stock_quantity), 10)
  }
}

export const transformCustomer = (data: any): Customer | null => {
  if (!isValidCustomer(data)) return null

  return {
    ...data,
    created_at: new Date(data.created_at).toISOString(),
    updated_at: new Date(data.updated_at).toISOString()
  }
}

export const transformEmployee = (data: any): Employee | null => {
  if (!isValidEmployee(data)) return null

  return {
    ...data,
    created_at: new Date(data.created_at).toISOString(),
    updated_at: new Date(data.updated_at).toISOString(),
    hire_date: new Date(data.hire_date).toISOString()
  }
}

// ============ API RESPONSE HELPERS ============

/**
 * API response type guards and utilities
 */

export const isApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    (response.data !== undefined || response.error !== undefined)
  )
}

export const isPaginatedResponse = <T>(response: any): response is PaginatedResponse<T> => {
  return (
    typeof response === 'object' &&
    Array.isArray(response.data) &&
    typeof response.total === 'number' &&
    typeof response.page === 'number' &&
    typeof response.per_page === 'number' &&
    typeof response.total_pages === 'number'
  )
}

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  data,
  success: true,
  message
})

export const createErrorResponse = (error: string, details?: any): ApiResponse<null> => ({
  data: null,
  success: false,
  error,
  details
})

export const createPaginatedResponse = <T>(
  data: T[], 
  page: number, 
  perPage: number, 
  total: number
): PaginatedResponse<T> => ({
  data,
  total,
  page,
  per_page: perPage,
  total_pages: Math.ceil(total / perPage)
})

// ============ FORM HELPERS ============

/**
 * Form utilities and helpers
 */

export const createFormField = (config: Partial<FormField>): FormField => ({
  name: '',
  label: '',
  type: 'text',
  required: false,
  ...config
})

export const validateForm = (fields: FormField[], values: Record<string, any>): ValidationResult => {
  const errors: Record<string, string[]> = {}

  fields.forEach(field => {
    const value = values[field.name]
    const fieldErrors: string[] = []

    // Required validation
    if (field.required && (value === undefined || value === '')) {
      fieldErrors.push(`${field.label} is required`)
    }

    // Type validation
    if (value !== undefined && value !== '') {
      switch (field.type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            fieldErrors.push('Please enter a valid email address')
          }
          break
        case 'number':
          if (isNaN(Number(value))) {
            fieldErrors.push('Please enter a valid number')
          }
          break
      }

      // Length validation
      if (field.validation?.min && value.length < field.validation.min) {
        fieldErrors.push(`Minimum length is ${field.validation.min}`)
      }
      if (field.validation?.max && value.length > field.validation.max) {
        fieldErrors.push(`Maximum length is ${field.validation.max}`)
      }

      // Pattern validation
      if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
        fieldErrors.push('Invalid format')
      }
    }

    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// ============ NAVIGATION HELPERS ============

/**
 * Navigation utilities and helpers
 */

export const createNavigationItem = (config: Partial<NavigationItem>): NavigationItem => ({
  path: '',
  label: '',
  ...config
})

export const filterNavigationByRole = (items: NavigationItem[], userRole: UserRole): NavigationItem[] => {
  return items.filter(item => 
    !item.permissions || item.permissions.includes(userRole)
  )
}

export const findNavigationItem = (items: NavigationItem[], path: string): NavigationItem | null => {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children) {
      const found = findNavigationItem(item.children, path)
      if (found) return found
    }
  }
  return null
}

// ============ THEME HELPERS ============

/**
 * Theme utilities and helpers
 */

export const createTheme = (config: Partial<Theme>): Theme => ({
  colors: {
    primary: '#a855f7',
    secondary: '#f3f4f6',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    ...config.colors
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    ...config.spacing
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    ...config.borderRadius
  }
})

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement

  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })

  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value)
  })

  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value)
  })
}

// ============ ERROR HANDLING ============

/**
 * Error handling utilities
 */

export class ValidationError extends Error {
  public errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class ApiError extends Error {
  public code?: string
  public details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

export const handleValidationError = (validationResult: ValidationResult): void => {
  if (!validationResult.isValid) {
    throw new ValidationError(validationResult.errors)
  }
}

export const handleApiError = (response: any): never => {
  if (isApiResponse(response) && !response.success) {
    throw new ApiError(response.error || 'Unknown error', response.code, response.details)
  }
  throw new ApiError('Invalid API response')
}

// ============ PERFORMANCE HELPERS ============

/**
 * Performance utilities for type checking and optimization
 */

export const createTypeCache = <T>() => {
  const cache = new Map<string, T>()
  
  return {
    get: (key: string): T | undefined => cache.get(key),
    set: (key: string, value: T): void => { cache.set(key, value) },
    has: (key: string): boolean => cache.has(key),
    clear: (): void => cache.clear(),
    size: (): number => cache.size
  }
}

export const memoizeValidation = <T>(
  validator: (data: T) => ValidationResult,
  keyGenerator: (data: T) => string
) => {
  const cache = createTypeCache<ValidationResult>()
  
  return (data: T): ValidationResult => {
    const key = keyGenerator(data)
    const cached = cache.get(key)
    
    if (cached) return cached
    
    const result = validator(data)
    cache.set(key, result)
    return result
  }
}

// ============ EXPORTS ============

// All functions are already exported above, no need for duplicate exports
