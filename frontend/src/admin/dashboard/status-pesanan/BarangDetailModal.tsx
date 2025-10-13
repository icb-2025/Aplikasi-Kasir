import React from "react";
import type { BarangDibeli } from ".";

interface BarangDetailModalProps {
  visible: boolean;
  barangList: BarangDibeli[];
  onClose: () => void;
}

const BarangDetailModal: React.FC<BarangDetailModalProps> = ({ 
  visible, 
  barangList, 
  onClose 
}) => {
  if (!visible) return null;

  // Hitung total barang
  const totalBarang = barangList.reduce((sum, barang) => sum + barang.jumlah, 0);
  const totalHarga = barangList.reduce((sum, barang) => sum + barang.subtotal, 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Detail Barang Dibeli
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {barangList.length > 0 ? (
            <div className="space-y-4">
              {/* Ringkasan */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-blue-800">Total Barang:</span>
                  <span className="font-semibold text-blue-800">{totalBarang} item</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Total Harga:</span>
                  <span className="font-semibold text-blue-800">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(totalHarga)}
                  </span>
                </div>
              </div>
              
              {/* Tabel Barang */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Nama Barang</th>
                      <th className="px-4 py-2 text-center">Jumlah</th>
                      <th className="px-4 py-2 text-right">Harga Satuan</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangList.map((barang, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{barang.nama_barang}</td>
                        <td className="px-4 py-3 text-center">{barang.jumlah}</td>
                        <td className="px-4 py-3 text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(barang.harga_satuan)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(barang.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data barang
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarangDetailModal;