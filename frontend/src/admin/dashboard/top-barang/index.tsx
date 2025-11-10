import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Crown, Medal, Award, Star } from 'lucide-react'; // Hapus Trophy dari import
import { portbe } from '../../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;
interface BarangTerlaris {
  nama_barang: string;
  jumlah: number;
}

interface ApiResponse {
  barang_terlaris: BarangTerlaris[];
}

// Tambahkan interface untuk produk item
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

const TopBarang: React.FC = () => {
  const [data, setData] = useState<BarangTerlaris[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [produkList, setProdukList] = useState<ProdukItem[]>([]); // State untuk produk list
  const [loadingProduk, setLoadingProduk] = useState<boolean>(true); // State untuk loading produk

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = `${ipbe}:${portbe}/api/admin/dashboard/top-barang`;
        
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
  }, []);

  // Fetch data produk untuk mendapatkan gambar
  useEffect(() => {
    const fetchProdukList = async () => {
      try {
        setLoadingProduk(true);
        const response = await fetch(`${ipbe}:${portbe}/api/admin/stok-barang`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ProdukItem[] = await response.json();
        setProdukList(result);
      } catch (err) {
        console.error('Error fetching produk list:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data produk');
      } finally {
        setLoadingProduk(false);
      }
    };

    fetchProdukList();
  }, []);

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

  // Fungsi untuk mendapatkan ikon peringkat
  const getRankingIcon = (index: number) => {
    switch(index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  // Fungsi untuk mendapatkan gambar produk
  const getProdukImage = (namaBarang: string) => {
    const produk = produkList.find(p => p.nama_barang === namaBarang);
    return produk ? produk.gambar_url : null;
  };

  if (loading || loadingProduk) {
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

      {/* Statistik Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Barang Terjual</h3>
          <p className="text-2xl font-bold text-blue-600">{formatAngka(totalPenjualan)}</p>
          <p className="text-xs text-gray-500 mt-1">Periode: saat ini</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Jenis Barang</h3>
          <p className="text-2xl font-bold text-green-600">{data.length}</p>
          <p className="text-xs text-gray-500 mt-1">Periode: saat ini</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Rata-rata per Barang</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatAngka(totalPenjualan > 0 ? Math.round(totalPenjualan / data.length) : 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Periode: saat ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Barang Terlaris */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Ranking Barang Terlaris</h2>
            <p className="text-sm text-gray-500">Periode: saat ini</p>
          </div>
          <div className="p-6">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center">Tidak ada data barang untuk periode ini</p>
            ) : (
              <div className="space-y-4">
                {data.map((barang, index) => {
                  const percentage = totalPenjualan > 0 ? (barang.jumlah / totalPenjualan) * 100 : 0;
                  const color = getProgressColor(index);
                  const gambarUrl = getProdukImage(barang.nama_barang);
                  
                  return (
                    <div key={barang.nama_barang} className="flex items-center">
                      <div className="mr-3">
                        {getRankingIcon(index)}
                      </div>
                      {gambarUrl ? (
                        <img 
                          src={gambarUrl} 
                          alt={barang.nama_barang}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-xs text-gray-500">No Img</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {barang.nama_barang}
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
            <p className="text-sm text-gray-500">Periode: saat ini</p>
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
                    <div key={barang.nama_barang} className="flex items-center">
                      <div className="mr-3">
                        {getRankingIcon(index)}
                      </div>
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-800">Detail Barang Terlaris</h2>
    <p className="text-sm text-gray-500">Periode: saat ini</p>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Peringkat
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Gambar
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nama Barang
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Jumlah Terjual
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Trend
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((barang, index) => {
          const percentage = totalPenjualan > 0 ? (barang.jumlah / totalPenjualan) * 100 : 0;
          const color = getProgressColor(index);
          const gambarUrl = getProdukImage(barang.nama_barang);
          
          return (
            <tr 
              key={barang.nama_barang} 
              className={`transition-colors hover:bg-gray-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  {getRankingIcon(index)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  {gambarUrl ? (
                    <img 
                      src={gambarUrl} 
                      alt={barang.nama_barang}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Img</span>
                    </div>
                  )}
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
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
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
    </div>
  );
};

export default TopBarang;