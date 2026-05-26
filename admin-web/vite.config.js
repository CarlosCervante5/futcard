import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174 // Run on 5174 so it doesn't conflict with the mobile dev server running on 5173!
  }
})
