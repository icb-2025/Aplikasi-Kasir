import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/MainLayout";

interface BarangDibeli {
  barang_id: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

interface TransactionResponse {
  _id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[];
  total_harga: number;
  metode_pembayaran: string;
  status: string;
  kasir_id: string;
  createdAt: string;
  updatedAt: string;
}

interface SettingsResponse {
  receiptHeader?: string;
  receiptFooter?: string;
}

interface KasirResponse {
  _id: string;
  nama: string;
  username: string;
  role: string;
}

const PembelianBerhasil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams<{ token: string }>();
  const [transaksi, setTransaksi] = useState<TransactionResponse | null>(null);
  const [settings, setSettings] = useState<SettingsResponse>({});
  const [kasir, setKasir] = useState<KasirResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number | undefined | null): string => {
    if (!value || isNaN(value)) return "Rp 0";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('order_id');
        const statusCode = queryParams.get('status_code');
        const transactionStatus = queryParams.get('transaction_status');
        
        console.log("Query params:", { orderId, statusCode, transactionStatus });
        console.log("Token dari URL:", token);
        
        const state = location.state as { 
          transaksiId?: string, 
          transaksiTerbaru?: TransactionResponse,
          status?: string,
          message?: string
        };
        
        let transaksiId = state?.transaksiId;
        
        if (!transaksiId && orderId) {
          transaksiId = orderId;
        }
        
        console.log("Transaksi ID:", transaksiId);
        
        if (state?.transaksiTerbaru) {
          console.log("Menggunakan transaksiTerbaru dari state:", state.transaksiTerbaru);
          const transaksiData = {
            ...state.transaksiTerbaru,
            status: 'selesai'
          };
          setTransaksi(transaksiData);
          
          if (transaksiData.kasir_id) {
            fetchKasirData(transaksiData.kasir_id);
          }
          
          try {
            await fetch(`http://192.168.110.16:5000/api/transaksi/${transaksiData._id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'selesai' }),
            });
          } catch (err) {
            console.error("Gagal update status transaksi:", err);
          }
        } 
        else if (transaksiId) {
          console.log("Mengambil transaksi dengan order_id:", transaksiId);
          const resTransaksi = await fetch(`http://192.168.110.16:5000/api/transaksi/${transaksiId}`);
          if (!resTransaksi.ok) throw new Error("Gagal fetch transaksi");
          const dataTransaksi = await resTransaksi.json();
          console.log("Data transaksi dari API:", dataTransaksi);
          const transaksiData = {
            ...dataTransaksi,
            status: 'selesai'
          };
          setTransaksi(transaksiData);
          
          if (transaksiData.kasir_id) {
            fetchKasirData(transaksiData.kasir_id);
          }
          
          try {
            await fetch(`http://192.168.110.16:5000/api/transaksi/${transaksiId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'selesai' }),
            });
          } catch (err) {
            console.error("Gagal update status transaksi:", err);
          }
        } 
        else if (token) {
          console.log("Mengambil transaksi dengan token:", token);
          const resTransaksi = await fetch(`http://192.168.110.16:5000/api/transaksi/token/${token}`);
          if (!resTransaksi.ok) throw new Error("Gagal fetch transaksi dengan token");
          const dataTransaksi = await resTransaksi.json();
          console.log("Data transaksi dari API dengan token:", dataTransaksi);
          const transaksiData = {
            ...dataTransaksi,
            status: 'selesai'
          };
          setTransaksi(transaksiData);
          
          if (transaksiData.kasir_id) {
            fetchKasirData(transaksiData.kasir_id);
          }
          
          try {
            await fetch(`http://192.168.110.16:5000/api/transaksi/${transaksiData._id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'selesai' }),
            });
          } catch (err) {
            console.error("Gagal update status transaksi:", err);
          }
        } 
        else {
          console.log("Mengambil transaksi terbaru");
          const resTransaksi = await fetch("http://192.168.110.16:5000/api/transaksi");
          if (!resTransaksi.ok) throw new Error("Gagal fetch transaksi");
          const dataTransaksi = await resTransaksi.json();
          console.log("Data transaksi terbaru:", dataTransaksi);
          const transaksiData = Array.isArray(dataTransaksi) 
            ? { ...dataTransaksi[dataTransaksi.length - 1], status: 'selesai' }
            : { ...dataTransaksi, status: 'selesai' };
          setTransaksi(transaksiData);
          
          if (transaksiData.kasir_id) {
            fetchKasirData(transaksiData.kasir_id);
          }
          
          try {
            const transaksiId = transaksiData._id;
            await fetch(`http://192.168.110.16:5000/api/transaksi/${transaksiId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'selesai' }),
            });
          } catch (err) {
            console.error("Gagal update status transaksi:", err);
          }
        }

        const resSettings = await fetch("http://192.168.110.16:5000/api/manager/settings");
        if (resSettings.ok) {
          const dataSettings = await resSettings.json();
          setSettings(dataSettings);
        }
        
        if (statusCode === '200' && transactionStatus === 'settlement' && transaksiId) {
          try {
            await fetch(`http://192.168.110.16:5000/api/transaksi/${transaksiId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'selesai' }),
            });
          } catch (err) {
            console.error("Gagal update status transaksi:", err);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal memuat data transaksi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    const fetchKasirData = async (kasirId: string) => {
      try {
        const resKasir = await fetch(`http://192.168.110.16:5000/api/kasir/${kasirId}`);
        if (resKasir.ok) {
          const dataKasir = await resKasir.json();
          setKasir(dataKasir);
        }
      } catch (err) {
        console.error("Gagal fetch data kasir:", err);
      }
    };

    fetchData();
  }, [location.state, location.search, token]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Memuat data transaksi...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!transaksi) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tidak ada data transaksi</h1>
            <p className="text-gray-600 mb-6">Data transaksi tidak ditemukan. Silakan kembali ke beranda.</p>
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-8 print:w-full print:shadow-none print:mt-0">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600">Terima kasih telah melakukan pembelian</p>
        </div>

        {settings.receiptHeader && (
          <pre className="text-center font-bold mb-4 whitespace-pre-line">
            {settings.receiptHeader}
          </pre>
        )}

        <h2 className="text-xl font-bold text-center mb-2">STRUK PEMBELIAN</h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          #{transaksi.nomor_transaksi || transaksi._id || "-"}
        </p>

        <div className="border-t border-b py-2 mb-4 text-sm">
          <p><span className="font-semibold">Tanggal:</span>{" "}
            {transaksi.tanggal_transaksi
              ? new Date(transaksi.tanggal_transaksi).toLocaleString("id-ID")
              : transaksi.createdAt
                ? new Date(transaksi.createdAt).toLocaleString("id-ID")
                : "-"}
          </p>
          <p><span className="font-semibold">Metode:</span> {transaksi.metode_pembayaran || "-"}</p>
          <p><span className="font-semibold">Kasir:</span> {kasir ? kasir.nama : (transaksi.kasir_id || "-")}</p>
          <p><span className="font-semibold">Status:</span>{" "}
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Selesai</span>
          </p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead className="border-b">
            <tr>
              <th className="text-left py-1">Barang</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Harga</th>
              <th className="text-right py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.barang_dibeli && transaksi.barang_dibeli.length > 0 ? (
              transaksi.barang_dibeli.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">{item.nama_barang}</td>
                  <td className="py-1 text-center">{item.jumlah}</td>
                  <td className="py-1 text-right">{formatCurrency(item.harga_satuan)}</td>
                  <td className="py-1 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-2 text-center text-gray-500">
                  Tidak ada data barang
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center text-lg font-bold mb-6">
          <span>Total</span>
          <span className="text-green-600">{formatCurrency(transaksi.total_harga)}</span>
        </div>

        {settings.receiptFooter && (
          <pre className="text-center text-sm text-gray-600 mt-4 whitespace-pre-line">
            {settings.receiptFooter}
          </pre>
        )}

        <div className="flex gap-3 mt-6 print:hidden">
          <button onClick={() => navigate("/")} className="w-1/3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Beranda
          </button>
          <button onClick={() => navigate("/riwayat")} className="w-1/3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Riwayat
          </button>
          <button onClick={() => window.print()} className="w-1/3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Cetak
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PembelianBerhasil;