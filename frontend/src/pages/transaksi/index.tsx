// src/pages/transaksi/index.tsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import SweetAlert from "../../components/SweetAlert";

// Perbarui interface PaymentChannel untuk lebih spesifik
interface PaymentChannel {
  method: string;
  channels: { name: string; logo?: string; _id: string; isActive: boolean }[];
  _id: string;
  isActive: boolean;
}

interface SettingsResponse {
  payment_methods: PaymentChannel[];
  kasir_aktif?: boolean; // Tambahkan properti kasir_aktif
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

// Animasi variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3
    }
  }
};

const TransaksiPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Coba ambil data dari state dulu, jika tidak ada ambil dari localStorage
  const initialState = (location.state as { cartItems: CartItem[]; total: number }) || {};
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (initialState.cartItems && initialState.cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(initialState.cartItems));
      return initialState.cartItems;
    }
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  
  const [total, setTotal] = useState<number>(() => {
    if (initialState.total) {
      localStorage.setItem('cartTotal', initialState.total.toString());
      return initialState.total;
    }
    const savedTotal = localStorage.getItem('cartTotal');
    return savedTotal ? parseInt(savedTotal, 10) : 0;
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentChannel[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedChannelObject, setSelectedChannelObject] = useState<{ name: string; logo?: string; _id: string } | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [kasirAktif, setKasirAktif] = useState<boolean>(true);

  // Fungsi untuk mengecek apakah metode pembayaran adalah tunai
  const isCashPayment = selectedMethod.toLowerCase() === 'tunai';

  // Simpan cartItems dan total ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartTotal', total.toString());
  }, [cartItems, total]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch("http://192.168.110.16:5000/api/admin/settings");
        const data: SettingsResponse = await res.json();
        
        // Periksa status kasir
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
    fetchPaymentMethods();
  }, []);

  // Fungsi untuk menghapus item dari keranjang dengan animasi
  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    
    // Tunggu sebentar untuk animasi
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedCartItems = cartItems.filter(item => item._id !== itemId);
    const updatedTotal = updatedCartItems.reduce((sum, item) => sum + (item.hargaFinal * item.quantity), 0);
    
    setCartItems(updatedCartItems);
    setTotal(updatedTotal);
    setRemovingItem(null);
    
    navigate(location.pathname, {
      state: { cartItems: updatedCartItems, total: updatedTotal },
      replace: true
    });
  };

  const handleProsesTransaksi = async () => {
    // Periksa apakah kasir aktif
    if (!kasirAktif) {
      await SweetAlert.fire({
        title: 'Kasir Tidak Aktif',
        text: 'Mohon maaf, kasir sedang tidak aktif. Silakan hubungi admin.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
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

    const storedUser = localStorage.getItem('user');
    let kasirId: string | null = null;
    try {
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      kasirId = parsed?._id || parsed?.id || null;
    } catch {
      kasirId = null;
    }

    const bodyData: Record<string, unknown> = {
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

    if (kasirId) {
      (bodyData as Record<string, unknown>).kasir_id = kasirId;
    }

    console.log("Mengirim data transaksi:", bodyData);

    setLoading(true);
    setErrorMessage("");
    
    try {
      // Tampilkan loading SweetAlert
      SweetAlert.loading("Memproses transaksi...");
      
      const res = await fetch("http://192.168.110.16:5000/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const responseData: TransactionApiResponse = await res.json();
      console.log("Respons dari backend:", responseData);
      
      if (!res.ok) {
        SweetAlert.close();
        throw new Error(responseData.message || "Gagal simpan transaksi");
      }

      // Hapus keranjang dari localStorage setelah transaksi berhasil
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartTotal');

      // Tampilkan notifikasi sukses
      SweetAlert.close();
      await SweetAlert.success("Transaksi berhasil diproses!");

      // Arahkan ke halaman proses transaksi dengan data transaksi
      navigate(`/transaksi/proses/${responseData.midtrans.transaction_id}`, {
        state: { 
          expiryTime: "",
          transaksi: responseData.transaksi,
          midtrans: responseData.midtrans
        },
      });
    } catch (err: unknown) {
      SweetAlert.close();
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan transaksi");
      await SweetAlert.error(err instanceof Error ? err.message : "Terjadi kesalahan transaksi");
    } finally {
      setLoading(false);
    }
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

  // Icon untuk metode pembayaran
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Proses Transaksi</h1>
                  <p className="text-blue-100 mt-1">Selesaikan pembayaran Anda dengan mudah</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <span className="font-semibold">{cartItems.length} item</span>
              </motion.div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 mx-8 mt-6 rounded-r-lg"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div className="text-red-700 whitespace-pre-line">{errorMessage}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-8">
            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center mb-8"
                >
                  <img 
                    src="/images/notransaksi.jpg" 
                    alt="Tidak ada transaksi" 
                    className="max-w-sm h-auto rounded-2xl shadow-lg"
                  />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Keranjang Kosong</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Belum ada barang di keranjang belanja Anda. Yuk mulai berbelanja!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Mulai Berbelanja
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Daftar Barang */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <ShoppingCart className="w-6 h-6 mr-2 text-blue-500" />
                    Daftar Belanja
                  </h2>
                  <div className="bg-gray-50 rounded-2xl p-1">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item._id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className={`bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 transition-all duration-300 ${
                            removingItem === item._id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Gambar Barang */}
                            <div className="flex-shrink-0">
                              {item.gambarUrl ? (
                                <motion.img 
                                  whileHover={{ scale: 1.1 }}
                                  src={item.gambarUrl} 
                                  alt={item.nama}
                                  className="w-16 h-16 object-cover rounded-xl shadow-sm"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                                  <ShoppingCart className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Detail Barang */}
                            <div className="flex-grow">
                              <h3 className="font-semibold text-gray-800">{item.nama}</h3>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <span>•</span>
                                <span>Rp {item.hargaFinal.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                            
                            {/* Subtotal & Aksi */}
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-bold text-gray-800">
                                  Rp {(item.quantity * item.hargaFinal).toLocaleString("id-ID")}
                                </p>
                                <p className="text-sm text-gray-500">Subtotal</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveItem(item._id)}
                                disabled={removingItem === item._id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Hapus dari keranjang"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Metode Pembayaran */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="w-6 h-6 mr-2 text-green-500" />
                    Metode Pembayaran
                  </h2>
                  
                  {paymentMethods.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center"
                    >
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <p className="text-yellow-700 font-medium">
                        Tidak ada metode pembayaran yang tersedia.
                      </p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Silakan hubungi admin untuk mengaktifkan metode pembayaran.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {/* Pilih Metode */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Pilih Metode Pembayaran
                        </label>
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          value={selectedMethod}
                          onChange={(e) => {
                            setSelectedMethod(e.target.value);
                            setSelectedChannel("");
                            setSelectedChannelObject(null);
                          }}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white"
                        >
                          {paymentMethods.map((m) => (
                            <option key={m._id} value={m.method}>
                              {m.method}
                            </option>
                          ))}
                        </motion.select>
                      </div>

                      {/* Pilih Channel */}
                      {paymentMethods.find((m) => m.method === selectedMethod)?.channels.length && !isCashPayment ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-4">
                            Pilih Channel Pembayaran
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {paymentMethods
                              .find((m) => m.method === selectedMethod)
                              ?.channels.map((ch) => {
                                const channelKey = getChannelKey(ch);
                                const isSelected = selectedChannel === ch.name;
                                
                                return (
                                  <motion.button
                                    key={channelKey}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChannelSelect(ch)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                    }`}
                                  >
                                    {ch.logo ? (
                                      <img 
                                        src={ch.logo} 
                                        alt={ch.name}
                                        className="w-8 h-8 object-contain"
                                      />
                                    ) : (
                                      getPaymentMethodIcon(selectedMethod)
                                    )}
                                    <span className={`font-medium ${
                                      isSelected ? "text-blue-700" : "text-gray-700"
                                    }`}>
                                      {ch.name}
                                    </span>
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto"
                                      >
                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                      </motion.div>
                                    )}
                                  </motion.button>
                                );
                              })}
                          </div>
                          
                          {selectedChannel && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <p className="text-sm text-blue-700 font-medium">
                                ✅ Pembayaran melalui <strong>{selectedChannel}</strong>
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      ) : isCashPayment ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center space-x-3">
                            <Wallet className="w-6 h-6 text-green-500" />
                            <p className="text-green-700 font-medium">
                              ✅ Pembayaran tunai dipilih
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-gray-50 rounded-2xl p-6 text-center"
                        >
                          <p className="text-gray-600">
                            Tidak ada channel yang tersedia untuk metode pembayaran ini.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Total & Aksi */}
                <motion.div variants={itemVariants}>
                  {/* Total */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg mb-6 text-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-100 text-sm">Total Pembayaran</p>
                        <h3 className="text-2xl font-bold">Rp {total.toLocaleString("id-ID")}</h3>
                      </div>
                      <motion.div
                        animate={{ 
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                      >
                        <Wallet className="w-8 h-8" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Tombol Aksi */}
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(-1)}
                      className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Kembali</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleProsesTransaksi}
                      disabled={loading || paymentMethods.length === 0 || (!isCashPayment && !selectedChannel)}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Proses Transaksi</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default TransaksiPage;