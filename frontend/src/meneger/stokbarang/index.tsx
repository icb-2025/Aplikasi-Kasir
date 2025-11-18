import type { Barang } from "../../admin/stok-barang";
import MenegerLayout from "../layout";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import StokFilter from "./StokFilter";
import StokSummary from "./StokSummary";
import StokCard from "./StokCard";
import DetailModal from "./DetailModal";
import io, { Socket } from 'socket.io-client';
import { portbe } from "../../../../backend/ngrokbackend";
import { Package, Search, XCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ipbe = import.meta.env.VITE_IPBE;
const API_BASE_URL = `${ipbe}:${portbe}`;

// Definisikan tipe untuk data yang diterima dari API
interface ApiBarang {
  _id: string;
  kode?: string;
  kode_barang?: string;
  nama?: string;
  nama_barang?: string;
  kategori?: string;
  hargaBeli?: number;
  harga_beli?: number;
  hargaJual?: number;
  harga_jual?: number;
  stok?: number;
  stokMinimal?: number;
  stok_minimal?: number;
  hargaFinal?: number;
  gambarUrl?: string;
  gambar_url?: string;
  status?: string;
  useDiscount?: boolean;
  use_discount?: boolean;
  margin?: number;
  bahan_baku?: Array<{
    nama_produk: string;
    bahan: Array<{
      nama: string;
      harga: number;
      jumlah: number;
    }>;
  }>;
}

interface SettingsUpdate {
  lowStockAlert?: number;
}

interface StokBarangMenegerProps {
  dataBarang: Barang[];
  isLoading?: boolean;
}

export default function StokBarangMeneger({
  dataBarang: initialDataBarang,
  isLoading = false,
}: StokBarangMenegerProps) {
  const [dataBarang, setDataBarang] = useState<Barang[]>(initialDataBarang || []);
  const [selectedProduct, setSelectedProduct] = useState<Barang | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [socketLoading, setSocketLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(5);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const socketRef = useRef<Socket | null>(null);

  // Fungsi untuk normalisasi data
  const normalizeBarangData = useCallback((barang: ApiBarang): Barang => {
    return {
      _id: barang._id || '',
      kode: barang.kode || barang.kode_barang || '',
      nama: barang.nama || barang.nama_barang || 'Tanpa Nama',
      kategori: barang.kategori || 'Lainnya',
      hargaBeli: barang.hargaBeli || barang.harga_beli || 0,
      hargaJual: barang.hargaJual || barang.harga_jual || 0,
      stok: barang.stok || 0,
      stok_awal: barang.stok || 0,
      stokMinimal: barang.stokMinimal || barang.stok_minimal || lowStockAlert,
      hargaFinal: barang.hargaFinal || 0,
      gambarUrl: barang.gambarUrl || barang.gambar_url || '',
      status: barang.status || 'aman',
      useDiscount: barang.useDiscount || barang.use_discount || true,
      margin: barang.margin || 30,
      bahanBaku: barang.bahan_baku || []
    };
  }, [lowStockAlert]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      console.log("Mengambil data settings...");
      const token = localStorage.getItem('token');
      const SETTINGS_API_URL = `${API_BASE_URL}/api/admin/settings`;
      const res = await fetch(SETTINGS_API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const settingsData = await res.json();
      
      console.log("Data settings yang diterima:", settingsData);
      
      if (settingsData.lowStockAlert !== undefined) {
        setLowStockAlert(settingsData.lowStockAlert);
        console.log("Low stock alert set to:", settingsData.lowStockAlert);
      }
      
      setSettingsLoaded(true);
    } catch (err) {
      console.error("Gagal mengambil pengaturan:", err);
      setLowStockAlert(5);
      setSettingsLoaded(true);
    }
  }, []);

  // Inisialisasi Socket.io
  const initializeSocket = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      console.log('Initializing socket with token:', token ? 'Present' : 'Missing');
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      socketRef.current = io(API_BASE_URL, {
        auth: {
          token: token
        }
      });
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected with ID:', socketRef.current?.id);
        socketRef.current?.emit('joinRoom', 'barang');
      });
      
      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listener untuk perubahan barang
      socketRef.current.on('barang:updated', (updatedBarang: ApiBarang) => {
        console.log('Received barang:updated event:', updatedBarang);
        const normalizedBarang = normalizeBarangData(updatedBarang);
        setDataBarang(prevList => 
          prevList.map(item => item._id === normalizedBarang._id ? normalizedBarang : item)
        );
      });
      
      // Listener untuk perubahan stok
      socketRef.current.on('stockUpdated', (data: { id: string; stok: number }) => {
        console.log('Received stockUpdated event:', data);
        setDataBarang(prevList => 
          prevList.map(item => {
            if (item._id === data.id) {
              const newStok = data.stok;
              const status = newStok <= 0 
                ? "habis" 
                : newStok <= (item.stokMinimal || lowStockAlert) 
                  ? "hampir habis" 
                  : "aman";
              return { 
                ...item, 
                stok: newStok,
                status
              };
            }
            return item;
          })
        );
      });
      
      // Listener untuk barang baru
      socketRef.current.on('barang:created', (newBarang: ApiBarang) => {
        console.log('Received barang:created event:', newBarang);
        const normalizedBarang = normalizeBarangData(newBarang);
        setDataBarang(prevList => [...prevList, normalizedBarang]);
      });
      
      // Listener untuk barang yang dihapus
      socketRef.current.on('barang:deleted', (payload: { id: string; nama?: string }) => {
        console.log('Received barang:deleted event:', payload);
        setDataBarang(prevList => prevList.filter(item => item._id !== payload.id));
      });
      
      // Listener untuk perubahan settings
      socketRef.current.on('settings:updated', (updatedSettings: SettingsUpdate) => {
        console.log('Received settings:updated event:', updatedSettings);
        
        if (updatedSettings.lowStockAlert !== undefined) {
          const newLowStockAlert = updatedSettings.lowStockAlert;
          setLowStockAlert(newLowStockAlert);
          console.log("Low stock alert updated to:", newLowStockAlert);
          
          setDataBarang(prevData => 
            prevData.map(item => ({
              ...item,
              stokMinimal: newLowStockAlert
            }))
          );
        }
      });
      
    } catch (socketError) {
      console.error('Error initializing socket:', socketError);
    }
  }, [lowStockAlert, normalizeBarangData]);

  // Fetch data dari server
  const fetchData = useCallback(async () => {
    try {
      setSocketLoading(true);
      setError(null);
      setServerError(false);
      
      const token = localStorage.getItem('token');
      console.log('Fetching data from:', `${API_BASE_URL}/api/admin/stok-barang`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/stok-barang`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      // Normalisasi data
      const normalizedData = Array.isArray(data) ? data.map(normalizeBarangData) : [];
      setDataBarang(normalizedData);
      setSocketLoading(false);
      
      // Inisialisasi socket setelah data berhasil dimuat
      initializeSocket();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data barang. Silakan coba lagi.');
      setServerError(true);
      setSocketLoading(false);
      
      // Gunakan data awal jika ada
      if (initialDataBarang && initialDataBarang.length > 0) {
        setDataBarang(initialDataBarang);
      }
    }
  }, [initializeSocket, normalizeBarangData, initialDataBarang]);

  useEffect(() => {
    // Fetch settings terlebih dahulu
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // Hanya jalankan jika settings sudah dimuat
    if (settingsLoaded) {
      // Jika sudah ada data awal, tidak perlu loading
      if (initialDataBarang && initialDataBarang.length > 0) {
        initializeSocket();
        return;
      }
      
      // Fetch data dari server
      fetchData();
      
      // Fetch data setiap 30 detik sebagai fallback
      const interval = setInterval(fetchData, 30000);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off('barang:created');
          socketRef.current.off('barang:updated');
          socketRef.current.off('barang:deleted');
          socketRef.current.off('stockUpdated');
          socketRef.current.off('settings:updated');
          socketRef.current.disconnect();
        }
        clearInterval(interval);
      };
    }
  }, [fetchData, initializeSocket, initialDataBarang, settingsLoaded]);

  // Dapatkan semua kategori unik dari dataBarang
  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(dataBarang.map((item) => item.kategori.toLowerCase()))
    );
  }, [dataBarang]);

  const filteredBarang = useMemo(() => {
    return dataBarang.filter((item) => {
      // Filter berdasarkan pencarian
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter berdasarkan kategori
      const matchesCategory = 
        categoryFilter === "" || 
        item.kategori.toLowerCase() === categoryFilter.toLowerCase();
      
      // Filter berdasarkan status stok
      let matchesStockStatus = true;
      if (stockStatusFilter === "tersedia") {
        matchesStockStatus = item.stok > lowStockAlert;
      } else if (stockStatusFilter === "terbatas") {
        matchesStockStatus = item.stok > 0 && item.stok <= lowStockAlert;
      } else if (stockStatusFilter === "habis") {
        matchesStockStatus = item.stok === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [dataBarang, searchTerm, categoryFilter, stockStatusFilter, lowStockAlert]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // 🔹 Kalau masih loading → tampilkan spinner overlay
  if (isLoading || socketLoading) {
    return (
      <MenegerLayout>
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <LoadingSpinner />
        </div>
      </MenegerLayout>
    );
  }

  // 🔹 Cek apakah server mati (dataBarang kosong)
  const isServerDown = dataBarang.length === 0;

  // 🔹 Tampilkan error state jika ada
  if (serverError) {
    return (
      <MenegerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Muat Ulang
            </button>
          </div>
        </div>
      </MenegerLayout>
    );
  }

  return (
    <MenegerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Stok Barang
          </h2>
          <p className="text-gray-600">Monitor dan kelola stok barang</p>
        </div>
        
        {/* Info Jumlah Barang */}
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <p className="text-blue-800 font-medium">
            Total: <span className="font-bold">{filteredBarang.length}</span> barang
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Cari nama, kode, atau kategori barang..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Komponen - Hanya tampilkan jika server tidak mati */}
      {!isServerDown && (
        <StokFilter
          uniqueCategories={uniqueCategories}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onStockStatusChange={setStockStatusFilter}
        />
      )}

      {/* Ringkasan Stok - Hanya tampilkan jika server tidak mati */}
      {!isServerDown && <StokSummary dataBarang={dataBarang} />}

      {/* Barang Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isServerDown ? (
          // Tampilan ketika server mati
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <img
              src="../images/nostokbarang.jpg"
              alt="Server tidak tersedia"
              className="max-w-md w-full h-auto rounded-lg shadow-lg mb-6"
            />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Server Tidak Tersedia
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda atau hubungi administrator.
            </p>
          </div>
        ) : currentItems.length > 0 ? (
          // Tampilkan barang jika ada hasil filter
          currentItems.map((item) => (
            <StokCard
              key={item._id}
              item={item}
              onSelect={setSelectedProduct}
            />
          ))
        ) : (
          // Tampilkan pesan tidak ada hasil filter
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Barang tidak ditemukan
            </h3>
            <p className="text-gray-500">
              Coba gunakan kata kunci pencarian yang berbeda
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
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
                  className={`w-10 h-10 rounded-md ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Detail Barang */}
      <DetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </MenegerLayout>
  );
}