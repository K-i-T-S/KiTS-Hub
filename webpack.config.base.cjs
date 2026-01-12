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
 */
module.exports = (env = {}) => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isProduction = env.NODE_ENV === 'production';

  return {
    target: 'web',

    entry: {
      main: [
        ...(isDevelopment ? ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'] : []),
        './src/index.tsx',
      ],
    },

    output: {
      clean: true,
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash:8].js',
      chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'assets/[name].[hash:8][ext]',
      publicPath: 'auto',
      uniqueName: 'kits-hub-solution',
      module: false,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/pages': path.resolve(__dirname, 'src/pages'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/styles': path.resolve(__dirname, 'src/styles'),
      },
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
        '.mjs': ['.mjs', '.mts'],
      },
      fallback: {
        buffer: false,
        crypto: false,
        stream: false,
        util: false,
      },
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    targets: {
                      browsers: ['> 1%', 'last 2 versions', 'not dead']
                    },
                    modules: false,
                    useBuiltIns: 'usage',
                    corejs: 3,
                  }],
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  ...(isDevelopment ? ['react-refresh/babel'] : []),
                  ['@babel/plugin-proposal-class-properties', { loose: true }],
                  ['@babel/plugin-proposal-decorators', { legacy: true }],
                  '@babel/plugin-proposal-optional-chaining',
                  '@babel/plugin-proposal-nullish-coalescing-operator',
                ],
                cacheDirectory: true,
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: isDevelopment
                    ? '[name]__[local]--[hash:base64:5]'
                    : '[hash:base64:8]',
                  exportLocalsConvention: 'camelCase',
                },
                sourceMap: isDevelopment,
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
                    ...(isProduction ? ['cssnano'] : []),
                  ],
                },
                sourceMap: isDevelopment,
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|webp|avif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024,
            },
          },
          generator: {
            filename: 'assets/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.json$/,
          type: 'json',
          parser: {
            strict: true,
          },
        },
        {
          test: /\.ya?ml$/,
          type: 'json',
          use: 'yaml-loader',
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: 'kits_hub_solution',
        filename: 'remoteEntry.js',
        exposes: {},
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies.react,
            eager: false,
            import: 'react',
            shareKey: 'react',
            shareScope: 'default',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
            eager: false,
            import: 'react-dom',
            shareKey: 'react-dom',
            shareScope: 'default',
          },
          '@supabase/supabase-js': {
            singleton: false,
            requiredVersion: dependencies['@supabase/supabase-js'],
            eager: false,
          },
          'react-router-dom': {
            singleton: false,
            requiredVersion: dependencies['react-router-dom'],
            eager: false,
          },
          'lucide-react': {
            singleton: false,
            requiredVersion: dependencies['lucide-react'],
            eager: false,
          },
        },
      }),
      ...(isDevelopment ? [new webpack.HotModuleReplacementPlugin()] : []),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              keep_classnames: false,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
      moduleIds: isProduction ? 'deterministic' : 'named',
      chunkIds: isProduction ? 'deterministic' : 'named',
    },

    devServer: isDevelopment ? {
      port: 3000,
      hot: true,
      open: false,
      compress: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/rest': {
          target: process.env.NEXT_PUBLIC_SUPABASE_URL,
          changeOrigin: true,
          secure: true,
        },
      },
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
      watchFiles: ['src/**/*', 'public/**/*'],
      client: {
        logging: 'info',
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    } : undefined,

    devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',

    performance: {
      maxAssetSize: 512000,
      maxEntrypointSize: 512000,
      hints: isProduction ? 'warning' : false,
      assetFilter: (assetFilename) => {
        return !assetFilename.endsWith('.map') && !assetFilename.includes('fonts/');
      },
    },

    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    },

    externals: isProduction ? {} : undefined,

    watchOptions: isDevelopment ? {
      ignored: /node_modules/,
      poll: 1000,
      aggregateTimeout: 300,
    } : undefined,
  };
};
