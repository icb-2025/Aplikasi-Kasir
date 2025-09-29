import type { Barang } from "../../admin/stok-barang";

interface DetailModalProps {
  item: Barang | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  if (!item) return null;

  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { text: "Stok Habis", color: "bg-red-100 text-red-800", icon: "exclamation" };
    if (stok <= stokMinimal)
      return { text: "Stok Terbatas", color: "bg-yellow-100 text-yellow-800", icon: "alert" };
    return { text: "Stok Tersedia", color: "bg-green-100 text-green-800", icon: "check" };
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

  // Fungsi untuk mendapatkan status profit
  const getProfitStatus = (hargaBeli: number, hargaJual: number) => {
    const profit = hargaJual - hargaBeli;
    const profitPercentage = (profit / hargaBeli) * 100;
    
    if (profitPercentage < 10) return { text: "Rendah", color: "text-red-600" };
    if (profitPercentage < 30) return { text: "Sedang", color: "text-yellow-600" };
    return { text: "Tinggi", color: "text-green-600" };
  };

  const profitStatus = getProfitStatus(item.hargaBeli, item.hargaJual);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${stockStatus.color}`}>
              {stockStatus.icon === "check" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {stockStatus.icon === "alert" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3,1.732 3z" />
                </svg>
              )}
              {stockStatus.icon === "exclamation" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Gambar Barang - Sebelah Kiri */}
          <div className="w-2/5 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
            {item.gambarUrl ? (
              <div className="relative">
                <img
                  src={item.gambarUrl}
                  alt={item.nama}
                  className="max-h-80 max-w-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    // Ganti dengan gambar default jika gagal dimuat
                    e.currentTarget.src = "../images/nostokbarang.png";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    stockStatus.text === "Stok Tersedia" ? "bg-green-500" : 
                    stockStatus.text === "Stok Terbatas" ? "bg-yellow-500" : "bg-red-500"
                  }`}></div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src="../images/nostokbarang.png"
                  alt="Gambar tidak tersedia"
                  className="max-h-80 max-w-full object-contain rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    stockStatus.text === "Stok Tersedia" ? "bg-green-500" : 
                    stockStatus.text === "Stok Terbatas" ? "bg-yellow-500" : "bg-red-500"
                  }`}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Informasi Barang - Sebelah Kanan */}
          <div className="w-3/5 p-8 overflow-y-auto bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-1">{item.nama}</h4>
                {item.kode && (
                  <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                    #{item.kode}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color} flex items-center`}
              >
                {stockStatus.icon === "check" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {stockStatus.icon === "alert" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3,1.732 3z" />
                  </svg>
                )}
                {stockStatus.icon === "exclamation" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {stockStatus.text}
              </span>
            </div>

            {/* Kategori */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-lg font-medium capitalize bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                  {item.kategori}
                </p>
              </div>
            </div>

            {/* Informasi Stok */}
            <div className="mb-8">
              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Informasi Stok
              </h5>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Stok Tersedia</p>
                  <p className="text-2xl font-bold text-blue-700">{item.stok} unit</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Stok Minimal</p>
                  <p className="text-2xl font-bold text-purple-700">{item.stokMinimal || 5} unit</p>
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
            <div className="mb-8">
              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Harga
              </h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Harga Beli</p>
                  <p className="text-xl font-bold text-green-700">Rp {item.hargaBeli.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Harga Jual</p>
                  <p className="text-xl font-bold text-blue-700">Rp {item.hargaJual.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Margin/Profit */}
              <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Margin Keuntungan</p>
                    <p className="text-lg font-bold text-yellow-700">
                      Rp {(item.hargaJual - item.hargaBeli).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profitStatus.color}`}>
                    {profitStatus.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  item.stok === 0 ? "bg-red-500" : 
                  item.stok <= (item.stokMinimal || 5) ? "bg-yellow-500" : "bg-green-500"
                }`}></div>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}