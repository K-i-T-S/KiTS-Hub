const { ContainerReferencePlugin, ModuleFederationPlugin } = require('webpack').container;
const { dependencies } = require('./package.json');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    entry: './src/bootstrap.tsx',
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
        // Local solution component imports - aligned with tsconfig.base.json paths
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
        '@/contexts': path.resolve(__dirname, 'src/contexts'),
        
        // Shared packages - accessible across all workspaces
        '@shared': path.resolve(__dirname, '../../shared'),
        '@shared-ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@shared-config': path.resolve(__dirname, '../../packages/config/src'),
        '@shared-auth': path.resolve(__dirname, '../../packages/auth/src'),
        '@shared-database': path.resolve(__dirname, '../../packages/database/src'),
        
        // Cross-solution imports for micro-frontend architecture
        '@shell': path.resolve(__dirname, '../../shared-shell/src'),
        '@pos': path.resolve(__dirname, '../point-of-sale/src'),
        '@crm': path.resolve(__dirname, '../crm-system/src'),
        '@hr': path.resolve(__dirname, '../hr-management/src'),
        '@accounting': path.resolve(__dirname, '../accounting-system/src'),
        '@analytics': path.resolve(__dirname, '../analytics-dashboard/src'),
        
        // Legacy aliases for backward compatibility
        '@shared-shell': path.resolve(__dirname, '../../shared-shell/src'),
        '@shared/ui-components': path.resolve(__dirname, '../../packages/ui/src'),
        '@kits-hub/ui': path.resolve(__dirname, '../../packages/ui/src')
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
          './App': './src/App.tsx',
          './InventoryDashboard': './src/pages/InventoryDashboard.tsx',
          './ProductsPage': './src/pages/ProductsPage.tsx',
          './bootstrap': './src/bootstrap.tsx',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: dependencies.react,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
          },
          'react-router-dom': {
            singleton: true,
            requiredVersion: dependencies['react-router-dom'],
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
