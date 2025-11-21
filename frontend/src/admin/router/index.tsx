// src/admin/AdminRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout';
import AdminDashboard from '../dashboard/dashboard';
import BreakdownPembayaran from '../dashboard/breakdown-pembayaran';
import LaporanPenjualan from '../dashboard/laporan-penjualan';
import OmzetPage from '../dashboard/omzet';
import StatusPesanan from '../dashboard/status-pesanan';
import TopBarang from '../dashboard/top-barang';
import Transaksi from '../dashboard/transaksi';
import InputPenjualan from '../dashboard/input-penjualan'; // Tambahkan import ini
import ModalPenjualan from '../biaya/modal-penjualan'; 
import BiayaLayanan from '../biaya/biaya-layanan'; 
import ModalBahanBaku from '../biaya/modal-bahanbaku/'; 
import StokBarangAdmin from '../stok-barang';
import StatusPesananAdmin from '../status-pesanan';
import UsersPage from '../users';
import SettingsPage from '../settings';
import Admin404 from '../notif/404notfound';
import type { Barang } from '../stok-barang';

interface AdminRouterProps {
  dataBarang: Barang[];
  setDataBarang: React.Dispatch<React.SetStateAction<Barang[]>>;
}

const AdminRouter: React.FC<AdminRouterProps> = ({ dataBarang, setDataBarang }) => {
  return (
    <AdminLayout>
      <Routes>
        {/* Dashboard Routes */}
        <Route path="dashboard">
          <Route index element={<AdminDashboard />} />
          <Route path="status-pesanan" element={<StatusPesanan />} />
          <Route path="top-barang" element={<TopBarang />} />
          <Route path="omzet" element={<OmzetPage />} />
          <Route path="laporan-penjualan" element={<LaporanPenjualan />} />
          <Route path="breakdown-pembayaran" element={<BreakdownPembayaran />} />
          <Route path="transaksi" element={<Transaksi />} />
          <Route path="input-penjualan" element={<InputPenjualan />} /> {/* Tambahkan route ini */}
        </Route>
        
        {/* Biaya Routes */}
        <Route path="biaya">
          <Route path="modal-penjualan" element={<ModalPenjualan />} />
          <Route path="biaya-layanan" element={<BiayaLayanan />} />
        </Route>
        
        {/* Stok Barang Route */}
        <Route path="stok-barang" element={<StokBarangAdmin dataBarang={dataBarang} setDataBarang={setDataBarang} />} />
        
        {/* Modal Bahan Baku Route */}
        <Route path="modal-bahanbaku" element={<ModalBahanBaku />} />
        
        {/* Status Pesanan Route */}
        <Route path="status-pesanan" element={<StatusPesananAdmin />} />
        
        {/* Users Route */}
        <Route path="users" element={<UsersPage />} />
        
        
        
        {/* Settings Route */}
        <Route path="settings" element={<SettingsPage />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Admin404 />} />
        
        {/* Default route - redirect ke dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRouter;