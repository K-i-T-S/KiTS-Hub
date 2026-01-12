import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default defineConfig([
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    external: ['react', 'react-dom', '@supabase/supabase-js', 'zustand'],
    plugins: [
      typescript({
        typescript: require('typescript'),
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external: ['react', 'react-dom', '@supabase/supabase-js', 'zustand'],
    plugins: [
      typescript({
        typescript: require('typescript'),
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
      }),
    ],
  },
]);
