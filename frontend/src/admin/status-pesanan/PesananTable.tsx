import React, { useState } from "react";
import type { Pesanan } from ".";
import { Landmark, Wallet, TrendingUp, CreditCard } from "lucide-react";

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'selesai':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'dibatalkan':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'diproses':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const getPaymentMethodClass = (method: string): string => {
  switch (method.toLowerCase()) {
    case 'tunai':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'kartu debit':
    case 'kartu kredit':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'qris':
    case 'e-wallet':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
};

// Dapatkan icon berdasarkan metode pembayaran
const getPaymentIcon = (method: string): React.ReactNode => {
  if (method.includes('Virtual Account')) return <Landmark className="h-4 w-4 text-blue-500" />;
  if (method.includes('E-Wallet')) return <Wallet className="h-4 w-4 text-green-500" />;
  if (method.includes('Tunai')) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
  if (method.includes('Kartu Kredit')) return <CreditCard className="h-4 w-4 text-purple-500" />;
  return <CreditCard className="h-4 w-4 text-gray-500" />;
};

// Type untuk barang
interface BarangItem {
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  kode_barang?: string;
  _id?: string;
  gambar_url?: string; // Tambahkan properti gambar
}

// Komponen untuk menampilkan gambar dengan fallback
const BarangImage: React.FC<{ url?: string; name: string; size?: "small" | "medium" }> = ({ 
  url, 
  name, 
  size = "small" 
}) => {
  const [imgError, setImgError] = useState(false);
  
  const sizeClasses = size === "small" 
    ? "w-10 h-10 object-cover rounded" 
    : "w-16 h-16 object-cover rounded-lg";
  
  if (imgError || !url) {
    return (
      <div className={`${sizeClasses} bg-gray-200 flex items-center justify-center`}>
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  
  return (
    <img 
      src={url} 
      alt={name}
      className={sizeClasses}
      onError={() => setImgError(true)}
    />
  );
};

// Component untuk dropdown barang
interface BarangDropdownProps {
  barang: BarangItem[];
}

const BarangDropdown: React.FC<BarangDropdownProps> = ({ barang }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!barang || barang.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  const totalItems = barang.length;
  const firstTwoItems = barang.slice(0, 2);

  // Generate unique ID untuk setiap barang jika tidak ada kode_barang
  const getBarangIdentifier = (item: BarangItem, index: number): string => {
    return item.kode_barang || item._id || `barang-${index}`;
  };

  return (
    <div className="relative">
      {/* Preview Items */}
      <div 
        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors border border-transparent hover:border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="space-y-2">
          {firstTwoItems.map((item, index) => (
            <div key={getBarangIdentifier(item, index)} className="border-l-3 border-blue-400 pl-3 py-2 bg-blue-50 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <BarangImage url={item.gambar_url} name={item.nama_barang} size="small" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 flex justify-between items-center">
                    <span className="truncate max-w-[140px] text-sm">{item.nama_barang}</span>
                    <span className="text-blue-600 text-xs bg-white px-2 py-1 rounded-full border border-blue-200">
                      {item.jumlah}x
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 flex justify-between items-center mt-1">
                    <span className="bg-white px-2 py-1 rounded border">@{formatCurrency(item.harga_satuan)}</span>
                    <span className="font-semibold text-green-600 bg-white px-2 py-1 rounded border">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {totalItems > 2 && (
            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
              <span className="font-medium">+{totalItems - 2} barang lainnya</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="font-bold text-gray-800 text-lg">Detail Barang</h4>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {totalItems} items
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {barang.map((item, index) => (
                  <div 
                    key={getBarangIdentifier(item, index)} 
                    className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <BarangImage url={item.gambar_url} name={item.nama_barang} size="medium" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-base mb-1">
                          {item.nama_barang}
                        </p>
                        {/* Kode Barang - selalu tampilkan dengan fallback */}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border font-mono">
                            #{getBarangIdentifier(item, index).substring(0, 8)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Qty: {item.jumlah}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Harga Satuan
                      </div>
                      <div className="text-lg font-semibold text-gray-800 mb-2">
                        {formatCurrency(item.harga_satuan)}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        Subtotal
                      </div>
                      <div className="text-lg font-bold text-green-600 bg-white px-3 py-2 rounded-lg border border-green-200">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer dengan Total */}
            <div className="pt-4 border-t border-gray-200 bg-white rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-700">Total Items</div>
                  <div className="text-xs text-gray-500">{totalItems} barang</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Total Pembelian</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(barang.reduce((sum, item) => sum + item.subtotal, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PesananTableProps {
  data: Pesanan[];
  onUpdateStatus: (id: string, status: string) => void;
  loading?: boolean;
}

const PesananTable: React.FC<PesananTableProps> = ({ data, onUpdateStatus, loading = false }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="w-full text-center py-8 text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                📋 Nomor Transaksi
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                📅 Tanggal
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                🛒 Barang Dibeli
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                💰 Total Harga
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                💳 Metode Pembayaran
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                📊 Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                ⚡ Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                  key={item._id || `row-${index}-${Date.now()}`} 
                  className="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-md border-b border-gray-100"
                >
                  {/* Nomor Transaksi */}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 font-mono">
                          {item.nomor_transaksi || "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {item._id?.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tanggal */}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                    <div className="text-sm text-gray-900 font-medium">
                      {item.tanggal_transaksi ? formatDate(item.tanggal_transaksi) : "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.tanggal_transaksi ? new Date(item.tanggal_transaksi).toLocaleTimeString('id-ID') : ""}
                    </div>
                  </td>

                  {/* Barang Dibeli dengan Dropdown */}
                  <td className="px-6 py-4 border-r border-gray-100">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <BarangDropdown barang={item.barang_dibeli || []} />
                    </div>
                  </td>

                  {/* Total Harga */}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(item.total_harga || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.barang_dibeli?.length || 0} item
                      </div>
                    </div>
                  </td>

                  {/* Metode Pembayaran */}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getPaymentMethodClass(item.metode_pembayaran || "")}`}>
                        {getPaymentIcon(item.metode_pembayaran || "")}
                        <span className="ml-2">{item.metode_pembayaran || "-"}</span>
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                    <div className="flex flex-col items-start space-y-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusClass(
                          item.status || ""
                        )}`}
                      >
                        {item.status === 'pending' && '⏳'}
                        {item.status === 'diproses' && '🔄'}
                        {item.status === 'selesai' && '✅'}
                        {item.status === 'dibatalkan' && '❌'}
                        <span className="ml-1">
                          {item.status
                            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                            : "Tidak diketahui"}
                        </span>
                      </span>
                      <div className="text-xs text-gray-500">
                        {item.updatedAt ? `Diupdate: ${new Date(item.updatedAt).toLocaleDateString('id-ID')}` : ''}
                      </div>
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => onUpdateStatus(item._id, "diproses")}
                        disabled={loading || item.status === "diproses"}
                        className={`inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-semibold rounded-lg transition-all duration-200 ${
                          item.status === "diproses" 
                            ? "bg-blue-100 text-blue-400 cursor-not-allowed border border-blue-200" 
                            : "text-blue-700 bg-blue-50 hover:bg-blue-100 hover:shadow-sm border border-blue-200"
                        }`}
                        title="Proses pesanan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Update Pesanan
                      </button>
                      <button
                        onClick={() => onUpdateStatus(item._id, "selesai")}
                        disabled={loading || item.status === "selesai"}
                        className={`inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-semibold rounded-lg transition-all duration-200 ${
                          item.status === "selesai" 
                            ? "bg-green-100 text-green-400 cursor-not-allowed border border-green-200" 
                            : "text-green-700 bg-green-50 hover:bg-green-100 hover:shadow-sm border border-green-200"
                        }`}
                        title="Selesaikan pesanan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selesai
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center border-b border-gray-100">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Tidak ada data pesanan</p>
                    <p className="text-sm">Semua pesanan akan muncul di sini</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer dengan informasi */}
      {data.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Menampilkan {data.length} pesanan</span>
            <span>Total: {formatCurrency(data.reduce((sum, item) => sum + (item.total_harga || 0), 0))}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PesananTable;