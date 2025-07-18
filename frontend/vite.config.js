import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/text': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/text/, '/text')
      }
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '813a9b6ce93a.ngrok-free.app'
    ]
    // Or, for dev, you can do:
    // allowedHosts: 'all'
  }
})
