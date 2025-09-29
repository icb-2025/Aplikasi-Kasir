// src/meneger/laporan/index.tsx
import { useState, useEffect } from 'react';
import MenegerLayout from "../layout";
import LoadingSpinner from "../../components/LoadingSpinner";
import SummaryCards from './components/SummaryCards';
import TransactionChart from './components/TransactionChart';
import TransactionTable from './components/TransactionTable';
import { formatMethodName } from './components/utils';

// Define types for our data
interface HarianItem {
  _id: string;
  tanggal?: string;
  total_penjualan?: number;
  jumlah_transaksi?: number;
}

interface LaporanData {
  _id: string;
  laporan_penjualan: {
    harian: HarianItem[];
    mingguan: unknown[];
    bulanan: unknown[];
  };
  periode: {
    start: string;
    end: string;
  };
  laba: {
    total_laba: number;
    detail: Array<{
      laba: number;
      _id: string;
    }>;
  };
  rekap_metode_pembayaran: Array<{
    metode: string;
    total: number;
    _id: string;
  }>;
  pengeluaran: unknown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Filter options
interface FilterOptions {
  metodePembayaran: string;
  sortBy: 'metode' | 'total' | 'laba' | 'tanggal';
  sortOrder: 'asc' | 'desc';
}

const LaporanPage = () => {
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    metodePembayaran: 'semua',
    sortBy: 'metode',
    sortOrder: 'asc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.110.16:5000/api/manager/laporan");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
          setData(result[0]);
        } else {
          throw new Error("Data format is incorrect");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique payment methods for filter
  const paymentMethods = data?.rekap_metode_pembayaran?.map(item => item.metode) || [];
  const uniquePaymentMethods = ['semua', ...new Set(paymentMethods)];

  // Data untuk tabel dengan filter dan sorting
  const tableData = (data?.rekap_metode_pembayaran?.map((payment, index) => {
    const correspondingProfit = data?.laba?.detail?.[index];
    return {
      id: payment._id,
      metode: payment.metode,
      total: payment.total,
      laba: correspondingProfit?.laba || 0,
      tanggal: data?.createdAt ? new Date(data.createdAt).toLocaleDateString('id-ID') : 'Tanggal tidak tersedia'
    };
  }) || [])
  .filter(item => 
    filterOptions.metodePembayaran === 'semua' || 
    item.metode === filterOptions.metodePembayaran
  )
  .sort((a, b) => {
    const modifier = filterOptions.sortOrder === 'asc' ? 1 : -1;
    
    switch (filterOptions.sortBy) {
      case 'metode':
        return a.metode.localeCompare(b.metode) * modifier;
      case 'total':
        return (a.total - b.total) * modifier;
      case 'laba':
        return (a.laba - b.laba) * modifier;
      case 'tanggal':
        return modifier; // Since all dates are the same in this data structure
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Laporan Penjualan</h1>
        
        {/* Summary Cards */}
        <SummaryCards 
          totalLaba={data?.laba?.total_laba || 0}
          totalTransaksi={data?.rekap_metode_pembayaran?.reduce((acc, item) => acc + (item.total > 0 ? 1 : 0), 0) || 0}
          periodeStart={data?.periode?.start}
          periodeEnd={data?.periode?.end}
        />

        {/* Chart Section */}
        <TransactionChart 
          rekapMetodePembayaran={data?.rekap_metode_pembayaran || []}
          labaDetail={data?.laba?.detail || []}
        />

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filterOptions.metodePembayaran}
                onChange={(e) => handleFilterChange('metodePembayaran', e.target.value)}
              >
                <option value="semua">Semua Metode</option>
                {uniquePaymentMethods.filter(m => m !== 'semua').map((method) => (
                  <option key={method} value={method}>
                    {formatMethodName(method)}
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
                <option value="metode">Metode Pembayaran</option>
                <option value="total">Total Penjualan</option>
                <option value="laba">Laba</option>
                <option value="tanggal">Tanggal</option>
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

        {/* Table Section */}
        <TransactionTable tableData={tableData} />
      </div>
    </MenegerLayout>
  );
};

export default LaporanPage;