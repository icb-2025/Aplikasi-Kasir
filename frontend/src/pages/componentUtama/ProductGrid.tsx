import React from 'react';
import type { Barang } from "../../admin/stok-barang";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Barang[];
  isLoading: boolean;
  onAddToCart: (product: Barang, quantity: number) => void;
  onBuyNow: (product: Barang, quantity: number) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Array<{ id: string; name: string; icon: string }>;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading, 
  onAddToCart, 
  onBuyNow,
  selectedCategory,
  setSelectedCategory,
  categories
}) => {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Menu</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
              <div className="h-32 sm:h-36 bg-gray-200"></div>
              <div className="p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3 mb-2 sm:mb-3"></div>
                <div className="h-4 sm:h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🍔</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Produk tidak ditemukan</h3>
        <p className="text-gray-500 text-sm sm:text-base">Coba kategori lain atau ubah pencarian</p>
      </div>
    );
  }

  return (
    <div>
      {/* Bagian Kategori */}
      <div className="mb-4 sm:mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1 sm:mr-2 text-sm">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
          
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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