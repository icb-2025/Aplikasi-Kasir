import React from "react";
import type { Barang } from ".";

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
      <div className="overflow-x-auto rounded-lg shadow">
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
    return `http://192.168.110.16:5000${gambarUrl.startsWith('/') ? '' : '/'}${gambarUrl}`;
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-6 py-3">Gambar</th>
            <th className="px-6 py-3">Kode</th>
            <th className="px-6 py-3">Nama</th>
            <th className="px-6 py-3">Kategori</th>
            <th className="px-6 py-3">Harga Beli</th>
            <th className="px-6 py-3">Harga Jual</th>
            <th className="px-6 py-3">Harga Final</th>
            <th className="px-6 py-3">Stok</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, idx) => {
              const imageUrl = getImageUrl(item.gambarUrl);
              
              return (
                <tr
                  key={item._id || `row-${idx}-${Date.now()}`}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  {/* Gambar */}
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {safeValue(item.kode, "-")}
                  </td>

                  {/* Nama */}
                  <td className="px-6 py-4">{safeValue(item.nama, "-")}</td>

                  {/* Kategori */}
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {safeValue(item.kategori, "-")}
                    </span>
                  </td>

                  {/* Harga Beli */}
                  <td className="px-6 py-4">
                    Rp {formatNumber(safeValue(item.hargaBeli, 0))}
                  </td>

                  {/* Harga Jual */}
                  <td className="px-6 py-4">
                    Rp {formatNumber(safeValue(item.hargaJual, 0))}
                  </td>

                  {/* Harga Final */}
                  <td className="px-6 py-4 font-medium text-green-600">
                    Rp {formatNumber(safeValue(item.hargaFinal, 0))}
                  </td>

                  {/* Stok */}
                  <td className="px-6 py-4">
                    {safeValue(item.stok, 0)} / {safeValue(item.stokMinimal, 5)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStokClass(
                        item.status
                      )}`}
                    >
                      {item.status
                        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                        : "Tidak diketahui"}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => item._id && onEdit(item._id)}
                        className="font-medium text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Edit barang"
                        disabled={!item._id}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => item._id && onDelete(item._id)}
                        className="font-medium text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
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
            <tr key="no-data">
              <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data barang
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BarangTable;