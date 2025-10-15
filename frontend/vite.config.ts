import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

// Dapatkan __dirname di ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    // Tambahkan semua host ngrok yang Anda gunakan
    allowedHosts: [
      'bf45610fab5b.ngrok-free.app',
      '0ca7d236de79.ngrok-free.app'
    ],
    proxy: {
      '/api/admin/stok-barang': {
        target: 'http://192.168.110.16:5000/api/admin/stok-barang',
        changeOrigin: true,
        secure: false,
      },
      '/api/transaksi': {   
        target: 'http://192.168.110.16:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk Google OAuth
      '/api/auth/google': {
        target: 'https://bf45610fab5b.ngrok-free.app', // Gunakan URL backend teman Anda
        changeOrigin: true,
        secure: false,
      },
      // Tambahkan proxy untuk endpoint users/me
      '/api/users/me': {
        target: 'https://bf45610fab5b.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk endpoint cart
      '/api/cart': {
        target: 'https://bf45610fab5b.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk endpoint transaksi
      '/api/transaksi/public/status': {
        target: 'https://bf45610fab5b.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk endpoint users/history
      '/api/users/history': {
        target: 'https://bf45610fab5b.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
