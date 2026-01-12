# Module Federation Configuration for @kits-hub/auth

This guide shows how to configure Module Federation to share the authentication package across all KiTS Hub micro-frontends.

## Shell Application Configuration

Update your shell's `webpack.config.cjs` to include the auth package as a shared dependency:

```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        // ... other remotes
      },
      shared: {
        ...dependencies,
        '@kits-hub/auth': {
          singleton: true,
          requiredVersion: '^1.0.0',
          eager: true, // Load auth immediately
        },
      },
    }),
  ],
};
```

## Solution Applications Configuration

Each solution should configure the auth package as a shared dependency:

```javascript
// solutions/inventory-management/webpack.config.cjs
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'inventoryManagement',
      filename: 'remoteEntry.js',
      exposes: {
        // ... exposed components
      },
      shared: {
        ...dependencies,
        '@kits-hub/auth': {
          singleton: true,
          requiredVersion: '^1.0.0',
        },
      },
    }),
  ],
};
```

## Package.json Dependencies

Add the auth package to each application's dependencies:

```json
{
  "dependencies": {
    "@kits-hub/auth": "^1.0.0",
    // ... other dependencies
  }
}
```

## Usage in Applications

### Shell Application

```tsx
import React from 'react';
import { AuthProvider, useAuth } from '@kits-hub/auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### Solution Applications

```tsx
import React from 'react';
import { useAuth, ProtectedRoute, usePermissions } from '@kits-hub/auth';

function InventoryApp() {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <div>
      <ProtectedRoute 
        requiredPermissions={['inventory:read']}
        redirectTo="/unauthorized"
      >
        <InventoryDashboard />
      </ProtectedRoute>
    </div>
  );
}
```

## Singleton Enforcement

The auth package is configured as a singleton to ensure:

1. **Single Auth State**: Only one authentication state across all micro-frontends
2. **Shared Session**: User session is shared between applications
3. **Consistent Context**: Organization and user context is consistent
4. **Centralized Token Management**: Token refresh is handled centrally

## Environment Variables

Ensure all applications have the required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Or for Vite
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Authentication Flow

1. **Initial Load**: Shell app initializes authentication state
2. **User Login**: Authentication state is updated in shell
3. **State Sharing**: All micro-frontends access the same auth context
4. **Token Refresh**: Automatic token refresh happens centrally
5. **Logout**: Centralized logout clears state across all apps

## Best Practices

### 1. Auth Provider Placement
- Place AuthProvider at the root of your shell application
- Wrap all routes and remote components

### 2. Permission Checking
- Use permission-based route guards for sensitive features
- Check permissions in components before rendering actions

### 3. Error Handling
- Implement proper error boundaries for auth failures
- Provide fallback UI for unauthorized access

### 4. Performance
- The auth package is marked as `eager: true` in the shell
- This ensures it loads before other applications need it

## Troubleshooting

### Multiple Auth Instances
If you see multiple authentication instances:

1. Check that `singleton: true` is set in webpack config
2. Verify package versions match across applications
3. Ensure environment variables are consistent

### Auth State Not Shared
If authentication state isn't shared:

1. Verify the shell app has AuthProvider at root
2. Check that all apps import from `@kits-hub/auth`
3. Ensure Module Federation is configured correctly

### Token Refresh Issues
If token refresh fails:

1. Check Supabase configuration
2. Verify network connectivity
3. Check browser console for errors

## Migration Guide

### From Individual Auth Implementation

1. Install the auth package:
   ```bash
   npm install @kits-hub/auth
   ```

2. Update webpack configs to share the package

3. Replace existing auth imports:
   ```tsx
   // Before
   import { useAuth } from './auth';
   
   // After
   import { useAuth } from '@kits-hub/auth';
   ```

4. Remove individual auth implementations

5. Test authentication flow across all applications

### Version Updates

When updating the auth package:

1. Update version in all package.json files
2. Update requiredVersion in webpack configs
3. Test all authentication flows
4. Deploy updates to all applications

## Security Considerations

1. **Environment Variables**: Never expose Supabase keys in client code
2. **Token Storage**: The auth package uses in-memory storage only
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure proper CORS settings for Supabase

## Performance Impact

The shared auth package provides:

- **Reduced Bundle Size**: Auth code is shared, not duplicated
- **Faster Initialization**: Single auth initialization
- **Consistent State**: No state synchronization overhead
- **Centralized Caching**: Shared token refresh logic

Estimated bundle size reduction: 50-100KB per application
