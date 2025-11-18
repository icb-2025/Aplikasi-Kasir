// index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import OmzetCards from './components/OmzetCards';
import OmzetChart from './components/OmzetChart';
import OmzetTable from './components/OmzetTable';
// import OmzetSummary from './components/OmzetSummary';
import { exportOmzetToCsv, exportOmzetToExcel, exportOmzetToPdf } from '@/admin/utils/OmzetExport';
import { formatRupiah } from '@/admin/utils/formatRupiah';
import { portbe } from '../../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;

// Interface untuk produk dari API
interface ProdukApi {
  nama_produk: string;
  jumlah_terjual: number;
  hpp_per_porsi: number;
  hpp_total: number;
  pendapatan: number;
  laba_kotor: number;
  _id: string;
}

// Interface untuk response dari API
interface ApiResponse {
  success: boolean;
  data: {
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

// Interface untuk data omzet
interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
  // Tambahkan data detail untuk chart dan tabel
  detail_hari: {
    tanggal: string;
    omzet: number;
  }[];
  detail_minggu: {
    tanggal: string;
    omzet: number;
  }[];
  detail_bulan: {
    tanggal: string;
    omzet: number;
  }[];
}

const OmzetPage: React.FC = () => {
  const [omzetData, setOmzetData] = useState<OmzetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'hari' | 'minggu' | 'bulan'>('hari');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchOmzetData = useCallback(async (showNotification = false) => {
    try {
      setLoading(true);
      
      // Ambil data dari API
      const response = await fetch(`${ipbe}:${portbe}/api/admin/hpp-total`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Validasi data
      if (!data || !data.success || !data.data || data.data.length === 0) {
        throw new Error('Data tidak valid atau tidak lengkap');
      }
      
      // Proses data untuk omzet
      const processedData = processOmzetData(data.data);
      setOmzetData(processedData);
      
      if (showNotification) {
        setNotification({message: 'Data berhasil diperbarui', type: 'success'});
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data omzet';
      setError(errorMessage);
      
      if (showNotification) {
        setNotification({message: 'Gagal memperbarui data', type: 'error'});
        setTimeout(() => setNotification(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, []); // PERBAIKAN: Hapus selectedPeriod dari dependency array karena tidak digunakan dalam fungsi

  // Fungsi untuk memproses data dari API menjadi format omzet
  const processOmzetData = (data: ApiResponse['data']): OmzetData => {
    // Kelompokkan data berdasarkan tanggal
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    // Filter data untuk periode yang berbeda
    const todayData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      return itemDate.toDateString() === today.toDateString();
    });
    
    const weekData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      return itemDate >= weekAgo && itemDate <= today;
    });
    
    const monthData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      return itemDate >= monthAgo && itemDate <= today;
    });
    
    // Hitung total omzet untuk setiap periode
    const todayOmzet = todayData.reduce((sum, item) => sum + item.total_pendapatan, 0);
    const weekOmzet = weekData.reduce((sum, item) => sum + item.total_pendapatan, 0);
    const monthOmzet = monthData.reduce((sum, item) => sum + item.total_pendapatan, 0);
    
    // Buat detail data untuk chart
    const detailHari = weekData.map(item => ({
      tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      omzet: item.total_pendapatan
    }));
    
    const detailMinggu = weekData.map(item => ({
      tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      omzet: item.total_pendapatan
    }));
    
    const detailBulan = monthData.map(item => ({
      tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      omzet: item.total_pendapatan
    }));
    
    return {
      hari_ini: todayOmzet,
      minggu_ini: weekOmzet,
      bulan_ini: monthOmzet,
      detail_hari: detailHari,
      detail_minggu: detailMinggu,
      detail_bulan: detailBulan
    };
  };

  useEffect(() => {
    fetchOmzetData();
  }, [fetchOmzetData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Laporan Omzet</h1>
          <p className="text-gray-600">Analisis performa omzet toko</p>
        </div>
        <LoadingSpinner />
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
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Laporan Omzet</h1>
          <p className="text-gray-600">Analisis performa omzet toko</p>
        </div>
        <div className="flex space-x-2">        
          <div className="relative group">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button 
                onClick={() => exportOmzetToCsv(omzetData)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
              >
                Export CSV
              </button>
              <button 
                onClick={() => exportOmzetToExcel(omzetData)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
              >
                Export Excel
              </button>
              <button 
                onClick={() => exportOmzetToPdf(omzetData)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Statistik */}
      <OmzetCards 
        omzetData={omzetData} 
        formatRupiah={formatRupiah} 
      />

      {/* Grafik Omzet */}
      <OmzetChart 
        omzetData={omzetData} 
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        formatRupiah={formatRupiah}
      />

      {/* Tabel Detail Omzet */}
      <OmzetTable 
        omzetData={omzetData} 
        formatRupiah={formatRupiah} 
      />

      {/* Ringkasan */}
      {/* <OmzetSummary 
        omzetData={omzetData}
        formatRupiah={formatRupiah}
      /> */}
      
    </div>
  );
};

export default OmzetPage;