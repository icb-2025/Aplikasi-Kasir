import React from "react";
import type { Pesanan } from ".";

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
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'dibatalkan':
      return 'bg-red-100 text-red-800';
    case 'diproses':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor Transaksi
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barang Dibeli
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Harga
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metode Pembayaran
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                  key={item._id || `row-${index}-${Date.now()}`} 
                  className={`transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
                  }`}
                >
                  {/* Nomor Transaksi */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.nomor_transaksi || "-"}
                    </div>
                  </td>

                  {/* Tanggal */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.tanggal_transaksi ? formatDate(item.tanggal_transaksi) : "-"}
                    </div>
                  </td>

                  {/* Barang Dibeli */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {item.barang_dibeli && item.barang_dibeli.length > 0 ? (
                        <div className="space-y-1">
                          {item.barang_dibeli.map((barang, barangIndex) => (
                            <div key={barangIndex} className="border-l-2 border-blue-200 pl-2 py-1">
                              <div className="font-medium">{barang.nama_barang}</div>
                              <div className="text-gray-500 text-xs">
                                {barang.jumlah} x {formatCurrency(barang.harga_satuan)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </div>
                  </td>

                  {/* Total Harga */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(item.total_harga || 0)}
                    </div>
                  </td>

                  {/* Metode Pembayaran */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {item.metode_pembayaran || "-"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        item.status || ""
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
                        onClick={() => onUpdateStatus(item._id, "diproses")}
                        disabled={loading || item.status === "diproses"}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md ${
                          item.status === "diproses" 
                            ? "bg-blue-100 text-blue-400 cursor-not-allowed" 
                            : "text-blue-700 bg-blue-100 hover:bg-blue-200"
                        }`}
                        title="Proses pesanan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Proses
                      </button>
                      <button
                        onClick={() => onUpdateStatus(item._id, "selesai")}
                        disabled={loading || item.status === "selesai"}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md ${
                          item.status === "selesai" 
                            ? "bg-green-100 text-green-400 cursor-not-allowed" 
                            : "text-green-700 bg-green-100 hover:bg-green-200"
                        }`}
                        title="Selesaikan pesanan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selesai
                      </button>
                      <button
                        onClick={() => onUpdateStatus(item._id, "dibatalkan")}
                        disabled={loading || item.status === "dibatalkan"}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md ${
                          item.status === "dibatalkan" 
                            ? "bg-red-100 text-red-400 cursor-not-allowed" 
                            : "text-red-700 bg-red-100 hover:bg-red-200"
                        }`}
                        title="Batalkan pesanan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batal
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data pesanan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PesananTable;