import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth, usePermissions } from '../../src/index';
import { Permission } from '../../src/types/auth.types';

// Test component to verify session persistence
function TestComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { hasPermission } = usePermissions();

  const handleSignIn = async () => {
    await signIn({
      email: 'test@example.com',
      password: 'testpassword123'
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div data-testid="test-component">
      <div data-testid="auth-state">
        <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
        <span data-testid="user-email">{user?.email || 'null'}</span>
        <span data-testid="user-name">{user?.name || 'null'}</span>
      </div>
      <div data-testid="permission-state">
        <span data-testid="has-inventory-read">
          {hasPermission(Permission.INVENTORY_READ).toString()}
        </span>
      </div>
      <button data-testid="sign-in-btn" onClick={handleSignIn}>
        Sign In
      </button>
      <button data-testid="sign-out-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}

describe('Authentication System Validation', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn()
      }
    };
    
    // Override the global supabase import
    vi.doMock('../src/utils/session', () => ({
      supabase: mockSupabase,
      sessionManager: {
        getSession: vi.fn().mockReturnValue(null),
        setSession: vi.fn(),
        clearSession: vi.fn(),
        validateToken: vi.fn().mockReturnValue({
          isValid: true,
          isExpired: false,
          willExpireSoon: false
        })
      }
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Persistence', () => {
    it('should maintain authentication state across component re-renders', async () => {
      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initial state - not authenticated
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');

      // Simulate sign in
      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Re-render component to test persistence
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // State should persist after re-render
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('should maintain user permissions across re-renders', async () => {
      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Sign in with user that has permissions
      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      await waitFor(() => {
        expect(screen.getByTestId('has-inventory-read')).toHaveTextContent('true');
      });

      // Re-render component
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Permissions should persist
      expect(screen.getByTestId('has-inventory-read')).toHaveTextContent('true');
    });

    it('should clear session state on sign out', async () => {
      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Sign in first
      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      // Sign out
      const signOutBtn = screen.getByTestId('sign-out-btn');
      fireEvent.click(signOutBtn);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('null');
      });

      // Re-render after sign out
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should remain signed out
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    });
  });

  describe('Context Value Consistency', () => {
    it('should provide consistent auth context across multiple components', async () => {
      function ChildComponent() {
        const { user, isAuthenticated } = useAuth();
        return (
          <div data-testid="child-component">
            <span data-testid="child-authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="child-user-email">{user?.email || 'null'}</span>
          </div>
        );
      }

      render(
        <AuthProvider>
          <div>
            <TestComponent />
            <ChildComponent />
          </div>
        </AuthProvider>
      );

      // Sign in
      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      await waitFor(() => {
        // Both components should have the same auth state
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('child-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('child-user-email')).toHaveTextContent('test@example.com');
      });
    });

    it('should maintain permission context across components', async () => {
      function PermissionChild() {
        const { hasPermission } = usePermissions();
        return (
          <div data-testid="permission-child">
            <span data-testid="child-permission">
              {hasPermission(Permission.INVENTORY_READ).toString()}
            </span>
          </div>
        );
      }

      render(
        <AuthProvider>
          <div>
            <TestComponent />
            <PermissionChild />
          </div>
        </AuthProvider>
      );

      // Sign in
      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      await waitFor(() => {
        // Both components should have the same permission state
        expect(screen.getByTestId('has-inventory-read')).toHaveTextContent('true');
        expect(screen.getByTestId('child-permission')).toHaveTextContent('true');
      });
    });
  });

  describe('Session Manager Integration', () => {
    it('should properly integrate with session manager', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      await waitFor(() => {
        // Verify session manager was called
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'testpassword123'
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      // Mock sign in to fail
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Invalid credentials')
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const signInBtn = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInBtn);

      await waitFor(() => {
        // Should remain unauthenticated on error
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('null');
      });
    });
  });
});
