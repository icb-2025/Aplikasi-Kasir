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
      <div className="overflow-x-auto rounded-lg shadow">
        <div className="w-full text-center py-8 text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-6 py-3">Nomor Transaksi</th>
            <th className="px-6 py-3">Tanggal</th>
            <th className="px-6 py-3">Barang Dibeli</th>
            <th className="px-6 py-3">Total Harga</th>
            <th className="px-6 py-3">Metode Pembayaran</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, idx) => (
              <tr
                key={item._id || `row-${idx}-${Date.now()}`}
                className="bg-white border-b hover:bg-gray-50"
              >
                {/* Nomor Transaksi */}
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.nomor_transaksi || "-"}
                </td>

                {/* Tanggal */}
                <td className="px-6 py-4">
                  {item.tanggal_transaksi ? formatDate(item.tanggal_transaksi) : "-"}
                </td>

                {/* Barang Dibeli */}
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {item.barang_dibeli && item.barang_dibeli.length > 0 ? (
                      <div className="space-y-1">
                        {item.barang_dibeli.map((barang, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{barang.nama_barang}</div>
                            <div className="text-gray-500">
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
                <td className="px-6 py-4 font-medium text-green-600">
                  {formatCurrency(item.total_harga || 0)}
                </td>

                {/* Metode Pembayaran */}
                <td className="px-6 py-4">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {item.metode_pembayaran || "-"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      item.status || ""
                    )}`}
                  >
                    {item.status
                      ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                      : "Tidak diketahui"}
                  </span>
                </td>

                {/* Aksi - Diperbaiki */}
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => onUpdateStatus(item._id, "diproses")}
                      disabled={loading || item.status === "diproses"}
                      className={`font-medium p-2 rounded-lg transition-colors ${
                        item.status === "diproses" 
                          ? "bg-blue-100 text-blue-400 cursor-not-allowed" 
                          : "text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                      }`}
                      title="Proses pesanan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(item._id, "selesai")}
                      disabled={loading || item.status === "selesai"}
                      className={`font-medium p-2 rounded-lg transition-colors ${
                        item.status === "selesai" 
                          ? "bg-green-100 text-green-400 cursor-not-allowed" 
                          : "text-green-600 hover:bg-green-100 hover:text-green-800"
                      }`}
                      title="Selesaikan pesanan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(item._id, "dibatalkan")}
                      disabled={loading || item.status === "dibatalkan"}
                      className={`font-medium p-2 rounded-lg transition-colors ${
                        item.status === "dibatalkan" 
                          ? "bg-red-100 text-red-400 cursor-not-allowed" 
                          : "text-red-600 hover:bg-red-100 hover:text-red-800"
                      }`}
                      title="Batalkan pesanan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr key="no-data">
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data pesanan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PesananTable;