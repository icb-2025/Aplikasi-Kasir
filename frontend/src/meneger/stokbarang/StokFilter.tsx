// Komponen StokFilter
import { useState } from "react";

interface StokFilterProps {
  uniqueCategories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
}

export default function StokFilter({
  uniqueCategories,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange,
}: StokFilterProps) {
  const [searchValue, setSearchValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [stockStatusValue, setStockStatusValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategoryValue(value);
    onCategoryChange(value);
  };

  const handleStockStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStockStatusValue(value);
    onStockStatusChange(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          </div>
          <input
            type="text"
            placeholder="Cari barang..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        
        <select
          className="pl-3 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm w-full"
          value={categoryValue}
          onChange={handleCategoryChange}
        >
          <option value="">Semua Kategori</option>
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        
        <select
          className="pl-3 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm w-full"
          value={stockStatusValue}
          onChange={handleStockStatusChange}
        >
          <option value="">Semua Status Stok</option>
          <option value="tersedia">Stok Tersedia</option>
          <option value="terbatas">Stok Terbatas</option>
          <option value="habis">Stok Habis</option>
        </select>
      </div>
    </div>
  );
}