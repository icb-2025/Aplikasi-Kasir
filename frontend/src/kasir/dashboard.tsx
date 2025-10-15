// src/kasir/dashboard.tsx
import type { Barang } from "../admin/stok-barang";
import MainLayout from "./layout";
import { useState } from "react";

interface DashboardProps {
  dataBarang: Barang[];
}

const KasirDashboard = ({ dataBarang }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Barang | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredBarang = dataBarang.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetail = (item: Barang) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedItem(null);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Kasir Dashboard</h2>
          <p className="text-gray-600">Daftar barang yang tersedia</p>
        </div>
        
        {/* Info Jumlah Barang */}
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium">
            Total: <span className="font-bold">{filteredBarang.length}</span> barang
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama, kode, atau kategori barang..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Barang Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBarang.map(item => (
          <div
            key={item._id}
            onClick={() => openDetail(item)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
          >
            {/* Gambar Barang */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img 
                src={item.gambarUrl || "https://via.placeholder.com/300x200?text=No+Image"} 
                alt={item.nama}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              
              {/* Status Stok Overlay */}
              {item.stok === 0 && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">HABIS</span>
                </div>
              )}
              {item.stok > 0 && item.stok <= 5 && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Stok Sedikit
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              {/* Nama Barang */}
              <h3 className="text-xl font-bold text-gray-800 mb-3 truncate">{item.nama}</h3>

              {/* Kode dan Kategori */}
              <div className="mb-4 space-y-2">
                {item.kode && (
                  <div className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">Kode:</span> {item.kode}
                  </div>
                )}
                <div className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="font-medium">Kategori:</span> {item.kategori}
                </div>
              </div>

              {/* Info Stok dan Harga */}
              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Stok:</span>
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      item.stok > 5
                        ? 'bg-green-100 text-green-800'
                        : item.stok > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.stok} unit
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Harga:</span>
                  <span className="text-lg font-bold text-blue-700">Rp {item.hargaJual.toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              {/* Tombol Lihat Detail */}
              <div className="mt-4 text-center">
                <span className="text-sm text-blue-600 font-medium">Lihat Detail →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBarang.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada barang yang ditemukan</h3>
          <p className="text-gray-500">Coba gunakan kata kunci pencarian yang berbeda</p>
        </div>
      )}

      {/* Modal Detail Barang */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              {/* Header Modal */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Detail Barang</h3>
                <button 
                  onClick={closeDetail}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Konten Modal - Gambar Kiri, Informasi Kanan */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Gambar Besar - Kiri */}
                <div className="md:w-2/5">
                  <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={selectedItem.gambarUrl || "https://via.placeholder.com/600x400?text=No+Image"} 
                      alt={selectedItem.nama}
                      className="w-full h-64 md:h-80 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/600x400?text=No+Image";
                      }}
                    />
                  </div>
                </div>
                
                {/* Informasi Detail - Kanan */}
                <div className="md:w-3/5">
                  <div className="space-y-4">
                    {/* Nama Barang */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <h4 className="text-lg font-semibold text-blue-800 mb-1">Nama Barang</h4>
                      <p className="text-xl font-bold text-gray-800">{selectedItem.nama}</p>
                    </div>
                    
                    {/* Grid Informasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Kode Barang */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Kode Barang</h4>
                            <p className="font-medium text-gray-800">{selectedItem.kode || "-"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Kategori */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Kategori</h4>
                            <p className="font-medium text-gray-800">{selectedItem.kategori}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stok Tersedia */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start">
                          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Stok Tersedia</h4>
                            <div className="flex items-center mt-1">
                              <span
                                className={`text-sm font-semibold px-3 py-1 rounded-full mr-2 ${
                                  selectedItem.stok > 5
                                    ? 'bg-green-100 text-green-800'
                                    : selectedItem.stok > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {selectedItem.stok} unit
                              </span>
                              {selectedItem.stok === 0 && (
                                <span className="text-red-600 text-sm font-medium">Stok Habis</span>
                              )}
                              {selectedItem.stok > 0 && selectedItem.stok <= 5 && (
                                <span className="text-yellow-600 text-sm font-medium">Stok Menipis</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Harga Jual */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start">
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Harga Jual</h4>
                            <p className="text-xl font-bold text-blue-700">Rp {selectedItem.hargaJual.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stok Minimal */}
                    {selectedItem.stokMinimal && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Stok Minimal</h4>
                            <p className="font-medium text-gray-800">{selectedItem.stokMinimal} unit</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Barang */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Status</h4>
                          <div className="flex items-center mt-1">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              selectedItem.stok > 5 
                                ? 'bg-green-500' 
                                : selectedItem.stok > 0 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}></div>
                            <span className="text-gray-800 font-medium">
                              {selectedItem.stok > 5 
                                ? 'Stok Aman' 
                                : selectedItem.stok > 0 
                                  ? 'Stok Menipis' 
                                  : 'Stok Habis'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tombol Aksi */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  disabled={selectedItem.stok === 0}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                    selectedItem.stok === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedItem.stok === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </button>
                <button
                  onClick={closeDetail}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default KasirDashboard;
