import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // Main bundle (CJS and ESM)
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
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
    external: ['zod', 'react'],
  },
  // Client bundle (browser-safe)
  {
    input: 'src/client.ts',
    output: [
      {
        file: 'dist/client.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/client.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
    external: ['zod', 'react'],
  },
  // Server bundle (Node.js)
  {
    input: 'src/server.ts',
    output: [
      {
        file: 'dist/server.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/server.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
    external: ['zod', 'react'],
  },
];
