import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import {ngrokBackend} from './ngrokfrontend.ts'
import { portbe } from '../backend/ngrokbackend.ts'
// Dapatkan __dirname di ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ngfb = ngrokBackend() 
const ipbe = process.env.VITE_IPBE
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
      ngfb
    ],
    proxy: {
      '/api/admin/stok-barang': {
        target: `${ipbe}:${portbe}/api/admin/stok-barang`,
        changeOrigin: true,
        secure: false,
      },
      '/api/transaksi': {   
        target: `${ipbe}:${portbe}`,
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk Google OAuth
      '/api/auth/google': {
        target: ngfb, // Gunakan URL backend teman Anda
        changeOrigin: true,
        secure: false,
      },
      // Tambahkan proxy untuk endpoint users/me
      '/api/users/me': {
        target: ngfb,
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk endpoint cart
      '/api/cart': {
        target: ngfb,
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk endpoint transaksi
      '/api/transaksi/public/status': {
        target: ngfb,
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk endpoint users/history
      '/api/users/history': {
        target: ngfb,
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
