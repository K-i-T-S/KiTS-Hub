# @kits-hub/auth

Unified authentication system for KiTS Hub micro-frontend architecture with Supabase integration, role-based access control, and multi-tenant support.

## Features

### 🔐 **Core Authentication**
- **Supabase Integration**: Complete authentication with Supabase backend
- **Session Management**: In-memory session persistence with automatic token refresh
- **Multi-Tenant Support**: Organization switching and tenant isolation
- **Role-Based Access Control**: 5 user roles with granular permissions
- **Password Security**: Strong password validation and secure generation

### 🛡️ **Security Features**
- **Token Validation**: JWT token parsing and expiration checking
- **Session Timeout**: Configurable timeout with activity monitoring
- **Rate Limiting**: Built-in rate limiting for auth endpoints
- **Input Sanitization**: Email validation and XSS prevention
- **Secure Random Generation**: Cryptographically secure random strings

### 🎯 **Permission System**
- **Granular Permissions**: 25+ specific permissions for fine-grained control
- **Role-Based Permissions**: Automatic permission assignment based on user roles
- **Permission Checking**: Utility functions for permission validation
- **Dynamic Permissions**: Runtime permission evaluation and caching

### 🚀 **React Integration**
- **Context Provider**: React Context for state management
- **Custom Hooks**: `useAuth`, `usePermissions`, `useOrganization`
- **Route Guards**: Protected routes with permission/role checking
- **Error Boundaries**: Comprehensive error handling with retry logic

### 🔄 **Real-Time Features**
- **Token Refresh**: Automatic token refresh before expiration
- **Session Sync**: Cross-application session synchronization
- **Event System**: Authentication event broadcasting
- **Health Monitoring**: Session health and connectivity checking

## Installation

```bash
npm install @kits-hub/auth
```

## Quick Start

### 1. Setup AuthProvider

```tsx
import React from 'react';
import { AuthProvider } from '@kits-hub/auth';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. Use Authentication Hooks

```tsx
import { useAuth, usePermissions } from '@kits-hub/auth';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  const { hasPermission } = usePermissions();

  const handleLogin = async () => {
    await signIn({
      email: 'user@example.com',
      password: 'password123'
    });
  };

  return (
    <div>
      {user && <p>Welcome, {user.name}!</p>}
      {hasPermission('inventory:read') && (
        <button>View Inventory</button>
      )}
      <button onClick={handleLogin}>Sign In</button>
    </div>
  );
}
```

### 3. Protect Routes

```tsx
import { ProtectedRoute } from '@kits-hub/auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/public" element={<PublicPage />} />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute requiredPermissions={['inventory:read']}>
              <InventoryPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
```

## API Reference

### useAuth Hook

```tsx
const {
  user,              // Current user object
  organization,       // Current organization
  session,           // Session information
  isLoading,         // Loading state
  isAuthenticated,    // Authentication status
  error,             // Error message
  signIn,            // Sign in function
  signUp,            // Sign up function
  signOut,           // Sign out function
  resetPassword,      // Password reset function
  confirmPasswordReset, // Confirm password reset
  refreshSession,    // Refresh session function
  clearError         // Clear error function
} = useAuth();
```

### usePermissions Hook

```tsx
const {
  hasPermission,      // Check single permission
  hasAnyPermission,   // Check any of multiple permissions
  hasAllPermissions,  // Check all of multiple permissions
  hasRole,            // Check single role
  hasAnyRole,         // Check any of multiple roles
  permissions,         // User's permissions array
  role                 // User's role
} = usePermissions();
```

### useOrganization Hook

```tsx
const {
  organization,        // Current organization
  switchOrganization,  // Switch to different organization
  updateOrganization,  // Update organization details
  isLoading,           // Loading state
  error               // Error message
} = useOrganization();
```

## Permission System

### User Roles

- **SUPER_ADMIN**: Full system access
- **TENANT_ADMIN**: Organization management
- **MANAGER**: Team and resource management
- **EMPLOYEE**: Basic operational access
- **VIEWER**: Read-only access

### Permission Categories

- **User Management**: `user:read`, `user:write`, `user:delete`
- **Organization**: `org:read`, `org:write`, `org:delete`
- **Inventory**: `inventory:read`, `inventory:write`, `inventory:delete`
- **Sales**: `sales:read`, `sales:write`, `sales:delete`, `sales:refund`
- **CRM**: `customer:read`, `customer:write`, `customer:delete`
- **HR**: `employee:read`, `employee:write`, `employee:delete`, `payroll:read`, `payroll:write`
- **Accounting**: `accounting:read`, `accounting:write`, `reports:read`, `reports:write`
- **Analytics**: `analytics:read`, `analytics:write`
- **System**: `system:admin`, `system:config`

## Route Protection

### ProtectedRoute Component

```tsx
<ProtectedRoute
  requiredPermissions={['inventory:read', 'inventory:write']}
  requiredRoles={[UserRole.MANAGER, UserRole.EMPLOYEE]}
  fallback={<div>Access Denied</div>}
  redirectTo="/unauthorized"
>
  <ProtectedContent />
</ProtectedRoute>
```

### Guard Components

```tsx
// Permission-based guard
<PermissionGuard permission="inventory:delete">
  <DeleteButton />
</PermissionGuard>

// Role-based guard
<RoleGuard role={UserRole.ADMIN}>
  <AdminPanel />
</RoleGuard>

// Authentication guard
<AuthenticatedGuard>
  <UserDashboard />
</AuthenticatedGuard>

// Unauthenticated guard
<UnauthenticatedGuard>
  <LoginForm />
</UnauthenticatedGuard>
```

## Utilities

### Password Security

```tsx
import { PasswordUtils } from '@kits-hub/auth';

// Check password strength
const strength = PasswordUtils.checkPasswordStrength('MyPassword123!');
console.log(strength.score);        // 0-5
console.log(strength.isStrong);     // boolean
console.log(strength.feedback);      // string[]
console.log(strength.suggestions);  // string[]

// Generate secure password
const securePassword = PasswordUtils.generateSecurePassword(16);
```

### Token Validation

```tsx
import { TokenUtils } from '@kits-hub/auth';

const validation = TokenUtils.validateToken(token);
console.log(validation.isValid);        // boolean
console.log(validation.isExpired);       // boolean
console.log(validation.willExpireSoon); // boolean
console.log(validation.expiresAt);       // timestamp
```

### Session Timeout

```tsx
import { SessionTimeoutUtils } from '@kits-hub/auth';

// Configure timeout
SessionTimeoutUtils.configure({
  warningMinutes: 5,
  timeoutMinutes: 30,
  extendOnActivity: true
});

// Start monitoring
SessionTimeoutUtils.start(
  () => console.log('Session expired'),
  () => console.log('Session expiring soon')
);
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# For Vite
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Module Federation

### Configuration

Add to your webpack configuration:

```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'your-app',
      shared: {
        '@kits-hub/auth': {
          singleton: true,
          requiredVersion: '^1.0.0',
          eager: true
        }
      }
    })
  ]
};
```

### Benefits

- **Single Auth Instance**: Ensures consistent authentication state
- **Reduced Bundle Size**: Shared authentication code
- **Automatic Sync**: Cross-application session synchronization
- **Centralized Logic**: Single source of truth for auth

## Security Best Practices

### 1. Environment Variables
- Never expose Supabase keys in client-side code
- Use environment variables for sensitive configuration
- Validate environment variables on startup

### 2. Session Management
- Sessions are stored in memory only (no localStorage)
- Automatic token refresh prevents session expiration
- Session timeout protects against inactivity

### 3. Permission Checking
- Always check permissions before performing actions
- Use permission guards for UI components
- Implement proper access denied handling

### 4. Error Handling
- Implement proper error boundaries
- Provide user-friendly error messages
- Log authentication errors appropriately

## Troubleshooting

### Common Issues

**Authentication not working:**
1. Check Supabase environment variables
2. Verify network connectivity
3. Check browser console for errors

**Permissions not working:**
1. Verify user role is assigned correctly
2. Check permission names match exactly
3. Ensure AuthProvider wraps the component

**Session expiring:**
1. Check token refresh is working
2. Verify session timeout configuration
3. Check network connectivity

### Debug Mode

Enable debug logging:

```tsx
<AuthProvider debugMode>
  <App />
</AuthProvider>
```

## TypeScript Support

Full TypeScript support with:

- **Type Safety**: All APIs fully typed
- **IntelliSense**: Complete autocomplete support
- **Type Guards**: Built-in type checking functions
- **Generic Types**: Flexible type system for extensions

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/kits-hub/auth.git
cd auth

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build package
npm run build
```

### Project Structure

```
src/
├── AuthProvider.tsx          # Main context provider
├── hooks/                  # React hooks
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   ├── useOrganization.ts
│   └── useRequireAuth.ts
├── components/              # React components
│   └── ProtectedRoute.tsx
├── utils/                   # Utility functions
│   ├── session.ts
│   └── auth-utils.ts
├── types/                   # TypeScript types
│   └── auth.types.ts
└── index.ts                 # Main exports
```

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: [Full Documentation](https://docs.kits-hub.com/auth)
- **Issues**: [GitHub Issues](https://github.com/kits-hub/auth/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kits-hub/auth/discussions)

## Version History

### v1.0.0
- Initial release
- Complete authentication system
- Module Federation support
- Full TypeScript support
- Comprehensive documentation
