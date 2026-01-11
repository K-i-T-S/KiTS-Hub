import type { Meta, StoryObj } from '@storybook/react'
import { Navigation } from '@/components/Navigation'

const meta: Meta<typeof Navigation> = {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main navigation component for KiTS Hub with responsive design and user authentication.'
      }
    },
    viewport: {
      defaultViewport: 'desktop'
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop'
    }
  }
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile'
    }
  }
}

export const WithUser: Story = {
  args: {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      tenant_id: 'tenant-1'
    },
    tenant: {
      id: 'tenant-1',
      name: 'Test Company',
      plan: 'premium'
    }
  }
}

export const WithoutUser: Story = {
  args: {
    user: null,
    tenant: null
  }
}

export const DifferentPlans: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Standard Plan</h3>
        <Navigation
          user={{
            id: '1',
            email: 'user@standard.com',
            name: 'Standard User',
            role: 'user',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Standard Company',
            plan: 'standard'
          }}
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Premium Plan</h3>
        <Navigation
          user={{
            id: '2',
            email: 'user@premium.com',
            name: 'Premium User',
            role: 'admin',
            tenant_id: 'tenant-2'
          }}
          tenant={{
            id: 'tenant-2',
            name: 'Premium Company',
            plan: 'premium'
          }}
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Enterprise Plan</h3>
        <Navigation
          user={{
            id: '3',
            email: 'user@enterprise.com',
            name: 'Enterprise User',
            role: 'super_admin',
            tenant_id: 'tenant-3'
          }}
          tenant={{
            id: 'tenant-3',
            name: 'Enterprise Company',
            plan: 'enterprise'
          }}
        />
      </div>
    </div>
  )
}

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Loading User</h3>
        <Navigation
          user={null}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          loading={true}
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Loading Tenant</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={null}
          loading={true}
        />
      </div>
    </div>
  )
}

export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Authentication Error</h3>
        <Navigation
          user={null}
          tenant={null}
          error="Authentication failed"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Network Error</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          error="Network connection failed"
        />
      </div>
    </div>
  )
}

export const ActiveStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Dashboard Active</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          activeRoute="/"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Inventory Active</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          activeRoute="/inventory"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">POS Active</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          activeRoute="/pos"
        />
      </div>
    </div>
  )
}

export const MobileMenuStates: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile'
    }
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Menu Closed</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          mobileMenuOpen={false}
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Menu Open</h3>
        <Navigation
          user={{
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenant_id: 'tenant-1'
          }}
          tenant={{
            id: 'tenant-1',
            name: 'Test Company',
            plan: 'premium'
          }}
          mobileMenuOpen={true}
        />
      </div>
    </div>
  )
}
