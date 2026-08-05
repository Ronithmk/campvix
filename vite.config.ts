import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Route-based lazy loading (src/routes/index.tsx) already splits each
        // page into its own chunk. Without this, large shared vendor
        // libraries (recharts, the mock/faker data graph) still land in
        // whichever chunk happens to import them first, producing an
        // oversized chunk with a misleading page name.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'vendor-charts'
          if (id.includes('@radix-ui')) return 'vendor-radix'
          if (id.includes('@faker-js')) return 'vendor-faker'
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms'
          if (id.includes('framer-motion')) return 'vendor-motion'
          return 'vendor'
        },
      },
    },
  },
})
