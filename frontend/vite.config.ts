import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory'))
              return 'charts-vendor'
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler'))
              return 'react-vendor'
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('axios'))
              return 'query-vendor'
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod'))
              return 'forms-vendor'
          }
        },
      },
    },
  },
})
