import type { Barang } from "../../admin/stok-barang";
import MenegerLayout from "../layout";
import { useState, useEffect, useMemo, useRef } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import StokFilter from "./StokFilter";
import StokSummary from "./StokSummary";
import StokCard from "./StokCard";
import DetailModal from "./DetailModal";
import io, { Socket } from 'socket.io-client';
import { portbe } from "../../../../backend/ngrokbackend";

const ipbe = import.meta.env.VITE_IPBE;
const API_BASE_URL = `${ipbe}:${portbe}`;

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
  const socketRef = useRef<Socket | null>(null);

  // Fungsi untuk normalisasi data
  const normalizeBarangData = (barang: any): Barang => {
    return {
      _id: barang._id || '',
      kode: barang.kode || barang.kode_barang || '',
      nama: barang.nama || barang.nama_barang || 'Tanpa Nama',
      kategori: barang.kategori || 'Lainnya',
      hargaBeli: barang.hargaBeli || barang.harga_beli || 0,
      hargaJual: barang.hargaJual || barang.harga_jual || 0,
      stok: barang.stok || 0,
      stokMinimal: barang.stokMinimal || barang.stok_minimal || 5,
      hargaFinal: barang.hargaFinal || 0,
      gambarUrl: barang.gambarUrl || barang.gambar_url || '',
      status: barang.status || 'aman',
      useDiscount: barang.useDiscount || barang.use_discount || true
    };
  };

  // Inisialisasi Socket.io
  const initializeSocket = () => {
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
        // Bergabung dengan room 'barang' jika diperlukan
        socketRef.current?.emit('joinRoom', 'barang');
      });
      
      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listener untuk perubahan barang
      socketRef.current.on('barang:updated', (updatedBarang: any) => {
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
      
      // Listener untuk barang baru
      socketRef.current.on('barang:created', (newBarang: any) => {
        console.log('Received barang:created event:', newBarang);
        const normalizedBarang = normalizeBarangData(newBarang);
        setDataBarang(prevList => [...prevList, normalizedBarang]);
      });
      
      // Listener untuk barang yang dihapus
      socketRef.current.on('barang:deleted', (payload: { id: string; nama?: string }) => {
        console.log('Received barang:deleted event:', payload);
        setDataBarang(prevList => prevList.filter(item => item._id !== payload.id));
      });
      
    } catch (socketError) {
      console.error('Error initializing socket:', socketError);
    }
  };

  // Fetch data dari server
  const fetchData = async () => {
    try {
      setSocketLoading(true);
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
      
      // Normalisasi data
      const normalizedData = Array.isArray(data) ? data.map(normalizeBarangData) : [];
      setDataBarang(normalizedData);
      setSocketLoading(false);
      
      // Inisialisasi socket setelah data berhasil dimuat
      initializeSocket();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data barang. Silakan coba lagi.');
      setSocketLoading(false);
      
      // Gunakan data awal jika ada
      if (initialDataBarang && initialDataBarang.length > 0) {
        setDataBarang(initialDataBarang);
      }
    }
  };

  useEffect(() => {
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
        socketRef.current.disconnect();
      }
      clearInterval(interval);
    };
  }, [initialDataBarang]);

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
        matchesStockStatus = item.stok > 10;
      } else if (stockStatusFilter === "terbatas") {
        matchesStockStatus = item.stok > 0 && item.stok <= 10;
      } else if (stockStatusFilter === "habis") {
        matchesStockStatus = item.stok === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [dataBarang, searchTerm, categoryFilter, stockStatusFilter]);

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
  if (error) {
    return (
      <MenegerLayout>
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
      </MenegerLayout>
    );
  }

  return (
    <MenegerLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Stok Barang
          </h2>
          <p className="text-gray-600">Monitor dan kelola stok barang</p>
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
        ) : filteredBarang.length > 0 ? (
          // Tampilkan barang jika ada hasil filter
          filteredBarang.map((item) => (
            <StokCard
              key={item._id}
              item={item}
              onSelect={setSelectedProduct}
            />
          ))
        ) : (
          // Tampilkan pesan tidak ada hasil filter
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Barang tidak ditemukan
            </h3>
            <p className="text-gray-500">
              Coba gunakan kata kunci pencarian yang berbeda
            </p>
          </div>
        )}
      </div>

      {/* Modal Detail Barang */}
      <DetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </MenegerLayout>
  );
}