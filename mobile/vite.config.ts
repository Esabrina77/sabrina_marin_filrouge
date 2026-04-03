import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // Allow mobile devices to connect to dev server on LAN
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
