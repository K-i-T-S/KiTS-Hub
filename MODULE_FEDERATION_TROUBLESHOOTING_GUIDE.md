# Module Federation Troubleshooting Guide

## 🚨 Quick Fixes

### Remote Entry Not Loading
**Problem**: 404 error when accessing remoteEntry.js
```bash
# Immediate Fix
cd solutions/[solution-name]
npm run build
npm run dev
```

**Common Causes**:
- Remote server not running
- Incorrect port configuration  
- CORS headers missing
- Build files not generated

### React Version Conflicts
**Problem**: Multiple React instances, hooks errors
```bash
# Fix Version Conflicts
npm ls react
# Ensure all solutions use same version
npm install react@^18.3.1 --save
```

**Solution**: Update webpack.config.cjs
```javascript
shared: {
  react: { 
    singleton: true, 
    requiredVersion: '^18.3.1' 
  },
  'react-dom': { 
    singleton: true, 
    requiredVersion: '^18.3.1' 
  }
}
```

## 🔧 Detailed Troubleshooting

### Module Resolution Issues

#### TypeScript Path Aliases
**Error**: `Cannot find module '@/components/X'`

**Fix**: Ensure consistent tsconfig.json across all solutions:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Webpack Alias Configuration**:
```javascript
// webpack.config.cjs
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

#### Import/Export Mismatches
**Error**: `Module not found` or `Export not found`

**Common Issues**:
- Incorrect file paths in webpack exposes
- Missing default exports
- Case sensitivity in file names

**Fix**: Verify webpack configuration:
```javascript
exposes: {
  './ComponentName': './src/components/ComponentName.tsx', // Correct path
}
```

### Build Failures

#### TypeScript Compilation Errors
**Error**: TS18002 - Empty files list

**Fix**: Create proper tsconfig.json:
```bash
# Create missing tsconfig files
echo '{"compilerOptions": {"target": "ES2020", "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": true, "moduleResolution": "bundler", "allowImportingTsExtensions": true, "resolveJsonModule": true, "isolatedModules": true, "noEmit": true, "jsx": "react-jsx", "strict": true, "noUnusedLocals": true, "noUnusedParameters": true, "noFallthroughCasesInSwitch": true, "baseUrl": ".", "paths": {"@/*": ["./src/*"]}}, "include": ["src"]}' > tsconfig.json
```

#### Missing HTML Templates
**Error**: `Can't resolve public/index.html`

**Fix**: Create HTML template:
```bash
mkdir -p public
echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Solution Name</title></head><body><div id="root"></div><script type="module" src="/src/index.ts"></script></body></html>' > public/index.html
```

### Runtime Issues

#### Component Not Rendering
**Problem**: Remote component loads but doesn't render

**Debug Steps**:
1. Check browser console for errors
2. Verify component exports
3. Check React error boundaries
4. Test component in isolation

**Example Debug Code**:
```javascript
// In shared shell
const RemoteComponent = React.lazy(() => import('remoteName/Component'));

// Add error boundary
<ErrorBoundary fallback={<div>Loading failed</div>}>
  <React.Suspense fallback={<div>Loading...</div>}>
    <RemoteComponent />
  </React.Suspense>
</ErrorBoundary>
```

#### State Management Issues
**Problem**: State not shared between remotes

**Solution**: Use shared context or state management:
```javascript
// Create shared context
const SharedContext = React.createContext();

// In webpack config
shared: {
  ...dependencies,
  'shared-context': { singleton: true },
}
```

### Performance Issues

#### Slow Remote Loading
**Problem**: Remote components take too long to load

**Solutions**:
1. Implement proper loading states
2. Use React.lazy for code splitting
3. Optimize bundle sizes
4. Enable caching

```javascript
// Optimized remote loading
const Component = React.lazy(() => 
  import('remoteName/Component').catch(() => 
    import('./components/Fallback')
  )
);
```

#### Memory Leaks
**Problem**: Memory usage increases when switching remotes

**Fix**: Proper cleanup in useEffect:
```javascript
useEffect(() => {
  return () => {
    // Cleanup subscriptions, timers, etc.
  };
}, []);
```

## 🛠️ Development Environment Issues

### Port Conflicts
**Error**: `Port already in use`

**Solution**: Change port in webpack.config.cjs:
```javascript
devServer: {
  port: 4178, // Change to available port
}
```

### Hot Module Replacement Not Working
**Problem**: Changes not reflecting in browser

**Fix**: Ensure proper HMR configuration:
```javascript
devServer: {
  hot: true,
  liveReload: true,
}
```

### CORS Issues
**Error**: CORS policy errors in browser

**Solution**: Add CORS headers:
```javascript
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  },
}
```

## 📦 Dependency Management

### Version Conflicts
**Problem**: Different versions of shared dependencies

**Solution**: Align dependency versions:
```bash
# Check versions across solutions
find solutions -name package.json -exec grep -l "react" {} \;

# Update to consistent versions
npm install react@^18.3.1 react-dom@^18.3.1 --save
```

### Peer Dependency Warnings
**Problem**: Peer dependency conflicts

**Fix**: Install missing peer dependencies:
```bash
npm install @types/react @types/react-dom --save-dev
```

## 🔍 Debugging Tools

### Webpack Bundle Analyzer
```bash
# Install analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to package.json
"analyze": "webpack-bundle-analyzer dist/stats.json"

# Generate stats
npm run build -- --json > stats.json
npm run analyze
```

### Network Request Monitoring
Use browser DevTools to monitor:
- RemoteEntry.js loading
- Chunk loading times
- Failed requests
- Response sizes

### Console Logging
Add debug logging to webpack config:
```javascript
console.log('Loading remote:', remoteName);
console.log('Exposed modules:', exposes);
```

## 🚀 Production Issues

### Remote Loading in Production
**Problem**: Remotes not loading in production

**Checklist**:
1. Verify build outputs exist
2. Check remoteEntry.js URLs
3. Verify CDN/file server configuration
4. Test network accessibility

### Caching Issues
**Problem**: Old versions of remotes being served

**Solution**: Implement cache busting:
```javascript
output: {
  filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
  chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
}
```

## 📋 Common Error Messages

### "Module not found: Can't resolve 'remoteName/Component'"
**Cause**: Remote not properly configured or not running
**Fix**: Check remote server status and webpack configuration

### "Uncaught TypeError: Cannot read properties of undefined"
**Cause**: Remote component not loaded properly
**Fix**: Add proper error boundaries and loading states

### "Invalid hook call"
**Cause**: Multiple React instances
**Fix**: Ensure React is shared as singleton in Module Federation

### "ChunkLoadError: Loading chunk failed"
**Cause**: Network issues or incorrect chunk paths
**Fix**: Check network connectivity and webpack publicPath configuration

## 🆘 Emergency Recovery

### Complete Reset
If all else fails, reset the solution:
```bash
# Clear everything
rm -rf node_modules dist package-lock.json
npm install
npm run build
npm run dev
```

### Rollback Strategy
Keep working versions of configurations:
```bash
# Backup working configs
cp webpack.config.cjs webpack.config.cjs.backup
cp package.json package.json.backup
```

### Isolation Testing
Test solutions in isolation:
```bash
# Test standalone
cd solutions/point-of-sale
npm run dev
# Test in browser directly

# Test remote loading
# Access http://localhost:4178/remoteEntry.js directly
```

---

**Remember**: Most issues are related to configuration, network connectivity, or version conflicts. Start with the basics and work systematically through the debugging steps.
