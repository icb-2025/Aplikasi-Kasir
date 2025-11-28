import type { Barang } from "../../admin/stok-barang";
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  FolderOpen, 
  Box, 
  DollarSign 
} from 'lucide-react';

interface DetailModalProps {
  item: Barang | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  if (!item) return null;

  // Fungsi untuk menentukan status stok
  const getStatusStok = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { 
        teks: "Stok Habis", 
        warna: "bg-red-100 text-red-800", 
        ikon: <XCircle className="h-5 w-5" />
      };
    if (stok <= stokMinimal)
      return { 
        teks: "Stok Terbatas", 
        warna: "bg-yellow-100 text-yellow-800", 
        ikon: <AlertTriangle className="h-5 w-5" />
      };
    return { 
      teks: "Stok Tersedia", 
      warna: "bg-green-100 text-green-800", 
      ikon: <CheckCircle className="h-5 w-5" />
    };
  };

  const statusStok = getStatusStok(item.stok, item.stokMinimal);

  // Fungsi untuk mendapatkan warna progress bar
  const getWarnaProgressBar = (stok: number, stokMinimal: number = 5) => {
    return stok <= stokMinimal ? "bg-yellow-500" : "bg-green-500";
  };

  // Menghitung lebar progress bar
  const getLebarProgressBar = (stok: number) => {
    return `${Math.min(100, (stok / 50) * 100)}%`;
  };

  const warnaProgressBar = getWarnaProgressBar(item.stok, item.stokMinimal || 5);
  const lebarProgressBar = getLebarProgressBar(item.stok);

  // Fungsi untuk mendapatkan status profit
  const getStatusProfit = (hargaBeli: number, hargaJual: number) => {
    const profit = hargaJual - hargaBeli;
    const persentaseProfit = (profit / hargaBeli) * 100;
    
    if (persentaseProfit < 10) return { 
      teks: "Rendah", 
      warna: "text-red-600", 
      ikon: <TrendingDown className="h-4 w-4" />
    };
    if (persentaseProfit < 30) return { 
      teks: "Sedang", 
      warna: "text-yellow-600", 
      ikon: <Minus className="h-4 w-4" />
    };
    return { 
      teks: "Tinggi", 
      warna: "text-green-600", 
      ikon: <TrendingUp className="h-4 w-4" />
    };
  };

  const statusProfit = getStatusProfit(item.hargaBeli, item.hargaJual);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${statusStok.warna} text-2xl`}>
              {statusStok.ikon}
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
                    e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg text-xl">
                  {statusStok.ikon}
                </div>
              </div>
            ) : (
              <div className="relative max-w-xs w-full">
                <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg text-xl">
                  {statusStok.ikon}
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
                className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStok.warna} flex items-center gap-1`}
              >
                {statusStok.ikon}
                {statusStok.teks}
              </span>
            </div>

            {/* Kategori */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <div className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2 text-gray-600" />
                <p className="text-base md:text-lg font-medium capitalize bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                  {item.kategori}
                </p>
              </div>
            </div>

            {/* Informasi Stok */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Box className="h-5 w-5 mr-2 text-blue-600" />
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
              {item.stok > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ketersediaan Stok</span>
                    <span>{Math.round((item.stok / 50) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${warnaProgressBar}`}
                      style={{ width: lebarProgressBar }}
                    ></div>
                  </div>
                </div>
              )}
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
                  <p className="text-lg md:text-xl font-bold text-blue-700">Rp {item.hargaFinal?.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Margin/Profit */}
              <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Margin Keuntungan</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-700">
                      Rp {(item.hargaJual - item.hargaBeli).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusProfit.warna} flex items-center gap-1`}>
                    {statusProfit.ikon}
                    {statusProfit.teks}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {item.stok === 0 ? <XCircle className="h-5 w-5 text-red-500" /> : 
                  item.stok <= (item.stokMinimal || 5) ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : 
                  <CheckCircle className="h-5 w-5 text-green-500" />}
                </span>
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