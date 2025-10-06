import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/MainLayout";
import { getSocket } from "../../utils/socket";

interface BarangDibeli {
  nama_barang?: string;
  jumlah_barang?: number;
  harga?: number;
  subtotal?: number;
  [key: string]: unknown;
}

interface PesananItem {
  _id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[] | string[];
  total_harga: number;
  metode_pembayaran: string;
  status: string;
  updatedAt?: string;
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

const StatusPesananPage = () => {
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [pesananList, setPesananList] = useState<PesananItem[]>([]);
  const [loading, setLoading] = useState(true);
 
  const location = useLocation();
  const navigate = useNavigate();
  
  const locationState = location.state as LocationState | null;

  // Fetch data pesanan dari API
  const fetchPesanan = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://192.168.110.16:5000/api/transaksi");
      
      if (response.ok) {
        const data = await response.json();
        // Handle berbagai format response
        const pesananData = Array.isArray(data) ? data : (data.data || []);
        setPesananList(pesananData);
      } else {
        console.error("Gagal mengambil data pesanan");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup Socket.IO connection
  useEffect(() => {
    // Ambil data pertama kali
    fetchPesanan();

    const socket = getSocket();
    
    // Listen for status updates
    const handleStatusUpdated = (data: StatusUpdateData) => {
      console.log("Status updated:", data);

      setPesananList(prevList => {
        const updatedList = prevList.map(pesanan =>
          pesanan._id === data._id
            ? { ...pesanan, status: data.status, updatedAt: data.updatedAt }
            : pesanan
        );

        const updatedPesanan = updatedList.find(p => p._id === data._id);
        if (updatedPesanan) {
          console.log(`Pesanan ${updatedPesanan.nomor_transaksi} diperbarui: ${data.status}`);
        }

        return updatedList;
      });
    };

    // Listen for new transactions
    const handleNewTransaction = (data: PesananItem) => {
      console.log("New transaction:", data);
      
      // Add the new transaction to the list
      setPesananList(prevList => {
        // Cek apakah transaksi sudah ada untuk menghindari duplikat
        const alreadyExists = prevList.some(item => item._id === data._id);
        if (alreadyExists) {
          return prevList.map(item => 
            item._id === data._id ? data : item
          );
        }
        return [data, ...prevList];
      });

      // Show notification
      console.log(`Pesanan baru: ${data.nomor_transaksi}`);
    };

    // Setup event listeners
    socket.on("statusUpdated", handleStatusUpdated);
    socket.on("newTransaction", handleNewTransaction);

    // Cleanup on unmount
    return () => {
      socket.off("statusUpdated", handleStatusUpdated);
      socket.off("newTransaction", handleNewTransaction);
    };
  }, []);

  // Ambil data transaksi terbaru dari state navigasi
  useEffect(() => {
    if (locationState?.transaksiTerbaru) {
      setPesananList(prev => {
        // Cek apakah transaksi sudah ada untuk menghindari duplikat
        const alreadyExists = prev.some(item => item._id === locationState.transaksiTerbaru?._id);
        if (alreadyExists) {
          return prev.map(item => 
            item._id === locationState.transaksiTerbaru?._id 
              ? locationState.transaksiTerbaru 
              : item
          );
        }
        return [locationState.transaksiTerbaru as PesananItem, ...prev];
      });
    }
  }, [locationState]);

  // Filter pesanan berdasarkan status
  const filteredPesanan = filterStatus === "semua" 
    ? pesananList 
    : pesananList.filter(pesanan => pesanan.status === filterStatus);

  // Fungsi untuk mendapatkan class warna berdasarkan status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "dikirim": return "bg-blue-100 text-blue-800";
      case "selesai": return "bg-green-100 text-green-800";
      case "dibatalkan": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk format tanggal
  const formatTanggal = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Fungsi untuk mendapatkan nama barang
  const getNamaBarang = (barang: BarangDibeli | string): string => {
    if (typeof barang === 'string') {
      return barang;
    }
    return barang.nama_barang || 'Barang';
  };

  // Fungsi untuk mendapatkan jumlah barang
  const getJumlahBarang = (barang: BarangDibeli | string): number => {
    if (typeof barang === 'string' || !barang.jumlah_barang) {
      return 1;
    }
    return barang.jumlah_barang;
  };

  // Fungsi untuk mendapatkan harga barang
  const getHargaBarang = (barang: BarangDibeli | string): number | null => {
    if (typeof barang === 'string' || !barang.harga) {
      return null;
    }
    return barang.harga;
  };

  // Fungsi untuk mendapatkan subtotal barang
  const getSubtotalBarang = (barang: BarangDibeli | string): number | null => {
    if (typeof barang === 'string' || !barang.subtotal) {
      return null;
    }
    return barang.subtotal;
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Status Pesanan</h1>
          <p className="text-gray-600">Lihat status dan riwayat pesanan Anda (Real-time)</p>
        </div>

        {/* Pesan Sukses dari Transaksi */}
        {locationState?.message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {locationState.message}
          </div>
        )}

        {/* Filter Status */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter Status:</span>
            <div className="flex flex-wrap gap-2">
              {["semua", "pending", "dikirim", "selesai", "dibatalkan"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Memuat data pesanan...</p>
          </div>
        ) : filteredPesanan.length === 0 ? (
          /* Pesanan Kosong */
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filterStatus === "semua" 
                ? "Belum ada pesanan" 
                : `Tidak ada pesanan dengan status "${filterStatus}"`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === "semua" 
                ? "Pesanan yang Anda buat akan muncul di halaman ini." 
                : "Coba ubah filter status untuk melihat pesanan lainnya."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Kembali Berbelanja
            </button>
          </div>
        ) : (
          /* Daftar Pesanan */
          <div className="space-y-4">
            {filteredPesanan.map((pesanan) => (
              <div key={pesanan._id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Pesanan #{pesanan.nomor_transaksi}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatTanggal(pesanan.tanggal_transaksi)}
                      {pesanan.updatedAt && (
                        <span className="text-xs text-green-600 ml-2">
                          (Diperbarui: {formatTanggal(pesanan.updatedAt)})
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pesanan.status)}`}>
                    {pesanan.status.toUpperCase()}
                  </span>
                </div>

                <div className="border-t border-b border-gray-100 py-4 mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Barang yang dibeli:</h4>
                  <ul className="space-y-2">
                    {pesanan.barang_dibeli.map((barang, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>
                          {getNamaBarang(barang)}
                          {` (${getJumlahBarang(barang)} pcs)`}
                        </span>
                        <div className="text-right">
                          {getHargaBarang(barang) && (
                            <div className="text-gray-500">
                              Rp {getHargaBarang(barang)?.toLocaleString('id-ID')} × {getJumlahBarang(barang)}
                            </div>
                          )}
                          {getSubtotalBarang(barang) && (
                            <div className="font-semibold">
                              Rp {getSubtotalBarang(barang)?.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Metode Pembayaran: <span className="font-medium">{pesanan.metode_pembayaran}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Pembayaran</p>
                    <p className="text-lg font-bold text-blue-600">
                      Rp {pesanan.total_harga.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informasi Status */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2">
            Informasi Status Pesanan:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • <span className="font-medium">Pending</span>: Pesanan sedang diproses
            </li>
            <li>
              • <span className="font-medium">Dikirim</span>: Pesanan sedang dalam pengiriman
            </li>
            <li>
              • <span className="font-medium">Selesai</span>: Pesanan telah sampai dan selesai
            </li>
            <li>
              • <span className="font-medium">Dibatalkan</span>: Pesanan telah dibatalkan
            </li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            Status akan diperbarui secara real-time saat ada perubahan.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default StatusPesananPage;