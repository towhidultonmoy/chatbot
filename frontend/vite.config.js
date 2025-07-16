// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// // vite.config.js
// export default {
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//     allowedHosts: ['.ngrok-free.app'] // wildcard subdomain support
//   }
// }
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Accessible externally
    port: 5173,      // Default Vite port
    // Remove or adjust allowedHosts since backend is on EC2
    // allowedHosts: ['.ngrok-free.app'] // Comment out or remove if not using ngrok
  },
  // Optional: Add proxy to handle CORS
  proxy: {
    '/text': {
      target: 'http://34.219.90.159:8501', // Your EC2 backend
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/text/, '/text'), // Optional, adjust if needed
    },
  },
})
