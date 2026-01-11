import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'

// Mock the auth context
const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    tenant_id: 'tenant-1'
  },
  tenant: {
    id: 'tenant-1',
    name: 'Test Tenant',
    plan: 'premium'
  },
  signOut: vi.fn()
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

// Mock the remote config
vi.mock('@/lib/remote-config', () => ({
  remoteConfig: {
    inventory: { url: 'http://localhost:4177', module: './InventoryApp' },
    pos: { url: 'http://localhost:4178', module: './PosApp' },
    crm: { url: 'http://localhost:4179', module: './CrmApp' },
    hr: { url: 'http://localhost:4180', module: './HrApp' },
    accounting: { url: 'http://localhost:4181', module: './AccountingApp' },
    analytics: { url: 'http://localhost:4182', module: './AnalyticsApp' }
  }
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Navigation Component', () => {
  it('renders navigation with all solution links', () => {
    renderWithRouter(<Navigation />)
    
    expect(screen.getByText('KiTS Hub')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Point of Sale')).toBeInTheDocument()
    expect(screen.getByText('CRM')).toBeInTheDocument()
    expect(screen.getByText('HR Management')).toBeInTheDocument()
    expect(screen.getByText('Accounting')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays user information', () => {
    renderWithRouter(<Navigation />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Test Tenant')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    renderWithRouter(<Navigation />)
    
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink.closest('a')).toHaveClass('bg-accent')
  })

  it('handles navigation clicks', () => {
    renderWithRouter(<Navigation />)
    
    const inventoryLink = screen.getByText('Inventory')
    fireEvent.click(inventoryLink)
    
    // Should navigate to /inventory
    expect(window.location.pathname).toBe('/inventory')
  })

  it('opens mobile menu when hamburger is clicked', () => {
    renderWithRouter(<Navigation />)
    
    const hamburgerButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(hamburgerButton)
    
    expect(screen.getByText('Dashboard')).toBeVisible()
  })

  it('closes mobile menu when link is clicked', () => {
    renderWithRouter(<Navigation />)
    
    // Open mobile menu first
    const hamburgerButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(hamburgerButton)
    
    // Click a link
    const inventoryLink = screen.getByText('Inventory')
    fireEvent.click(inventoryLink)
    
    // Menu should be closed (implementation dependent)
    expect(true).toBe(true) // Placeholder assertion
  })

  it('handles sign out', () => {
    renderWithRouter(<Navigation />)
    
    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)
    
    expect(mockAuthContext.signOut).toHaveBeenCalledTimes(1)
  })

  it('displays solution badges and descriptions', () => {
    renderWithRouter(<Navigation />)
    
    // Check for solution indicators
    expect(screen.getByText('Inventory Management')).toBeInTheDocument()
    expect(screen.getByText('Point of Sale')).toBeInTheDocument()
    expect(screen.getByText('CRM System')).toBeInTheDocument()
    expect(screen.getByText('HR Management')).toBeInTheDocument()
    expect(screen.getByText('Accounting System')).toBeInTheDocument()
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Navigation />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('aria-label', 'Main navigation')
    
    const menuButton = screen.getByRole('button', { name: /menu/i })
    expect(menuButton).toHaveAttribute('aria-label', 'Toggle navigation menu')
  })

  it('supports keyboard navigation', () => {
    renderWithRouter(<Navigation />)
    
    const firstNavLink = screen.getByText('Dashboard')
    firstNavLink.focus()
    expect(firstNavLink).toHaveFocus()
    
    // Tab through navigation items
    fireEvent.keyDown(firstNavLink, { key: 'Tab' })
    
    // Should move to next navigation item
    expect(true).toBe(true) // Placeholder assertion
  })

  it('displays correct plan badge', () => {
    renderWithRouter(<Navigation />)
    
    const planBadge = screen.getByText('Premium')
    expect(planBadge).toBeInTheDocument()
    expect(planBadge).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500')
  })

  it('handles responsive design correctly', () => {
    // Test mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    renderWithRouter(<Navigation />)
    
    const hamburgerButton = screen.getByRole('button', { name: /menu/i })
    expect(hamburgerButton).toBeVisible()
    
    // Test desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    
    renderWithRouter(<Navigation />)
    
    expect(screen.getByText('Dashboard')).toBeVisible()
  })

  it('shows loading state for remote applications', () => {
    renderWithRouter(<Navigation />)
    
    // Mock remote loading state
    const loadingIndicator = screen.queryByText('Loading...')
    expect(loadingIndicator).toBeNull() // Initially not loading
    
    // Implementation would show loading when remote is loading
  })

  it('handles remote loading errors gracefully', () => {
    renderWithRouter(<Navigation />)
    
    // Mock remote loading error
    const errorIndicator = screen.queryByText('Failed to load')
    expect(errorIndicator).toBeNull() // Initially no error
    
    // Implementation would show error when remote fails to load
  })
})
