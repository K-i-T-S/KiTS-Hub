import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/coverage/**'
      ],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    globals: true,
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../shared-shell/src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@components': path.resolve(__dirname, '../shared-shell/src/components'),
      '@lib': path.resolve(__dirname, '../shared-shell/src/lib'),
      '@contexts': path.resolve(__dirname, '../shared-shell/src/contexts')
    }
  }
})
