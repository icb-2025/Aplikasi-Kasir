// src/pages/Dashboard.tsx
import type { Barang } from "../admin/stok-barang";
import MainLayout from "../components/MainLayout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DashboardProps {
  dataBarang: Barang[];
}

interface CartItem extends Barang {
  quantity: number;
}

const Dashboard = ({ dataBarang }: DashboardProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Barang | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  
  // Ambil semua kategori unik dari dataBarang
  const allCategories = ["Semua", ...Array.from(new Set(dataBarang.map(item => item.kategori)))];
  
  // Animasi badge keranjang
  useEffect(() => {
    if (cart.length > 0) {
      setCartAnimation(true);
      const timer = setTimeout(() => setCartAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart]);

  // Filter barang berdasarkan pencarian dan kategori
  const filteredBarang = dataBarang.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "Semua" || item.kategori === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Barang, qty: number = 1) => {
    if (qty > product.stok) {
      toast.error(`Stok tidak mencukupi! Stok tersedia: ${product.stok}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    setIsAnimating(true);
    
    setTimeout(() => {
      const existingItem = cart.find(item => item._id === product._id);
      if (existingItem) {
        const newQty = existingItem.quantity + qty;
        if (newQty > product.stok) {
          toast.error(`Jumlah melebihi stok! Stok tersedia: ${product.stok}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setIsAnimating(false);
          return;
        }
        setCart(cart.map(item => item._id === product._id ? { ...item, quantity: newQty } : item));
        toast.success(`${product.nama} ditambahkan ke keranjang`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        setCart([...cart, { ...product, quantity: qty }]);
        toast.success(`${product.nama} ditambahkan ke keranjang`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      setSelectedProduct(null);
      setQuantity(1);
      setIsAnimating(false);
    }, 300);
  };

  const handleBuyNow = (product: Barang, qty: number = 1) => {
    if (qty > product.stok) {
      toast.error(`Stok tidak mencukupi! Stok tersedia: ${product.stok}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    navigate('/transaksi', {
      state: { cartItems: [{ ...product, quantity: qty }], total: qty * (product.hargaFinal || product.hargaJual) }
    });
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <MainLayout>
      {/* Toast Container */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 animate-fadeIn">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Inventori</h2>
          <p className="text-gray-600">Kelola dan pantau stok barang Anda</p>
        </div>
        {/* Keranjang Button */}
        <button
          onClick={() => setShowCartModal(true)}
          className={`relative p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 transform hover:scale-105 ${cartAnimation ? 'animate-pulse' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {totalCartItems > 0 && (
            <span className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${cartAnimation ? 'animate-bounce' : ''}`}>
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* Search dan Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fadeInUp">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama, kode, kategori..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Kategori */}
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Barang Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBarang.map((item, index) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1 animate-fadeInUp"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Gambar produk */}
            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
              {item.gambarUrl ? (
                <img 
                  src={item.gambarUrl} 
                  alt={item.nama}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Ganti dengan gambar default jika gagal memuat
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent looping
                    target.src = "/images/nostokbarang.jpg";
                  }}
                />
              ) : (
                <img 
                  src="/images/nostokbarang.jpg" 
                  alt="Tidak ada gambar"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Info produk */}
            <div className="flex-1 p-5 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 truncate mb-1">{item.nama}</h3>
              <p className="text-sm text-gray-500 mb-1">Kategori: {item.kategori}</p>
              <p className="text-sm text-gray-600">
                Stok:
                <span className={`ml-1 font-medium ${item.stok > 0 ? "text-green-600" : "text-red-500"}`}>
                  {item.stok}
                </span>
              </p>
              <p className="text-base font-semibold text-blue-600 mt-2">
                Rp {(item.hargaFinal || item.hargaJual).toLocaleString("id-ID")}
              </p>

              {/* Tombol aksi */}
              <div className="mt-auto pt-4 flex gap-2">
                <button
                  onClick={() => setSelectedProduct(item)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  Keranjang
                </button>
                <button
                  onClick={() => handleBuyNow(item, 1)}
                  className="flex-1 px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95"
                >
                  Beli
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Keranjang */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col animate-slideUp">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Keranjang Belanja</h3>
              <button 
                onClick={() => setShowCartModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors transform hover:rotate-90 duration-300"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div 
                      key={item._id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        {item.gambarUrl ? (
                          <img 
                            src={item.gambarUrl} 
                            alt={item.nama}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/images/nostokbarang.jpg";
                            }}
                          />
                        ) : (
                          <img 
                            src="/images/nostokbarang.jpg" 
                            alt="Tidak ada gambar"
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{item.nama}</h4>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x Rp {(item.hargaFinal || item.hargaJual).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        Rp {(item.quantity * (item.hargaFinal || item.hargaJual)).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span>Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {cart.reduce((total, item) => total + (item.quantity * (item.hargaFinal || item.hargaJual)), 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowCartModal(false);
                    navigate('/transaksi', {
                      state: { 
                        cartItems: cart, 
                        total: cart.reduce((total, item) => total + (item.quantity * (item.hargaFinal || item.hargaJual)), 0) 
                      }
                    });
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Masukkan Keranjang */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-slideUp">
            <div className="flex items-center gap-4 mb-4">
              {selectedProduct.gambarUrl ? (
                <img 
                  src={selectedProduct.gambarUrl} 
                  alt={selectedProduct.nama}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/nostokbarang.jpg";
                  }}
                />
              ) : (
                <img 
                  src="/images/nostokbarang.jpg" 
                  alt="Tidak ada gambar"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{selectedProduct.nama}</h3>
                <p className="text-gray-500">{selectedProduct.kategori}</p>
              </div>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              Stok tersedia: <span className="font-medium">{selectedProduct.stok}</span>
            </div>
            <div className="mb-4 text-lg font-semibold">
              Harga: Rp {(selectedProduct.hargaFinal || selectedProduct.hargaJual).toLocaleString("id-ID")}
            </div>
            <div className="flex items-center justify-center mb-6">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="px-4 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300 transition-colors active:scale-95"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={selectedProduct.stok}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Math.min(selectedProduct.stok, Number(e.target.value))))}
                className="w-20 text-center py-2 border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={() => setQuantity(q => Math.min(selectedProduct.stok, q + 1))} 
                className="px-4 py-2 bg-gray-200 rounded-r-lg hover:bg-gray-300 transition-colors active:scale-95"
              >
                +
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => addToCart(selectedProduct, quantity)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                disabled={isAnimating}
              >
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes slideUp {
            from { 
              transform: translateY(30px); 
              opacity: 0; 
            }
            to { 
              transform: translateY(0); 
              opacity: 1; 
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease forwards;
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease forwards;
          }
          
          .animate-slideUp {
            animation: slideUp 0.3s ease forwards;
          }
        `}
      </style>
    </MainLayout>
  );
};

export default Dashboard;