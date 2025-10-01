// src/admin/dashboard/top-barang/index.tsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner'; // Adjust path as needed

interface BarangTerlaris {
  nama_barang: string;
  jumlah: number;
}

interface ApiResponse {
  barang_terlaris: BarangTerlaris[];
}

type FilterType = 'hari ini' | 'bulan ini' | 'tahun ini';

const TopBarang: React.FC = () => {
  const [data, setData] = useState<BarangTerlaris[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('bulan ini');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Menentukan endpoint berdasarkan filter aktif
        let endpoint = 'http://192.168.110.16:5000/api/admin/dashboard/top-barang';
        
        if (activeFilter === 'hari ini') {
          endpoint += '?filter=hari';
        } else if (activeFilter === 'bulan ini') {
          endpoint += '?filter=bulan';
        } else if (activeFilter === 'tahun ini') {
          endpoint += '?filter=tahun';
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        setData(result.barang_terlaris);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  // Hitung total penjualan
  const totalPenjualan = data.reduce((total, barang) => total + barang.jumlah, 0);

  // Format angka
  const formatAngka = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Komponen Progress Bar
  const ProgressBar: React.FC<{ percentage: number; color: string }> = ({ percentage, color }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  // Warna untuk progress bar
  const getProgressColor = (index: number): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-teal-500', 'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  // Fungsi untuk menangani perubahan filter
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Top Barang Terlaris</h1>
        <p className="text-gray-600">Analisis produk paling populer berdasarkan penjualan</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleFilterChange('hari ini')}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'hari ini'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Hari Ini
        </button>
        <button
          onClick={() => handleFilterChange('bulan ini')}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'bulan ini'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bulan Ini
        </button>
        <button
          onClick={() => handleFilterChange('tahun ini')}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'tahun ini'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tahun Ini
        </button>
      </div>

      {/* Statistik Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Barang Terjual</h3>
          <p className="text-2xl font-bold text-blue-600">{formatAngka(totalPenjualan)}</p>
          <p className="text-xs text-gray-500 mt-1">Periode: {activeFilter}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Jenis Barang</h3>
          <p className="text-2xl font-bold text-green-600">{data.length}</p>
          <p className="text-xs text-gray-500 mt-1">Periode: {activeFilter}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Rata-rata per Barang</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatAngka(totalPenjualan > 0 ? Math.round(totalPenjualan / data.length) : 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Periode: {activeFilter}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Barang Terlaris */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Ranking Barang Terlaris</h2>
            <p className="text-sm text-gray-500">Periode: {activeFilter}</p>
          </div>
          <div className="p-6">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center">Tidak ada data barang untuk periode ini</p>
            ) : (
              <div className="space-y-4">
                {data.map((barang, index) => {
                  const percentage = totalPenjualan > 0 ? (barang.jumlah / totalPenjualan) * 100 : 0;
                  const color = getProgressColor(index);
                  
                  return (
                    <div key={barang.nama_barang} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {index + 1}. {barang.nama_barang}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({formatAngka(barang.jumlah)} terjual)
                          </span>
                        </div>
                        <ProgressBar percentage={percentage} color={color} />
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chart Visualisasi */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Distribusi Penjualan</h2>
            <p className="text-sm text-gray-500">Periode: {activeFilter}</p>
          </div>
          <div className="p-6">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center">Tidak ada data untuk ditampilkan pada periode ini</p>
            ) : (
              <div className="space-y-3">
                {data.map((barang, index) => {
                  const percentage = totalPenjualan > 0 ? (barang.jumlah / totalPenjualan) * 100 : 0;
                  const color = getProgressColor(index);
                  
                  return (
                    <div key={barang.nama_barang} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 w-32 truncate">
                        {barang.nama_barang}
                      </span>
                      <div className="flex-1 mx-2">
                        <div className="flex items-center">
                          <div 
                            className={`h-4 ${color} rounded-l`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div 
                            className="h-4 bg-gray-200 rounded-r"
                            style={{ width: `${100 - percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-16 text-right">
                        {formatAngka(barang.jumlah)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Detail */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Detail Barang Terlaris</h2>
          <p className="text-sm text-gray-500">Periode: {activeFilter}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peringkat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Terjual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persentase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((barang, index) => {
                const percentage = totalPenjualan > 0 ? (barang.jumlah / totalPenjualan) * 100 : 0;
                const color = getProgressColor(index);
                
                return (
                  <tr key={barang.nama_barang} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${color} text-white font-bold`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {barang.nama_barang}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAngka(barang.jumlah)} unit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {percentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-16 h-2 bg-gray-200 rounded-full mr-2`}>
                          <div 
                            className={`h-2 rounded-full ${color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Analisis Penjualan</h3>
        <p className="text-sm text-blue-700">
          Total {formatAngka(totalPenjualan)} barang terjual dari {data.length} jenis produk pada periode {activeFilter}. 
          Barang teratas "{data[0]?.nama_barang}" menyumbang {totalPenjualan > 0 ? ((data[0]?.jumlah / totalPenjualan) * 100).toFixed(1) : 0}% dari total penjualan.
        </p>
      </div>
    </div>
  );
};

export default TopBarang;