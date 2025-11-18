import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabel } from 'recharts';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { exportPdf, exportExcel } from './utils';
import { Landmark, Wallet, TrendingUp, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { portbe } from '../../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;

// Interfaces
interface ProdukApi {
  nama_produk: string;
  jumlah_terjual: number;
  hpp_per_porsi: number;
  hpp_total: number;
  pendapatan: number;
  laba_kotor: number;
  _id: string;
}

interface SummaryApi {
  total_hpp: number;
  total_pendapatan: number;
  total_laba_kotor: number;
  total_beban: number;
  total_laba_bersih: number;
}

interface ApiResponse {
  success: boolean;
  summary: SummaryApi;
  data?: {
    _id: string;
    tanggal: string;
    produk: ProdukApi[];
    total_hpp: number;
    total_pendapatan: number;
    total_laba_kotor: number;
    total_beban: number;
    laba_bersih: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
}

interface DaftarBulan {
  id: string;
  nama_bulan: string;
  bulan: number;
  tahun: number;
  createdAt: string;
}

interface ProdukTerlaris {
  produk: string;
  harga_jual: number;
  harga_beli: number;
  labaPerItem: number;
  jumlahTerjual: number;
  totalLaba: number;
  gambar_url?: string;
}

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

interface PieData {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface MetodePembayaran {
  metode: string;
  total: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PieData;
  }>;
}

const LaporanPenjualan: React.FC = () => {
  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [produkTerlarisHariIni, setProdukTerlarisHariIni] = useState<ProdukTerlaris[]>([]);
  const [totalPendapatan, setTotalPendapatan] = useState<number>(0);
  const [totalBarangTerjualHariIni, setTotalBarangTerjualHariIni] = useState<number>(0);
  const [totalLabaKotor, setTotalLabaKotor] = useState<number>(0);
  const [labaBersih, setLabaBersih] = useState<number>(0);
  const [totalHpp, setTotalHpp] = useState<number>(0);
  const [totalBebanPerhari, setTotalBebanPerhari] = useState<number>(0);
  const [totalBebanPerbulan, setTotalBebanPerbulan] = useState<number>(0);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [daftarBulan, setDaftarBulan] = useState<DaftarBulan[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [loadingBulan, setLoadingBulan] = useState<boolean>(true);
  const [biayaOperasional, setBiayaOperasional] = useState<BiayaOperasionalData>({
    rincian_biaya: [],
    total: 0,
  });
  const [loadingBiayaOperasional, setLoadingBiayaOperasional] = useState<boolean>(true);

  // Constants
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#EF4444', '#14B8A6', '#F97316'];

  // Fetch daftar bulan
  useEffect(() => {
    const fetchDaftarBulan = async () => {
      try {
        setLoadingBulan(true);
        const response = await fetch(`${ipbe}:${portbe}/api/admin/laporan/bulan`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        setDaftarBulan(result.daftar_bulan);
        
        if (result.daftar_bulan?.length > 0) {
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

  // Fetch data laporan
  const fetchData = useCallback(async () => {
    if (!selectedBulan) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${ipbe}:${portbe}/api/admin/hpp-total/summary?bulan=${selectedBulan}`);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result: ApiResponse = await response.json();
      
      if (!result?.success || !result?.summary) {
        throw new Error('Data tidak valid atau tidak lengkap');
      }
      
      setData(result);
      
      // Set data dari summary
      setTotalPendapatan(result.summary.total_pendapatan || 0);
      setTotalLabaKotor(result.summary.total_laba_kotor || 0);
      setLabaBersih(result.summary.total_laba_bersih || 0);
      setTotalHpp(result.summary.total_hpp || 0);
      
      // Proses data harian
      if (result.data && result.data.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayData = result.data.find(item => item.tanggal === today);
        
        // Set beban perhari
        setTotalBebanPerhari(todayData?.total_beban || result.data[result.data.length - 1].total_beban || 0);
        
        // Hitung total beban perbulan
        const totalBebanBulanan = result.data.reduce((sum, item) => sum + (item.total_beban || 0), 0);
        setTotalBebanPerbulan(totalBebanBulanan);
        
        // Proses produk hari ini
        if (todayData?.produk) {
          const produkHariIniData: ProdukTerlaris[] = todayData.produk.map(item => ({
            produk: item.nama_produk,
            harga_jual: item.pendapatan / item.jumlah_terjual,
            harga_beli: item.hpp_per_porsi,
            labaPerItem: item.laba_kotor / item.jumlah_terjual,
            jumlahTerjual: item.jumlah_terjual,
            totalLaba: item.laba_kotor
          }));
          
          produkHariIniData.sort((a, b) => b.totalLaba - a.totalLaba);
          setProdukTerlarisHariIni(produkHariIniData);
          
          const totalBarangHariIni = produkHariIniData.reduce((sum, item) => sum + item.jumlahTerjual, 0);
          setTotalBarangTerjualHariIni(totalBarangHariIni);
        } else {
          setProdukTerlarisHariIni([]);
          setTotalBarangTerjualHariIni(0);
        }
      } else {
        setProdukTerlarisHariIni([]);
        setTotalBarangTerjualHariIni(0);
        setTotalBebanPerhari(0);
        setTotalBebanPerbulan(0);
      }
      
      // Set data pie chart
      const pieDataArray = [
        { name: 'Tunai', value: result.summary.total_pendapatan * 0.4 },
        { name: 'E-Wallet', value: result.summary.total_pendapatan * 0.3 },
        { name: 'Virtual Account', value: result.summary.total_pendapatan * 0.2 },
        { name: 'Kartu Kredit', value: result.summary.total_pendapatan * 0.1 }
      ];
      
      setPieData(pieDataArray);
      
      // Set biaya operasional
      setBiayaOperasional({
        rincian_biaya: [
          { nama: 'Listrik', jumlah: totalBebanPerbulan * 0.3 },
          { nama: 'Air', jumlah: totalBebanPerbulan * 0.1 },
          { nama: 'Internet', jumlah: totalBebanPerbulan * 0.1 },
          { nama: 'Sewa Tempat', jumlah: totalBebanPerbulan * 0.3 },
          { nama: 'Gaji Karyawan', jumlah: totalBebanPerbulan * 0.2 }
        ],
        total: totalBebanPerbulan || 0
      });
      setLoadingBiayaOperasional(false);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  }, [selectedBulan, totalBebanPerbulan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = produkTerlarisHariIni.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(produkTerlarisHariIni.length / itemsPerPage);

  // Format Rupiah
  const formatRupiah = useCallback((amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Pagination functions
  const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);
  const nextPage = useCallback(() => setCurrentPage(prev => Math.min(prev + 1, totalPages)), [totalPages]);
  const prevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);

  // Export functions
  const handleExport = useCallback((type: 'pdf' | 'excel') => {
    if (!data) return;
    
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
    
    biayaOperasional.rincian_biaya?.forEach(item => {
      switch (item.nama.toLowerCase()) {
        case 'listrik': biayaOperasionalExport.listrik = item.jumlah || 0; break;
        case 'air': biayaOperasionalExport.air = item.jumlah || 0; break;
        case 'internet': biayaOperasionalExport.internet = item.jumlah || 0; break;
        case 'sewa tempat':
        case 'sewa': biayaOperasionalExport.sewa_tempat = item.jumlah || 0; break;
        case 'gaji karyawan':
        case 'gaji': biayaOperasionalExport.gaji_karyawan = item.jumlah || 0; break;
      }
    });
    
    // Konversi PieData ke MetodePembayaran
    const metodePembayaran: MetodePembayaran[] = pieData.map(item => ({
      metode: item.name,
      total: item.value
    }));
    
    const exportData = {
      periode: {
        start: data.data?.[0]?.tanggal || new Date().toISOString(),
        end: data.data?.[data.data.length - 1]?.tanggal || new Date().toISOString()
      },
      laba: {
        total_laba: totalLabaKotor,
        total_laba_kotor: totalLabaKotor,
        laba_bersih: labaBersih,
        detail: produkTerlarisHariIni.map(item => ({
          produk: item.produk,
          harga_jual: item.harga_jual,
          harga_beli: item.harga_beli,
          labaPerItem: item.labaPerItem,
          jumlahTerjual: item.jumlahTerjual,
          totalLaba: item.totalLaba
        }))
      },
      rekap_metode_pembayaran: metodePembayaran, // Perbaikan: gunakan metodePembayaran yang sudah dikonversi
      totalPendapatan: totalPendapatan,
      totalBarangTerjual: totalBarangTerjualHariIni,
      pengeluaran: totalBebanPerbulan,
      biaya_operasional: biayaOperasionalExport
    };
    
    if (type === 'pdf') {
      exportPdf(exportData);
    } else {
      exportExcel(exportData);
    }
  }, [data, biayaOperasional, totalLabaKotor, labaBersih, produkTerlarisHariIni, pieData, totalPendapatan, totalBarangTerjualHariIni, totalBebanPerbulan]);

  // Custom tooltip for pie chart
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload?.length) {
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

  // Custom label for pie chart
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

  // Handle bulan change
  const handleBulanChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBulan(e.target.value);
    setCurrentPage(1);
  }, []);

  // Get payment icon
  const getPaymentIcon = useCallback((method: string): React.ReactNode => {
    if (method.includes('Virtual Account')) return <Landmark className="h-5 w-5 text-blue-500" />;
    if (method.includes('E-Wallet')) return <Wallet className="h-5 w-5 text-green-500" />;
    if (method.includes('Tunai')) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    if (method.includes('Kartu Kredit')) return <CreditCard className="h-5 w-5 text-purple-500" />;
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  }, []);

  // Memoized values
  const selectedBulanName = useMemo(() => 
    daftarBulan.find(b => b.id === selectedBulan)?.nama_bulan || 'Semua Periode', 
    [daftarBulan, selectedBulan]
  );

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
          <h1 className="text-2xl font-semibold text-gray-800">Laporan Penjualan</h1>
          <p className="text-gray-600">Periode: {selectedBulanName}</p>
        </div>
        <div className="flex items-center space-x-4">
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
          {/* Statistik Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Laba Kotor</h3>
              <p className={`text-2xl font-bold ${totalLabaKotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatRupiah(totalLabaKotor)}
              </p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Pendapatan</h3>
              <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalPendapatan)}</p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Barang Terjual (Hari Ini)</h3>
              <p className="text-2xl font-bold text-orange-600">{totalBarangTerjualHariIni}</p>
              <p className="text-xs text-gray-500">hari ini</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Laba Bersih</h3>
              <p className={`text-2xl font-bold ${labaBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatRupiah(labaBersih)}
              </p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
          </div>

          {/* Baris kedua untuk statistik tambahan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total HPP</h3>
              <p className="text-2xl font-bold text-purple-600">{formatRupiah(totalHpp)}</p>
              <p className="text-xs text-gray-500">periode terpilih</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Beban (Hari Ini)</h3>
              <p className="text-2xl font-bold text-red-600">{formatRupiah(totalBebanPerhari)}</p>
              <p className="text-xs text-gray-500">hari ini</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Beban (Perbulan)</h3>
              <p className="text-2xl font-bold text-red-600">{formatRupiah(totalBebanPerbulan)}</p>
              <p className="text-xs text-gray-500">jumlah semua hari</p>
            </div>
          </div>

          {/* Detail Biaya Operasional */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Detail Biaya Operasional (Per Bulan)</h2>
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
              <h2 className="text-lg font-semibold text-gray-800">Produk Terlaris (Hari Ini)</h2>
              <p className="text-sm text-gray-600">Berdasarkan total laba hari ini</p>
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
                      Total Laba Kotor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data produk untuk hari ini
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
            {produkTerlarisHariIni.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, produkTerlarisHariIni.length)}</span> dari{' '}
                  <span className="font-semibold text-gray-900">{produkTerlarisHariIni.length}</span> produk
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
                {pieData.map((item, index) => {
                  const maxTotal = Math.max(...pieData.map(p => p.value));
                  const percentage = maxTotal > 0 ? (item.value / maxTotal) * 100 : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          {getPaymentIcon(item.name)}
                          <span className="text-sm font-medium text-gray-700 ml-2">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatRupiah(item.value)}</span>
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