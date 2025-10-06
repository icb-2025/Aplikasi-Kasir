import React from 'react';
import type { CartItem } from '../../pages/Dashboard';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  totalItems: number;
  totalValue: number;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckout,
  totalItems,
  totalValue
}) => {
  if (!isOpen) return null;

  // Fungsi untuk formatting harga tanpa pembulatan
  const formatPrice = (price: number) => {
    // Debug: tampilkan nilai asli di console
    console.log('Nilai asli harga:', price);
    
    // Konversi ke string untuk mempertahankan semua digit desimal
    const priceStr = price.toString();
    
    // Pisahkan bagian integer dan desimal
    const [integerPart, decimalPart] = priceStr.includes('.') 
      ? priceStr.split('.') 
      : [priceStr, ''];
    
    // Format bagian integer dengan pemisah ribuan
    const formattedInteger = parseInt(integerPart).toLocaleString('id-ID');
    
    // Gabungkan kembali dengan bagian desimal jika ada
    return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div>
            <h3 className="text-xl font-bold">Keranjang Belanja</h3>
            <p className="text-amber-100 text-sm">{totalItems} item</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Keranjang Kosong</h4>
              <p className="text-gray-500 mb-6">Yuk, tambahkan menu favorit Anda!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                // Debug: tampilkan nilai item di console
                console.log('Item:', item);
                
                // Pastikan harga adalah number
                const harga = Number(item.hargaFinal || item.hargaJual);
                // Perbaiki perhitungan subtotal
                const subtotal = item.quantity * harga;
                
                return (
                  <div key={item._id} className="flex items-center p-4 bg-amber-50 rounded-2xl">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mr-4">
                      {item.gambarUrl ? (
                        <img 
                          src={item.gambarUrl} 
                          alt={item.nama}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-2xl">🍔</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.nama}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x Rp {formatPrice(harga)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-amber-600">
                        Rp {formatPrice(subtotal)}
                      </p>
                      <button 
                        onClick={() => onRemoveItem(item._id)}
                        className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">Rp {formatPrice(totalValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-amber-600">Rp {formatPrice(totalValue)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              Lanjutkan Pembayaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;