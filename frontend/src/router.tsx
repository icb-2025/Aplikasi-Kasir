import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Hapus Navigate yang tidak digunakan
import { AuthProvider } from "./auth/context/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthOnlyRoute from "./auth/AuthOnlyRoute";
import DashboardRedirect from "./auth/DashboardRedirect";
import NotFound from "./auth/notif/404notfound";
import Transaction from "./pages/transaksi/index";
import ProsesTransaksi from "./pages/transaksi/proses-transaksi";
import StatusPesananPage from "./pages/pesanan/index";
import RiwayatPage from "./pages/riwayat/index";
import type { Barang } from "./admin/stok-barang";
import PembelianBerhasil from "./pages/notif/PembelianBerhasil";

// Kasir
import KasirDashboard from "./kasir/dashboard";
import KasirPesananPage from "./kasir/pesanan";
import KasirRiwayatPage from "./kasir/riwayat";

// Manager
import MenegerDashboard from "./meneger/dashboard";
import MenegerStokBarangPage from "./meneger/stokbarang";
import MenegerRiwayatPage from "./meneger/riwayat";
import MenegerLaporanPage from "./meneger/laporan";
import MenegerSettingsPage from "./meneger/settings";

// Admin - Import router admin
import AdminRouter from "./admin/router";

// Auth
import LoginPage from "./auth/pages/login";
import RegisterPage from "./auth/pages/register";

interface RouterProps {
  dataBarang: Barang[];
  setDataBarang: React.Dispatch<React.SetStateAction<Barang[]>>;
}

const AppRouter = ({ dataBarang, setDataBarang }: RouterProps) => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Halaman default - bisa diakses tanpa login */}
          <Route path="/" element={<DashboardRedirect dataBarang={dataBarang} />} />
          
          {/* Auth Routes - hanya bisa diakses jika belum login */}
          <Route path="/login" element={<AuthOnlyRoute><LoginPage /></AuthOnlyRoute>} />
          <Route path="/register" element={<AuthOnlyRoute><RegisterPage /></AuthOnlyRoute>} />

          {/* Halaman Transaksi - bisa diakses oleh siapa saja */}
          <Route path="/transaksi" element={<Transaction />} />
          <Route path="/transaksi/proses/:token" element={<ProsesTransaksi />} />

          {/* Status Pesanan - bisa diakses oleh siapa saja */}
          <Route path="/pesanan" element={<StatusPesananPage />} />

          {/* Halaman Riwayat - bisa diakses oleh siapa saja */}
          <Route path="/riwayat" element={<RiwayatPage />} />

          {/* Perbarui rute PembelianBerhasil untuk menerima token */}
          <Route path="/pembelian-berhasil/:token" element={<PembelianBerhasil />} />

          {/* Halaman 404 */}
          <Route path="/not-found" element={<NotFound />} />

          {/* Kasir - hanya bisa diakses oleh kasir dan admin */}
          <Route 
            path="/kasir/*" 
            element={
              <ProtectedRoute allowedRoles={['kasir', 'admin']}>
                <Routes>
                  <Route path="dashboard" element={<KasirDashboard dataBarang={dataBarang} />} />
                  <Route path="pesanan" element={<KasirPesananPage />} />
                  <Route path="riwayat" element={<KasirRiwayatPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Manager - hanya bisa diakses oleh manajer dan admin */}
          <Route 
            path="/meneger/*" 
            element={
              <ProtectedRoute allowedRoles={['manajer', 'admin']}>
                <Routes>
                  <Route path="dashboard" element={<MenegerDashboard />} />
                  <Route path="stokbarang" element={<MenegerStokBarangPage dataBarang={dataBarang} />} />
                  <Route path="riwayat" element={<MenegerRiwayatPage />} />
                  <Route path="laporan" element={<MenegerLaporanPage />} />
                  <Route path="settings" element={<MenegerSettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Admin - hanya bisa diakses oleh admin */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRouter dataBarang={dataBarang} setDataBarang={setDataBarang} />
              </ProtectedRoute>
            } 
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;