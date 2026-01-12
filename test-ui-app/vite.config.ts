import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@kits-hub/ui': resolve(__dirname, '../packages/ui/src'),
      '@kits-hub/ui/styles': resolve(__dirname, '../packages/ui/src/styles/globals.css'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
})
