// src/admin/dashboard/dashboard.tsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

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

interface BreakdownResponse {
  payment_breakdown: {
    [key: string]: number;
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
        
        // Fetch data from all endpoints
        const [
          usersResponse,
          topBarangResponse,
          laporanResponse,
          breakdownResponse,
          transaksiResponse
        ] = await Promise.all([
          fetch('http://192.168.110.16:5000/api/admin/users'),
          fetch('http://192.168.110.16:5000/api/admin/dashboard/top-barang?filter=bulan'),
          fetch('http://192.168.110.16:5000/api/manager/laporan'),
          fetch('http://192.168.110.16:5000/api/admin/dashboard/breakdown-pembayaran'),
          fetch('http://192.168.110.16:5000/api/admin/dashboard/transaksi/terakhir')
        ]);

        // Check for errors
        if (!usersResponse.ok || !topBarangResponse.ok || !laporanResponse.ok || 
            !breakdownResponse.ok || !transaksiResponse.ok) {
          throw new Error('One or more requests failed');
        }

        // Parse responses
        const usersData: User[] = await usersResponse.json();
        const topBarangData: TopBarangResponse = await topBarangResponse.json();
        const laporanData: LaporanResponse[] = await laporanResponse.json();
        const breakdownData: BreakdownResponse = await breakdownResponse.json();
        const transaksiData: Transaksi[] = await transaksiResponse.json();

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
        
        // Count payment methods
        const paymentMethods = Object.keys(breakdownData.payment_breakdown).length;
        
        // Calculate average transaction value
        const averageTransactionValue = totalTransactions > 0 
          ? transaksiData.reduce((sum, t) => sum + t.total_harga, 0) / totalTransactions 
          : 0;

        setStats({
          totalUsers,
          totalTransactions,
          totalRevenue,
          totalProductsSold,
          paymentMethods,
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

  // Format Rupiah
  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600">{stats.activeUsers} aktif</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100 text-green-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-xs text-green-600">{stats.completedTransactions} selesai</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">{formatRupiah(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500">Rata-rata: {formatRupiah(stats.averageTransactionValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Produk Terjual</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProductsSold}</p>
              <p className="text-xs text-gray-500">{stats.paymentMethods} metode pembayaran</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
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
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((trans) => (
                    <tr key={trans._id} className="hover:bg-gray-50">
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trans.status)}`}>
                          {trans.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 text-center">
            <a href="/admin/dashboard/transaksi" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Lihat semua transaksi →
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Akses Cepat</h2>
          </div>
          <div className="p-6 space-y-4">
            <a href="/admin/users" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Manajemen Pengguna</span>
            </a>
            
            <a href="/admin/dashboard/top-barang" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Top Barang Terlaris</span>
            </a>
            
            <a href="/admin/dashboard/laporan-penjualan" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="p-2 rounded-md bg-purple-100 text-purple-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Laporan Penjualan</span>
            </a>

            <a href="/admin/dashboard/breakdown-pembayaran" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="p-2 rounded-md bg-red-100 text-red-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Breakdown Pembayaran</span>
            </a>
          </div>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Ringkasan Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Total Pengguna</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            <p className="text-xs text-blue-700">{stats.activeUsers} aktif</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-800">Total Transaksi</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalTransactions}</p>
            <p className="text-xs text-green-700">{stats.completedTransactions} selesai</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-800">Total Pendapatan</p>
            <p className="text-2xl font-bold text-purple-600">{formatRupiah(stats.totalRevenue)}</p>
            <p className="text-xs text-purple-700">Rata-rata: {formatRupiah(stats.averageTransactionValue)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Produk Terjual</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.totalProductsSold}</p>
            <p className="text-xs text-yellow-700">{stats.paymentMethods} metode pembayaran</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;