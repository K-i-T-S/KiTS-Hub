import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

export interface Tenant {
  id: string
  name: string
  domain: string
  settings: {
    theme: 'light' | 'dark' | 'auto'
    currency: string
    timezone: string
    locale: string
  }
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
    expiresAt?: string
  }
}

export interface TenantContextType {
  tenant: Tenant | null
  loading: boolean
  error: string | null
  switchTenant: (tenantId: string) => Promise<void>
  updateSettings: (settings: Partial<Tenant['settings']>) => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    tenant: Tenant | null
    loading: boolean
    error: string | null
  }>({
    tenant: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    loadCurrentTenant()
  }, [])

  const loadCurrentTenant = async () => {
    try {
      const tenantId = localStorage.getItem('current_tenant')
      
      if (tenantId) {
        const tenant = await mockTenantApi.getTenant(tenantId)
        setState({
          tenant,
          loading: false,
          error: null,
        })
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load tenant',
      }))
    }
  }

  const switchTenant = async (tenantId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const tenant = await mockTenantApi.getTenant(tenantId)
      
      setState({
        tenant,
        loading: false,
        error: null,
      })

      localStorage.setItem('current_tenant', tenantId)
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to switch tenant',
      }))
    }
  }

  const updateSettings = async (settings: Partial<Tenant['settings']>) => {
    if (!state.tenant) return

    try {
      const updatedTenant = await mockTenantApi.updateSettings(state.tenant.id, settings)
      
      setState(prev => ({
        ...prev,
        tenant: updatedTenant,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }))
    }
  }

  const contextValue: TenantContextType = {
    ...state,
    switchTenant,
    updateSettings,
  }

  return React.createElement(
    TenantContext.Provider,
    { value: contextValue },
    children
  )
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

const mockTenantApi = {
  getTenant: async (tenantId: string): Promise<Tenant> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const tenants: Record<string, Tenant> = {
      'demo-tenant': {
        id: 'demo-tenant',
        name: 'Demo Company',
        domain: 'demo.kits-hub.com',
        settings: {
          theme: 'light',
          currency: 'USD',
          timezone: 'UTC',
          locale: 'en-US',
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          expiresAt: '2024-12-31',
        },
      },
      'test-tenant': {
        id: 'test-tenant',
        name: 'Test Organization',
        domain: 'test.kits-hub.com',
        settings: {
          theme: 'dark',
          currency: 'EUR',
          timezone: 'Europe/London',
          locale: 'en-GB',
        },
        subscription: {
          plan: 'basic',
          status: 'active',
        },
      },
    }

    const tenant = tenants[tenantId]
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    return tenant
  },

  updateSettings: async (tenantId: string, settings: Partial<Tenant['settings']>): Promise<Tenant> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const tenant = await mockTenantApi.getTenant(tenantId)
    
    return {
      ...tenant,
      settings: {
        ...tenant.settings,
        ...settings,
      },
    }
  },
}
