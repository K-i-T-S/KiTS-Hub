/**
 * Example Webpack Configuration for Inventory Management Solution
 * 
 * This example shows how to extend the base Webpack configuration
 * for a specific micro-frontend in the KiTS Hub ecosystem.
 */

const baseConfig = require('./webpack.config.base');
const { ModuleFederationPlugin } = require('@module-federation/webpack');
const { dependencies } = require('./package.json');
const path = require('path');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';

  // Get the base configuration
  const config = baseConfig(env);

  // Override Module Federation configuration for this specific solution
  const moduleFederationPlugin = config.plugins.find(
    plugin => plugin.constructor.name === 'ModuleFederationPlugin'
  );

  if (moduleFederationPlugin) {
    // Update the Module Federation configuration
    moduleFederationPlugin.options = {
      // Unique name for this solution
      name: 'inventory_management',
      
      // Filename for the remote entry (consistent across all solutions)
      filename: 'remoteEntry.js',
      
      // Expose components for remote consumption by other solutions
      exposes: {
        // Main application
        './InventoryApp': './src/App.tsx',
        
        // Page components
        './InventoryDashboard': './src/pages/InventoryDashboard.tsx',
        './ProductList': './src/pages/ProductList.tsx',
        './ProductDetails': './src/pages/ProductDetails.tsx',
        './StockManagement': './src/pages/StockManagement.tsx',
        './SupplierManagement': './src/pages/SupplierManagement.tsx',
        './Reports': './src/pages/Reports.tsx',
        
        // Reusable components
        './ProductCard': './src/components/ProductCard.tsx',
        './StockStatus': './src/components/StockStatus.tsx',
        './SupplierForm': './src/components/SupplierForm.tsx',
      },
      
      // Shared dependencies configuration
      shared: {
        ...dependencies,
        
        // React as singleton to ensure single instance
        react: {
          singleton: true,
          requiredVersion: dependencies.react,
          eager: false,
          import: 'react',
          shareKey: 'react',
          shareScope: 'default',
        },
        
        // React-DOM as singleton
        'react-dom': {
          singleton: true,
          requiredVersion: dependencies['react-dom'],
          eager: false,
          import: 'react-dom',
          shareKey: 'react-dom',
          shareScope: 'default',
        },
        
        // Supabase client (can have multiple instances for different configs)
        '@supabase/supabase-js': {
          singleton: false,
          requiredVersion: dependencies['@supabase/supabase-js'],
          eager: false,
        },
        
        // React Router for navigation
        'react-router-dom': {
          singleton: false,
          requiredVersion: dependencies['react-router-dom'],
          eager: false,
        },
        
        // Shared UI components
        'lucide-react': {
          singleton: false,
          requiredVersion: dependencies['lucide-react'],
          eager: false,
        },
        
        // Date utilities
        'date-fns': {
          singleton: false,
          requiredVersion: dependencies['date-fns'],
          eager: false,
        },
      },
      
      // Remote configuration for consuming other solutions
      remotes: {
        // Consume shared shell components
        shell: 'shell@http://localhost:3000/remoteEntry.js',
        
        // Consume other solutions
        pos: 'pos@http://localhost:4178/remoteEntry.js',
        crm: 'crm@http://localhost:4179/remoteEntry.js',
        hr: 'hr@http://localhost:4180/remoteEntry.js',
        accounting: 'accounting@http://localhost:4181/remoteEntry.js',
        analytics: 'analytics@http://localhost:4182/remoteEntry.js',
      },
    };
  }

  // Override development server configuration
  if (isDevelopment && config.devServer) {
    config.devServer.port = 4177; // Unique port for inventory management
    
    // Custom headers for Module Federation
    config.devServer.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    };
    
    // Proxy configuration for API calls
    config.devServer.proxy = {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      
      // Supabase proxy
      '/rest': {
        target: process.env.NEXT_PUBLIC_SUPABASE_URL,
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          '^/rest': '/rest/v1',
        },
      },
      
      // Auth proxy
      '/auth': {
        target: process.env.NEXT_PUBLIC_SUPABASE_URL,
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          '^/auth': '/auth/v1',
        },
      },
    };
  }

  // Override output configuration for this solution
  config.output = {
    ...config.output,
    // Unique name for this solution's chunks
    uniqueName: 'inventory_management',
    
    // Custom public path for deployment
    publicPath: isDevelopment ? 'http://localhost:4177/' : '/inventory/',
  };

  // Add solution-specific optimizations
  if (isProduction) {
    config.optimization = {
      ...config.optimization,
      
      // Custom split chunks for inventory management
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          
          // Inventory-specific components
          inventory: {
            test: /[\\/]src[\\/]components[\\/]inventory[\\/]/,
            name: 'inventory-components',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          
          // Product-related components
          products: {
            test: /[\\/]src[\\/]components[\\/]products[\\/]/,
            name: 'product-components',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      },
    };
  }

  // Add solution-specific plugins
  if (isProduction) {
    // Add bundle analyzer plugin for production builds
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: '../bundle-analysis/inventory-report.html',
      })
    );
  }

  // Add environment-specific variables
  const definePlugin = config.plugins.find(
    plugin => plugin.constructor.name === 'DefinePlugin'
  );
  
  if (definePlugin) {
    definePlugin.definitions = {
      ...definePlugin.definitions,
      
      // Solution-specific environment variables
      'process.env.SOLUTION_NAME': JSON.stringify('inventory-management'),
      'process.env.SOLUTION_VERSION': JSON.stringify(require('./package.json').version),
      'process.env.SOLUTION_PORT': JSON.stringify('4177'),
      
      // Feature flags
      'process.env.ENABLE_REAL_TIME_UPDATES': JSON.stringify('true'),
      'process.env.ENABLE_ADVANCED_REPORTING': JSON.stringify('true'),
      'process.env.ENABLE_BULK_OPERATIONS': JSON.stringify('true'),
    };
  }

  return config;
};
