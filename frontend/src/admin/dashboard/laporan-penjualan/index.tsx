import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabel } from 'recharts';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { exportPdf, exportExcel } from './utils';
import { Landmark, Wallet, TrendingUp, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { portbe } from '../../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;

// Interface untuk data dari API
interface LaporanHarian {
  tanggal: string;
  _id: string;
}

interface ProdukLaba {
  produk: string;
  harga_jual: number;
  harga_beli: number;
  laba: number;
  jumlah?: number;
  subtotal?: number;
  _id: string;
}

interface MetodePembayaran {
  metode: string;
  total: number;
  _id: string;
}

// Interface untuk biaya operasional
export interface BiayaOperasionalItem {
  nama: string;
  jumlah: number;
  _id?: string;
}

export interface BiayaOperasionalData {
  _id?: string;
  rincian_biaya: BiayaOperasionalItem[];
  total: number;
  createdAt?: string;
  __v?: number;
}

// Interface untuk biaya operasional yang sesuai dengan fungsi export
interface BiayaOperasional {
  _id: string;
  listrik: number;
  air: number;
  internet: number;
  sewa_tempat: number;
  gaji_karyawan: number;
  total: number;
  createdAt: string;
  __v: number;
}

// Interface untuk data yang tidak diketahui strukturnya
interface UnknownData {
  [key: string]: unknown;
}

interface ApiResponse {
  laporan_penjualan: {
    harian: LaporanHarian[];
    mingguan: UnknownData[];
    bulanan: UnknownData[];
  };
  periode: {
    start: string;
    end: string;
  };
  laba: {
    total_laba: number;
    detail: ProdukLaba[];
  };
  rekap_metode_pembayaran: MetodePembayaran[];
  _id: string;
  biaya_operasional_id: string | BiayaOperasionalData;
  pengeluaran: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Data tambahan dari backend
  total_pendapatan: number;
  total_barang_terjual: number;
  produk_terlaris: ProdukTerlaris[];
}

// Interface untuk daftar bulan
interface DaftarBulan {
  id: string;
  nama_bulan: string;
  bulan: number;
  tahun: number;
  createdAt: string;
}

// Interface untuk data produk terlaris
interface ProdukTerlaris {
  produk: string;
  harga_jual: number;
  harga_beli: number;
  labaPerItem: number;
  jumlahTerjual: number;
  totalLaba: number;
  gambar_url?: string;
}

// Interface untuk data pie chart
interface PieData {
  name: string;
  value: number;
  [key: string]: unknown;
}

// Interface untuk props CustomTooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PieData;
  }>;
}

const LaporanPenjualan: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [produkTerlaris, setProdukTerlaris] = useState<ProdukTerlaris[]>([]);
  const [totalPendapatan, setTotalPendapatan] = useState<number>(0);
  const [totalBarangTerjual, setTotalBarangTerjual] = useState<number>(0);
  const [pieData, setPieData] = useState<PieData[]>([]);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  // State untuk filter bulan
  const [daftarBulan, setDaftarBulan] = useState<DaftarBulan[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [loadingBulan, setLoadingBulan] = useState<boolean>(true);
  
  // State untuk biaya operasional
  const [biayaOperasional, setBiayaOperasional] = useState<BiayaOperasionalData>({
    rincian_biaya: [],
    total: 0,
  });
  const [loadingBiayaOperasional, setLoadingBiayaOperasional] = useState<boolean>(true);
  
  // Warna untuk pie chart
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#EF4444', '#14B8A6', '#F97316'];

  // Fetch daftar bulan
  useEffect(() => {
    const fetchDaftarBulan = async () => {
      try {
        setLoadingBulan(true);
        const response = await fetch(`${ipbe}:${portbe}/api/admin/laporan/bulan`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setDaftarBulan(result.daftar_bulan);
        
        // Pilih bulan terbaru secara default
        if (result.daftar_bulan && result.daftar_bulan.length > 0) {
          setSelectedBulan(result.daftar_bulan[0].id);
        }
      } catch (err) {
        console.error('Error fetching daftar bulan:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil daftar bulan');
      } finally {
        setLoadingBulan(false);
      }
    };

    fetchDaftarBulan();
  }, []);

  // Fetch data biaya operasional berdasarkan ID
  const fetchBiayaOperasional = async (id: string) => {
    try {
      setLoadingBiayaOperasional(true);
      
      // Pastikan id adalah string dan tidak kosong
      if (!id || typeof id !== 'string') {
        console.error('Invalid biaya operasional ID:', id);
        setBiayaOperasional({
          rincian_biaya: [],
          total: 0,
        });
        return;
      }
      
      const response = await fetch(`${ipbe}:${portbe}/api/admin/biaya-operasional/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Biaya operasional not found for ID:', id);
          setBiayaOperasional({
            rincian_biaya: [],
            total: 0,
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: BiayaOperasionalData = await response.json();
      setBiayaOperasional(result);
    } catch (err) {
      console.error('Error fetching biaya operasional:', err);
      setBiayaOperasional({
        rincian_biaya: [],
        total: 0,
      });
    } finally {
      setLoadingBiayaOperasional(false);
    }
  };

  // Fetch data laporan berdasarkan bulan yang dipilih
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBulan) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${ipbe}:${portbe}/api/admin/laporan/${selectedBulan}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        
        // Validasi data
        if (!result || !result.laba || !Array.isArray(result.laba.detail)) {
          throw new Error('Data tidak valid atau tidak lengkap');
        }
        
        setData(result);
        
        // Periksa biaya_operasional_id
        if (result.biaya_operasional_id) {
          if (typeof result.biaya_operasional_id === 'string') {
            // Jika berupa string, fetch data biaya operasional
            await fetchBiayaOperasional(result.biaya_operasional_id);
          } else if (typeof result.biaya_operasional_id === 'object') {
            // Jika berupa objek, gunakan langsung
            setBiayaOperasional(result.biaya_operasional_id as BiayaOperasionalData);
            setLoadingBiayaOperasional(false);
          }
        } else {
          console.warn('Missing biaya_operasional_id');
          setBiayaOperasional({
            rincian_biaya: [],
            total: 0,
          });
          setLoadingBiayaOperasional(false);
        }
        
        // Ambil data langsung dari backend tanpa perhitungan
        setTotalPendapatan(result.total_pendapatan || 0);
        setTotalBarangTerjual(result.total_barang_terjual || 0);
        setProdukTerlaris(result.produk_terlaris || []);
        
        // Siapkan data untuk pie chart
        const pieDataArray = result.rekap_metode_pembayaran.map(item => ({
          name: item.metode,
          value: item.total
        }));
        
        setPieData(pieDataArray);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBulan]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = produkTerlaris.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(produkTerlaris.length / itemsPerPage);

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fungsi untuk mengubah halaman
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Fungsi untuk mengekspor data
  const handleExport = (type: 'pdf' | 'excel') => {
    if (!data) return;
    
    // Konversi data biaya operasional ke format yang sesuai dengan fungsi export
    const biayaOperasionalExport: BiayaOperasional = {
      _id: biayaOperasional._id || '',
      listrik: 0,
      air: 0,
      internet: 0,
      sewa_tempat: 0,
      gaji_karyawan: 0,
      total: biayaOperasional.total || 0,
      createdAt: biayaOperasional.createdAt || new Date().toISOString(),
      __v: biayaOperasional.__v || 0
    };
    
    // Isi nilai berdasarkan data yang ada
    if (biayaOperasional.rincian_biaya && Array.isArray(biayaOperasional.rincian_biaya)) {
      biayaOperasional.rincian_biaya.forEach(item => {
        switch (item.nama.toLowerCase()) {
          case 'listrik':
            biayaOperasionalExport.listrik = item.jumlah || 0;
            break;
          case 'air':
            biayaOperasionalExport.air = item.jumlah || 0;
            break;
          case 'internet':
            biayaOperasionalExport.internet = item.jumlah || 0;
            break;
          case 'sewa tempat':
          case 'sewa':
            biayaOperasionalExport.sewa_tempat = item.jumlah || 0;
            break;
          case 'gaji karyawan':
          case 'gaji':
            biayaOperasionalExport.gaji_karyawan = item.jumlah || 0;
            break;
        }
      });
    }
    
    // Siapkan data untuk export
    const exportData = {
      periode: data.periode,
      laba: {
        total_laba: data.laba.total_laba,
        detail: produkTerlaris.map(item => ({
          produk: item.produk,
          harga_jual: item.harga_jual,
          harga_beli: item.harga_beli,
          labaPerItem: item.labaPerItem,
          jumlahTerjual: item.jumlahTerjual,
          totalLaba: item.totalLaba
        }))
      },
      rekap_metode_pembayaran: data.rekap_metode_pembayaran,
      totalPendapatan: totalPendapatan,
      totalBarangTerjual: totalBarangTerjual,
      pengeluaran: data.pengeluaran,
      biaya_operasional: biayaOperasionalExport
    };
    
    if (type === 'pdf') {
      exportPdf(exportData);
    } else {
      exportExcel(exportData);
    }
  };

  // Custom tooltip untuk pie chart
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? (data.value / total) * 100 : 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-700">Nilai: {formatRupiah(data.value)}</p>
          <p className="text-sm text-gray-700">Persentase: {percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom label untuk pie chart
  const renderCustomizedLabel: PieLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    
    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }
    
    const RADIAN = Math.PI / 180;
    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > Number(cx) ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(Number(percent) * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Handle perubahan select bulan
  const handleBulanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBulan(e.target.value);
    setCurrentPage(1);
  };

  // Dapatkan icon berdasarkan metode pembayaran
  const getPaymentIcon = (method: string): React.ReactNode => {
    if (method.includes('Virtual Account')) return <Landmark className="h-5 w-5 text-blue-500" />;
    if (method.includes('E-Wallet')) return <Wallet className="h-5 w-5 text-green-500" />;
    if (method.includes('Tunai')) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    if (method.includes('Kartu Kredit')) return <CreditCard className="h-5 w-5 text-purple-500" />;
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  };

  if (loadingBulan) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Filter Bulan */}
          <div className="flex items-center">
            <label htmlFor="bulan" className="block text-sm font-medium text-black-700 mr-3">
              Pilih Bulan:
            </label>
            <select
              id="bulan"
              name="bulan"
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-black-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedBulan}
              onChange={handleBulanChange}
            >
              {daftarBulan.map((bulan) => (
                <option key={bulan.id} value={bulan.id}>
                  {bulan.nama_bulan}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Export PDF
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">Gagal memuat data: {error}</p>
            </div>
          </div>
        </div>
      ) : !data ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-700">
              <p className="font-medium">Data Tidak Tersedia</p>
              <p className="text-sm">Tidak ada data laporan penjualan yang dapat ditampilkan.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Laporan Penjualan</h1>
              <p className="text-gray-600">Periode: {formatTanggal(data.periode.start)} - {formatTanggal(data.periode.end)}</p>
            </div>
          </div>

          {/* Statistik Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Laba</h3>
              <p className={`text-2xl font-bold ${data.laba.total_laba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatRupiah(data.laba.total_laba)}
              </p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Pendapatan</h3>
              <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalPendapatan)}</p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Barang Terjual</h3>
              <p className="text-2xl font-bold text-orange-600">{totalBarangTerjual}</p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
          </div>

          {/* Baris kedua untuk statistik tambahan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Biaya Operasional</h3>
              <p className="text-2xl font-bold text-red-600">{formatRupiah(biayaOperasional.total)}</p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
          </div>

          {/* Detail Biaya Operasional */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Detail Biaya Operasional</h2>
              <p className="text-sm text-gray-600">Rincian biaya operasional periode ini</p>
            </div>
            <div className="overflow-x-auto">
              {loadingBiayaOperasional ? (
                <div className="flex justify-center items-center h-40">
                  <LoadingSpinner />
                </div>
              ) : biayaOperasional.rincian_biaya.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data biaya operasional</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {biayaOperasional.rincian_biaya.map((item, index) => (
                      <tr 
                        key={item._id || index} 
                        className={`transition-colors hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatRupiah(item.jumlah)}</div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">Total</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatRupiah(biayaOperasional.total)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Tabel Produk Terlaris */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Produk Terlaris</h2>
              <p className="text-sm text-gray-600">Berdasarkan total laba</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Jual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Beli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Laba/Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Terjual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Laba
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data produk
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`transition-colors hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.produk}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            {item.gambar_url ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={item.gambar_url} 
                                alt={item.produk}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                <img
                                  src="../../images/nostokbarang.jpg"
                                  alt="No Stock"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatRupiah(item.harga_jual)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatRupiah(item.harga_beli)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${item.labaPerItem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatRupiah(item.labaPerItem)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.jumlahTerjual}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${item.totalLaba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatRupiah(item.totalLaba)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {produkTerlaris.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, produkTerlaris.length)}</span> dari{' '}
                  <span className="font-semibold text-gray-900">{produkTerlaris.length}</span> produk
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                    }`}
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grafik Metode Pembayaran */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Metode Pembayaran</h2>
              <div className="space-y-4">
                {data.rekap_metode_pembayaran.map((item, index) => {
                  const maxTotal = Math.max(...data.rekap_metode_pembayaran.map(p => p.total));
                  const percentage = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          {getPaymentIcon(item.metode)}
                          <span className="text-sm font-medium text-gray-700 ml-2">{item.metode}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatRupiah(item.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Metode Pembayaran</h2>
  <div className="h-80 w-full">
    {pieData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >{pieData.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    )}
  </div>
</div>
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPenjualan;