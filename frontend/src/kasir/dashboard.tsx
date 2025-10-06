// src/kasir/dashboard.tsx
import type { Barang } from "../pages/Barang";
import MainLayout from "./layout";
import { useState } from "react";

interface DashboardProps {
  dataBarang: Barang[];
}

const KasirDashboard = ({ dataBarang }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBarang = dataBarang.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
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
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg overflow-hidden border border-blue-200 hover:shadow-2xl transform hover:-translate-y-1 transition-all flex flex-col"
        >
          <div className="p-5 flex-1 flex flex-col">
            {/* Nama Barang */}
            <h3 className="text-xl font-bold text-blue-900 mb-4">{item.nama}</h3>

            {/* Kode dan Kategori */}
            <div className="mb-4 space-y-2">
              {item.kode && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Kode:</span> {item.kode}
                </div>
              )}
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Kategori:</span> {item.kategori}
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
                <span className="text-lg font-bold text-blue-800">Rp {item.hargaBeli.toLocaleString("id-ID")}</span>
              </div>
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
    </MainLayout>
  );
};

export default KasirDashboard;
