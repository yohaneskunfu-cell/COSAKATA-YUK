import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Sesuaikan dengan port server/backend Anda jika berjalan di port lain (misal: 3000 atau 5000)
        changeOrigin: true,
      }
    }
  }
})