import React, { useState } from 'react';
import type { Barang } from "../../admin/stok-barang";

interface ProductCardProps {
  product: Barang;
  onAddToCart: (product: Barang, quantity: number) => void;
  onBuyNow: (product: Barang, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {     // , onBuyNow
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

  // Determine stock status with more descriptive text
  const stockStatus = product.stok > 10 ? 'Tersedia' : 
                     product.stok > 0 ? `Stok ${product.stok}` : 'Habis';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Memuat gambar...</div>
          </div>
        )}
        
        {imageError || !product.gambarUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-5xl mb-2">🍔</span>
            <span className="text-xs text-gray-500">Gambar tidak tersedia</span>
          </div>
        ) : (
          <>
            <img
              src={product.gambarUrl}
              alt={product.nama}
              className={`w-full h-full object-cover transition-transform duration-500 ${imageLoaded ? 'scale-100' : 'scale-105'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Image overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Stock Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-md z-10 ${
          product.stok > 10 ? 'bg-green-500 hover:bg-green-600' : 
          product.stok > 0 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
        } text-white transition-colors`}>
          {stockStatus}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            {product.kategori}
          </span>
        </div>
        
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-base line-clamp-2 flex-1 pr-2">{product.nama}</h3>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            product.stok > 10 ? 'bg-green-100 text-green-800' : 
            product.stok > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.stok > 0 ? `${product.stok} stok` : 'Habis'}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          {product.hargaFinal && product.hargaFinal < product.hargaJual ? (
            <div>
              <span className="text-lg font-bold text-amber-600">
                Rp {product.hargaFinal.toLocaleString("id-ID")}
              </span>
              <div className="text-xs text-gray-500 line-through">
                Rp {product.hargaJual.toLocaleString("id-ID")}
              </div>
            </div>
          ) : (
            <span className="text-lg font-bold text-amber-600">
              Rp {(product.hargaFinal || product.hargaJual).toLocaleString("id-ID")}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onAddToCart(product, 1)}
            disabled={product.stok === 0}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
              product.stok === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:scale-105'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Keranjang
          </button>
          {/* <button
            onClick={() => onBuyNow(product, 1)}
            disabled={product.stok === 0}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
              product.stok === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-105'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Beli
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;