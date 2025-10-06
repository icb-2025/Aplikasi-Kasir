import { useContext, useCallback, useEffect, useState } from 'react';
import type { Barang } from "../admin/stok-barang";
import MainLayout from "../components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customStyles } from "./CssHalamanUtama";
import Sidebar from "./componentUtama/Sidebar";
import ProductGrid from "./componentUtama/ProductGrid";
import CurrentOrder from "./componentUtama/CurrentOrder";
import TransactionModal from "./componentUtama/TransactionModal";
import AuthContext from "./../auth/context/AuthContext";

interface DashboardProps {
  dataBarang: Barang[];
}

export interface CartItem extends Barang {
  quantity: number;
  jumlah?: number;
}

// Interface untuk item dari API cart
interface CartItemResponse {
  barangId: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
  image: string; // Tambahkan field image
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
  nomor_transaksi: string; // Tambahkan properti ini
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

const API_BASE_URL = 'http://192.168.110.16:5000';

const Dashboard = ({ dataBarang }: DashboardProps) => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  
  const { user } = authContext;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Barang | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionResponse | undefined>(undefined);
  const [isCartLoading, setIsCartLoading] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const categories = [
    { id: "Semua", name: "Semua", icon: "🍔" },
    { id: "Makanan", name: "Makanan", icon: "🍕" },
    { id: "Minuman", name: "Minuman", icon: "🥤" },
    { id: "Cemilan", name: "Cemilan", icon: "🍿" },
    { id: "Signature", name: "Signature", icon: "⭐" },
  ];
  
  // API Functions
  const fetchCart = useCallback(async (): Promise<CartItem[]> => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const data = await response.json();
      return data.items.map((item: CartItemResponse) => ({
        ...item,
        _id: item.barangId,
        nama: item.name,
        hargaJual: item.price,
        quantity: item.quantity,
        gambarUrl: item.image // Tambahkan pemetaan field image ke gambarUrl
      }));
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }, []);
  
  const addItemToCart = useCallback(async (barangId: string, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ barangId, quantity })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add item to cart');
    }
    
    return response.json();
  }, []);
  
  const removeItemFromCart = useCallback(async (barangId: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${API_BASE_URL}/api/cart/${barangId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to remove item from cart');
    
    return response.json();
  }, []);
  
  const updateItemQuantity = useCallback(async (barangId: string, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    // First remove the item
    await removeItemFromCart(barangId);
    
    // Then add with new quantity
    return addItemToCart(barangId, quantity);
  }, [addItemToCart, removeItemFromCart]);
  
  const clearCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to clear cart');
    
    return response.json();
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Load cart when user is available
  useEffect(() => {
    if (user) {
      const loadCart = async () => {
        setIsCartLoading(true);
        try {
          const cartData = await fetchCart();
          setCart(cartData);
        } catch (error) {
          console.error('Failed to load cart:', error);
          toast.error('Gagal memuat keranjang');
        } finally {
          setIsCartLoading(false);
        }
      };
      
      loadCart();
    } else {
      setCart([]);
    }
  }, [user, fetchCart]);
  
  const filteredBarang = dataBarang.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || item.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const checkLoginAndProceed = (callback: () => void) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    callback();
  };

  const addToCart = async (product: Barang, qty: number = 1) => {
    checkLoginAndProceed(async () => {
      if (qty > product.stok) {
        toast.error(`Stok tidak mencukupi! Stok tersedia: ${product.stok}`, {
          position: "top-right", autoClose: 3000, hideProgressBar: false,
          closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
        });
        return;
      }
      
      setIsAnimating(true);
      try {
        // Check if item already in cart
        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
          const newQty = existingItem.quantity + qty;
          if (newQty > product.stok) {
            toast.error(`Jumlah melebihi stok! Stok tersedia: ${product.stok}`, {
              position: "top-right", autoClose: 3000, hideProgressBar: false,
              closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
            });
            setIsAnimating(false);
            return;
          }
          
          // Update quantity
          await updateItemQuantity(product._id, newQty);
          const updatedCart = await fetchCart();
          setCart(updatedCart);
          toast.success(`${product.nama} diperbarui di keranjang`, {
            position: "top-right", autoClose: 2000, hideProgressBar: false,
            closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
          });
        } else {
          // Add new item
          await addItemToCart(product._id, qty);
          const updatedCart = await fetchCart();
          setCart(updatedCart);
          toast.success(`${product.nama} ditambahkan ke keranjang`, {
            position: "top-right", autoClose: 2000, hideProgressBar: false,
            closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
          });
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Gagal menambah item ke keranjang');
      } finally {
        setSelectedProduct(null);
        setQuantity(1);
        setIsAnimating(false);
      }
    });
  };

  const removeFromCart = async (productId: string) => {
    try {
      await removeItemFromCart(productId);
      const updatedCart = await fetchCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Gagal menghapus item dari keranjang');
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    const product = cart.find(item => item._id === productId);
    if (!product) return;
    
    if (newQuantity > product.stok) {
      toast.error(`Jumlah melebihi stok! Stok tersedia: ${product.stok}`, {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
      });
      return;
    }
    
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    try {
      await updateItemQuantity(productId, newQuantity);
      const updatedCart = await fetchCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Gagal memperbarui kuantitas');
    }
  };

  const handleBuyNow = async (product: Barang, qty: number = 1) => {
    checkLoginAndProceed(async () => {
      if (qty > product.stok) {
        toast.error(`Stok tidak mencukupi! Stok tersedia: ${product.stok}`, {
          position: "top-right", autoClose: 3000, hideProgressBar: false,
          closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
        });
        return;
      }
      
      try {
        // Add item to cart
        await addItemToCart(product._id, qty);
        const updatedCart = await fetchCart();
        setCart(updatedCart);
        
        // Open transaction modal
        setIsTransactionModalOpen(true);
      } catch (error) {
        console.error('Error adding to cart for buy now:', error);
        toast.error('Gagal menambah item ke keranjang');
      }
    });
  };

  const handleCheckout = () => {
    checkLoginAndProceed(() => {
      setIsTransactionModalOpen(true);
    });
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartValue = cart.reduce((total, item) => total + (item.quantity * (item.hargaFinal || item.hargaJual)), 0);

  const handleTransactionSuccess = async (transactionData?: TransactionResponse) => {
    try {
      await clearCart();
      setCart([]);
      
      // Simpan data transaksi untuk ditampilkan di struk
      if (transactionData) {
        setTransactionData(transactionData);
        setTransactionSuccess(true);
        
        // Simpan transaksi ke riwayat pengguna
        const saveToHistory = async () => {
          try {
            const token = localStorage.getItem('token');
            await fetch("http://192.168.110.16:5000/api/users/history", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                transaksi_id: transactionData._id,
                order_id: transactionData.order_id,
                tanggal_transaksi: transactionData.tanggal_transaksi,
                barang_dibeli: transactionData.barang_dibeli,
                total_harga: transactionData.total_harga,
                metode_pembayaran: transactionData.metode_pembayaran,
                status: transactionData.status
              }),
            });
            
            console.log('Transaksi berhasil disimpan ke riwayat');
          } catch (err) {
            console.error("Gagal menyimpan transaksi ke riwayat:", err);
          }
        };
        
        saveToHistory();
      }
    } catch (error) {
      console.error('Error clearing cart after transaction:', error);
      toast.error('Gagal mengosongkan keranjang setelah transaksi');
    }
  };

  const goToLogin = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  const handleResetTransaction = () => {
    setTransactionSuccess(false);
    setTransactionData(undefined);
    setIsTransactionModalOpen(false);
  };

  return (
    <MainLayout>
      <ToastContainer />
      
      {/* Top Navigation */}
      <div className="bg-white shadow-md rounded-b-xl">
        <div className="max-w-10x4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="md:hidden mr-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-amber-500 p-2 rounded-xl shadow-md">
                  <span className="text-white text-xl font-bold">K+</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">KasirPlus</h1>
                  <p className="text-xs text-gray-500">Point of Sale System</p>
                </div>
              </div>
              
              <div className="hidden md:ml-10 md:flex md:space-x-1">
                {categories.map((category) => (
                  <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="ml-3 flex items-center">
                <div className="relative max-w-md w-full">
                  <input type="text" placeholder="Cari makanan favoritmu..."
                    className="w-full py-2 px-4 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex items-center">
                <button onClick={() => handleCheckout()} className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:hidden px-4 pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)] mt-4 gap-4">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 bg-white rounded-2xl shadow-md p-4 overflow-y-auto">
          <ProductGrid 
            products={filteredBarang}
            isLoading={isLoading}
            onAddToCart={addToCart}
            onBuyNow={handleBuyNow}
          />
        </div>
        
        <div className="w-80 bg-white rounded-2xl shadow-md p-4 flex flex-col">
          <CurrentOrder 
            cartItems={cart}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={handleCheckout}
            totalItems={totalCartItems}
            totalValue={totalCartValue}
            isLoading={isCartLoading}
          />
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                {selectedProduct.gambarUrl ? (
                  <img src={selectedProduct.gambarUrl} alt={selectedProduct.nama} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="text-3xl">🍔</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{selectedProduct.nama}</h3>
                <p className="text-gray-500">{selectedProduct.kategori}</p>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  Rp {(selectedProduct.hargaFinal || selectedProduct.hargaJual).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Stok tersedia:</span>
                <span className={`font-bold ${selectedProduct.stok > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedProduct.stok} unit
                </span>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Jumlah:</label>
              <div className="flex items-center justify-center space-x-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  className="w-12 h-12 bg-amber-100 rounded-xl hover:bg-amber-200 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center text-xl font-bold text-amber-700">
                  -
                </button>
                <div className="w-20 text-center">
                  <input type="number" min={1} max={selectedProduct.stok} value={quantity}
                    onChange={e => setQuantity(Math.max(1, Math.min(selectedProduct.stok, Number(e.target.value))))}
                    className="w-full text-2xl font-bold text-center bg-transparent border-0 focus:outline-none focus:ring-0" />
                </div>
                <button onClick={() => setQuantity(q => Math.min(selectedProduct.stok, q + 1))} 
                  className="w-12 h-12 bg-amber-100 rounded-xl hover:bg-amber-200 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center text-xl font-bold text-amber-700">
                  +
                </button>
              </div>
              <div className="text-center mt-3 text-sm text-gray-500">
                Total: <span className="font-semibold text-amber-600">
                  Rp {(quantity * (selectedProduct.hargaFinal || selectedProduct.hargaJual)).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button onClick={() => setSelectedProduct(null)} 
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95 font-medium">
                Batal
              </button>
              <button onClick={() => addToCart(selectedProduct, quantity)} 
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-[0.98] font-medium flex items-center justify-center gap-2 shadow-lg"
                disabled={isAnimating}>
                {isAnimating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Tambah ke Keranjang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleResetTransaction}
        cartItems={cart.map(item => ({
          ...item,
          hargaFinal: item.hargaFinal || item.hargaJual,
          jumlah: item.quantity
        }))}
        total={totalCartValue}
        onTransactionSuccess={handleTransactionSuccess}
        transactionSuccess={transactionSuccess}
        transactionData={transactionData}
      />

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Login Diperlukan</h3>
              <p className="text-gray-600">Silakan login untuk menambah produk ke keranjang atau melakukan pembelian.</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button onClick={goToLogin} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md">
                Login Sekarang
              </button>
              <button onClick={() => setShowLoginModal(false)} className="w-full py-3 px-4 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{customStyles}</style>
    </MainLayout>
  );
};

export default Dashboard;