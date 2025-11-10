import type { Barang } from "../admin/stok-barang";
import MainLayout from "./layout";
import { useState, useEffect, useRef, useCallback } from "react";
import io, { Socket } from 'socket.io-client';
import { portbe } from '../../../backend/ngrokbackend';

const ipbe = import.meta.env.VITE_IPBE;
const API_BASE_URL = `${ipbe}:${portbe}`;

// Define interfaces for socket data
interface SocketBarangData {
  _id?: string;
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
}

interface StockUpdateData {
  id: string;
  stok: number;
}

interface DeletedBarangData {
  id: string;
  nama?: string;
}

// Komponen StokCard (dipindahkan dari bawah)
interface StokCardProps {
  item: Barang;
  onSelect: (item: Barang) => void;
}

const StokCard = ({ item, onSelect }: StokCardProps) => {
  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { text: "Stok Habis", color: "bg-red-100 text-red-800" };
    if (stok <= stokMinimal)
      return { text: "Stok Terbatas", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Stok Tersedia", color: "bg-green-100 text-green-800" };
  };

  const stockStatus = getStockStatus(item.stok, item.stokMinimal);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all flex flex-col">
      {/* Gambar Barang */}
      <div className="h-48 overflow-hidden bg-gray-100">
        {item.gambarUrl ? (
          <img
            src={item.gambarUrl}
            alt={item.nama}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        ) : (
          <img
            src="https://via.placeholder.com/300x200?text=No+Image"
            alt="Gambar tidak tersedia"
            className="w-full h-full object-contain p-4"
          />
        )}
      </div>
      
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}
          >
            {stockStatus.text}
          </span>
          {item.kode && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{item.kode}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {item.nama}
        </h3>
        <p className="text-sm text-gray-500 mb-3 capitalize">
          Kategori: {item.kategori}
        </p>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">Stok Tersedia</p>
            <p className="text-lg font-bold">{item.stok} unit</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Harga Final</p>
            <p className="text-lg font-bold text-blue-600">
              Rp {item.hargaFinal?.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {item.stok > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className={`h-2 rounded-full ${
                item.stok <= (item.stokMinimal || 5) ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(100, (item.stok / 50) * 100)}%`,
              }}
            ></div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => onSelect(item)}
          className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

// Komponen DetailModal (dipindahkan dari bawah)
interface DetailModalProps {
  item: Barang | null;
  onClose: () => void;
}

const DetailModal = ({ item, onClose }: DetailModalProps) => {
  if (!item) return null;

  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { text: "Stok Habis", color: "bg-red-100 text-red-800", emoji: "❌" };
    if (stok <= stokMinimal)
      return { text: "Stok Terbatas", color: "bg-yellow-100 text-yellow-800", emoji: "⚠️" };
    return { text: "Stok Tersedia", color: "bg-green-100 text-green-800", emoji: "✅" };
  };

  const stockStatus = getStockStatus(item.stok, item.stokMinimal);

  // Fungsi untuk mendapatkan warna progress bar
  const getProgressBarColor = (stok: number, stokMinimal: number = 5) => {
    return stok <= stokMinimal ? "bg-yellow-500" : "bg-green-500";
  };

  // Menghitung lebar progress bar
  const getProgressBarWidth = (stok: number) => {
    return `${Math.min(100, (stok / 50) * 100)}%`;
  };

  const progressBarColor = getProgressBarColor(item.stok, item.stokMinimal || 5);
  const progressBarWidth = getProgressBarWidth(item.stok);

  // Fungsi untuk mendapatkan status profit
  const getProfitStatus = (hargaBeli: number, hargaJual: number) => {
    const profit = hargaJual - hargaBeli;
    const profitPercentage = (profit / hargaBeli) * 100;
    
    if (profitPercentage < 10) return { text: "Rendah", color: "text-red-600", emoji: "📉" };
    if (profitPercentage < 30) return { text: "Sedang", color: "text-yellow-600", emoji: "📊" };
    return { text: "Tinggi", color: "text-green-600", emoji: "📈" };
  };

  const profitStatus = getProfitStatus(item.hargaBeli, item.hargaJual);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${stockStatus.color} text-2xl`}>
              {stockStatus.emoji}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Detail Barang</h3>
              <p className="text-sm text-gray-600">Informasi lengkap tentang produk</p>
            </div>
          </div>
        </div>
        
        {/* Konten Modal - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Gambar Barang - Full width on mobile */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
            {item.gambarUrl ? (
              <div className="relative max-w-xs w-full">
                <img
                  src={item.gambarUrl}
                  alt={item.nama}
                  className="w-full h-48 md:h-64 object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg text-xl">
                  {stockStatus.emoji}
                </div>
              </div>
            ) : (
              <div className="relative max-w-xs w-full">
                <img
                  src="https://via.placeholder.com/600x400?text=No+Image"
                  alt="Gambar tidak tersedia"
                  className="w-full h-48 md:h-64 object-contain rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg text-xl">
                  {stockStatus.emoji}
                </div>
              </div>
            )}
          </div>
          
          {/* Informasi Barang */}
          <div className="p-4 md:p-8 bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{item.nama}</h4>
                {item.kode && (
                  <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                    #{item.kode}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color} flex items-center`}
              >
                <span className="mr-1">{stockStatus.emoji}</span>
                {stockStatus.text}
              </span>
            </div>

            {/* Kategori */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <div className="flex items-center">
                <span className="text-xl mr-2">📁</span>
                <p className="text-base md:text-lg font-medium capitalize bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                  {item.kategori}
                </p>
              </div>
            </div>

            {/* Informasi Stok */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">📦</span>
                Informasi Stok
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Stok Tersedia</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-700">{item.stok} unit</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Stok Minimal</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-700">{item.stokMinimal || 5} unit</p>
                </div>
              </div>

              {/* Progress Bar Stok */}
              {item.stok > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ketersediaan Stok</span>
                    <span>{Math.round((item.stok / 50) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${progressBarColor}`}
                      style={{ width: progressBarWidth }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Informasi Harga */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">💰</span>
                Informasi Harga
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Harga Beli</p>
                  <p className="text-lg md:text-xl font-bold text-green-700">Rp {item.hargaBeli.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Harga Jual</p>
                  <p className="text-lg md:text-xl font-bold text-blue-700">Rp {item.hargaFinal?.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Margin/Profit */}
              <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Margin Keuntungan</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-700">
                      Rp {(item.hargaBeli - item.hargaJual).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profitStatus.color} flex items-center`}>
                    <span className="mr-1">{profitStatus.emoji}</span>
                    {profitStatus.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {item.stok === 0 ? "❌" : 
                  item.stok <= (item.stokMinimal || 5) ? "⚠️" : "✅"}
                </span>
                <p className="text-gray-800 capitalize">
                  {item.status || (item.stok === 0 
                    ? "stok habis" 
                    : item.stok <= (item.stokMinimal || 5) 
                      ? "stok hampir habis" 
                      : "stok aman")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
          >
            <span className="mr-1">❌</span>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  dataBarang: Barang[];
}

const KasirDashboard = ({ dataBarang: initialDataBarang }: DashboardProps) => {
  console.log('Initial data barang:', initialDataBarang);
  
  const [dataBarang, setDataBarang] = useState<Barang[]>(initialDataBarang || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Barang | null>(null);
  const [isLoading, setIsLoading] = useState(!initialDataBarang || initialDataBarang.length === 0);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fungsi untuk normalisasi data
  const normalizeBarangData = (barang: SocketBarangData): Barang => {
    return {
      _id: barang._id || '',
      kode: barang.kode || barang.kode_barang || '',
      nama: barang.nama || barang.nama_barang || 'Tanpa Nama',
      kategori: barang.kategori || 'Lainnya',
      hargaBeli: barang.hargaBeli || barang.harga_beli || 0,
      hargaJual: barang.hargaJual || barang.harga_jual || 0,
      stok: barang.stok || 0,
      stok_awal: barang.stok || 0,
      stokMinimal: barang.stokMinimal || barang.stok_minimal || 5,
      hargaFinal: barang.hargaFinal || 0,
      gambarUrl: barang.gambarUrl || barang.gambar_url || '',
      status: barang.status || 'aman',
      useDiscount: barang.useDiscount || barang.use_discount || true
    };
  };

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
      
      socketRef.current.on('barang:updated', (updatedBarang: SocketBarangData) => {
        console.log('Received barang:updated event:', updatedBarang);
        const normalizedBarang = normalizeBarangData(updatedBarang);
        setDataBarang(prevList => 
          prevList.map(item => item._id === normalizedBarang._id ? normalizedBarang : item)
        );
      });
      
      socketRef.current.on('stockUpdated', (data: StockUpdateData) => {
        console.log('Received stockUpdated event:', data);
        setDataBarang(prevList => 
          prevList.map(item => {
            if (item._id === data.id) {
              const newStok = data.stok;
              const status = newStok <= 0 
                ? "habis" 
                : newStok <= (item.stokMinimal || 5) 
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
      
      socketRef.current.on('barang:created', (newBarang: SocketBarangData) => {
        console.log('Received barang:created event:', newBarang);
        const normalizedBarang = normalizeBarangData(newBarang);
        setDataBarang(prevList => [...prevList, normalizedBarang]);
      });
      
      socketRef.current.on('barang:deleted', (payload: DeletedBarangData) => {
        console.log('Received barang:deleted event:', payload);
        setDataBarang(prevList => prevList.filter(item => item._id !== payload.id));
      });
      
    } catch (socketError) {
      console.error('Error initializing socket:', socketError);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      const normalizedData = Array.isArray(data) ? data.map(normalizeBarangData) : [];
      setDataBarang(normalizedData);
      setIsLoading(false);
      
      initializeSocket();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data barang. Silakan coba lagi.');
      setIsLoading(false);
      
      if (initialDataBarang && initialDataBarang.length > 0) {
        setDataBarang(initialDataBarang);
      }
    }
  }, [initializeSocket, initialDataBarang]);

  useEffect(() => {
    if (initialDataBarang && initialDataBarang.length > 0) {
      setIsLoading(false);
      initializeSocket();
      return;
    }
    
    fetchData();
    
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('barang:created');
        socketRef.current.off('barang:updated');
        socketRef.current.off('barang:deleted');
        socketRef.current.off('stockUpdated');
        socketRef.current.disconnect();
      }
      clearInterval(interval);
    };
  }, [initialDataBarang, fetchData, initializeSocket]);

  const filteredBarang = dataBarang.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetail = (item: Barang) => {
    setSelectedItem(item);
  };

  const closeDetail = () => {
    setSelectedItem(null);
  };

  // Tampilkan loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Memuat data barang...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Kasir Dashboard</h2>
          <p className="text-gray-600">Daftar barang yang tersedia</p>
        </div>
        
        {/* Info Jumlah Barang */}
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium">
            Total: <span className="font-bold">{filteredBarang.length}</span> barang
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
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

      {/* Barang Grid - Menggunakan StokCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredBarang.map(item => (
          <StokCard
            key={item._id}
            item={item}
            onSelect={openDetail}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredBarang.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada barang yang ditemukan</h3>
          <p className="text-gray-500">Coba gunakan kata kunci pencarian yang berbeda</p>
        </div>
      )}

      {/* Modal Detail Barang - Menggunakan DetailModal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={closeDetail}
        />
      )}
    </MainLayout>
  );
};

export default KasirDashboard;