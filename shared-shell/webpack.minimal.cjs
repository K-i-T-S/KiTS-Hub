const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { dependencies } = require('./package.json');
const path = require('path');

module.exports = {
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
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
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
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        inventoryManagement: 'inventoryManagement@http://localhost:4177/remoteEntry.js',
        pointOfSale: 'pointOfSale@http://localhost:4178/remoteEntry.js',
        crmSystem: 'crmSystem@http://localhost:4179/remoteEntry.js',
        hrManagement: 'hrManagement@http://localhost:4180/remoteEntry.js',
        accountingSystem: 'accountingSystem@http://localhost:4181/remoteEntry.js',
        analyticsDashboard: 'analyticsDashboard@http://localhost:4182/remoteEntry.js',
      },
      shared: {
        ...dependencies,
        react: {
          singleton: true,
          requiredVersion: dependencies.react,
          eager: false,
          import: 'react'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: dependencies['react-dom'],
          eager: false,
          import: 'react-dom'
        },
        '@supabase/supabase-js': {
          singleton: true,
          requiredVersion: dependencies['@supabase/supabase-js'],
          eager: false
        },
        'lucide-react': {
          singleton: false,
          requiredVersion: dependencies['lucide-react'],
          eager: false
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: dependencies['react-router-dom'],
          eager: false,
          import: 'react-router-dom'
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
