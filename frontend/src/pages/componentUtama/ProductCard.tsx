import React, { useState } from 'react';
import type { Barang } from "../../admin/stok-barang";

interface ProductCardProps {
  product: Barang;
  onAddToCart: (product: Barang, quantity: number) => void;
  onBuyNow: (product: Barang, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const discountPercentage = product.hargaFinal && product.hargaFinal < product.hargaJual
    ? Math.round((1 - product.hargaFinal / product.hargaJual) * 100)
    : 0;

  // Determine stock status
  const stockStatus = product.stok > 10 ? 'Tersedia' : 
                     product.stok > 0 ? `Stok ${product.stok}` : 'Habis';

  // Get category icon
  const getCategoryIcon = (category: string) => {
    // Ekstrak ikon dari nama kategori jika ada
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const match = category.match(emojiRegex);
    return match ? match[0] : "";
  };

  // Get category name without icon
  const getCategoryName = (category: string) => {
    // Ekstrak nama tanpa ikon
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    return category.replace(emojiRegex, "").trim();
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 sm:hover:-translate-y-1 flex flex-col h-full">
      <div className="relative h-28 sm:h-32 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden flex-shrink-0">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-xs">Memuat...</div>
          </div>
        )}
        
        {imageError || !product.gambarUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <span className="text-3xl sm:text-4xl mb-1">🍔</span>
            <span className="text-xs text-gray-500 text-center">Gambar tidak tersedia</span>
          </div>
        ) : (
          <>
            <img
              src={product.gambarUrl}
              alt={product.nama}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                imageLoaded ? 'scale-100' : 'scale-105'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            {/* Image overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-sm z-10">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Stock Badge */}
        <div className={`absolute top-1.5 right-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium shadow-sm z-10 ${
          product.stok > 10 ? 'bg-green-500 hover:bg-green-600' : 
          product.stok > 0 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
        } text-white transition-colors`}>
          {stockStatus}
        </div>
      </div>
      
      <div className="p-2 sm:p-3 flex flex-col flex-grow">
        <div className="mb-1.5 flex items-center">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-amber-200 flex items-center">
            <span className="mr-1">{getCategoryIcon(product.kategori)}</span>
            {getCategoryName(product.kategori)}
          </span>
        </div>
        
        <div className="flex items-start justify-between mb-1.5 sm:mb-2 flex-grow">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight line-clamp-2 flex-1 pr-2 min-h-[2.5rem]">
            {product.nama}
          </h3>
          <div className={`text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex-shrink-0 ${
            product.stok > 10 ? 'bg-green-100 text-green-800' : 
            product.stok > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.stok > 0 ? product.stok : '0'}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2 sm:mb-3 mt-auto">
          {product.hargaFinal && product.hargaFinal < product.hargaJual ? (
            <div>
              <span className="text-base sm:text-lg font-bold text-amber-600">
                Rp {product.hargaFinal.toLocaleString("id-ID")}
              </span>
              <div className="text-xs text-gray-500 line-through">
                Rp {product.hargaJual.toLocaleString("id-ID")}
              </div>
            </div>
          ) : (
            <span className="text-base sm:text-lg font-bold text-amber-600">
              Rp {(product.hargaFinal || product.hargaJual).toLocaleString("id-ID")}
            </span>
          )}
        </div>
        
        <div className="flex space-x-1.5 sm:space-x-2">
          <button
            onClick={() => onAddToCart(product, 1)}
            disabled={product.stok === 0}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
              product.stok === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:scale-105 active:scale-95'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;