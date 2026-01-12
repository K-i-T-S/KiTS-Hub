const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'eval-source-map',
  devServer: {
    port: 3020,
    historyApiFallback: true,
    hot: false,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    // Ensure client-side routing works
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: true,
        runtimeErrors: true,
      },
    },
    // Setup middlewares to handle all requests
    setupMiddlewares: (middlewares, devServer) => {
      console.log('🔄 Dev server starting...');
      
      devServer.app.get('*', (req, res, next) => {
        console.log(`📄 Request received: ${req.method} ${req.url}`);
        // Always serve the React app for all routes
        return next();
      });
      
      return middlewares;
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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      // Inject the React app into the HTML
      inject: true,
      templateParameters: {
        'html': {
          minify: false,
          cache: false,
        },
      },
    }),
  ],
  optimization: {
    splitChunks: false, // Disable code splitting for now
  },
};
