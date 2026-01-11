import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  })),
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockSupabase: any

  beforeEach(() => {
    const mockClient = createClient('test-url', 'test-key')
    mockSupabase = mockClient as any
    authService = new AuthService(mockSupabase)
  })

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        tenant_id: 'tenant-1'
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: 'token' }
        },
        error: null
      })

      const result = await authService.signIn('test@example.com', 'password')

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
      expect(result.user).toEqual(mockUser)
      expect(result.session.access_token).toBe('token')
    })

    it('should throw error for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      await expect(authService.signIn('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle network errors', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      await expect(authService.signIn('test@example.com', 'password'))
        .rejects.toThrow('Network error')
    })
  })

  describe('signUp', () => {
    it('should sign up new user', async () => {
      const mockUser = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        role: 'user',
        tenant_id: 'tenant-1'
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: 'token' }
        },
        error: null
      })

      const result = await authService.signUp('new@example.com', 'password', 'New User')

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password',
        options: {
          data: {
            name: 'New User'
          }
        }
      })
      expect(result.user).toEqual(mockUser)
    })

    it('should throw error for existing email', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' }
      })

      await expect(authService.signUp('existing@example.com', 'password', 'User'))
        .rejects.toThrow('Email already registered')
    })
  })

  describe('signOut', () => {
    it('should sign out current user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      await authService.signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' }
      })

      await expect(authService.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        tenant_id: 'tenant-1'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should return null for no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const callback = vi.fn()
      const mockSubscription = { data: { subscription: { id: 'sub-1' } } }

      mockSupabase.auth.onAuthStateChange.mockReturnValue(mockSubscription)

      const subscription = authService.onAuthStateChange(callback)

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      )
      expect(subscription).toEqual(mockSubscription)
    })

    it('should call callback when auth state changes', () => {
      const callback = vi.fn()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }

      mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
        // Simulate auth state change
        cb('SIGNED_IN', mockUser)
        return { data: { subscription: { id: 'sub-1' } } }
      })

      authService.onAuthStateChange(callback)

      expect(callback).toHaveBeenCalledWith('SIGNED_IN', mockUser)
    })
  })

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      await authService.resetPassword('test@example.com')

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
    })

    it('should handle reset password errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Email not found' }
      })

      await expect(authService.resetPassword('unknown@example.com'))
        .rejects.toThrow('Email not found')
    })
  })

  describe('updatePassword', () => {
    it('should update user password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      await authService.updatePassword('new-password')

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'new-password'
      })
    })

    it('should handle update password errors', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        error: { message: 'Password too weak' }
      })

      await expect(authService.updatePassword('weak'))
        .rejects.toThrow('Password too weak')
    })
  })

  describe('refreshSession', () => {
    it('should refresh current session', async () => {
      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh-token'
      }

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authService.refreshSession()

      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled()
      expect(result).toEqual(mockSession)
    })

    it('should handle refresh session errors', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' }
      })

      await expect(authService.refreshSession())
        .rejects.toThrow('Session expired')
    })
  })
})
