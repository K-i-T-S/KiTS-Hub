const { ContainerReferencePlugin, ModuleFederationPlugin } = require('webpack').container;
const { dependencies } = require('./package.json');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
      clean: true,
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        // Local solution component imports
        '@': path.resolve(__dirname, './src'),
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
        
        // Cross-solution imports for micro-frontend architecture
        '@shared-shell': path.resolve(__dirname, '../../shared-shell/src'),
        '@shared/ui-components': path.resolve(__dirname, '../../shared/ui-components/src'),
        '@shared/integration': path.resolve(__dirname, '../../shared/integration/core/src'),
        '@kits-hub/ui': path.resolve(__dirname, '../../packages/ui/src'),
        
        // Solution-specific imports for cross-solution communication
        '@pos': path.resolve(__dirname, '../point-of-sale/src'),
        '@crm': path.resolve(__dirname, '../crm-system/src'),
        '@hr': path.resolve(__dirname, '../hr-management/src'),
        '@accounting': path.resolve(__dirname, '../accounting-system/src'),
        '@analytics': path.resolve(__dirname, '../analytics-dashboard/src'),
      },
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
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'inventoryManagement',
        filename: 'remoteEntry.js',
        exposes: {
          './InventoryApp': './src/App.tsx',
          './InventoryDashboard': './src/pages/InventoryDashboard.tsx',
          './ProductsPage': './src/pages/ProductsPage.tsx',
          './SuppliersPage': './src/pages/SuppliersPage.tsx',
          './LocationsPage': './src/pages/LocationsPage.tsx',
          './ReportsPage': './src/pages/ReportsPage.tsx',
          './SettingsPage': './src/pages/SettingsPage.tsx',
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies.react,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
          },
          '@supabase/supabase-js': {
            singleton: true,
            requiredVersion: dependencies['@supabase/supabase-js'],
          },
          'lucide-react': {
            singleton: false,
            requiredVersion: dependencies['lucide-react'],
          },
          '@kits-hub/ui': {
            singleton: true,
            requiredVersion: '^1.0.0',
            eager: false,
            import: '@kits-hub/ui',
            shareKey: '@kits-hub/ui',
            shareScope: 'default',
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
      }),
    ],
    devServer: {
      port: 4177,
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};
