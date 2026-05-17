import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // or use '0.0.0.0'
    port: 3000,
    strictPort: true, // This is key: it prevents Vite from jumping to 5174
    // allowedHosts: ['8c19919a8d01.ngrok-free.app']
  },
  plugins: [react()],
})
