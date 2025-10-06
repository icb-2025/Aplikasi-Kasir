// src/admin/status-pesanan/StatusModal.tsx
import React, { useState } from "react";
import { SweetAlert } from "../../components/SweetAlert"; // Pastikan path ini benar

interface StatusModalProps {
  visible: boolean;
  pesananId: string;
  currentStatus: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  loading?: boolean;
}

const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  pesananId,
  currentStatus,
  onClose,
  onUpdateStatus,
  loading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "diproses", label: "Diproses", color: "bg-blue-100 text-blue-800" },
    { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-800" },
    { value: "dibatalkan", label: "Dibatalkan", color: "bg-red-100 text-red-800" },
  ];

  const handleSubmit = async () => {
    if (selectedStatus === currentStatus) {
      // Perbaikan: Ganti SweetAlert.info dengan SweetAlert.success
      await SweetAlert.success("Status tidak berubah");
      return;
    }

    try {
      await SweetAlert.loading("Mengupdate status...");
      await onUpdateStatus(pesananId, selectedStatus);
      SweetAlert.close();
      await SweetAlert.success("Status berhasil diperbarui");
      onClose();
    } catch {
      // Perbaikan: Hapus parameter err yang tidak digunakan
      SweetAlert.close();
      SweetAlert.error("Gagal memperbarui status");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Update Status Pesanan
          </h3>
        </div>

        {/* Form */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStatus === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={() => setSelectedStatus(option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span
                    className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${option.color}`}
                  >
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[100px] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Memperbarui...
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;