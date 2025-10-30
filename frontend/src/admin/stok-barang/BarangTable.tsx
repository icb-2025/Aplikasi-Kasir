import React from "react";
import type { Barang } from ".";
import { portbe } from "../../../../backend/ngrokbackend";
const ipbe = import.meta.env.VITE_IPBE;

// Utility functions
const safeValue = <T,>(value: T | null | undefined, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number' && isNaN(value)) return fallback;
  return value;
};

const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "0";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0" : num.toLocaleString("id-ID");
};

const getStokClass = (status?: string): string => {
  if (status === "aman") return "bg-green-100 text-green-800";
  if (status === "hampir habis") return "bg-yellow-100 text-yellow-800";
  if (status === "habis") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

interface BarangTableProps {
  data: Barang[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BarangTable: React.FC<BarangTableProps> = ({ data, onEdit, onDelete }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="w-full text-center py-8 text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  // Fungsi untuk mendapatkan URL gambar yang benar
  const getImageUrl = (gambarUrl?: string): string | null => {
    if (!gambarUrl) return null;
    
    // Jika gambarUrl sudah berupa URL lengkap
    if (gambarUrl.startsWith('http://') || gambarUrl.startsWith('https://')) {
      return gambarUrl;
    }
    
    // Jika gambarUrl adalah path relatif, tambahkan base URL
    return `${ipbe}:${portbe}${gambarUrl.startsWith('/') ? '' : '/'}${gambarUrl}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Final</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item, index) => {
                const imageUrl = getImageUrl(item.gambarUrl);
                
                return (
                  <tr 
                    key={item._id || `row-${index}-${Date.now()}`}
                    className={`transition-colors hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
                    }`}
                  >
                    {/* Gambar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.nama || "gambar barang"}
                            className="w-16 h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/64?text=No+Image";
                              target.classList.add("object-contain");
                              target.classList.add("p-2");
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-gray-400 text-xs text-center">No Image</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kode */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {safeValue(item.kode, "-")}
                      </div>
                    </td>

                    {/* Nama */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {safeValue(item.nama, "-")}
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {safeValue(item.kategori, "-")}
                      </span>
                    </td>

                    {/* Harga Beli */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Rp {formatNumber(safeValue(item.hargaBeli, 0))}
                      </div>
                    </td>

                    {/* Harga Jual */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Rp {formatNumber(safeValue(item.hargaJual, 0))}
                      </div>
                    </td>

                    {/* Harga Final */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        Rp {formatNumber(safeValue(item.hargaFinal, 0))}
                      </div>
                    </td>

                    {/* Stok */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {safeValue(item.stok, 0)} / {safeValue(item.stokMinimal, 5)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getStokClass(
                          item.status
                        )}`}
                      >
                        {item.status
                          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                          : "Tidak diketahui"}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => item._id && onEdit(item._id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit barang"
                          disabled={!item._id}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => item._id && onDelete(item._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Hapus barang"
                          disabled={!item._id}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data barang
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BarangTable;