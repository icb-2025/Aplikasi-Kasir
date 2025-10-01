// src/pages/transaksi/index.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/MainLayout";

// Perbarui interface PaymentChannel untuk lebih spesifik
interface PaymentChannel {
  method: string;
  channels: { name: string; logo?: string; _id: string; isActive: boolean }[];
  _id: string;
  isActive: boolean;
}

interface SettingsResponse {
  payment_methods: PaymentChannel[];
}

interface CartItem {
  _id: string;
  nama: string;
  hargaFinal: number;
  quantity: number;
  jumlah: number;
  stok: number;
  gambarUrl?: string;
  hargaBeli?: number;
}

interface BarangDibeli {
  kode_barang: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  harga_beli: number;
  subtotal: number;
  _id: string;
}

interface TransactionResponse {
  _id: string;
  order_id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[];
  total_harga: number;
  metode_pembayaran: string;
  status: string;
  kasir_id?: string;
  createdAt: string;
  updatedAt: string;
  no_va?: string;
}

interface MidtransData {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
}

interface TransactionApiResponse {
  message: string;
  transaksi: TransactionResponse;
  midtrans: MidtransData;
}

const TransaksiPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cartItems = [], total = 0 } =
    (location.state as { cartItems: CartItem[]; total: number }) || {};

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentChannel[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedChannelObject, setSelectedChannelObject] = useState<{ name: string; logo?: string; _id: string } | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch("http://192.168.110.16:5000/api/admin/settings");
        const data: SettingsResponse = await res.json();
        
        // Filter hanya metode pembayaran yang aktif
        const activePaymentMethods = data.payment_methods.filter(method => method.isActive);
        
        // Filter channel yang aktif untuk setiap metode pembayaran
        const methodsWithActiveChannels = activePaymentMethods.map(method => {
          // Filter channel yang aktif
          const activeChannels = method.channels.filter(channel => channel.isActive);
          return { ...method, channels: activeChannels };
        });
        
        setPaymentMethods(methodsWithActiveChannels);
        
        if (methodsWithActiveChannels.length > 0) {
          setSelectedMethod(methodsWithActiveChannels[0].method);
        }
      } catch (err) {
        console.error("Gagal ambil metode pembayaran:", err);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Fungsi untuk menghapus item dari keranjang
  const handleRemoveItem = (itemId: string) => {
    const updatedCartItems = cartItems.filter(item => item._id !== itemId);
    const updatedTotal = updatedCartItems.reduce((sum, item) => sum + (item.hargaFinal * item.quantity), 0);
    
    // Navigate kembali dengan state yang diperbarui
    navigate(location.pathname, {
      state: { cartItems: updatedCartItems, total: updatedTotal },
      replace: true
    });
  };

  const handleProsesTransaksi = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    const invalidStock = cartItems.filter(
      (item) => isNaN(item.quantity) || item.quantity <= 0 || item.quantity > item.stok
    );
    if (invalidStock.length > 0) {
      setErrorMessage(
        invalidStock.map((i) => `${i.nama}: qty ${i.quantity} > stok ${i.stok}`).join("\n")
      );
      return;
    }

    // Validasi metode pembayaran masih aktif
    const isPaymentMethodActive = paymentMethods.some(
      method => method.method === selectedMethod && method.isActive
    );
    
    if (!isPaymentMethodActive) {
      setErrorMessage("Metode pembayaran yang dipilih tidak tersedia");
      return;
    }

    // Format metode pembayaran sesuai dengan backend
    let paymentMethod = selectedMethod;
    if (selectedChannelObject) {
      // Untuk Virtual Account, formatnya "Virtual Account (BCA)"
      // Untuk E-Wallet, formatnya "E-Wallet (shopeepay)"
      if (selectedMethod === "Virtual Account" || selectedMethod === "E-Wallet") {
        paymentMethod += ` (${selectedChannelObject.name})`;
      }
    }

    const bodyData = {
      nomor_transaksi: "TRX" + Date.now(),
      barang_dibeli: cartItems.map((item) => ({
        barang_id: item._id,
        kode_barang: item._id, // Tambahkan kode_barang
        nama_barang: item.nama,
        jumlah: item.quantity,
        harga_satuan: item.hargaFinal,
        harga_beli: item.hargaBeli || 0,
        subtotal: item.quantity * item.hargaFinal,
        gambar_url: item.gambarUrl || "",
      })),
      total_harga: total,
      metode_pembayaran: paymentMethod,
      status: "pending",
    };

    console.log("Mengirim data transaksi:", bodyData);

    setLoading(true);
    try {
      const res = await fetch("http://192.168.110.16:5000/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const responseData: TransactionApiResponse = await res.json();
      console.log("Respons dari backend:", responseData);
      
      if (!res.ok) throw new Error(responseData.message || "Gagal simpan transaksi");

      // Arahkan ke halaman proses transaksi dengan data transaksi
      navigate(`/transaksi/proses/${responseData.midtrans.transaction_id}`, {
        state: { 
          expiryTime: "", // Backend baru tidak menyediakan expiry_time
          transaksi: responseData.transaksi,
          midtrans: responseData.midtrans
        },
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan transaksi");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengekstrak nilai channel dari objek
  const getChannelValue = (channel: { name: string; logo?: string; _id: string }): string => {
    return channel.name;
  };

  // Fungsi untuk membuat key unik untuk channel
  const getChannelKey = (channel: { name: string; logo?: string; _id: string }): string => {
    return channel._id || channel.name;
  };

  // Fungsi untuk menangani pemilihan channel
  const handleChannelSelect = (channel: { name: string; logo?: string; _id: string }) => {
    setSelectedChannel(channel.name);
    setSelectedChannelObject(channel);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Proses Transaksi</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {cartItems.length} item
          </span>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-line">
            {errorMessage}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Tidak ada barang di keranjang.</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali Berbelanja
            </button>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-lg shadow mb-6">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs">Gambar</th>
                    <th className="px-6 py-3 text-left text-xs">Nama Barang</th>
                    <th className="px-6 py-3 text-left text-xs">Qty</th>
                    <th className="px-6 py-3 text-left text-xs">Harga</th>
                    <th className="px-6 py-3 text-left text-xs">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td className="px-6 py-4">
                        {item.gambarUrl ? (
                          <img 
                            src={item.gambarUrl} 
                            alt={item.nama}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{item.nama}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">
                        Rp {item.hargaFinal.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        Rp {(item.quantity * item.hargaFinal).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Hapus dari keranjang"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2} d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Metode Pembayaran</h3>
              
              {paymentMethods.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                  Tidak ada metode pembayaran yang tersedia. Silakan hubungi admin untuk mengaktifkan metode pembayaran.
                </div>
              ) : (
                <>
                  <select
                    value={selectedMethod}
                    onChange={(e) => {
                      setSelectedMethod(e.target.value);
                      setSelectedChannel("");
                      setSelectedChannelObject(null);
                    }}
                    className="w-full p-3 border rounded-md mb-3"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m._id} value={m.method}>
                        {m.method}
                      </option>
                    ))}
                  </select>

                  {paymentMethods.find((m) => m.method === selectedMethod)?.channels.length ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Pilih Channel:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {paymentMethods
                          .find((m) => m.method === selectedMethod)
                          ?.channels.map((ch) => {
                            const channelValue = getChannelValue(ch);
                            const channelKey = getChannelKey(ch);
                            const isSelected = selectedChannel === channelValue;
                            
                            return (
                              <button
                                key={channelKey}
                                onClick={() => handleChannelSelect(ch)}
                                className={`p-3 rounded-lg border flex items-center ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                              >
                                {ch.logo ? (
                                  <img 
                                    src={ch.logo} 
                                    alt={ch.name}
                                    className="w-6 h-6 mr-2 object-contain"
                                  />
                                ) : null}
                                <span>{channelValue}</span>
                              </button>
                            );
                          })}
                      </div>
                      {selectedChannel && (
                        <div className="mt-3 text-sm text-gray-500">
                          Pembayaran melalui {selectedChannel}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-gray-500">
                      Tidak ada channel yang tersedia untuk metode pembayaran ini.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg mb-6 text-white">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Kembali
              </button>
              <button
                onClick={handleProsesTransaksi}
                disabled={loading || paymentMethods.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? "Memproses..." : "Proses Transaksi"}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TransaksiPage;