import type { Barang } from "../../admin/stok-barang";
import MenegerLayout from "../layout";
import { useState, useMemo } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import StokFilter from "./StokFilter";
import StokSummary from "./StokSummary";
import StokCard from "./StokCard";
import DetailModal from "./DetailModal";

interface StokBarangMenegerProps {
  dataBarang: Barang[];
  isLoading?: boolean;
}

export default function StokBarangMeneger({
  dataBarang,
  isLoading = false,
}: StokBarangMenegerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Barang | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");

  // Dapatkan semua kategori unik dari dataBarang
  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(dataBarang.map((item) => item.kategori.toLowerCase()))
    );
  }, [dataBarang]);

  const filteredBarang = useMemo(() => {
    return dataBarang.filter((item) => {
      // Filter berdasarkan pencarian
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter berdasarkan kategori
      const matchesCategory = 
        categoryFilter === "" || 
        item.kategori.toLowerCase() === categoryFilter.toLowerCase();
      
      // Filter berdasarkan status stok
      let matchesStockStatus = true;
      if (stockStatusFilter === "tersedia") {
        matchesStockStatus = item.stok > 10;
      } else if (stockStatusFilter === "terbatas") {
        matchesStockStatus = item.stok > 0 && item.stok <= 10;
      } else if (stockStatusFilter === "habis") {
        matchesStockStatus = item.stok === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [dataBarang, searchTerm, categoryFilter, stockStatusFilter]);

  // 🔹 Kalau masih loading → tampilkan spinner overlay
  if (isLoading) {
    return (
      <MenegerLayout>
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <LoadingSpinner />
        </div>
      </MenegerLayout>
    );
  }

  // 🔹 Cek apakah server mati (dataBarang kosong)
  const isServerDown = dataBarang.length === 0;

  return (
    <MenegerLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Stok Barang
          </h2>
          <p className="text-gray-600">Monitor dan kelola stok barang</p>
        </div>
      </div>

      {/* Filter Komponen - Hanya tampilkan jika server tidak mati */}
      {!isServerDown && (
        <StokFilter
          uniqueCategories={uniqueCategories}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onStockStatusChange={setStockStatusFilter}
        />
      )}

      {/* Ringkasan Stok - Hanya tampilkan jika server tidak mati */}
      {!isServerDown && <StokSummary dataBarang={dataBarang} />}

      {/* Barang Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isServerDown ? (
          // Tampilan ketika server mati
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <img
              src="../images/nostokbarang.jpg"
              alt="Server tidak tersedia"
              className="max-w-md w-full h-auto rounded-lg shadow-lg mb-6"
            />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Server Tidak Tersedia
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda atau hubungi administrator.
            </p>
          </div>
        ) : filteredBarang.length > 0 ? (
          // Tampilkan barang jika ada hasil filter
          filteredBarang.map((item) => (
            <StokCard
              key={item._id}
              item={item}
              onSelect={setSelectedProduct}
            />
          ))
        ) : (
          // Tampilkan pesan tidak ada hasil filter
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Barang tidak ditemukan
            </h3>
            <p className="text-gray-500">
              Coba gunakan kata kunci pencarian yang berbeda
            </p>
          </div>
        )}
      </div>

      {/* Modal Detail Barang */}
      <DetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </MenegerLayout>
  );
}