import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layout";
import { getSocket } from "../../utils/socket";

interface BarangDibeli {
  nama_barang?: string;
  jumlah_barang?: number;
  harga?: number;
  subtotal?: number;
}

interface PesananItem {
  _id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[];
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

const PesananKasirPage = () => {
  const [pesananList, setPesananList] = useState<PesananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Fetch data pesanan
  const fetchPesanan = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://192.168.110.16:5000/api/transaksi");
      if (res.ok) {
        const data = await res.json();
        setPesananList(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Gagal ambil pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update status → selesai / dibatalkan
  const updateStatusPesanan = async (id: string, status: "selesai" | "dibatalkan") => {
    setUpdatingStatus(id);
    try {
      const res = await fetch(`http://192.168.110.16:5000/api/transaksi/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setPesananList(prev =>
          prev.map(p =>
            p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
          )
        );
        getSocket().emit("updateStatus", { _id: id, status });
      } else {
        alert("Gagal update status");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
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
      setPesananList(prev => {
        const exists = prev.some(item => item._id === data._id);
        return exists ? prev : [data, ...prev];
      });
    };

    socket.on("statusUpdated", handleStatusUpdated);
    socket.on("newTransaction", handleNewTransaction);

    return () => {
      socket.off("statusUpdated", handleStatusUpdated);
      socket.off("newTransaction", handleNewTransaction);
    };
  }, []);

  // Tambah transaksi baru via navigate state
  useEffect(() => {
    if (locationState?.transaksiTerbaru) {
      setPesananList(prev => {
        const exists = prev.some(p => p._id === locationState.transaksiTerbaru?._id);
        return exists ? prev : [locationState.transaksiTerbaru!, ...prev];
      });
    }
  }, [locationState]);

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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Pesanan Kasir</h1>

        {loading ? (
          <p>Memuat pesanan...</p>
        ) : pesananList.length === 0 ? (
          <p>Belum ada pesanan</p>
        ) : (
          <div className="space-y-4">
            {pesananList.map(pesanan => (
              <div key={pesanan._id} className="bg-white shadow p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold">#{pesanan.nomor_transaksi}</h2>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      pesanan.status
                    )}`}
                  >
                    {pesanan.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{formatTanggal(pesanan.tanggal_transaksi)}</p>

                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    Metode: <span className="font-medium">{pesanan.metode_pembayaran}</span>
                  </p>
                  <p className="font-semibold text-blue-600">
                    Rp {pesanan.total_harga.toLocaleString("id-ID")}
                  </p>
                </div>

                {pesanan.status === "pending" && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => updateStatusPesanan(pesanan._id, "selesai")}
                      disabled={updatingStatus === pesanan._id}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                    >
                      {updatingStatus === pesanan._id ? "Menyelesaikan..." : "Acc & Tandai Selesai"}
                    </button>
                    <button
                      onClick={() => updateStatusPesanan(pesanan._id, "dibatalkan")}
                      disabled={updatingStatus === pesanan._id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
                    >
                      Batalkan
                    </button>
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
