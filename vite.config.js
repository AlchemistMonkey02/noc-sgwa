import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // Force optimization to resolve 504 Outdated Dep issues
  optimizeDeps: {
    force: true,
  },
  // Cache busting
  define: {
    'process.env.VITE_CACHE_BUST': JSON.stringify(Date.now()),
  }
})
