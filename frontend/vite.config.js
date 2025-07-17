import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external access
    port: 5173,
    proxy: {
      '/text': {
        target: 'http://localhost:5000', // Proxy requests to Flask backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})
