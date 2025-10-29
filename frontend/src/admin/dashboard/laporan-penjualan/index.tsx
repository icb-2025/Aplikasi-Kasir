import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabel } from 'recharts';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { exportPdf, exportExcel } from './utils';
import { Landmark, Wallet, TrendingUp, CreditCard } from 'lucide-react';
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
  _id: string;
}

interface MetodePembayaran {
  metode: string;
  total: number;
  _id: string;
}

// Interface untuk biaya operasional
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
  biaya_operasional_id: BiayaOperasional;
  pengeluaran: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
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

// Interface untuk data pie chart yang sesuai dengan Recharts
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

// Interface untuk produk item
interface ProdukItem {
  _id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  stok_minimal: number;
  gambar_url: string;
  status: string;
  hargaFinal?: number;
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

  // State untuk produk list
  const [produkList, setProdukList] = useState<ProdukItem[]>([]);

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

  // Fetch data produk untuk mendapatkan gambar
  useEffect(() => {
    const fetchProdukList = async () => {
      try {
        const response = await fetch(`${ipbe}:${portbe}/api/admin/stok-barang`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ProdukItem[] = await response.json();
        setProdukList(result);
      } catch (err) {
        console.error('Error fetching produk list:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data produk');
      }
    };

    fetchProdukList();
  }, []);

  // Fetch data laporan berdasarkan bulan yang dipilih
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBulan) return; // Jangan fetch jika belum ada bulan yang dipilih
      
      try {
        setLoading(true);
        const response = await fetch(`${ipbe}:${portbe}/api/admin/laporan/${selectedBulan}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        
        // Log data untuk debugging
        console.log('Data dari API:', result);
        
        // Validasi data sebelum digunakan
        if (!result || !result.laba || !result.laba.detail) {
          throw new Error('Data tidak valid atau tidak lengkap');
        }
        
        setData(result);
        
        // Hitung total pendapatan (total harga jual)
        const pendapatan = result.laba.detail.reduce((sum, item) => sum + item.harga_jual, 0);
        setTotalPendapatan(pendapatan);
        
        // Hitung total barang terjual
        setTotalBarangTerjual(result.laba.detail.length);
        
        // Kelompokkan data produk terlaris
        const produkMap = new Map<string, ProdukTerlaris>();
        
        result.laba.detail.forEach(item => {
          if (produkMap.has(item.produk)) {
            const produk = produkMap.get(item.produk)!;
            produk.jumlahTerjual += 1;
            produk.totalLaba += item.laba;
          } else {
            // Cari produk di produkList untuk mendapatkan gambar
            const produkInfo = produkList.find(p => p.nama_barang === item.produk);
            produkMap.set(item.produk, {
              produk: item.produk,
              harga_jual: item.harga_jual,
              harga_beli: item.harga_beli,
              labaPerItem: item.laba,
              jumlahTerjual: 1,
              totalLaba: item.laba,
              gambar_url: produkInfo ? produkInfo.gambar_url : '' // Tambahkan gambar
            });
          }
        });
        
        // Konversi Map ke array dan urutkan berdasarkan total laba
        const produkArray = Array.from(produkMap.values());
        produkArray.sort((a, b) => b.totalLaba - a.totalLaba);
        
        setProdukTerlaris(produkArray);
        
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
  }, [selectedBulan, produkList]); // Tambahkan produkList sebagai dependency

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

  // Fungsi untuk mengekspor data
  const handleExport = (type: 'pdf' | 'excel') => {
    if (!data) return;
    
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
      biaya_operasional: data.biaya_operasional_id
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
    setCurrentPage(1); // Reset pagination ke halaman 1
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
      ) : !data.laba || !data.laba.detail ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-700">
              <p className="font-medium">Data Laba Tidak Lengkap</p>
              <p className="text-sm">Data laba atau detail laba tidak tersedia.</p>
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
              <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
              <p className="text-2xl font-bold text-purple-600">{data.laba.detail.length}</p>
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
              <p className="text-2xl font-bold text-red-600">{formatRupiah(data.biaya_operasional_id.total)}</p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Laba Kotor</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatRupiah(totalPendapatan - data.laba.detail.reduce((sum, item) => sum + item.harga_beli, 0))}
              </p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Rata-rata Laba per Transaksi</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {data.laba.detail.length > 0 ? formatRupiah(data.laba.total_laba / data.laba.detail.length) : formatRupiah(0)}
              </p>
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
        <tr className="transition-colors hover:bg-gray-50 bg-white">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">Listrik</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{formatRupiah(data.biaya_operasional_id.listrik)}</div>
          </td>
        </tr>
        <tr className="transition-colors hover:bg-gray-50 bg-amber-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">Air</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{formatRupiah(data.biaya_operasional_id.air)}</div>
          </td>
        </tr>
        <tr className="transition-colors hover:bg-gray-50 bg-white">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">Internet</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{formatRupiah(data.biaya_operasional_id.internet)}</div>
          </td>
        </tr>
        <tr className="transition-colors hover:bg-gray-50 bg-amber-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">Sewa Tempat</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{formatRupiah(data.biaya_operasional_id.sewa_tempat)}</div>
          </td>
        </tr>
        <tr className="transition-colors hover:bg-gray-50 bg-white">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">Gaji Karyawan</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{formatRupiah(data.biaya_operasional_id.gaji_karyawan)}</div>
          </td>
        </tr>
        <tr className="bg-gray-100 border-t-2 border-gray-300">
  <td className="px-6 py-4 whitespace-nowrap">
    <div className="text-sm font-bold text-gray-900">Total</div>
  </td>
  <td className="px-6 py-4 whitespace-nowrap">
    <div className="text-sm font-bold text-gray-900">{formatRupiah(data.biaya_operasional_id.total)}</div>
  </td>
</tr>
      </tbody>
    </table>
  </div>
</div>

          {/* Tabel Produk Terlaris */}
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
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Img</span>
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
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Sebelumnya
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Selanjutnya
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> hingga{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, produkTerlaris.length)}
            </span>{' '}
            dari <span className="font-medium">{produkTerlaris.length}</span> hasil
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Sebelumnya</span>
              &larr;
            </button>
            
            {/* Page numbers */}
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
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNum
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Selanjutnya</span>
              &rarr;
            </button>
          </nav>
        </div>
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Analisis Performa</h3>
            <p className="text-sm text-blue-700">
              Total {data.laba.detail.length} transaksi dengan pendapatan {formatRupiah(totalPendapatan)} 
              dan laba {formatRupiah(data.laba.total_laba)} dalam periode {formatTanggal(data.periode.start)} 
              hingga {formatTanggal(data.periode.end)}. Biaya operasional sebesar {formatRupiah(data.biaya_operasional_id.total)} 
              telah diperhitungkan dalam perhitungan laba bersih.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPenjualan;