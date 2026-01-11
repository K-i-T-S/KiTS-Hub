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
      filename: 'remoteEntry.js',
      remotes: {
        inventoryManagement: 'inventoryManagement@http://localhost:4177/remoteEntry.js',
        pointOfSale: 'pointOfSale@http://localhost:4178/remoteEntry.js',
        crmSystem: 'crmSystem@http://localhost:4179/remoteEntry.js',
        hrManagement: 'hrManagement@http://localhost:4180/remoteEntry.js',
        accountingSystem: 'accountingSystem@http://localhost:4181/remoteEntry.js',
        analyticsDashboard: 'analyticsDashboard@http://localhost:4182/remoteEntry.js',
      },
      // Don't share React for now - let each remote manage its own React instance
      shared: {},
    }),
    new HtmlWebpackPlugin({
      template: './public/working-index.html',
    }),
  ],
  optimization: {
    splitChunks: false, // Disable to avoid chunk conflicts
  },
};
