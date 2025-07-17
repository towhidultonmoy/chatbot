import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import fs from 'fs'

   export default defineConfig({
     plugins: [react()],
     server: {
       host: '0.0.0.0',
       port: 5173,
       https: {
         key: fs.readFileSync('./ssl/key.pem'),
         cert: fs.readFileSync('./ssl/cert.pem')
       },
       proxy: {
         '/text': {
           target: 'http://localhost:5000', // Flask backend (HTTP is fine for backend)
           changeOrigin: true,
           secure: false
         }
       }
     }
   })
