import type { Barang } from "../../admin/stok-barang";
import { Package, FolderOpen, Box, DollarSign, FileText, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface StokCardProps {
  item: Barang;
  onSelect: (item: Barang) => void;
}

export default function StokCard({ item, onSelect }: StokCardProps) {
  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { 
        text: "Stok Habis", 
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />
      };
    if (stok <= stokMinimal)
      return { 
        text: "Stok Terbatas", 
        color: "bg-yellow-100 text-yellow-800",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    return { 
      text: "Stok Tersedia", 
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4" />
    };
  };

  const stockStatus = getStockStatus(item.stok, item.stokMinimal);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all flex flex-col group">
      {/* Gambar Barang */}
      <div className="h-48 overflow-hidden bg-gray-100 relative">
        {item.gambarUrl ? (
          <img
            src={item.gambarUrl}
            alt={item.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${stockStatus.color}`}
          >
            {stockStatus.icon}
            {stockStatus.text}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {item.nama}
          </h3>
          {item.kode && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
              #{item.kode}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-3 capitalize flex items-center gap-1">
          <FolderOpen className="h-3 w-3" />
          {item.kategori}
        </p>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Stok</p>
              <p className="text-lg font-bold">{item.stok} unit</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
              <DollarSign className="h-3 w-3" />
              Harga
            </p>
            <p className="text-lg font-bold text-blue-600">
              Rp {item.hargaFinal?.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {item.stok > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                item.stok <= (item.stokMinimal || 5) ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(100, (item.stok / 50) * 100)}%`,
              }}
            ></div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => onSelect(item)}
          className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700"
        >
          <FileText className="h-4 w-4" />
          Lihat Detail
        </button>
      </div>
    </div>
  );
}