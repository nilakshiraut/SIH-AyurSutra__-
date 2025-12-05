import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://sih-ayursutra.onrender.com',
        changeOrigin: true
      },
      '/ws': {
        target: 'wss://sih-ayursutra.onrender.com',
        ws: true
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:10000'),
    __WS_URL__: JSON.stringify(process.env.VITE_WS_URL || 'ws://localhost:10000')
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  publicDir: 'public'
})


