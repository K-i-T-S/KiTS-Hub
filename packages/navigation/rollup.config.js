import typescript from 'rollup-plugin-typescript2';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfig: './tsconfig.json',
        clean: true,
      }),
    ],
    external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
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
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfig: './tsconfig.json',
        clean: true,
      }),
    ],
    external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
  },
];
