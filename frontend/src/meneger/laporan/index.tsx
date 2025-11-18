// src/meneger/laporan/index.tsx
import { useState, useEffect } from 'react';
import MenegerLayout from "../layout";
import LoadingSpinner from "../../components/LoadingSpinner";
import SummaryCards from './components/SummaryCards';
import TransactionChart from './components/TransactionChart';
import TransactionTable from './components/TransactionTable';

interface ProdukItem {
  nama_produk: string;
  jumlah_terjual: number;
  hpp_per_porsi: number;
  hpp_total: number;
  pendapatan: number;
  laba_kotor: number;
  _id: string;
}

interface LaporanData {
  _id: string;
  tanggal: string;
  produk: ProdukItem[];
  total_hpp: number;
  total_pendapatan: number;
  total_laba_kotor: number;
  total_beban: number;
  laba_bersih: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: LaporanData[];
}

interface FilterOptions {
  produk: string;
  sortBy: 'nama_produk' | 'jumlah_terjual' | 'hpp_total' | 'pendapatan' | 'laba_kotor';
  sortOrder: 'asc' | 'desc';
}

const LaporanPage = () => {
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    produk: 'semua',
    sortBy: 'nama_produk',
    sortOrder: 'asc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://192.168.110.16:5000/api/admin/hpp-total');
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result: ApiResponse = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setData(result.data[0]);
        } else {
          throw new Error("Data format is incorrect or empty");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const products = data?.produk?.map(item => item.nama_produk) || [];
  const uniqueProducts = ['semua', ...new Set(products)];

  const tableData = (data?.produk?.map((produk) => {
    return {
      id: produk._id,
      nama_produk: produk.nama_produk,
      jumlah_terjual: produk.jumlah_terjual,
      hpp_per_porsi: produk.hpp_per_porsi,
      hpp_total: produk.hpp_total,
      pendapatan: produk.pendapatan,
      laba_kotor: produk.laba_kotor,
      tanggal: data?.tanggal || 'Tanggal tidak tersedia'
    };
  }) || [])
  .filter(item => 
    filterOptions.produk === 'semua' || 
    item.nama_produk === filterOptions.produk
  )
  .sort((a, b) => {
    const modifier = filterOptions.sortOrder === 'asc' ? 1 : -1;
    
    switch (filterOptions.sortBy) {
      case 'nama_produk':
        return a.nama_produk.localeCompare(b.nama_produk) * modifier;
      case 'jumlah_terjual':
        return (a.jumlah_terjual - b.jumlah_terjual) * modifier;
      case 'hpp_total':
        return (a.hpp_total - b.hpp_total) * modifier;
      case 'pendapatan':
        return (a.pendapatan - b.pendapatan) * modifier;
      case 'laba_kotor':
        return (a.laba_kotor - b.laba_kotor) * modifier;
      default:
        return 0;
    }
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <MenegerLayout>
        <LoadingSpinner />
      </MenegerLayout>
    );
  }

  if (error) {
    return (
      <MenegerLayout>
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </MenegerLayout>
    );
  }

  return (
    <MenegerLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Laporan HPP dan Laba</h1>
        
        <SummaryCards 
          totalLaba={data?.laba_bersih || 0}
          totalPendapatan={data?.total_pendapatan || 0}
          totalBeban={data?.total_beban || 0}
          totalLabaKotor={data?.total_laba_kotor || 0} // Tambahkan props ini
          periode={data?.tanggal || ''}
        />

        <TransactionChart 
          produk={data?.produk || []}
        />

        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filterOptions.produk}
                onChange={(e) => handleFilterChange('produk', e.target.value)}
              >
                <option value="semua">Semua Produk</option>
                {uniqueProducts.filter(p => p !== 'semua').map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filterOptions.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterOptions['sortBy'])}
              >
                <option value="nama_produk">Nama Produk</option>
                <option value="jumlah_terjual">Jumlah Terjual</option>
                <option value="hpp_total">HPP Total</option>
                <option value="pendapatan">Pendapatan</option>
                <option value="laba_kotor">Laba Kotor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filterOptions.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as FilterOptions['sortOrder'])}
              >
                <option value="asc">Naik (A-Z)</option>
                <option value="desc">Turun (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <TransactionTable tableData={tableData} />
      </div>
    </MenegerLayout>
  );
};

export default LaporanPage;