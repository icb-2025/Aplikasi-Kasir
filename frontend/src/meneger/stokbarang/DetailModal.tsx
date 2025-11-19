import type { Barang } from "../../admin/stok-barang";
import { CheckCircle, AlertCircle, XCircle, Folder, Package, DollarSign, Archive } from "lucide-react";

interface DetailModalProps {
  item: Barang | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  if (!item) return null;

  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { text: "Stok Habis", color: "bg-red-100 text-red-800", icon: <XCircle className="w-5 h-5" /> };
    if (stok <= stokMinimal)
      return { text: "Stok Terbatas", color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="w-5 h-5" /> };
    return { text: "Stok Tersedia", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-5 h-5" /> };
  };

  const stockStatus = getStockStatus(item.stok, item.stokMinimal);

  // Fungsi untuk menghitung persentase stok
  const getStockPercentage = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0) return 0;
    if (stok <= stokMinimal) return 25;
    if (stok <= stokMinimal * 2) return 50;
    if (stok <= stokMinimal * 3) return 75;
    return 100;
  };

  const stockPercentage = getStockPercentage(item.stok, item.stokMinimal || 5);

  // Fungsi untuk mendapatkan warna progress bar berdasarkan persentase
  const getProgressBarColor = (percentage: number) => {
    if (percentage === 0) return "bg-red-500";
    if (percentage <= 25) return "bg-orange-500";
    if (percentage <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const progressBarColor = getProgressBarColor(stockPercentage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${stockStatus.color}`}>
              {stockStatus.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Detail Barang</h3>
              <p className="text-sm text-gray-600">Informasi lengkap tentang produk</p>
            </div>
          </div>
        </div>
        
        {/* Konten Modal - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Gambar Barang - Full width on mobile */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
            {item.gambarUrl ? (
              <div className="relative max-w-xs w-full">
                <img
                  src={item.gambarUrl}
                  alt={item.nama}
                  className="w-full h-48 md:h-64 object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    // Ganti dengan gambar default jika gagal dimuat
                    e.currentTarget.src = "../images/nostokbarang.png";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  {stockStatus.icon}
                </div>
              </div>
            ) : (
              <div className="relative max-w-xs w-full">
                <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  {stockStatus.icon}
                </div>
              </div>
            )}
          </div>
          
          {/* Informasi Barang */}
          <div className="p-4 md:p-8 bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{item.nama}</h4>
                {item.kode && (
                  <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                    #{item.kode}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color} flex items-center gap-1`}
              >
                {stockStatus.icon}
                {stockStatus.text}
              </span>
            </div>

            {/* Kategori */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <div className="flex items-center">
                <Folder className="h-5 w-5 mr-2 text-gray-600" />
                <p className="text-base md:text-lg font-medium capitalize bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                  {item.kategori}
                </p>
              </div>
            </div>

            {/* Informasi Stok */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Archive className="h-5 w-5 mr-2 text-blue-600" />
                Informasi Stok
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Stok Tersedia</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-700">{item.stok} unit</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-600 mb-1">Stok Minimal</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-700">{item.stokMinimal || 5} unit</p>
                </div>
              </div>

              {/* Progress Bar Stok */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Ketersediaan Stok</span>
                  <span>{stockPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${progressBarColor}`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Informasi Harga */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Informasi Harga
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Harga Beli</p>
                  <p className="text-lg md:text-xl font-bold text-green-700">Rp {item.hargaBeli.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Harga Jual</p>
                  <p className="text-lg md:text-xl font-bold text-blue-700">Rp {item.hargaJual.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center">
                <span className="mr-2">{stockStatus.icon}</span>
                <p className="text-gray-800 capitalize">
                  {item.status || (item.stok === 0 
                    ? "stok habis" 
                    : item.stok <= (item.stokMinimal || 5) 
                      ? "stok hampir habis" 
                      : "stok aman")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}