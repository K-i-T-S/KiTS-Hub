# Webpack 5 Base Configuration for Module Federation

This comprehensive Webpack 5 base configuration provides a solid foundation for building micro-frontend applications using Module Federation in the KiTS Hub ecosystem.

## 🚀 Features

### Core Capabilities
- **TypeScript & React Support**: Modern tooling with Babel and SWC loaders
- **CSS Modules & Tailwind CSS**: Component-scoped styling with utility-first CSS
- **Environment Variables**: Flexible configuration with NEXT_PUBLIC_ prefix support
- **Hot Module Replacement**: Development productivity with live reloading
- **Code Splitting**: Optimized bundle sizes with intelligent chunking
- **Module Federation**: Dependency sharing and component isolation
- **Performance Optimization**: Tree shaking, minification, and bundle analysis

### Micro-Frontend Architecture Support
- **Shared Dependencies**: React, React-DOM, and other libraries shared across applications
- **Singleton Enforcement**: Ensures single instances of critical dependencies
- **Remote Component Loading**: Dynamic loading of components from different applications
- **Version Management**: Semantic versioning for shared dependencies
- **Conflict Resolution**: Automatic handling of version mismatches

## 📁 File Structure

```
webpack.config.base.js          # Main Webpack configuration
webpack.base.package.json       # Required dependencies
webpack.base.tsconfig.json      # TypeScript configuration
webpack.base.postcss.config.js  # PostCSS configuration for Tailwind
```

## 🛠️ Usage

### 1. Install Dependencies

Copy the dependencies from `webpack.base.package.json` to your project's `package.json`:

```bash
npm install @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
npm install @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators
npm install @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-nullish-coalescing-operator
npm install @module-federation/webpack @swc/core
npm install babel-loader css-loader cssnano mini-css-extract-plugin
npm install postcss postcss-loader style-loader swc-loader tailwindcss
npm install terser-webpack-plugin webpack webpack-cli webpack-dev-server
npm install webpack-hot-middleware yaml-loader buffer crypto-browserify stream-browserify
npm install core-js util autoprefixer
```

### 2. Create Project Webpack Config

Create a `webpack.config.js` in your project root:

```javascript
const baseConfig = require('./webpack.config.base');
const { dependencies } = require('./package.json');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';

  const config = baseConfig(env);

  // Override Module Federation configuration
  config.plugins[0] = new (require('@module-federation/webpack').ModuleFederationPlugin)({
    name: 'inventory_management', // Unique name for your solution
    filename: 'remoteEntry.js',
    exposes: {
      './InventoryApp': './src/App.tsx',
      './ProductList': './src/components/ProductList.tsx',
      './ProductDetails': './src/components/ProductDetails.tsx',
    },
    shared: {
      ...dependencies,
      react: {
        singleton: true,
        requiredVersion: dependencies.react,
        eager: false,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: dependencies['react-dom'],
        eager: false,
      },
      '@supabase/supabase-js': {
        singleton: false,
        requiredVersion: dependencies['@supabase/supabase-js'],
        eager: false,
      },
    },
  });

  // Override development server port
  if (isDevelopment) {
    config.devServer.port = 4177; // Unique port for each solution
  }

  return config;
};
```

### 3. Configure TypeScript

Extend the base TypeScript configuration in your `tsconfig.json`:

```json
{
  "extends": "./webpack.base.tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 4. Configure PostCSS

Create a `postcss.config.js` that extends the base configuration:

```javascript
const baseConfig = require('./webpack.base.postcss.config');

module.exports = {
  ...baseConfig,
  // Add any project-specific PostCSS plugins here
};
```

### 5. Update Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "webpack serve --mode=development",
    "build": "webpack --mode=production",
    "start": "webpack serve --mode=development --open",
    "analyze": "webpack-bundle-analyzer dist/stats.json",
    "typecheck": "tsc --noEmit"
  }
}
```

## 🔧 Configuration Options

### Environment Variables

The configuration supports environment variables with the `NEXT_PUBLIC_` prefix:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

These variables are automatically injected into your application code.

### Module Federation Configuration

#### Shared Dependencies

```javascript
shared: {
  // Singleton dependencies (only one instance)
  react: {
    singleton: true,
    requiredVersion: dependencies.react,
    eager: false, // Lazy load for better performance
  },
  
  // Non-singleton dependencies (multiple instances allowed)
  '@supabase/supabase-js': {
    singleton: false,
    requiredVersion: dependencies['@supabase/supabase-js'],
    eager: false,
  },
}
```

#### Exposed Modules

```javascript
exposes: {
  // Expose components for remote consumption
  './ProductList': './src/components/ProductList.tsx',
  './ProductDetails': './src/components/ProductDetails.tsx',
  
  // Expose entire application
  './App': './src/App.tsx',
}
```

### Development Server Configuration

```javascript
devServer: {
  port: 4177, // Unique port for each solution
  hot: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  proxy: {
    '/api': 'http://localhost:8000',
  },
}
```

## 🎯 Best Practices

### 1. Dependency Management

- **Use exact versions** for shared dependencies to avoid conflicts
- **Keep React as singleton** to prevent multiple instances
- **Version pinning** ensures consistent behavior across applications

### 2. Performance Optimization

- **Enable code splitting** for better initial load times
- **Use lazy loading** for non-critical components
- **Monitor bundle sizes** with webpack-bundle-analyzer
- **Configure cache headers** for optimal caching

### 3. Development Workflow

- **Use HMR** for faster development cycles
- **Enable source maps** for easier debugging
- **Configure proxy** for API calls during development
- **Use consistent port numbering** across solutions

### 4. Production Deployment

- **Use content hashes** for cache busting
- **Enable minification** for smaller bundles
- **Configure CDN** for static assets
- **Monitor performance** with real user metrics

## 🔍 Troubleshooting

### Common Issues

#### Module Federation Not Working

1. **Check remoteEntry.js**: Ensure it's accessible at the correct URL
2. **Verify shared dependencies**: Make sure versions are compatible
3. **Check CORS headers**: Ensure cross-origin requests are allowed
4. **Validate webpack configuration**: Ensure Module Federation plugin is properly configured

#### TypeScript Errors

1. **Check path aliases**: Ensure they match your directory structure
2. **Validate module resolution**: Check baseUrl and paths configuration
3. **Verify include/exclude patterns**: Ensure correct files are being processed

#### CSS Issues

1. **Check PostCSS configuration**: Ensure Tailwind and Autoprefixer are properly configured
2. **Validate CSS Modules**: Ensure localIdentName is correctly configured
3. **Check import order**: Ensure CSS is loaded before components

#### Performance Issues

1. **Analyze bundle size**: Use webpack-bundle-analyzer to identify large chunks
2. **Check code splitting**: Ensure dynamic imports are working correctly
3. **Monitor caching**: Verify cache headers are properly configured

### Debug Commands

```bash
# Analyze bundle size
npm run analyze

# Check TypeScript compilation
npm run typecheck

# Build with verbose output
webpack --mode=production --verbose

# Start development with debugging
webpack serve --mode=development --debug
```

## 📊 Performance Targets

### Bundle Size Limits
- **Main bundle**: < 512KB
- **Vendor chunks**: < 1MB
- **Individual chunks**: < 256KB
- **Total application**: < 5MB

### Load Time Targets
- **Initial load**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 5 seconds
- **Largest Contentful Paint**: < 2.5 seconds

### Development Performance
- **Build time**: < 30 seconds
- **HMR update**: < 200ms
- **TypeScript compilation**: < 10 seconds

## 🚀 Advanced Configuration

### Custom Loaders

```javascript
// Add custom loaders for specific file types
{
  test: /\.custom$/,
  use: 'custom-loader',
}
```

### Optimization Plugins

```javascript
optimization: {
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
        },
      },
    }),
  ],
}
```

### Environment-Specific Configuration

```javascript
const config = baseConfig(env);

if (isProduction) {
  // Production-specific optimizations
  config.optimization.minimize = true;
  config.devtool = 'source-map';
}

if (isDevelopment) {
  // Development-specific features
  config.devServer.hot = true;
  config.devtool = 'eval-cheap-module-source-map';
}
```

## 📚 References

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Webpack 5 Documentation](https://webpack.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

When contributing to the base configuration:

1. **Test changes** across all solutions
2. **Update documentation** for any new features
3. **Maintain backward compatibility** when possible
4. **Follow semantic versioning** for breaking changes
5. **Add comprehensive tests** for new functionality

This base configuration provides a robust foundation for building scalable, maintainable micro-frontend applications with Module Federation in the KiTS Hub ecosystem.
