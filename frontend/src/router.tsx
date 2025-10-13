import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import { AuthProvider } from "./auth/context/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthOnlyRoute from "./auth/AuthOnlyRoute";
import AuthGuard from "./auth/AuthGuard";
import DashboardRedirect from "./auth/DashboardRedirect";
import NotFound from "./auth/notif/404notfound";
import Transaction from "./pages/transaksi/index";
// import ProsesTransaksi from "./pages/transaksi/proses-transaksi";
import StatusPesananPage from "./pages/pesanan/index";


// Kasir
import KasirDashboard from "./kasir/dashboard";
import KasirPesananPage from "./kasir/pesanan";

// Manager
import MenegerDashboard from "./meneger/dashboard";
import MenegerStokBarangPage from "./meneger/stokbarang";
import MenegerRiwayatPage from "./meneger/riwayat";
import MenegerLaporanPage from "./meneger/laporan";
import MenegerSettingsPage from "./meneger/settings";

// Admin - Import router admin
import AdminRouter from "./admin/router";

// Auth
import LoginForm from "./auth/pages/login";
import RegisterPage from "./auth/pages/register";
import LoginSuccess from "./auth/components/LoginSuccess"; // Tambahkan import ini

// Profile
import ProfilePage from "./pages/ProfileUsers/profile/index";

// Import tipe Barang
import type { Barang } from "./admin/stok-barang";

// Definisi tipe untuk props router
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
          <Route path="/login" element={<AuthOnlyRoute><LoginForm /></AuthOnlyRoute>} />
          <Route path="/register" element={<AuthOnlyRoute><RegisterPage /></AuthOnlyRoute>} />
          
          {/* Login Success Route - untuk menangani callback dari Google OAuth */}
          <Route path="/login-success" element={<LoginSuccess />} />

          {/* Halaman Transaksi - bisa diakses oleh siapa saja */}
          <Route path="/transaksi" element={<Transaction />} />
          {/* <Route path="/proses-transaksi" element={<ProsesTransaksi />} /> */}

          {/* Status Pesanan - memerlukan login */}
          <Route 
            path="/pesanan" 
            element={
              <AuthGuard>
                <StatusPesananPage />
              </AuthGuard>
            } 
          />

          {/* Perbarui rute PembelianBerhasil untuk menerima token */}
          

          {/* Halaman 404 */}
          <Route path="/not-found" element={<NotFound />} />

          {/* Halaman Profil - bisa diakses oleh semua role yang login */}
          <Route 
            path="/profile" 
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            } 
          />

          {/* Kasir - hanya bisa diakses oleh kasir dan admin */}
          <Route 
            path="/kasir/*" 
            element={
              <ProtectedRoute allowedRoles={['kasir', 'admin']}>
                <Routes>
                  <Route path="dashboard" element={<KasirDashboard dataBarang={dataBarang} />} />
                  <Route path="pesanan" element={<KasirPesananPage />} />
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