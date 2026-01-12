const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { dependencies } = require('./package.json');
const path = require('path');

// Base configuration that can be extended for different environments
const baseConfig = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      // Local shell component imports - aligned with tsconfig.base.json paths
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/pages': path.resolve(__dirname, 'src/pages'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/config': path.resolve(__dirname, 'src/config'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/store': path.resolve(__dirname, 'src/store'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      
      // Shared packages - accessible across all workspaces
      '@shared': path.resolve(__dirname, '../shared'),
      '@shared-ui': path.resolve(__dirname, '../packages/ui/src'),
      '@shared-config': path.resolve(__dirname, '../packages/config/src'),
      '@shared-auth': path.resolve(__dirname, '../packages/auth/src'),
      '@shared-database': path.resolve(__dirname, '../packages/database/src'),
      
      // Solution-specific paths for clean imports
      '@shell': path.resolve(__dirname, 'src'),
      '@inventory': path.resolve(__dirname, '../solutions/inventory-management/src'),
      '@pos': path.resolve(__dirname, '../solutions/point-of-sale/src'),
      '@crm': path.resolve(__dirname, '../solutions/crm-system/src'),
      '@hr': path.resolve(__dirname, '../solutions/hr-management/src'),
      '@accounting': path.resolve(__dirname, '../solutions/accounting-system/src'),
      '@analytics': path.resolve(__dirname, '../solutions/analytics-dashboard/src'),
      
      // Legacy aliases for backward compatibility
      '@shared-shell': path.resolve(__dirname, 'src'),
      '@shared/ui-components': path.resolve(__dirname, '../packages/ui/src'),
      '@kits-hub/ui': path.resolve(__dirname, '../packages/ui/src')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        inventoryManagement: 'inventoryManagement@http://localhost:4177/remoteEntry.js',
        pointOfSale: 'pointOfSale@http://localhost:4178/remoteEntry.js',
        crmSystem: 'crmSystem@http://localhost:4179/remoteEntry.js',
        hrManagement: 'hrManagement@http://localhost:4180/remoteEntry.js',
        accountingSystem: 'accountingSystem@http://localhost:4181/remoteEntry.js',
        analyticsDashboard: 'analyticsDashboard@http://localhost:4182/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '18.3.1',
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '18.3.1',
          eager: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^7.1.3',
          eager: false,
        },
        '@supabase/supabase-js': {
          singleton: true,
          requiredVersion: '^2.49.8',
          eager: false,
        },
        '@kits-hub/auth': {
          singleton: true,
          requiredVersion: '^1.0.0',
          eager: true,
        },
        '@kits-hub/ui': {
          singleton: true,
          requiredVersion: '^1.0.0',
          eager: false,
        },
        'lucide-react': {
          singleton: false,
          requiredVersion: dependencies['lucide-react'],
          eager: false,
        },
        'zustand': {
          singleton: true,
          requiredVersion: dependencies['zustand'],
          eager: false,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};

// Development configuration
const developmentConfig = {
  ...baseConfig,
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'eval-source-map',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: false,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: '/',
    clean: true,
  },
};

// Production configuration
const productionConfig = {
  ...baseConfig,
  mode: 'production',
  entry: './src/index.tsx',
  devtool: 'source-map',
  output: {
    publicPath: '/',
    clean: true,
  },
};

// Export configurations
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  return isProduction ? productionConfig : developmentConfig;
};

// Also export individual configs for specific use cases
module.exports.development = developmentConfig;
module.exports.production = productionConfig;
module.exports.base = baseConfig;
