import { useContext, useCallback, useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
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
import ProsesTransaksiModal from "./componentUtama/proses-transaksi";
import AuthContext from "./../auth/context/AuthContext";

interface DashboardProps {
  dataBarang: Barang[];
}

export interface CartItem extends Barang {
  quantity: number;
  jumlah?: number;
}

interface CartItemResponse {
  barangId: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
  image: string;
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
  transaction_id?: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  qr_string?: string;
  permata_va_number?: string;
  va_number?: string;
  actions?: Array<{
    name: string;
    method: string;
    url: string;
  }>;
}

interface TransactionStatusData {
  cartItems?: CartItem[];
  total?: number;
  transactionData?: TransactionResponse | null;
  midtransData?: MidtransData | null;
  expiryTime?: string | null;
  token?: string | null;
  paymentMethod?: string | null;
}

const API_BASE_URL = 'http://192.168.110.16:5000';

interface BarangInput {
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
}

const normalizeBarangData = (barang: BarangInput): Barang => {
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
    status: barang.status || 'aman'
  };
};

const Dashboard = ({ dataBarang }: DashboardProps) => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const socketRef = useRef<Socket | null>(null);
  
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  
  const { user } = authContext;
  
  const toastRef = useRef<{[key: string]: string | number}>({});
  const lastToastTime = useRef<{[key: string]: number}>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Barang | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isProsesTransaksiModalOpen, setIsProsesTransaksiModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionResponse | undefined>(undefined);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [barangList, setBarangList] = useState<Barang[]>(dataBarang.map(normalizeBarangData));
  
  const [prosesTransaksiData, setProsesTransaksiData] = useState<{
    transaksi: TransactionResponse | null;
    midtrans: MidtransData | null;
    expiryTime?: string;
    token?: string;
  }>({
    transaksi: null,
    midtrans: null
  });
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', id: string = 'default') => {
    const now = Date.now();
    const lastTime = lastToastTime.current[id] || 0;
    
    if (now - lastTime < 1500) {
      if (toastRef.current[id]) {
        toast.update(toastRef.current[id], {
          render: message,
          type,
          autoClose: 1500,
        });
        return;
      }
    }
    
    const toastId = toast[type](message, {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
    });
    
    toastRef.current[id] = toastId;
    lastToastTime.current[id] = now;
    
    setTimeout(() => {
      delete toastRef.current[id];
    }, 2000);
  }, []);
  
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
  
  useEffect(() => {
    setBarangList(dataBarang.map(normalizeBarangData));
  }, [dataBarang]);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL);
    
    socketRef.current.on('barang:created', (newBarang: BarangInput) => {
      const normalizedBarang = normalizeBarangData(newBarang);
      setBarangList(prevList => [...prevList, normalizedBarang]);
    });

    socketRef.current.on('barang:updated', (updatedBarang: BarangInput) => {
      const normalizedBarang = normalizeBarangData(updatedBarang);
      setBarangList(prevList => 
        prevList.map(item => item._id === normalizedBarang._id ? normalizedBarang : item)
      );
    });

    socketRef.current.on('barang:deleted', (payload: { id: string; nama?: string }) => {
      const { id } = payload;
      setBarangList(prevList => prevList.filter(item => item._id !== id));
      setCart(prevCart => prevCart.filter(item => item._id !== id));
    });

    socketRef.current.on('stockUpdated', (data: { id: string; stok: number }) => {
      setBarangList(prevList => 
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
      
      setCart(prevCart => 
        prevCart.map(item => {
          if (item._id === data.id) {
            if (data.stok <= 0) {
              showToast(`${item.nama} has run out of stock. Removed from cart.`, 'warning', `stock-${item._id}`);
              return { ...item, quantity: 0 };
            }
            if (item.quantity > data.stok) {
              showToast(`Stock of ${item.nama} has decreased. Quantity in cart adjusted.`, 'warning', `stock-${item._id}`);
              return { ...item, quantity: data.stok };
            }
            return { ...item, stok: data.stok };
          }
          return item;
        }).filter(item => item.quantity > 0)
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('barang:created');
        socketRef.current.off('barang:updated');
        socketRef.current.off('barang:deleted');
        socketRef.current.off('stockUpdated');
        socketRef.current.disconnect();
      }
    };
  }, [showToast]);
  
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
        gambarUrl: item.image
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
    
    const response = await fetch(`${API_BASE_URL}/api/cart/${barangId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });
    
    if (!response.ok) {
      await removeItemFromCart(barangId);
      return addItemToCart(barangId, quantity);
    }
    
    return response.json();
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
  
  useEffect(() => {
    if (user) {
      const loadCart = async () => {
        setIsCartLoading(true);
        try {
          const cartData = await fetchCart();
          setCart(cartData);
        } catch (error) {
          console.error('Failed to load cart:', error);
          showToast('Failed to load cart', 'error', 'load-cart');
        } finally {
          setIsCartLoading(false);
        }
      };
      
      loadCart();
    } else {
      setCart([]);
    }
  }, [user, fetchCart, showToast]);

  const saveTransactionStatus = useCallback((status: 'pending' | 'success' | 'expired' | 'cancelled', data?: TransactionStatusData) => {
    const transactionData = {
      status,
      data: {
        ...data,
        transactionData: data?.transactionData || null,
        midtransData: data?.midtransData || null,
        expiryTime: data?.expiryTime || null,
        token: data?.token || null,
        paymentMethod: data?.paymentMethod || null
      },
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('transactionStatus', JSON.stringify(transactionData));
  }, []);

  const clearTransactionStatus = useCallback(() => {
    localStorage.removeItem('transactionStatus');
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('transaksi_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    const savedTransactionStatus = localStorage.getItem('transactionStatus');
    
    if (savedTransactionStatus) {
      try {
        const { status, data, timestamp } = JSON.parse(savedTransactionStatus) as {
          status: 'pending' | 'success' | 'expired' | 'cancelled';
          data: TransactionStatusData;
          timestamp: string;
        };
        
        const transactionTime = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - transactionTime.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
          if (status === 'pending') {
            const verifyTransaction = async () => {
              try {
                if (data.transactionData && data.midtransData) {
                  setProsesTransaksiData({
                    transaksi: data.transactionData,
                    midtrans: data.midtrans,
                    expiryTime: data.expiryTime || undefined,
                    token: data.token || undefined
                  });
                  setIsProsesTransaksiModalOpen(true);
                  
                  showToast('Melanjutkan proses pembayaran', 'info', 'continue-payment');
                  return;
                }
                
                if (data.cartItems && data.total !== undefined) {
                  setCart(data.cartItems);
                  setIsTransactionModalOpen(true);
                  
                  showToast('Melanjutkan transaksi tertunda', 'info', 'continue-transaction');
                  return;
                }
                
                clearTransactionStatus();
              } catch (error) {
                console.error('Error verifying transaction status:', error);
                clearTransactionStatus();
              }
            };
            
            verifyTransaction();
          }
        } else {
          clearTransactionStatus();
        }
      } catch (error) {
        console.error('Error parsing saved transaction status:', error);
        clearTransactionStatus();
      }
    }
  }, [clearTransactionStatus, showToast]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (localStorage.getItem('transactionStatus')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  const filteredBarang = barangList.filter(item => {
    if (!item) return false;
    
    const matchesSearch = 
      (item.nama && item.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.kode && item.kode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.kategori && item.kategori.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Semua" || 
      (item.kategori && item.kategori === selectedCategory);
    
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
      const currentProduct = barangList.find(item => item._id === product._id);
      const currentStock = currentProduct ? currentProduct.stok : product.stok;
      
      if (qty > currentStock) {
        showToast(`Insufficient stock! Available stock: ${currentStock}`, 'error', `stock-${product._id}`);
        return;
      }
      
      setIsAnimating(true);
      try {
        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
          const newQty = existingItem.quantity + qty;
          if (newQty > currentStock) {
            showToast(`Quantity exceeds stock! Available stock: ${currentStock}`, 'error', `stock-${product._id}`);
            setIsAnimating(false);
            return;
          }
          
          await updateItemQuantity(product._id, newQty);
          const updatedCart = await fetchCart();
          setCart(updatedCart);
          showToast(`${product.nama} updated in cart`, 'success', `cart-${product._id}`);
        } else {
          await addItemToCart(product._id, qty);
          const updatedCart = await fetchCart();
          setCart(updatedCart);
          showToast(`${product.nama} added to cart`, 'success', `cart-${product._id}`);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart', 'error', 'cart-error');
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
      showToast('Failed to remove item from cart', 'error', 'remove-error');
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    const product = cart.find(item => item._id === productId);
    if (!product) return;
    
    const currentProduct = barangList.find(item => item._id === productId);
    const currentStock = currentProduct ? currentProduct.stok : product.stok;
    
    if (newQuantity > currentStock) {
      showToast(`Quantity exceeds stock! Available stock: ${currentStock}`, 'error', `stock-${productId}`);
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
      showToast('Failed to update quantity', 'error', 'update-error');
    }
  };

  const handleBuyNow = async (product: Barang, qty: number = 1) => {
    checkLoginAndProceed(async () => {
      const currentProduct = barangList.find(item => item._id === product._id);
      const currentStock = currentProduct ? currentProduct.stok : product.stok;
      
      if (qty > currentStock) {
        showToast(`Insufficient stock! Available stock: ${currentStock}`, 'error', `stock-${product._id}`);
        return;
      }
      
      try {
        await addItemToCart(product._id, qty);
        const updatedCart = await fetchCart();
        setCart(updatedCart);
        
        saveTransactionStatus('pending', {
          cartItems: updatedCart,
          total: updatedCart.reduce((total, item) => total + (item.quantity * (item.hargaFinal || item.hargaJual)), 0)
        });
        
        setIsTransactionModalOpen(true);
      } catch (error) {
        console.error('Error adding to cart for buy now:', error);
        showToast('Failed to add item to cart', 'error', 'buy-now-error');
      }
    });
  };

  const handleCheckout = () => {
    checkLoginAndProceed(() => {
      if (cart.length === 0) {
        showToast('Shopping cart is still empty', 'error', 'empty-cart');
        return;
      }
      
      const hasInvalidItems = cart.some(item => {
        const currentProduct = barangList.find(p => p._id === item._id);
        const currentStock = currentProduct ? currentProduct.stok : item.stok;
        return item.quantity > currentStock;
      });
      
      if (hasInvalidItems) {
        showToast('Some items in cart exceed available stock. Please update your cart.', 'error', 'invalid-stock');
        return;
      }
      
      saveTransactionStatus('pending', {
        cartItems: cart,
        total: cart.reduce((total, item) => total + (item.quantity * (item.hargaFinal || item.hargaJual)), 0)
      });
      
      setIsTransactionModalOpen(true);
    });
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartValue = cart.reduce((total, item) => total + (item.quantity * (item.hargaFinal || item.hargaJual)), 0);

  const handleTransactionSuccess = async (transactionData?: TransactionResponse) => {
    try {
      await clearCart();
      setCart([]);
      
      if (transactionData) {
        setTransactionData(transactionData);
        setTransactionSuccess(true);
        
        clearTransactionStatus();
        
        const saveToHistory = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            await fetch(`${API_BASE_URL}/api/users/history`, {
              method: "GET",
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
            
            console.log('Transaction successfully saved to history');
          } catch (err) {
            console.error("Failed to save transaction to history:", err);
          }
        };
        
        saveToHistory();
      }
    } catch (error) {
      console.error('Error clearing cart after transaction:', error);
      showToast('Failed to clear cart after transaction', 'error', 'clear-cart-error');
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

  const handleResetProsesTransaksi = () => {
    setIsProsesTransaksiModalOpen(false);
    setProsesTransaksiData({
      transaksi: null,
      midtrans: null
    });
  };

  return (
    <MainLayout>
      <ToastContainer 
        position="top-right"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
      
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
                  <input type="text" placeholder="Search for your favorite food..."
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
                  <img 
                    src={selectedProduct.gambarUrl} 
                    alt={selectedProduct.nama} 
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/80?text=No+Image";
                      target.classList.add("object-contain");
                      target.classList.add("p-2");
                    }}
                  />
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
                <span className="text-gray-700">Available stock:</span>
                <span className={`font-bold ${selectedProduct.stok > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedProduct.stok} units
                </span>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity:</label>
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
                Cancel
              </button>
              <button onClick={() => addToCart(selectedProduct, quantity)} 
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-[0.98] font-medium flex items-center justify-center gap-2 shadow-lg"
                disabled={isAnimating}>
                {isAnimating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3,7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
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
        onOpenProsesTransaksi={(data) => {
          saveTransactionStatus('pending', {
            cartItems: cart,
            total: totalCartValue,
            transactionData: data.transaksi,
            midtransData: data.midtrans,
            expiryTime: data.expiryTime,
            token: data.token,
            paymentMethod: data.transaksi?.metode_pembayaran
          });
          
          setProsesTransaksiData(data);
          setIsProsesTransaksiModalOpen(true);
        }}
      />

      <ProsesTransaksiModal
        isOpen={isProsesTransaksiModalOpen}
        onClose={handleResetProsesTransaksi}
        transaksi={prosesTransaksiData.transaksi}
        midtrans={prosesTransaksiData.midtrans}
        expiryTime={prosesTransaksiData.expiryTime}
        token={prosesTransaksiData.token}
        onTransactionSuccess={handleTransactionSuccess}
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Login Required</h3>
              <p className="text-gray-600">Please login to add products to cart or make a purchase.</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button onClick={goToLogin} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md">
                Login Now
              </button>
              <button onClick={() => setShowLoginModal(false)} className="w-full py-3 px-4 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all">
                Cancel
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