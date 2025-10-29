// src/admin/dashboard/dashboard.tsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { portbe } from '../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;
// Define interfaces for API responses
interface User {
  _id: string;
  nama_lengkap?: string;
  nama?: string;
  username?: string;
  role: string;
  status: string;
  umur?: number;
  alamat?: string;
  password?: string;
}

interface TopBarangResponse {
  barang_terlaris: {
    nama_barang: string;
    jumlah: number;
  }[];
}

interface ProdukLaba {
  produk: string;
  harga_jual: number;
  harga_beli: number;
  laba: number;
  _id: string;
}

interface LaporanResponse {
  laba: {
    total_laba: number;
    detail: ProdukLaba[];
  };
}

interface BarangDibeli {
  kode_barang?: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  _id: string;
}

interface Transaksi {
  _id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[];
  total_harga: number;
  metode_pembayaran: string;
  status: 'pending' | 'selesai' | 'expire';
}

// Define Channel interface for payment methods
interface Channel {
  name: string;
  logo?: string;
  isActive?: boolean;
  _id?: string;
}

// Add interface for settings response
interface PaymentMethod {
  method: string;
  channels: Channel[];
  _id: string;
  isActive: boolean;
}

interface SettingsResponse {
  payment_methods: PaymentMethod[];
  // ... other settings properties
}

interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  totalProductsSold: number;
  paymentMethods: number;
  activeUsers: number;
  completedTransactions: number;
  averageTransactionValue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalProductsSold: 0,
    paymentMethods: 0,
    activeUsers: 0,
    completedTransactions: 0,
    averageTransactionValue: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaksi[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from all endpoints including settings
        const [
          usersResponse,
          topBarangResponse,
          laporanResponse,
          transaksiResponse,
          settingsResponse
        ] = await Promise.all([
          fetch(`${ipbe}:${portbe}/api/admin/users`),
          fetch(`${ipbe}:${portbe}/api/admin/dashboard/top-barang?filter=bulan`),
          fetch(`${ipbe}:${portbe}/api/manager/laporan`),
          fetch(`${ipbe}:${portbe}/api/admin/dashboard/transaksi/terakhir`),
          fetch(`${ipbe}:${portbe}/api/admin/settings`)
        ]);

        // Check for errors
        if (!usersResponse.ok || !topBarangResponse.ok || !laporanResponse.ok || 
            !transaksiResponse.ok || !settingsResponse.ok) {
          throw new Error('One or more requests failed');
        }

        // Parse responses
        const usersData: User[] = await usersResponse.json();
        const topBarangData: TopBarangResponse = await topBarangResponse.json();
        const laporanData: LaporanResponse[] = await laporanResponse.json();
        const transaksiData: Transaksi[] = await transaksiResponse.json();
        const settingsData: SettingsResponse = await settingsResponse.json();

        // Calculate statistics
        const totalUsers = usersData.length;
        const activeUsers = usersData.filter(user => user.status === 'aktif').length;
        const totalTransactions = transaksiData.length;
        const completedTransactions = transaksiData.filter(t => t.status === 'selesai').length;
        
        // Get total revenue from laporan data
        const totalRevenue = laporanData.length > 0 ? laporanData[0].laba.total_laba : 0;
        
        // Calculate total products sold
        const totalProductsSold = topBarangData.barang_terlaris.reduce(
          (sum: number, item) => sum + item.jumlah, 0
        );
        
        // Count active payment methods from settings
        const activePaymentMethods = settingsData.payment_methods.filter(
          method => method.isActive
        ).length;
        
        // Calculate average transaction value
        const averageTransactionValue = totalTransactions > 0 
          ? transaksiData.reduce((sum, t) => sum + t.total_harga, 0) / totalTransactions 
          : 0;

        setStats({
          totalUsers,
          totalTransactions,
          totalRevenue,
          totalProductsSold,
          paymentMethods: activePaymentMethods, // Use active payment methods count
          activeUsers,
          completedTransactions,
          averageTransactionValue
        });
        
        // Store recent transactions (limit to 5)
        setRecentTransactions(transaksiData.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format Rupiah dengan penanganan nilai negatif
  const formatRupiah = (amount: number): string => {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(absoluteAmount);
    
    return isNegative ? `-${formattedAmount}` : formattedAmount;
  };

  // Format Tanggal
  const formatTanggal = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'selesai': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expire': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'selesai': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'pending': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'expire': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default: 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">Gagal memuat data: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Total Pengguna */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Pengguna</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
              <p className="text-xs text-blue-100 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-white mr-1">{stats.activeUsers}</p> Aktif
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Total Transaksi */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Total Transaksi</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalTransactions}</p>
              <p className="text-xs text-green-100 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-white mr-1">{stats.completedTransactions}</p> Selesai
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Total Pendapatan - Diperbaiki untuk nilai negatif */}
        <div className={`bg-gradient-to-br ${stats.totalRevenue < 0 ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600'} p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Total Pendapatan</p>
              <p className={`text-2xl font-bold text-white mt-1 ${stats.totalRevenue < 0 ? 'text-red-100' : ''}`}>
                {formatRupiah(stats.totalRevenue)}
              </p>
              <p className="text-xs text-white mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Rata-rata: <p className="text-sm font-bold text-white ml-2">{formatRupiah(stats.averageTransactionValue)}</p>
              </p>
            </div>
            <div className="p-3 rounded-full bg-white bg-opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Produk Terjual */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Produk Terjual</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalProductsSold}</p>
              <p className="text-xs text-yellow-100 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-white mr-1">{stats.paymentMethods}</p> Metode Pembayaran
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Transaksi Terbaru
            </h2>
          </div>
          <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          No. Transaksi
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Tanggal
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {recentTransactions.length === 0 ? (
        <tr>
          <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">Tidak ada data transaksi</p>
          </td>
        </tr>
      ) : (
        recentTransactions.map((trans, index) => (
          <tr 
            key={trans._id} 
            className={`transition-colors duration-150 hover:bg-gray-50 ${
              index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
            }`}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {trans.nomor_transaksi}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {formatTanggal(trans.tanggal_transaksi)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {formatRupiah(trans.total_harga)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(trans.status)}`}>
                {getStatusIcon(trans.status)}
                <span className="ml-1">{trans.status.charAt(0).toUpperCase() + trans.status.slice(1)}</span>
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
          <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
            <a href="/admin/dashboard/transaksi" className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center">
              Lihat semua transaksi
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Akses Cepat
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <a href="/admin/users" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
              <div className="p-3 rounded-md bg-blue-100 text-blue-600 mr-4 group-hover:bg-blue-200 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">Manajemen Pengguna</span>
                <p className="text-xs text-gray-500 mt-1">Kelola data pengguna</p>
              </div>
            </a>
            
            <a href="/admin/dashboard/top-barang" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 group">
              <div className="p-3 rounded-md bg-green-100 text-green-600 mr-4 group-hover:bg-green-200 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-800 group-hover:text-green-700 transition-colors duration-200">Top Barang Terlaris</span>
                <p className="text-xs text-gray-500 mt-1">Lihat produk terlaris</p>
              </div>
            </a>
            
            <a href="/admin/dashboard/laporan-penjualan" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group">
              <div className="p-3 rounded-md bg-purple-100 text-purple-600 mr-4 group-hover:bg-purple-200 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V8a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-800 group-hover:text-purple-700 transition-colors duration-200">Laporan Penjualan</span>
                <p className="text-xs text-gray-500 mt-1">Analisis penjualan</p>
              </div>
            </a>

            <a href="/admin/dashboard/breakdown-pembayaran" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 group">
              <div className="p-3 rounded-md bg-red-100 text-red-600 mr-4 group-hover:bg-red-200 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-800 group-hover:text-red-700 transition-colors duration-200">Breakdown Pembayaran</span>
                <p className="text-xs text-gray-500 mt-1">Detail metode pembayaran</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Ringkasan Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Total Pengguna */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Pengguna</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                <p className="text-xs text-blue-700">{stats.activeUsers} aktif</p>
              </div>
            </div>
          </div>
          
          {/* Card Total Transaksi */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-100 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Total Transaksi</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalTransactions}</p>
                <p className="text-xs text-green-700">{stats.completedTransactions} selesai</p>
              </div>
            </div>
          </div>
          
          {/* Card Total Pendapatan - Diperbaiki untuk nilai negatif */}
          <div className={`bg-gradient-to-br ${stats.totalRevenue < 0 ? 'from-red-50 to-red-100 border-red-100' : 'from-purple-50 to-purple-100 border-purple-100'} p-5 rounded-lg border shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stats.totalRevenue < 0 ? 'bg-red-500' : 'bg-purple-500'} text-white mr-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${stats.totalRevenue < 0 ? 'text-red-800' : 'text-purple-800'}`}>Total Pendapatan</p>
                <p className={`text-2xl font-bold ${stats.totalRevenue < 0 ? 'text-red-600' : 'text-purple-600'}`}>
                  {formatRupiah(stats.totalRevenue)}
                </p>
                <p className={`text-xs ${stats.totalRevenue < 0 ? 'text-red-700' : 'text-purple-700'}`}>
                  Rata-rata: {formatRupiah(stats.averageTransactionValue)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Card Produk Terjual */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border border-yellow-100 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Produk Terjual</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalProductsSold}</p>
                <p className="text-xs text-yellow-700">{stats.paymentMethods} metode pembayaran</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;