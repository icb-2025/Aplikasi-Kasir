import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Crown, Medal, Award, Star, TrendingUp, Package, DollarSign, BarChart3, PieChart } from 'lucide-react';
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

// Interface untuk response dari API /hpp-total/summary
interface ApiResponse {
  success: boolean;
  summary: {
    total_hpp: number;
    total_pendapatan: number;
    total_laba_kotor: number;
    total_beban: number;
    total_laba_bersih: number;
  };
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
  const [data, setData] = useState<ProdukApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [produkList, setProdukList] = useState<ProdukItem[]>([]); // State untuk produk list
  const [loadingProduk, setLoadingProduk] = useState<boolean>(true); // State untuk loading produk
  const [totalPenjualan, setTotalPenjualan] = useState<number>(0); // State untuk total penjualan
  const [totalPendapatan, setTotalPendapatan] = useState<number>(0); // State untuk total pendapatan dari API
  const [selectedProduct, setSelectedProduct] = useState<ProdukApi | null>(null); // State untuk produk yang dipilih

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // PERBAIKAN: Gunakan endpoint /summary
        const endpoint = `${ipbe}:${portbe}/api/admin/hpp-total/summary`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        
        // Validasi data
        if (!result || !result.success) {
          throw new Error('Data tidak valid atau tidak lengkap');
        }
        
        // PERBAIKAN: Ambil total pendapatan dari summary
        if (result.summary && result.summary.total_pendapatan) {
          setTotalPendapatan(result.summary.total_pendapatan);
        }
        
        // Jika ada data produk, ambil dari result.data
        if (result.data && result.data.length > 0) {
          // Ambil semua produk dari semua data
          const semuaProduk: ProdukApi[] = [];
          result.data.forEach(item => {
            if (item.produk && Array.isArray(item.produk)) {
              semuaProduk.push(...item.produk);
            }
          });
          
          // Urutkan produk berdasarkan pendapatan tertinggi
          const sortedProduk = [...semuaProduk].sort((a, b) => b.pendapatan - a.pendapatan);
          
          // PERBAIKAN: Ambil hanya 5 produk terlaris
          const top5Produk = sortedProduk.slice(0, 5);
          
          setData(top5Produk);
          
          // Set produk pertama sebagai produk yang dipilih
          if (top5Produk.length > 0) {
            setSelectedProduct(top5Produk[0]);
          }
          
          // Hitung total penjualan
          const total = top5Produk.reduce((sum, item) => sum + item.jumlah_terjual, 0);
          setTotalPenjualan(total);
        } else {
          // Jika tidak ada data produk, set ke array kosong
          setData([]);
          setTotalPenjualan(0);
        }
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

  // Format angka
  const formatAngka = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Format Rupiah
  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Fungsi untuk mendapatkan kategori produk
  const getProdukKategori = (namaBarang: string) => {
    const produk = produkList.find(p => p.nama_barang === namaBarang);
    return produk ? produk.kategori : 'Tidak diketahui';
  };

  // Fungsi untuk mendapatkan harga jual produk
  const getProdukHargaJual = (namaBarang: string) => {
    const produk = produkList.find(p => p.nama_barang === namaBarang);
    return produk ? produk.harga_jual : 0;
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
        <h1 className="text-2xl font-semibold text-gray-800">Top 5 Barang Terlaris</h1>
        <p className="text-gray-600">Analisis produk paling populer berdasarkan pendapatan</p>
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
          <h3 className="text-sm font-medium text-gray-500">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatRupiah(totalPendapatan)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Periode: saat ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Barang Terlaris - Diperluas ke kanan */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Ranking 5 Barang Terlaris</h2>
            <p className="text-sm text-gray-500">Berdasarkan pendapatan tertinggi</p>
          </div>
          <div className="p-6">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center">Tidak ada data barang untuk periode ini</p>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Kolom Kiri - Daftar Ranking */}
                <div className="lg:w-1/2">
                  <div className="space-y-4">
                    {data.map((barang, index) => {
                      const totalPendapatanProduk = data.reduce((sum, item) => sum + item.pendapatan, 0);
                      const percentage = totalPendapatanProduk > 0 ? (barang.pendapatan / totalPendapatanProduk) * 100 : 0;
                      const color = getProgressColor(index);
                      const gambarUrl = getProdukImage(barang.nama_produk);
                      const isSelected = selectedProduct?._id === barang._id;
                      
                      return (
                        <div 
                          key={barang.nama_produk} 
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedProduct(barang)}
                        >
                          <div className="mr-3">
                            {getRankingIcon(index)}
                          </div>
                          {gambarUrl ? (
                            <img 
                              src={gambarUrl} 
                              alt={barang.nama_produk}
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
                                {barang.nama_produk}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({formatAngka(barang.jumlah_terjual)} terjual)
                              </span>
                            </div>
                            <ProgressBar percentage={percentage} color={color} />
                          </div>
                          <div className="ml-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {formatRupiah(barang.pendapatan)}
                            </span>
                            <div className="text-xs text-gray-500">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Kolom Kanan - Detail Produk Terpilih */}
                <div className="lg:w-1/2">
                  {selectedProduct ? (
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-start mb-4">
                        {getProdukImage(selectedProduct.nama_produk) ? (
                          <img 
                            src={getProdukImage(selectedProduct.nama_produk) || ''} 
                            alt={selectedProduct.nama_produk}
                            className="h-16 w-16 rounded-lg object-cover mr-4"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                            <span className="text-xs text-gray-500">No Img</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.nama_produk}</h3>
                          <p className="text-sm text-gray-500">Kategori: {getProdukKategori(selectedProduct.nama_produk)}</p>
                          <div className="flex items-center mt-1">
                            {getRankingIcon(data.findIndex(p => p._id === selectedProduct._id))}
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Peringkat #{data.findIndex(p => p._id === selectedProduct._id) + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center text-blue-600 mb-1">
                            <Package className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Jumlah Terjual</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{formatAngka(selectedProduct.jumlah_terjual)} unit</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center text-purple-600 mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Harga Jual</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {formatRupiah(getProdukHargaJual(selectedProduct.nama_produk))}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center text-green-600 mb-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Pendapatan</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {formatRupiah(selectedProduct.pendapatan)}
                          </p>
                        </div>
                        <div className={`bg-white p-3 rounded-lg shadow-sm ${
                          selectedProduct.laba_kotor >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                        }`}>
                          <div className={`flex items-center mb-1 ${
                            selectedProduct.laba_kotor >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <BarChart3 className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Laba Kotor</span>
                          </div>
                          <p className={`text-lg font-bold ${
                            selectedProduct.laba_kotor >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatRupiah(selectedProduct.laba_kotor)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Analisis HPP</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">HPP per Porsi</span>
                            <span className="font-medium">{formatRupiah(selectedProduct.hpp_per_porsi)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total HPP</span>
                            <span className="font-medium">{formatRupiah(selectedProduct.hpp_total)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Margin</span>
                            <span className={`font-medium ${
                              selectedProduct.laba_kotor >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {selectedProduct.pendapatan > 0 
                                ? `${((selectedProduct.laba_kotor / selectedProduct.pendapatan) * 100).toFixed(1)}%` 
                                : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Pilih produk untuk melihat detail analisis</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Detail */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Detail 5 Barang Terlaris</h2>
          <p className="text-sm text-gray-500">Berdasarkan pendapatan tertinggi</p>
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
                  Pendapatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laba Kotor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((barang, index) => {                 
                const gambarUrl = getProdukImage(barang.nama_produk);
                
                return (
                  <tr 
                    key={barang.nama_produk} 
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
                            alt={barang.nama_produk}
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
                        {barang.nama_produk}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAngka(barang.jumlah_terjual)} unit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatRupiah(barang.pendapatan)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${barang.laba_kotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatRupiah(barang.laba_kotor)}
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