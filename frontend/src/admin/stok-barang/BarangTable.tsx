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

const formatCurrency = (value: number | string | null | undefined): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue as number)) return "Rp 0";
  
  return `Rp ${formatNumber(numValue)}`;
};

const getStokClass = (status?: string): string => {
  const statusMap: { [key: string]: string } = {
    "aman": "bg-green-50 text-green-700 border border-green-200",
    "hampir habis": "bg-yellow-50 text-yellow-700 border border-yellow-200",
    "habis": "bg-red-50 text-red-700 border border-red-200",
  };
  return statusMap[status?.toLowerCase() || ""] || "bg-gray-50 text-gray-600 border border-gray-200";
};

const getStokIcon = (status?: string): string => {
  const iconMap: { [key: string]: string } = {
    "aman": "✅",
    "hampir habis": "⚠️",
    "habis": "❌",
  };
  return iconMap[status?.toLowerCase() || ""] || "⚫";
};

interface BarangTableProps {
  data: Barang[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BarangTable: React.FC<BarangTableProps> = ({ data, onEdit, onDelete }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="w-full text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Memuat data barang...</p>
        </div>
      </div>
    );
  }

  // Fungsi untuk mendapatkan URL gambar yang benar
  const getImageUrl = (gambarUrl?: string): string | null => {
    if (!gambarUrl) return null;
    
    if (gambarUrl.startsWith('http://') || gambarUrl.startsWith('https://')) {
      return gambarUrl;
    }
    
    return `${ipbe}:${portbe}${gambarUrl.startsWith('/') ? '' : '/'}${gambarUrl}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Gambar
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Kode
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Nama Barang
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Kategori
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Harga Beli
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Harga Jual
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Harga Final
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Stok
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length > 0 ? (
              data.map((item, index) => {
                const imageUrl = getImageUrl(item.gambarUrl);
                const isLowStock = item.status === "hampir habis";
                const isOutOfStock = item.status === "habis";
                
                return (
                  <tr 
                    key={item._id || `row-${index}-${Date.now()}`}
                    className={`transition-all duration-200 hover:bg-blue-50/30 ${
                      isOutOfStock ? 'bg-red-50/20' : 
                      isLowStock ? 'bg-yellow-50/20' : 
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    } ${isOutOfStock ? 'border-l-4 border-l-red-400' : ''}`}
                  >
                    {/* Gambar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        {imageUrl ? (
                          <div className="relative group">
                            <img
                              src={imageUrl}
                              alt={item.nama || "gambar barang"}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-all"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/48?text=No+Img";
                                target.classList.add("object-contain", "p-1", "bg-gray-100");
                              }}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kode */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                        {safeValue(item.kode, "-")}
                      </div>
                    </td>

                    {/* Nama */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate" title={item.nama || "-"}>
                          {safeValue(item.nama, "-")}
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {safeValue(item.kategori, "-")}
                      </span>
                    </td>

                    {/* Harga Beli */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">
                        {formatCurrency(safeValue(item.hargaBeli, 0))}
                      </div>
                    </td>

                    {/* Harga Jual */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">
                        {formatCurrency(safeValue(item.hargaJual, 0))}
                      </div>
                    </td>

                    {/* Harga Final */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                        {formatCurrency(safeValue(item.hargaFinal, 0))}
                      </div>
                    </td>

                    {/* Stok */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {safeValue(item.stok, 0)}
                        </div>
                        {item.stok !== undefined && item.stokMinimal !== undefined && (
                          <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                item.stok <= 0
                                  ? 'bg-red-500'
                                  : item.stok <= (item.stokMinimal || 5)
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{
                                width: `${
                                  item.stok_awal
                                    ? Math.min((item.stok / item.stok_awal) * 100, 100)
                                    : 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getStokIcon(item.status)}</span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStokClass(item.status)}`}
                        >
                          {item.status
                            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                            : "Tidak diketahui"}
                        </span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => item._id && onEdit(item._id)}
                          className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200"
                          title="Edit barang"
                          disabled={!item._id}
                        >
                          <span className="text-sm">✏️</span>
                        </button>
                        <button
                          onClick={() => item._id && onDelete(item._id)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-200"
                          title="Hapus barang"
                          disabled={!item._id}
                        >
                          <span className="text-sm">🗑️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-gray-500 font-medium">Tidak ada data barang</p>
                    <p className="text-gray-400 text-sm mt-1">Data barang akan muncul di sini</p>
                  </div>
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