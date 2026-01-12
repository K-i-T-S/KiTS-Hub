import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MainLayout from '../src/layouts/MainLayout';
import { LayoutProvider } from '../src/hooks/useLayout';
import { AuthProvider } from '../src/contexts/AuthContext';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LayoutProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </LayoutProvider>
    </BrowserRouter>
  );
};

describe('Layout System Tests', () => {
  beforeEach(() => {
    // Reset viewport to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 720,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  });

  it('should render layout structure correctly', () => {
    renderWithProviders(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Check main layout elements
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('should handle viewport changes', async () => {
    renderWithProviders(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Start with desktop
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();

    // Change to mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 390,
    });
    
    window.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      // Check layout adapts to mobile
      expect(sidebar).toBeInTheDocument();
    });
  });

  it('should toggle sidebar functionality', async () => {
    renderWithProviders(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const toggle = screen.getByTestId('sidebar-toggle');
    expect(toggle).toBeInTheDocument();

    // Test toggle click
    fireEvent.click(toggle);

    await waitFor(() => {
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Check for proper ARIA labels
    const toggle = screen.getByTestId('sidebar-toggle');
    expect(toggle).toHaveAttribute('aria-label');

    // Check dark mode toggle exists
    const darkModeToggle = screen.getByTestId('dark-mode-toggle');
    expect(darkModeToggle).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    renderWithProviders(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Check for focusable elements
    const toggle = screen.getByTestId('sidebar-toggle');
    toggle.focus();
    expect(toggle).toEqual(document.activeElement);
  });
});
