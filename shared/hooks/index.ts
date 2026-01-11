/**
 * Shared Hooks for KiTS Hub
 * Reusable React hooks for common functionality across all solutions
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, UserRole, SubscriptionPlan, ApiResponse, PaginatedResponse } from '../types'

// ============ AUTHENTICATION HOOKS ============

export interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock authentication - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        name: 'Test User',
        role: 'tenant_admin',
        tenant_id: 'tenant-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUser(mockUser)
      localStorage.setItem('kits-hub-user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('kits-hub-user')
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('kits-hub-user', JSON.stringify(updatedUser))
    }
  }, [user])

  const hasRole = useCallback((role: UserRole) => {
    return user?.role === role
  }, [user])

  const hasPermission = useCallback((permission: string) => {
    // Mock permission logic - replace with actual permission system
    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: ['*'],
      tenant_admin: ['users.read', 'users.write', 'settings.read', 'settings.write'],
      manager: ['users.read', 'reports.read', 'inventory.read', 'inventory.write'],
      employee: ['inventory.read', 'sales.read'],
      cashier: ['sales.read', 'sales.write'],
      sales_rep: ['customers.read', 'customers.write'],
      accountant: ['accounting.read', 'accounting.write'],
      viewer: ['*.read']
    }
    
    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }, [user])

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('kits-hub-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('kits-hub-user')
      }
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    login,
    logout,
    updateUser
  }
}

// ============ TENANT HOOKS ============

export interface UseTenantReturn {
  tenant: any
  isLoading: boolean
  updateSettings: (settings: any) => void
  switchTenant: (tenantId: string) => Promise<void>
}

export const useTenant = (): UseTenantReturn => {
  const [tenant, setTenant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const updateSettings = useCallback((settings: any) => {
    if (tenant) {
      const updatedTenant = { ...tenant, settings: { ...tenant.settings, ...settings } }
      setTenant(updatedTenant)
      localStorage.setItem('kits-hub-tenant', JSON.stringify(updatedTenant))
    }
  }, [tenant])

  const switchTenant = useCallback(async (tenantId: string) => {
    setIsLoading(true)
    try {
      // Mock tenant switching - replace with actual API call
      const mockTenant = {
        id: tenantId,
        name: 'New Tenant',
        plan: 'professional' as SubscriptionPlan,
        settings: {
          timezone: 'Asia/Beirut',
          currency: 'LBP',
          language: 'en',
          date_format: 'DD/MM/YYYY',
          theme: 'light',
          rtl: false
        }
      }
      setTenant(mockTenant)
      localStorage.setItem('kits-hub-tenant', JSON.stringify(mockTenant))
    } catch (error) {
      console.error('Tenant switch failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize tenant from localStorage
  useEffect(() => {
    const storedTenant = localStorage.getItem('kits-hub-tenant')
    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant))
      } catch (error) {
        console.error('Failed to parse stored tenant:', error)
        localStorage.removeItem('kits-hub-tenant')
      }
    }
  }, [])

  return {
    tenant,
    isLoading,
    updateSettings,
    switchTenant
  }
}

// ============ API HOOKS ============

export interface UseApiOptions<T> {
  queryKey: string[]
  queryFn: () => Promise<ApiResponse<T>>
  enabled?: boolean
  retry?: number
  staleTime?: number
}

export const useApi = <T>({
  queryKey,
  queryFn,
  enabled = true,
  retry = 3,
  staleTime = 5 * 60 * 1000 // 5 minutes
}: UseApiOptions<T>) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn()
      if (!response.success) {
        throw new Error(response.error || 'API request failed')
      }
      return response.data
    },
    enabled,
    retry,
    staleTime
  })
}

export interface UseApiMutationOptions<T, V> {
  mutationFn: (variables: V) => Promise<ApiResponse<T>>
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}

export const useApiMutation = <T, V = void>({
  mutationFn,
  onSuccess,
  onError,
  onSettled
}: UseApiMutationOptions<T, V>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: V) => {
      const response = await mutationFn(variables)
      if (!response.success) {
        throw new Error(response.error || 'API request failed')
      }
      return response.data
    },
    onSuccess,
    onError,
    onSettled
  })
}

// ============ PAGINATION HOOKS ============

export interface UsePaginationReturn<T> {
  data: T[]
  isLoading: boolean
  error: Error | null
  page: number
  totalPages: number
  total: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  refetch: () => void
}

export const usePagination = <T>(
  fetchFn: (page: number) => Promise<PaginatedResponse<T>>,
  initialPage = 1
): UsePaginationReturn<T> => {
  const [page, setPage] = useState(initialPage)
  const [data, setData] = useState<T[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (pageNum: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchFn(pageNum)
      setData(response.data)
      setTotalPages(response.total_pages)
      setTotal(response.total)
      setPage(pageNum)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      fetchData(page + 1)
    }
  }, [page, totalPages, fetchData])

  const previousPage = useCallback(() => {
    if (page > 1) {
      fetchData(page - 1)
    }
  }, [page, fetchData])

  const goToPage = useCallback((targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      fetchData(targetPage)
    }
  }, [totalPages, fetchData])

  const refetch = useCallback(() => {
    fetchData(page)
  }, [page, fetchData])

  useEffect(() => {
    fetchData(initialPage)
  }, [fetchFn, initialPage])

  return {
    data,
    isLoading,
    error,
    page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage,
    previousPage,
    goToPage,
    refetch
  }
}

// ============ FORM HOOKS ============

export interface UseFormReturn<T> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  setValue: (field: keyof T, value: T[keyof T]) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: React.FormEvent) => void
  reset: () => void
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validation?: (values: T) => Record<keyof T, string>
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => ({ ...prev, [field]: '' }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>)
  }, [])

  const validate = useCallback(() => {
    if (!validation) return {}
    return validation(values)
  }, [values, validation])

  const isValid = useMemo(() => {
    const validationErrors = validate()
    return Object.keys(validationErrors).length === 0
  }, [validate])

  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault()
      const validationErrors = validate()
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
        // Reset form on successful submission
        setValues(initialValues)
        setErrors({} as Record<keyof T, string>)
        setTouched({} as Record<keyof T, boolean>)
      } catch (error) {
        console.error('Form submission failed:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, validate, initialValues])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({} as Record<keyof T, string>)
    setTouched({} as Record<keyof T, boolean>)
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    clearError,
    clearErrors,
    handleSubmit,
    reset
  }
}

// ============ LOCAL STORAGE HOOKS ============

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  return [storedValue, setValue]
}

// ============ DEBOUNCE HOOK ============

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ============ PREVIOUS HOOK ============

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// ============ WINDOW SIZE HOOK ============

export interface UseWindowSizeReturn {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export const useWindowSize = (): UseWindowSizeReturn => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 768
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024

  return {
    ...windowSize,
    isMobile,
    isTablet,
    isDesktop
  }
}

// ============ ONLINE STATUS HOOK ============

export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// ============ EXPORTS ============
// All hooks are already exported above, no need for duplicate exports
