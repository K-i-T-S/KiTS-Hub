const { ModuleFederationPlugin } = require('webpack').container;
const { dependencies } = require('./package.json');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
let CssMinimizerPlugin;
try {
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
} catch (e) {
  console.warn('css-minimizer-webpack-plugin not found, CSS minification will be disabled');
  CssMinimizerPlugin = class { apply() {} };
}
let MiniCssExtractPlugin;
try {
  MiniCssExtractPlugin = require('mini-css-extract-plugin');
} catch (e) {
  console.warn('mini-css-extract-plugin not found, CSS extraction will be disabled');
  MiniCssExtractPlugin = class { apply() {} };
}

/**
 * Webpack 5 Base Configuration for Module Federation
 * 
 * This configuration provides a solid foundation for micro-frontend architecture
 * with Module Federation, enabling seamless sharing of dependencies and components
 * across all KiTS Hub solutions.
 * 
 * Key Features:
 * - TypeScript and React support with modern tooling
 * - CSS Modules and Tailwind CSS integration
 * - Environment variable handling for deployment flexibility
 * - Optimized builds with tree shaking and code splitting
 * - Hot Module Replacement for development productivity
 * - Module Federation for dependency sharing and component isolation
 * - Performance optimization with bundle size limits
 */

module.exports = (env = {}) => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isProduction = env.NODE_ENV === 'production';

  return {
    // Target environment: 'web' for browser applications
    // This ensures proper handling of browser-specific APIs and polyfills
    target: 'web',

    // Entry point configuration
    // Single entry point for the application with HMR support in development
    entry: {
      main: [
        // Hot Module Replacement client for development
        ...(isDevelopment ? ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'] : []),
        // Main application entry point
        './src/index.tsx',
      ],
    },

    // Output configuration for different environments
    output: {
      // Clean output directory before each build
      clean: true,

      // Output directory for built files
      path: path.resolve(__dirname, 'dist'),

      // Filename pattern with content hash for cache busting in production
      filename: isDevelopment 
        ? '[name].js' // Development: simple names for easier debugging
        : '[name].[contenthash:8].js', // Production: content hash for caching

      // Chunk filename pattern for code-split chunks
      chunkFilename: isDevelopment
        ? '[name].chunk.js'
        : '[name].[contenthash:8].chunk.js',

      // Asset module filename pattern
      assetModuleFilename: 'assets/[name].[hash:8][ext]',

      // Public path for Module Federation - crucial for remote loading
      // This must match the deployment URL of each micro-frontend
      publicPath: 'auto',

      // Unique chunk loading for Module Federation
      uniqueName: 'kits-hub-solution',

      // Module format for better tree shaking
      module: false, // Disable for now to avoid experimental issues
    },

    // Module resolution configuration
    resolve: {
      // File extensions to try when resolving modules
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],

      // Alias configuration for cleaner imports and path resolution
      alias: {
        // Source directory alias for clean imports
        '@': path.resolve(__dirname, 'src'),
        
        // Component aliases for shared UI components
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/pages': path.resolve(__dirname, 'src/pages'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/styles': path.resolve(__dirname, 'src/styles'),
      },

      // Prefer ESM modules for better tree shaking
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
        '.mjs': ['.mjs', '.mts'],
      },

      // Fallback for Node.js modules in browser environment
      fallback: {
        // Buffer polyfill for browser compatibility
        buffer: false, // Disable for now to troubleshoot
        
        // Crypto polyfill for Supabase and other dependencies
        crypto: false, // Disable for now to troubleshoot
        
        // Stream polyfill for Node.js stream API
        stream: false, // Disable for now to troubleshoot
        
        // Util polyfill for Node.js util module
        util: false, // Disable for now to troubleshoot
      },
    },

    // Module configuration with loaders for different file types
    module: {
      rules: [
        // TypeScript and JavaScript files processing
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                // Babel configuration for React and TypeScript
                presets: [
                  ['@babel/preset-env', {
                    // Target browsers for optimal bundle size
                    targets: {
                      browsers: ['> 1%', 'last 2 versions', 'not dead']
                    },
                    // Enable tree shaking
                    modules: false,
                    // Use native async/await
                    useBuiltIns: 'usage',
                    corejs: 3,
                  }],
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  // React Fast Refresh for development
                  ...(isDevelopment ? ['react-refresh/babel'] : []),
                  
                  // Class properties and decorators
                  ['@babel/plugin-proposal-class-properties', { loose: true }],
                  ['@babel/plugin-proposal-decorators', { legacy: true }],
                  
                  // Optional chaining and nullish coalescing
                  '@babel/plugin-proposal-optional-chaining',
                  '@babel/plugin-proposal-nullish-coalescing-operator',
                ],
                // Cache babel results for faster builds
                cacheDirectory: true,
              },
            },
            // SWC loader for faster TypeScript compilation
            {
              loader: 'swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                    decorators: true,
                    dynamicImport: true,
                  },
                  transform: {
                    react: {
                      pragma: 'React.createElement',
                      pragmaFrag: 'React.Fragment',
                      development: isDevelopment,
                      refresh: isDevelopment,
                    },
                  },
                  target: 'es2020',
                  loose: false,
                },
                module: {
                  type: 'es6',
                },
              },
            },
          ],
        },

        // CSS and PostCSS processing
        {
          test: /\.css$/i,
          use: [
            // Style loader for injecting CSS into DOM
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            
            // CSS loader with CSS Modules support
            {
              loader: 'css-loader',
              options: {
                // Enable CSS Modules for component-scoped styles
                modules: {
                  // Naming pattern for CSS Modules
                  localIdentName: isDevelopment
                    ? '[name]__[local]--[hash:base64:5]' // Development: readable names
                    : '[hash:base64:8]', // Production: short hashes
                  
                  // Export class names and locals
                  exportLocalsConvention: 'camelCase',
                },
                
                // Source maps for debugging
                sourceMap: isDevelopment,
                
                // Import Loaders for proper processing order
                importLoaders: 1,
              },
            },
            
            // PostCSS loader for Tailwind CSS and autoprefixer
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    // Tailwind CSS for utility-first styling
                    'tailwindcss',
                    
                    // Autoprefixer for vendor prefixes
                    'autoprefixer',
                    
                    // CSS Nano for minification in production
                    ...(isProduction ? ['cssnano'] : []),
                  ],
                },
                sourceMap: isDevelopment,
              },
            },
          ],
        },

        // Asset processing for images, fonts, and other static files
        {
          test: /\.(png|jpe?g|gif|webp|avif|svg)$/i,
          type: 'asset',
          parser: {
            // Inline small assets as data URLs
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            // Output filename for assets
            filename: 'assets/[name].[hash:8][ext]',
          },
        },

        // Font file processing
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },

        // JSON file processing with validation
        {
          test: /\.json$/,
          type: 'json',
          parser: {
            // Strict JSON parsing
            strict: true,
          },
        },

        // YAML file processing for configuration
        {
          test: /\.ya?ml$/,
          type: 'json',
          use: 'yaml-loader',
        },
      ],
    },

    // Plugins configuration
    plugins: [
      // Module Federation Plugin for micro-frontend architecture
      new ModuleFederationPlugin({
        // Name of the remote application (must be unique)
        name: 'kits_hub_solution',
        
        // Filename for the remote entry (must be consistent across remotes)
        filename: 'remoteEntry.js',
        
        // Exposed modules for remote consumption
        // This will be overridden in individual solution configs
        exposes: {},
        
        // Shared dependencies configuration
        // This enables dependency sharing across micro-frontends
        shared: {
          // React and React-DOM as singletons
          // Singleton ensures only one instance of React is loaded
          ...dependencies,
          react: {
            singleton: true, // Enforce single React instance
            requiredVersion: dependencies.react,
            eager: false, // Lazy load for better performance
            import: 'react',
            shareKey: 'react', // Key for sharing
            shareScope: 'default', // Share scope name
          },
          'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
            eager: false,
            import: 'react-dom',
            shareKey: 'react-dom',
            shareScope: 'default',
          },
          
          // Supabase client for shared database access
          '@supabase/supabase-js': {
            singleton: false, // Allow multiple instances for different configs
            requiredVersion: dependencies['@supabase/supabase-js'],
            eager: false,
          },
          
          // React Router for navigation consistency
          'react-router-dom': {
            singleton: false,
            requiredVersion: dependencies['react-router-dom'],
            eager: false,
          },
          
          // Lucide React for consistent icons
          'lucide-react': {
            singleton: false,
            requiredVersion: dependencies['lucide-react'],
            eager: false,
          },
],
// Cache babel results for faster builds
cacheDirectory: true,
},
},
// SWC loader for faster TypeScript compilation
{
loader: 'swc-loader',
options: {
jsc: {
parser: {
syntax: 'typescript',
tsx: true,
decorators: true,
dynamicImport: true,
},
transform: {
react: {
pragma: 'React.createElement',
pragmaFrag: 'React.Fragment',
development: isDevelopment,
refresh: isDevelopment,
},
},
target: 'es2020',
loose: false,
},
module: {
type: 'es6',
},
},
},
],

// CSS and PostCSS processing
{
test: /\.css$/i,
use: [
// Style loader for injecting CSS into DOM
isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
  
// CSS loader with CSS Modules support
{
loader: 'css-loader',
options: {
// Enable CSS Modules for component-scoped styles
modules: {
// Naming pattern for CSS Modules
localIdentName: isDevelopment
? '[name]__[local]--[hash:base64:5]' // Development: readable names
: '[hash:base64:8]', // Production: short hashes
  
// Export class names and locals
exportLocalsConvention: 'camelCase',
},
  
// Source maps for debugging
sourceMap: isDevelopment,
  
// Import Loaders for proper processing order
importLoaders: 1,
},
},
  
// PostCSS loader for Tailwind CSS and autoprefixer
{
loader: 'postcss-loader',
options: {
postcssOptions: {
plugins: [
// Tailwind CSS for utility-first styling
'tailwindcss',
  
// Autoprefixer for vendor prefixes
'autoprefixer',
  
// CSS Nano for minification in production
...(isProduction ? ['cssnano'] : []),
],
},
sourceMap: isDevelopment,
},
},
],
},

// Asset processing for images, fonts, and other static files
{
test: /\.(png|jpe?g|gif|webp|avif|svg)$/i,
type: 'asset',
parser: {
// Inline small assets as data URLs
dataUrlCondition: {
maxSize: 8 * 1024, // 8kb
},
},
generator: {
// Output filename for assets
filename: 'assets/[name].[hash:8][ext]',
},
},

// Font file processing
{
test: /\.(woff|woff2|eot|ttf|otf)$/i,
type: 'asset/resource',
generator: {
filename: 'fonts/[name].[hash:8][ext]',
},
},
      // Minimizer configuration
      minimizer: [
        // Terser plugin for JavaScript minification
        new TerserPlugin({
          terserOptions: {
            compress: {
              // Remove console logs in production
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              // Keep class names for debugging
              keep_classnames: false,
            },
            format: {
              comments: false, // Remove comments
            },
          },
          extractComments: false, // Don't extract comments
        }),
        
        // CSS minimizer
        new CssMinimizerPlugin(),
      ],

      // Code splitting strategy
      splitChunks: {
        chunks: 'all', // Split all chunks
        cacheGroups: {
          // Vendor chunk for third-party dependencies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          
          // Common chunk for shared application code
          common: {
            name: 'common',
            minChunks: 2, // Split if used in 2+ chunks
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          
          // React-related dependencies
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },

      // Runtime chunk configuration
      runtimeChunk: {
        name: 'runtime', // Separate runtime chunk for better caching
      },

      // Module IDs configuration for better caching
      moduleIds: isProduction ? 'deterministic' : 'named',
      
      // Chunk IDs configuration
      chunkIds: isProduction ? 'deterministic' : 'named',
    },

    // Development server configuration
    devServer: isDevelopment ? {
      // Server port (will be overridden by individual solutions)
      port: 3000,
      
      // Enable hot module replacement
      hot: true,
      
      // Open browser on start
      open: false,
      
      // Enable gzip compression
      compress: true,
      
      // History API fallback for SPA routing
      historyApiFallback: true,
      
      // CORS configuration for Module Federation
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      
      // Proxy configuration for API calls
      proxy: {
        // Proxy API calls to backend
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        
        // Proxy Supabase calls
        '/rest': {
          target: process.env.NEXT_PUBLIC_SUPABASE_URL,
          changeOrigin: true,
          secure: true,
        },
      },
      
      // Static file serving
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
      
      // Watch configuration
      watchFiles: ['src/**/*', 'public/**/*'],
      
      // Client configuration
      client: {
        logging: 'info',
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    } : undefined,

    // Source map configuration
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',

    // Performance configuration
    performance: {
      // Asset size limits
      maxAssetSize: 512000, // 512kb
      maxEntrypointSize: 512000, // 512kb
      
      // Hints for performance issues
      hints: isProduction ? 'warning' : false,
      
      // Filter for performance hints
      assetFilter: (assetFilename) => {
        // Exclude source maps and large assets from performance hints
        return !assetFilename.endsWith('.map') && !assetFilename.includes('fonts/');
      },
    },

    // Statistics configuration for bundle analysis
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    },

    // Externals configuration for production
    externals: isProduction ? {
      // External dependencies that shouldn't be bundled
      // (e.g., CDN-hosted libraries)
    } : undefined,

    // Watch configuration for development
    watchOptions: isDevelopment ? {
      // Watch for changes in these directories
      ignored: /node_modules/,
      
      // Poll for file changes (useful in Docker)
      poll: 1000,
      
      // Aggregate timeout for batched changes
      aggregateTimeout: 300,
    } : undefined,
  };
};
