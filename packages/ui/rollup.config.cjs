const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

const config = [
  // Main bundle with CSS included
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        typescript: require('typescript'),
        useTsconfigDeclarationDir: true,
        declaration: true,
        declarationDir: 'dist',
      }),
      postcss({
        plugins: [
          tailwindcss('./tailwind.config.js'),
          autoprefixer(),
        ],
        extract: false,
        inject: true,
        minimize: true,
      }),
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
];

module.exports = config;
