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
  proxy: {
    '/api/admin/stok-barang': {
      target: 'http://192.168.110.16:5000/api/admin/stok-barang',
      changeOrigin: true,
      secure: false,
    },
    '/api/transaksi': {   // tambahkan ini
      target: 'http://192.168.110.16:5000',
      changeOrigin: true,
      secure: false,
    },
    
  }
}

})
