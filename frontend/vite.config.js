import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // or use '0.0.0.0'
    port: 5173,
    // allowedHosts: ['a286-2405-201-603c-3806-54f2-bca2-fbc8-598e.ngrok-free.app']
  },
  plugins: [react()],
})
