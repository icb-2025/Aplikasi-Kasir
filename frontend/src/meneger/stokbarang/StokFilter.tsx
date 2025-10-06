import { useState } from 'react';

interface StokFilterProps {
  uniqueCategories: string[];
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onStockStatusChange: (status: string) => void;
}

export default function StokFilter({
  uniqueCategories,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange
}: StokFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onSearchChange(term);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    onCategoryChange(category);
  };

  const handleStockStatusChange = (status: string) => {
    setStockStatusFilter(status);
    onStockStatusChange(status);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 20 20"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama, kode, atau kategori barang..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select 
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={stockStatusFilter}
            onChange={(e) => handleStockStatusChange(e.target.value)}
          >
            <option value="">Status Stok</option>
            <option value="tersedia">Stok Tersedia</option>
            <option value="terbatas">Stok Terbatas</option>
            <option value="habis">Stok Habis</option>
          </select>
        </div>
      </div>
    </div>
  );
}