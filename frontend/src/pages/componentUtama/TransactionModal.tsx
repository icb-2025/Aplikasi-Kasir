import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Wallet, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Printer,
  Home,
  History
} from "lucide-react";
import SweetAlert from "../../components/SweetAlert";
import ProsesTransaksiModal from "./proses-transaksi";

// Interface definitions
interface PaymentChannel {
  method: string;
  channels: { name: string; logo?: string; _id: string; isActive: boolean }[];
  _id: string;
  isActive: boolean;
}

interface SettingsResponse {
  payment_methods: PaymentChannel[];
  kasir_aktif?: boolean;
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

// Update interface untuk mencakup semua properti yang dibutuhkan
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

interface SettingsReceipt {
  receiptHeader?: string;
  receiptFooter?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onTransactionSuccess: (transactionData?: TransactionResponse) => void;
  transactionSuccess?: boolean;
  transactionData?: TransactionResponse;
}

// Animasi variants
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const
    }
  }
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  total,
  onTransactionSuccess,
  transactionSuccess = false,
  transactionData = null
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentChannel[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedChannelObject, setSelectedChannelObject] = useState<{ name: string; logo?: string; _id: string } | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [kasirAktif, setKasirAktif] = useState<boolean>(true);
  const [receiptSettings, setReceiptSettings] = useState<SettingsReceipt>({});
  
  // State untuk modal proses transaksi
  const [isProsesTransaksiOpen, setIsProsesTransaksiOpen] = useState(false);
  const [prosesTransaksiData, setProsesTransaksiData] = useState<{
    transaksi: TransactionResponse | null;
    midtrans: MidtransData | null;
    expiryTime?: string;
    token?: string;
  }>({
    transaksi: null,
    midtrans: null
  });

  const isCashPayment = selectedMethod.toLowerCase() === 'tunai';

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const res = await fetch("http://192.168.110.16:5000/api/admin/settings", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data: SettingsResponse = await res.json();
        
        if (data.kasir_aktif === false) {
          setKasirAktif(false);
        }
        
        const activePaymentMethods = data.payment_methods.filter(method => method.isActive);
        const methodsWithActiveChannels = activePaymentMethods.map(method => {
          const activeChannels = method.channels.filter(channel => channel.isActive);
          return { ...method, channels: activeChannels };
        });
        
        setPaymentMethods(methodsWithActiveChannels);
        
        if (methodsWithActiveChannels.length > 0) {
          setSelectedMethod(methodsWithActiveChannels[0].method);
        }
      } catch (err) {
        console.error("Gagal ambil metode pembayaran:", err);
        setErrorMessage("Gagal memuat metode pembayaran. Silakan refresh halaman.");
      }
    };
    
    const fetchReceiptSettings = async () => {
      try {
        const res = await fetch("http://192.168.110.16:5000/api/manager/settings");
        if (res.ok) {
          const data: SettingsReceipt = await res.json();
          setReceiptSettings(data);
        }
      } catch (err) {
        console.error("Gagal ambil pengaturan struk:", err);
      }
    };
    
    if (isOpen && !transactionSuccess) {
      fetchPaymentMethods();
      fetchReceiptSettings();
    }
  }, [isOpen, transactionSuccess]);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    await new Promise(resolve => setTimeout(resolve, 300));
    onTransactionSuccess();
    setRemovingItem(null);
  };

  const handleProsesTransaksi = async () => {
    if (!kasirAktif) {
      await SweetAlert.fire({
        title: 'Kasir Tidak Aktif',
        text: 'Mohon maaf, kasir sedang tidak aktif. Silakan hubungi admin.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Keranjang kosong! Silakan tambah barang terlebih dahulu.");
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

    const isPaymentMethodActive = paymentMethods.some(
      method => method.method === selectedMethod && method.isActive
    );
    
    if (!isPaymentMethodActive) {
      setErrorMessage("Metode pembayaran yang dipilih tidak tersedia");
      return;
    }

    let paymentMethod = selectedMethod;
    if (selectedChannelObject && !isCashPayment) {
      if (selectedMethod === "Virtual Account" || selectedMethod === "E-Wallet") {
        paymentMethod += ` (${selectedChannelObject.name})`;
      }
    }

    const bodyData = {
      barang_dibeli: cartItems.map((item) => ({
        barang_id: item._id,
        kode_barang: item._id,
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

    setLoading(true);
    setErrorMessage("");
    
    try {
      SweetAlert.loading("Memproses transaksi...");
      
      const token = localStorage.getItem('token');
      
      const res = await fetch("http://192.168.110.16:5000/api/transaksi", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData),
      });

      const responseData: TransactionApiResponse = await res.json();
      
      if (!res.ok) {
        SweetAlert.close();
        throw new Error(responseData.message || "Gagal simpan transaksi");
      }

      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartTotal');

      SweetAlert.close();
      
      // Simpan data transaksi untuk modal proses transaksi
      setProsesTransaksiData({
        transaksi: responseData.transaksi,
        midtrans: responseData.midtrans,
        expiryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 menit dari sekarang
        token: responseData.transaksi.order_id
      });
      
      // Buka modal proses transaksi
      setIsProsesTransaksiOpen(true);
      
      // Kirim data transaksi ke parent component
      onTransactionSuccess(responseData.transaksi);
    } catch (err: unknown) {
      SweetAlert.close();
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan transaksi");
      await SweetAlert.error(err instanceof Error ? err.message : "Terjadi kesalahan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const getChannelKey = (channel: { name: string; logo?: string; _id: string }): string => {
    return channel._id || channel.name;
  };

  const handleChannelSelect = (channel: { name: string; logo?: string; _id: string }) => {
    setSelectedChannel(channel.name);
    setSelectedChannelObject(channel);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'virtual account':
        return <CreditCard className="w-5 h-5" />;
      case 'e-wallet':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleGoToHistory = () => {
    onClose();
    // Navigasi ke halaman riwayat
    window.location.href = '/pesanan';
  };

  const formatCurrency = (value: number | undefined | null): string => {
    if (!value || isNaN(value)) return "Rp 0";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Proses Transaksi */}
          <ProsesTransaksiModal
            isOpen={isProsesTransaksiOpen}
            onClose={() => {
              setIsProsesTransaksiOpen(false);
              // Setelah modal proses transaksi ditutup, tampilkan struk jika pembayaran berhasil
              if (transactionSuccess) {
                // Tetap tampilkan struk
              } else {
                // Jika pembayaran belum berhasil, kembali ke modal transaksi utama
                onClose();
              }
            }}
            transaksi={prosesTransaksiData.transaksi}
            midtrans={prosesTransaksiData.midtrans}
            expiryTime={prosesTransaksiData.expiryTime}
            token={prosesTransaksiData.token}
          />
          
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {transactionSuccess && transactionData ? (
                // Tampilan Struk setelah transaksi berhasil
                <div className="flex-1 overflow-y-auto">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">Transaksi Berhasil</h1>
                          <p className="text-amber-100 text-sm">Terima kasih telah melakukan pembelian</p>
                        </div>
                      </div>
                      <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 print:w-full print:shadow-none print:mt-0">
                      {/* HEADER STRUK */}
                      {receiptSettings.receiptHeader && (
                        <pre className="text-center font-bold mb-4 whitespace-pre-line">
                          {receiptSettings.receiptHeader}
                        </pre>
                      )}

                      <h2 className="text-xl font-bold text-center mb-2">STRUK PEMBELIAN</h2>
                      <p className="text-center text-sm text-gray-600 mb-4">
                        #{transactionData.order_id || transactionData._id || "-"}
                      </p>

                      <div className="border-t border-b py-2 mb-4 text-sm">
                        <p>
                          <span className="font-semibold">Tanggal:</span>{" "}
                          {formatDate(transactionData.createdAt)}
                        </p>
                        <p>
                          <span className="font-semibold">Metode:</span>{" "}
                          {transactionData.metode_pembayaran || "-"}
                        </p>
                        <p>
                          <span className="font-semibold">Kasir:</span>{" "}
                          {transactionData.kasir_id || "-"}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Selesai
                          </span>
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
                          {transactionData.barang_dibeli && transactionData.barang_dibeli.length > 0 ? (
                            transactionData.barang_dibeli.map((item: BarangDibeli, idx: number) => (
                              <tr key={idx} className="border-b">
                                <td className="py-1">{item.nama_barang}</td>
                                <td className="py-1 text-center">{item.jumlah}</td>
                                <td className="py-1 text-right">
                                  {formatCurrency(item.harga_satuan)}
                                </td>
                                <td className="py-1 text-right">
                                  {formatCurrency(item.subtotal)}
                                </td>
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
                        <span className="text-green-600">
                          {formatCurrency(transactionData.total_harga)}
                        </span>
                      </div>

                      {/* FOOTER STRUK */}
                      {receiptSettings.receiptFooter && (
                        <pre className="text-center text-sm text-gray-600 mt-4 whitespace-pre-line">
                          {receiptSettings.receiptFooter}
                        </pre>
                      )}

                      <div className="flex gap-3 mt-6 print:hidden">
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
                        >
                          <Home className="w-4 h-4" />
                          Beranda
                        </button>
                        <button
                          onClick={handleGoToHistory}
                          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          Riwayat
                        </button>
                        <button
                          onClick={handlePrintReceipt}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          Cetak
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Tampilan form transaksi
                <>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">Proses Transaksi</h1>
                          <p className="text-amber-100 text-sm">Selesaikan pembayaran Anda</p>
                        </div>
                      </div>
                      <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="text-5xl mb-4">🛒</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Keranjang Kosong</h3>
                        <p className="text-gray-500 mb-6">Tambahkan produk untuk memulai transaksi</p>
                        <button
                          onClick={onClose}
                          className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                        >
                          Kembali ke Beranda
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {errorMessage && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <div className="flex items-center">
                              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                              <div className="text-red-700 whitespace-pre-line">{errorMessage}</div>
                            </div>
                          </div>
                        )}

                        <div>
                          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-amber-500" />
                            Daftar Belanja
                          </h2>
                          <div className="bg-gray-50 rounded-xl p-1 max-h-60 overflow-y-auto">
                            {cartItems.map((item) => (
                              <div
                                key={item._id}
                                className={`bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-100 transition-all duration-300 ${
                                  removingItem === item._id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {item.gambarUrl ? (
                                      <img 
                                        src={item.gambarUrl} 
                                        alt={item.nama}
                                        className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-grow">
                                    <h3 className="font-medium text-gray-800 text-sm">{item.nama}</h3>
                                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                                      <span>Qty: {item.quantity}</span>
                                      <span>•</span>
                                      <span>Rp {item.hargaFinal.toLocaleString("id-ID")}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                      <p className="font-bold text-gray-800 text-sm">
                                        Rp {(item.quantity * item.hargaFinal).toLocaleString("id-ID")}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItem(item._id)}
                                      disabled={removingItem === item._id}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                      title="Hapus dari keranjang"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-amber-500" />
                            Metode Pembayaran
                          </h2>
                          
                          {paymentMethods.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <p className="text-yellow-700 font-medium text-sm">
                                Tidak ada metode pembayaran yang tersedia.
                              </p>
                              <p className="text-yellow-600 text-xs mt-1">
                                Silakan hubungi admin untuk mengaktifkan metode pembayaran.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Pilih Metode Pembayaran
                                </label>
                                <select
                                  value={selectedMethod}
                                  onChange={(e) => {
                                    setSelectedMethod(e.target.value);
                                    setSelectedChannel("");
                                    setSelectedChannelObject(null);
                                  }}
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 appearance-none bg-white"
                                >
                                  {paymentMethods.map((m) => (
                                    <option key={m._id} value={m.method}>
                                      {m.method}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {paymentMethods.find((m) => m.method === selectedMethod)?.channels.length && !isCashPayment ? (
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Pilih Channel Pembayaran
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {paymentMethods
                                      .find((m) => m.method === selectedMethod)
                                      ?.channels.map((ch) => {
                                        const channelKey = getChannelKey(ch);
                                        const isSelected = selectedChannel === ch.name;
                                        
                                        return (
                                          <button
                                            key={channelKey}
                                            onClick={() => handleChannelSelect(ch)}
                                            className={`p-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                                              isSelected
                                                ? "border-amber-500 bg-amber-50 shadow-sm"
                                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                            }`}
                                          >
                                            {ch.logo ? (
                                              <img 
                                                src={ch.logo} 
                                                alt={ch.name}
                                                className="w-6 h-6 object-contain"
                                              />
                                            ) : (
                                              getPaymentMethodIcon(selectedMethod)
                                            )}
                                            <span className={`text-sm font-medium ${
                                              isSelected ? "text-amber-700" : "text-gray-700"
                                            }`}>
                                              {ch.name}
                                            </span>
                                            {isSelected && (
                                              <CheckCircle className="w-4 h-4 text-amber-500 ml-auto" />
                                            )}
                                          </button>
                                        );
                                      })}
                                  </div>
                                  
                                  {selectedChannel && (
                                    <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                      <p className="text-xs text-amber-700 font-medium">
                                        ✅ Pembayaran melalui <strong>{selectedChannel}</strong>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : isCashPayment ? (
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                  <div className="flex items-center space-x-2">
                                    <Wallet className="w-5 h-5 text-amber-500" />
                                    <p className="text-amber-700 font-medium text-sm">
                                      ✅ Pembayaran tunai dipilih
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                  <p className="text-gray-600 text-sm">
                                    Tidak ada channel yang tersedia untuk metode pembayaran ini.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-xl shadow-lg text-white">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-amber-100 text-xs">Total Pembayaran</p>
                              <h3 className="text-xl font-bold">Rp {total.toLocaleString("id-ID")}</h3>
                            </div>
                            <Wallet className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        Batal
                      </button>
                      
                      <button
                        onClick={handleProsesTransaksi}
                        disabled={loading || cartItems.length === 0 || paymentMethods.length === 0 || (!isCashPayment && !selectedChannel)}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Proses Transaksi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;