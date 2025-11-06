import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layout";
import { getSocket } from "../../utils/socket";
import { Landmark, Wallet, TrendingUp, CreditCard } from "lucide-react";
import { portbe } from "../../../../backend/ngrokbackend";
const ipbe = import.meta.env.VITE_IPBE;

interface BarangDibeli {
  kode_barang?: string;
  nama_barang?: string;
  jumlah?: number;
  harga_satuan?: number;
  harga_beli?: number;
  subtotal?: number;
  _id?: string;
}

interface PesananItem {
  _id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[];
  total_harga: number;
  metode_pembayaran: string;
  status: string;
  kasir_id: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface LocationState {
  transaksiTerbaru?: PesananItem;
  message?: string;
}

interface StatusUpdateData {
  _id: string;
  status: string;
  updatedAt: string;
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

const PesananKasirPage = () => {
  const [pesananList, setPesananList] = useState<PesananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kasirId, setKasirId] = useState<string | null>(null);
  const [loadingKasir, setLoadingKasir] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // State untuk produk list
  const [produkList, setProdukList] = useState<ProdukItem[]>([]);
  const [loadingProduk, setLoadingProduk] = useState(true);

  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Fetch kasir ID dari localStorage atau API
  useEffect(() => {
    const fetchKasirId = async () => {
      try {
        // Coba ambil dari localStorage terlebih dahulu
        const storedKasirId = localStorage.getItem('kasirId');
        
        if (storedKasirId) {
          setKasirId(storedKasirId);
        } else {
          // Jika tidak ada di localStorage, ambil dari API
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
          }
          
          // Gunakan endpoint /api/admin/users sebagai alternatif
          const usersUrl = `${ipbe}:${portbe}/api/admin/users`;
          console.debug("Fetching kasir user info", { url: usersUrl, tokenPresent: !!token });

          const res = await fetch(usersUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-api-key': 'yq7JHtwJ1J!FLJovMv9P/RPShQVzgHgd8y7'
            }
          });
          
          if (res.ok) {
            const usersData = await res.json();
            
            // Cari user yang sedang login
            if (Array.isArray(usersData) && usersData.length > 0) {
              // Ambil user pertama sebagai contoh
              const currentUser = usersData[0];
              
              if (currentUser && currentUser._id) {
                setKasirId(currentUser._id);
                localStorage.setItem('kasirId', currentUser._id);
              } else {
                throw new Error('Data user tidak valid');
              }
            } else {
              throw new Error('Tidak ada data user yang ditemukan');
            }
          } else {
            throw new Error('Gagal mengambil data user dari server');
          }
        }
      } catch (err) {
        console.error("Gagal ambil data kasir:", err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data kasir');
      } finally {
        setLoadingKasir(false);
      }
    };

    fetchKasirId();
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

  // Fetch data pesanan berdasarkan kasir ID dengan pagination
  const fetchPesanan = useCallback(async () => {
    if (!kasirId) return;
    
    try {
      setLoading(true);
      // Menggunakan kasir_id untuk filter — sertakan Bearer token dan x-api-key sesuai backend teman
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      // Hitung offset berdasarkan halaman saat ini
      const offset = (currentPage - 1) * itemsPerPage;
      // Tambahkan parameter sort untuk mengurutkan dari yang terbaru
      const url = `${ipbe}:${portbe}/api/transaksi?kasir_id=${kasirId}&limit=${itemsPerPage}&offset=${offset}&sort=-tanggal_transaksi`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'x-api-key': 'yq7JHtwJ1J!FLJovMv9P/RPShQVzgHgd8y7'
      };

      console.debug('Fetching transaksi', { url, headers: { Authorization: !!token, 'x-api-key': !!headers['x-api-key'] } });

      try {
        const res = await fetch(url, { headers });

        if (res.ok) {
          const data = await res.json();
          // Pastikan data adalah array
          const dataArray: PesananItem[] = Array.isArray(data) ? data : (data.data || []);
          
          // Sorting tambahan di frontend untuk memastikan urutan yang benar
          dataArray.sort((a: PesananItem, b: PesananItem) => {
            const dateA = new Date(a.tanggal_transaksi).getTime();
            const dateB = new Date(b.tanggal_transaksi).getTime();
            return dateB - dateA; // Urutkan dari yang terbaru ke terlama
          });
          
          setPesananList(dataArray);
          
          // Jika API mengembalikan informasi total items, gunakan itu
          if (data.total) {
            setTotalItems(data.total);
          } else {
            // Jika tidak ada total items, kita tetap gunakan panjang array saat ini
            setTotalItems(dataArray.length);
          }
        } else {
          // If server responded with a non-2xx status, try to read body for more detail
          let body = null;
          try { body = await res.text(); } catch { /* ignore */ }
          throw new Error(`Gagal mengambil data pesanan: ${res.status} ${res.statusText} ${body ? '- ' + body : ''}`);
        }
      } catch (fetchErr) {
        // Re-throw to be handled by outer catch, but attach more info for debugging
        console.error('Fetch transaksi failed detailed:', fetchErr);
        throw fetchErr;
      }
    } catch (err) {
      console.error("Gagal ambil pesanan:", err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  }, [kasirId, currentPage, itemsPerPage]);

  useEffect(() => {
    if (kasirId) {
      fetchPesanan();
      
      const socket = getSocket();

      const handleStatusUpdated = (data: StatusUpdateData) => {
        setPesananList(prev =>
          prev.map(p =>
            p._id === data._id ? { ...p, status: data.status, updatedAt: data.updatedAt } : p
          )
        );
      };

      const handleNewTransaction = (data: PesananItem) => {
        // Hanya tambahkan jika transaksi ini milik kasir yang sedang login
        if (data.kasir_id === kasirId) {
          setPesananList(prev => {
            // Cek apakah transaksi sudah ada di list
            const exists = prev.some(item => item._id === data._id);
            
            if (exists) {
              // Jika sudah ada, update data transaksi tersebut
              return prev.map(item => 
                item._id === data._id ? { ...item, ...data } : item
              );
            } else {
              // Jika belum ada, tambahkan di paling atas
              return [data, ...prev];
            }
          });
        }
      };

      socket.on("statusUpdated", handleStatusUpdated);
      socket.on("newTransaction", handleNewTransaction);

      return () => {
        socket.off("statusUpdated", handleStatusUpdated);
        socket.off("newTransaction", handleNewTransaction);
      };
    }
  }, [kasirId, fetchPesanan]);

  // Tambah transaksi baru via navigate state
  useEffect(() => {
    if (locationState?.transaksiTerbaru && kasirId) {
      // Hanya tambahkan jika transaksi ini milik kasir yang sedang login
      if (locationState.transaksiTerbaru.kasir_id === kasirId) {
        setPesananList(prev => {
          // Cek apakah transaksi sudah ada di list
          const exists = prev.some(p => p._id === locationState.transaksiTerbaru?._id);
          
          if (exists) {
            // Jika sudah ada, update data transaksi tersebut
            return prev.map(item => 
              item._id === locationState.transaksiTerbaru?._id 
                ? { ...item, ...locationState.transaksiTerbaru! } 
                : item
            );
          } else {
            // Jika belum ada, tambahkan di paling atas
            return [locationState.transaksiTerbaru!, ...prev];
          }
        });
      }
    }
  }, [locationState, kasirId]);

  // Reset ke halaman pertama ketika ada perubahan filter
  useEffect(() => {
    setCurrentPage(1);
  }, [kasirId]);

  // Pagination handlers
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatTanggal = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk mendapatkan ikon metode pembayaran
  const getPaymentIcon = (method: string) => {
    if (method.includes('Virtual Account')) return <Landmark className="h-5 w-5 text-blue-500" />;
    if (method.includes('E-Wallet')) return <Wallet className="h-5 w-5 text-green-500" />;
    if (method.includes('Tunai')) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    if (method.includes('Kartu Kredit')) return <CreditCard className="h-5 w-5 text-purple-500" />;
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  };

  // Fungsi untuk mendapatkan gambar produk
  const getProdukImage = (kodeBarang?: string) => {
    if (!kodeBarang) return null;
    const produk = produkList.find(p => p.kode_barang === kodeBarang);
    return produk ? produk.gambar_url : null;
  };

  if (loadingKasir || loadingProduk) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!kasirId) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">Tidak dapat mengidentifikasi kasir. Silakan login kembali.</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Hitung total halaman
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Pesanan Kasir</h1>
          <div className="text-sm text-gray-600">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pesanan
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : pesananList.length === 0 ? (
          <div className="bg-white shadow p-6 rounded-lg border text-center">
            <p className="text-gray-500">Belum ada pesanan untuk kasir ini</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {pesananList.map(pesanan => (
                <div key={pesanan._id} className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">#{pesanan.nomor_transaksi}</h2>
                        <p className="text-sm text-gray-500 mt-1">{formatTanggal(pesanan.tanggal_transaksi)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          pesanan.status
                        )}`}
                      >
                        {pesanan.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Metode Pembayaran</p>
                        <div className="flex items-center mt-1">
                          {getPaymentIcon(pesanan.metode_pembayaran)}
                          <p className="font-medium text-gray-800 ml-2">{pesanan.metode_pembayaran}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Kasir ID</p>
                        <p className="font-medium text-gray-800 mt-1">{pesanan.kasir_id}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-xs text-orange-500 uppercase tracking-wide">Total Harga</p>
                        <p className="font-bold text-lg text-orange-700 mt-1">{formatCurrency(pesanan.total_harga)}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-medium text-gray-700 mb-3">Barang Dibeli</h3>
                      <div className="space-y-3">
                        {pesanan.barang_dibeli.map((barang, index) => {
                          const gambarUrl = getProdukImage(barang.kode_barang);
                          return (
                            <div key={barang._id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
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
                                <div>
                                  <span className="font-medium text-gray-800">{barang.nama_barang}</span>
                                  <span className="text-gray-500 text-sm ml-2">({barang.kode_barang})</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">{barang.jumlah} x {formatCurrency(barang.harga_satuan || 0)}</div>
                                <div className="font-medium text-gray-800">{formatCurrency(barang.subtotal || 0)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {pesanan.updatedAt && (
                      <div className="mt-4 text-xs text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Terakhir diperbarui: {formatTanggal(pesanan.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Sebelumnya
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentPage === page
                              ? "bg-orange-500 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Selanjutnya
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PesananKasirPage;