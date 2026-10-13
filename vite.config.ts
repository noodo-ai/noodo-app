import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: false,
        timeout: 75000,
        proxyTimeout: 75000,
      },
    },
  },
})
