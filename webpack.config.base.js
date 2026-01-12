const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

// Conditional TerserPlugin import to avoid dependency issues
let TerserPlugin;
try {
  TerserPlugin = require('terser-webpack-plugin');
} catch (error) {
  console.warn('TerserPlugin not available, minification will be disabled');
}

// Conditional MiniCssExtractPlugin import
let MiniCssExtractPlugin;
try {
  MiniCssExtractPlugin = require('mini-css-extract-plugin');
} catch (error) {
  console.warn('MiniCssExtractPlugin not available, using style-loader instead');
}

/**
 * Base Webpack 5 Configuration for KiTS Hub Micro-Frontend Architecture
 * 
 * This configuration provides a comprehensive foundation for Module Federation
 * with support for TypeScript, React, CSS Modules, Tailwind CSS, and optimized
 * build processes for both development and production environments.
 * 
 * Key Features:
 * - Module Federation ready with shared dependencies
 * - TypeScript + React support with modern loaders
 * - Tailwind CSS + PostCSS integration
 * - Environment variable handling (NEXT_PUBLIC_* prefix)
 * - Hot Module Replacement for development
 * - Tree shaking and minification for production
 * - Performance optimization with code splitting
 * - Asset management for images, fonts, and SVGs
 */

module.exports = (env = {}, argv = {}) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = !isDevelopment;
  
  // Environment configuration
  const environment = env.environment || (isDevelopment ? 'development' : 'production');
  
  return {
    // ========================================================================
    // MODE AND TARGET CONFIGURATION
    // ========================================================================
    
    /**
     * Build mode affects optimization, error handling, and asset generation
     * - development: Faster builds, unminified, detailed error messages
     * - production: Optimized, minified, error handling minimized
     */
    mode: environment,
    
    /**
     * Target environment for compilation
     * 'web' ensures browser compatibility and proper module handling
     * Essential for micro-frontend architecture where multiple apps run in browsers
     */
    target: 'web',
    
    /**
     * Source map configuration for debugging
     * Development: eval-source-map for fastest rebuild times
     * Production: source-map for proper debugging while keeping bundle size reasonable
     */
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    // ========================================================================
    // ENTRY AND OUTPUT CONFIGURATION
    // ========================================================================
    
    /**
     * Entry point configuration - should be overridden by individual apps
     * Default assumes a standard React application entry point
     */
    entry: './src/index.tsx',
    
    /**
     * Output configuration for generated bundles
     * - Development: Simple filenames for easier debugging
     * - Production: Content hash for cache busting
     * - publicPath: 'auto' for Module Federation compatibility
     */
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: isDevelopment 
        ? '[name].js' 
        : '[name].[contenthash:8].js',
      chunkFilename: isDevelopment 
        ? '[name].chunk.js' 
        : '[name].[contenthash:8].chunk.js',
      clean: true, // Clean output directory before each build
      publicPath: 'auto', // Critical for Module Federation remote loading
      assetModuleFilename: isDevelopment 
        ? 'assets/[name][ext]' 
        : 'assets/[name].[contenthash:8][ext]',
    },
    
    // ========================================================================
    // MODULE RESOLUTION
    // ========================================================================
    
    /**
     * Module resolution configuration for imports and aliases
     * Essential for clean imports across micro-frontend architecture
     */
    resolve: {
      /**
       * File extensions to try when resolving modules
       * Order matters for performance - most specific first
       */
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      
      /**
       * Path aliases for clean imports
       * Standardized across all KiTS Hub applications for consistency
       */
      alias: {
        // Local application aliases
        '@': path.resolve(process.cwd(), 'src'),
        '@/components': path.resolve(process.cwd(), 'src/components'),
        '@/pages': path.resolve(process.cwd(), 'src/pages'),
        '@/hooks': path.resolve(process.cwd(), 'src/hooks'),
        '@/lib': path.resolve(process.cwd(), 'src/lib'),
        '@/utils': path.resolve(process.cwd(), 'src/utils'),
        '@/types': path.resolve(process.cwd(), 'src/types'),
        '@/assets': path.resolve(process.cwd(), 'src/assets'),
        '@/styles': path.resolve(process.cwd(), 'src/styles'),
        '@/config': path.resolve(process.cwd(), 'src/config'),
        '@/services': path.resolve(process.cwd(), 'src/services'),
        '@/store': path.resolve(process.cwd(), 'src/store'),
        
        // Cross-solution shared imports for micro-frontend architecture
        '@shared-shell': path.resolve(process.cwd(), '../shared-shell/src'),
        '@shared/ui-components': path.resolve(process.cwd(), '../shared/ui-components/src'),
        '@shared/integration': path.resolve(process.cwd(), '../shared/integration/core/src'),
        '@kits-hub/ui': path.resolve(process.cwd(), '../packages/ui/src'),
        '@kits-hub/config': path.resolve(process.cwd(), '../packages/config/src'),
      },
      
      /**
       * Module resolution strategy
       * 'node' maintains Node.js resolution behavior for compatibility
       */
      modules: ['node_modules'],
    },
    
    // ========================================================================
    // MODULE LOADING RULES
    // ========================================================================
    
    module: {
      rules: [
        // ====================================================================
        // TYPESCRIPT/JAVASCRIPT LOADING
        // ====================================================================
        
        /**
         * TypeScript and JavaScript transpilation
         * Uses ts-loader for TypeScript compilation with transpileOnly for speed
         * Babel can be added for additional transformations if needed
         */
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: isDevelopment, // Faster builds in development
                configFile: path.resolve(process.cwd(), 'tsconfig.json'),
              },
            },
          ],
          exclude: /node_modules/,
        },
        
        // ====================================================================
        // CSS AND STYLING LOADING
        // ====================================================================
        
        /**
         * CSS loading with PostCSS and Tailwind support
         * Development: style-loader for HMR
         * Production: MiniCssExtractPlugin for separate CSS files
         */
        {
          test: /\.css$/i,
          use: [
            isDevelopment ? 'style-loader' : (MiniCssExtractPlugin ? MiniCssExtractPlugin.loader : 'style-loader'),
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: (resourcePath) => resourcePath.includes('.module.'),
                  localIdentName: isDevelopment 
                    ? '[name]__[local]___[hash:base64:5]'
                    : '[hash:base64:8]',
                },
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'tailwindcss',
                    'autoprefixer',
                  ],
                },
              },
            },
          ],
        },
        
        // ====================================================================
        // ASSET LOADING
        // ====================================================================
        
        /**
         * Image and media asset loading
         * Uses asset/resource for proper file handling and optimization
         */
        {
          test: /\.(png|jpe?g|gif|webp|avif)$/i,
          type: 'asset/resource',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb - inline smaller images as base64
            },
          },
        },
        
        /**
         * SVG loading with optimization
         * Handles both inline and referenced SVGs
         */
        {
          test: /\.svg$/i,
          type: 'asset/resource',
          use: [
            {
              loader: 'svgo-loader',
              options: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
        
        /**
         * Font loading for custom fonts
         * Essential for consistent typography across micro-frontends
         */
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        
        /**
         * JSON file loading for configuration and data
         */
        {
          test: /\.json$/,
          type: 'json',
        },
      ],
    },
    
    // ========================================================================
    // OPTIMIZATION CONFIGURATION
    // ========================================================================
    
    optimization: {
      /**
       * Runtime chunk extraction for better caching
       * Separates webpack runtime from application code
       */
      runtimeChunk: 'single',
      
      /**
       * Code splitting strategy for optimal bundle sizes
       * Essential for micro-frontend performance
       */
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          /**
           * Vendor chunk separation
           * Extracts third-party dependencies into separate chunks
           * Critical for Module Federation dependency sharing
           */
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          
          /**
           * Common chunk for shared application code
           * Reduces duplication between chunks
           */
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          
          /**
           * React-specific chunk for better caching
           * React and related libraries change less frequently
           */
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      },
      
      /**
       * Minification configuration for production builds
       * Uses Terser for JavaScript optimization
       */
      minimize: isProduction,
      minimizer: TerserPlugin ? [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction, // Remove console logs in production
              drop_debugger: isProduction,
            },
            format: {
              comments: false, // Remove comments in production
            },
          },
          extractComments: false, // Don't extract comments to separate files
        }),
      ] : [],
      
      /**
       * Module concatenation for better performance
       * Combines modules into single functions where possible
       */
      concatenateModules: isProduction,
    },
    
    // ========================================================================
    // PLUGIN CONFIGURATION
    // ========================================================================
    
    plugins: [
      // ====================================================================
      // MODULE FEDERATION PLUGIN
      // ====================================================================
      
      /**
       * Module Federation Plugin - Core of micro-frontend architecture
       * Template configuration - should be customized by individual applications
       */
      new ModuleFederationPlugin({
        name: 'microApp', // Should be overridden by each app
        filename: 'remoteEntry.js',
        exposes: {}, // Should be defined by individual apps
        remotes: {}, // Should be defined by shell app
        shared: {
          /**
           * React singleton enforcement
           * Critical for preventing multiple React instances in micro-frontends
           */
          react: {
            singleton: true, // Enforce single instance
            requiredVersion: '^18.3.1', // Exact version matching
            eager: false, // Lazy loading for better performance
            import: 'react',
            shareKey: 'react',
            shareScope: 'default',
          },
          
          /**
           * React-DOM singleton enforcement
           * Must match React version for compatibility
           */
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.3.1',
            eager: false,
            import: 'react-dom',
            shareKey: 'react-dom',
            shareScope: 'default',
          },
          
          /**
           * React Router singleton for consistent routing
           * Essential for navigation between micro-frontends
           */
          'react-router-dom': {
            singleton: true,
            requiredVersion: '^6.30.2',
            eager: false,
            import: 'react-router-dom',
            shareKey: 'react-router-dom',
            shareScope: 'default',
          },
          
          /**
           * Supabase singleton for shared database client
           * Critical for multi-tenant data consistency
           */
          '@supabase/supabase-js': {
            singleton: true,
            requiredVersion: '^2.49.8',
            eager: false,
            import: '@supabase/supabase-js',
            shareKey: '@supabase/supabase-js',
            shareScope: 'default',
          },
          
          /**
           * Shared UI components library
           * Ensures consistent design system across micro-frontends
           */
          '@kits-hub/ui': {
            singleton: true,
            requiredVersion: '^1.0.0',
            eager: false,
            import: '@kits-hub/ui',
            shareKey: '@kits-hub/ui',
            shareScope: 'default',
          },
          
          /**
           * Lucide React icons (non-singleton)
           * Multiple versions can coexist without issues
           */
          'lucide-react': {
            singleton: false,
            requiredVersion: '^0.487.0',
            eager: false,
            import: 'lucide-react',
            shareKey: 'lucide-react',
            shareScope: 'default',
          },
        },
      }),
      
      // ====================================================================
      // HTML PLUGIN
      // ====================================================================
      
      /**
       * HTML generation plugin
       * Creates HTML file with proper script and link tags
       * Template should be provided by individual applications
       */
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
    ],
    
    // ========================================================================
    // DEVELOPMENT SERVER CONFIGURATION
    // ========================================================================
    
    devServer: {
      /**
       * Server configuration - should be customized per application
       * Default port and settings for development
       */
      port: 3000,
      host: '0.0.0.0', // Allow external access for micro-frontend communication
      hot: true, // Enable Hot Module Replacement
      open: false, // Don't auto-open browser
      historyApiFallback: true, // Support HTML5 History API
      
      /**
       * CORS headers for micro-frontend communication
       * Critical for cross-origin requests between applications
       */
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      
      /**
       * Proxy configuration for API requests
       * Should be customized based on application needs
       */
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    // ========================================================================
    // PERFORMANCE CONFIGURATION
    // ========================================================================
    
    performance: {
      /**
       * Performance hints and budget limits
       * Helps maintain optimal bundle sizes for micro-frontends
       */
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000, // 512kb
      maxAssetSize: 512000, // 512kb
      assetFilter: (assetFilename) => {
        // Don't enforce limits on source maps and large assets
        return !assetFilename.endsWith('.map') && 
               !assetFilename.match(/\.(png|jpe?g|gif|webp|svg|woff|woff2)$/i);
      },
    },
    
    // ========================================================================
    // ENVIRONMENT VARIABLE HANDLING
    // ========================================================================
    
    /**
     * Define plugin for environment variables
     * Should be used with webpack.DefinePlugin in individual configs
     * NEXT_PUBLIC_* prefix ensures browser-safe variables
     */
    define: {
      'process.env.NODE_ENV': JSON.stringify(environment),
      'process.env.BROWSER': JSON.stringify(true),
    },
    
    // ========================================================================
    // STATS CONFIGURATION
    // ========================================================================
    
    stats: {
      /**
       * Build statistics configuration
         * Development: Detailed for debugging
         * Production: Minimal for cleaner output
         */
      colors: true,
      modules: isDevelopment,
      chunks: isDevelopment,
      chunkModules: isDevelopment,
      assets: isDevelopment,
      errors: true,
      warnings: true,
      performance: isProduction,
      hash: false,
      version: false,
      timings: true,
      builtAt: false,
    },
  };
};
