import type { Barang } from "../../admin/stok-barang";

interface DetailModalProps {
  item: Barang | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  if (!item) return null;

  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { text: "Stok Habis", color: "bg-red-100 text-red-800", emoji: "❌" };
    if (stok <= stokMinimal)
      return { text: "Stok Terbatas", color: "bg-yellow-100 text-yellow-800", emoji: "⚠️" };
    return { text: "Stok Tersedia", color: "bg-green-100 text-green-800", emoji: "✅" };
  };

  const stockStatus = getStockStatus(item.stok, item.stokMinimal);

  // Fungsi untuk mendapatkan warna progress bar (sama seperti di file 2)
  const getProgressBarColor = (stok: number, stokMinimal: number = 5) => {
    return stok <= stokMinimal ? "bg-yellow-500" : "bg-green-500";
  };

  // Menghitung lebar progress bar (sama seperti di file 2)
  const getProgressBarWidth = (stok: number) => {
    return `${Math.min(100, (stok / 50) * 100)}%`;
  };

  const progressBarColor = getProgressBarColor(item.stok, item.stokMinimal || 5);
  const progressBarWidth = getProgressBarWidth(item.stok);

  // Fungsi untuk mendapatkan status profit
  const getProfitStatus = (hargaBeli: number, hargaJual: number) => {
    const profit = hargaJual - hargaBeli;
    const profitPercentage = (profit / hargaBeli) * 100;
    
    if (profitPercentage < 10) return { text: "Rendah", color: "text-red-600", emoji: "📉" };
    if (profitPercentage < 30) return { text: "Sedang", color: "text-yellow-600", emoji: "📊" };
    return { text: "Tinggi", color: "text-green-600", emoji: "📈" };
  };

  const profitStatus = getProfitStatus(item.hargaBeli, item.hargaJual);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${stockStatus.color} text-2xl`}>
              {stockStatus.emoji}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Detail Barang</h3>
              <p className="text-sm text-gray-600">Informasi lengkap tentang produk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <span className="text-xl">❌</span>
          </button>
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
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg text-xl">
                  {stockStatus.emoji}
                </div>
              </div>
            ) : (
              <div className="relative max-w-xs w-full">
                <img
                  src="../images/nostokbarang.png"
                  alt="Gambar tidak tersedia"
                  className="w-full h-48 md:h-64 object-contain rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg text-xl">
                  {stockStatus.emoji}
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
                className={`px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color} flex items-center`}
              >
                <span className="mr-1">{stockStatus.emoji}</span>
                {stockStatus.text}
              </span>
            </div>

            {/* Kategori */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <div className="flex items-center">
                <span className="text-xl mr-2">📁</span>
                <p className="text-base md:text-lg font-medium capitalize bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                  {item.kategori}
                </p>
              </div>
            </div>

            {/* Informasi Stok */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">📦</span>
                Informasi Stok
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Stok Tersedia</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-700">{item.stok} unit</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Stok Minimal</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-700">{item.stokMinimal || 5} unit</p>
                </div>
              </div>

              {/* Progress Bar Stok - Menggunakan implementasi dari file 2 */}
              {item.stok > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ketersediaan Stok</span>
                    <span>{Math.round((item.stok / 50) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${progressBarColor}`}
                      style={{ width: progressBarWidth }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Informasi Harga */}
            <div className="mb-6 md:mb-8">
              <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">💰</span>
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

              {/* Margin/Profit */}
              <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Margin Keuntungan</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-700">
                      Rp {(item.hargaJual - item.hargaBeli).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profitStatus.color} flex items-center`}>
                    <span className="mr-1">{profitStatus.emoji}</span>
                    {profitStatus.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {item.stok === 0 ? "❌" : 
                  item.stok <= (item.stokMinimal || 5) ? "⚠️" : "✅"}
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
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
          >
            <span className="mr-1">❌</span>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}