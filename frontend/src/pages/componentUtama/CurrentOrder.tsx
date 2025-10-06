import React from 'react';
import type { CartItem } from '../../pages/Dashboard';

interface CurrentOrderProps {
  cartItems: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
  totalItems: number;
  totalValue: number;
  isLoading: boolean;
}

const CurrentOrder: React.FC<CurrentOrderProps> = ({
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
  totalItems,
  totalValue,
  isLoading
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🛒</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Keranjang Kosong</h3>
            <p className="text-gray-500 text-sm">Tambahkan produk untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    {item.gambarUrl ? (
                      <img 
                        src={item.gambarUrl} 
                        alt={item.nama} 
                        className="w-16 h-16 object-cover rounded-lg" 
                        onError={(e) => {
                          // Fallback jika gambar gagal dimuat
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                              <span class="text-xl">📦</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm">{item.nama}</h3>
                        <p className="text-xs text-gray-500">
                          Rp {(item.hargaFinal || item.hargaJual).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item._id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => onUpdateQuantity(item._id, item.quantity - 1)} 
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)} 
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-amber-600 text-sm">
                        Rp {(item.quantity * (item.hargaFinal || item.hargaJual)).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">Rp {totalValue.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Items:</span>
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-amber-600">Rp {totalValue.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onCheckout} 
          disabled={cartItems.length === 0 || isLoading}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            cartItems.length === 0 || isLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md'
          }`}
        >
          {isLoading ? 'Loading...' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );
};

export default CurrentOrder;