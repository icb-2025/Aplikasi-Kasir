import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layout";
import { getSocket } from "../../utils/socket";

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

const PesananKasirPage = () => {
  const [pesananList, setPesananList] = useState<PesananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kasirId, setKasirId] = useState<string | null>(null);
  const [loadingKasir, setLoadingKasir] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const usersUrl = "http://192.168.110.16:5000/api/admin/users";
          console.debug("Fetching kasir user info", { url: usersUrl, tokenPresent: !!token });

          const res = await fetch(usersUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-api-key': 'GPJbke7X3vAP0IBiiP8A'
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

  // Fetch data pesanan berdasarkan kasir ID
  const fetchPesanan = useCallback(async () => {
    if (!kasirId) return;
    
    try {
      setLoading(true);
      // Menggunakan kasir_id untuk filter — sertakan Bearer token dan x-api-key sesuai backend teman
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      const url = `http://192.168.110.16:5000/api/transaksi?kasir_id=${kasirId}`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'x-api-key': 'GPJbke7X3vAP0IBiiP8A'
      };

      console.debug('Fetching transaksi', { url, headers: { Authorization: !!token, 'x-api-key': !!headers['x-api-key'] } });

      try {
        const res = await fetch(url, { headers });

        if (res.ok) {
          const data = await res.json();
          setPesananList(Array.isArray(data) ? data : data.data || []);
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
  }, [kasirId]);

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
            const exists = prev.some(item => item._id === data._id);
            return exists ? prev : [data, ...prev];
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
          const exists = prev.some(p => p._id === locationState.transaksiTerbaru?._id);
          return exists ? prev : [locationState.transaksiTerbaru!, ...prev];
        });
      }
    }
  }, [locationState, kasirId]);

  const formatTanggal = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  if (loadingKasir) {
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Pesanan Kasir</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : pesananList.length === 0 ? (
          <div className="bg-white shadow p-6 rounded-lg border text-center">
            <p className="text-gray-500">Belum ada pesanan untuk kasir ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pesananList.map(pesanan => (
              <div key={pesanan._id} className="bg-white shadow p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg">#{pesanan.nomor_transaksi}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      pesanan.status
                    )}`}
                  >
                    {pesanan.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{formatTanggal(pesanan.tanggal_transaksi)}</p>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Metode: <span className="font-medium">{pesanan.metode_pembayaran}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Kasir ID: <span className="font-medium">{pesanan.kasir_id}</span>
                  </p>
                  <p className="font-semibold text-blue-600 text-lg mt-2">
                    Rp {pesanan.total_harga.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <h3 className="font-medium text-gray-700 mb-2">Barang Dibeli:</h3>
                  <div className="space-y-2">
                    {pesanan.barang_dibeli.map((barang, index) => (
                      <div key={barang._id || index} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{barang.nama_barang}</span>
                          <span className="text-gray-500 ml-2">({barang.kode_barang})</span>
                        </div>
                        <div className="text-right">
                          <div>{barang.jumlah} x Rp {barang.harga_satuan?.toLocaleString("id-ID")}</div>
                          <div className="font-medium">Rp {barang.subtotal?.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {pesanan.updatedAt && (
                  <div className="mt-3 text-xs text-gray-500">
                    Terakhir diperbarui: {formatTanggal(pesanan.updatedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PesananKasirPage;