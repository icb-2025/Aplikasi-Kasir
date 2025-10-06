import React from 'react';
import type { Barang } from "../../admin/stok-barang";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Barang[];
  isLoading: boolean;
  onAddToCart: (product: Barang, quantity: number) => void;
  onBuyNow: (product: Barang, quantity: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading, 
  onAddToCart, 
  onBuyNow 
}) => {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍔</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Produk tidak ditemukan</h3>
        <p className="text-gray-500">Coba kategori lain atau ubah pencarian</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
        <p className="text-gray-600">{products.length} produk tersedia</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;