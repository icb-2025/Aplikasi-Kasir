// ModalBarang.tsx
import React, { useState, useEffect } from "react";

export interface BarangFormData {
  kode: string;
  nama: string;
  kategori: string;
  hargaBeli: string;
  hargaJual: string;
  stok: string;
  gambar?: File | null;
  gambarUrl?: string;
  useDiscount?: boolean;
}

interface ModalBarangProps {
  visible: boolean;
  isEditing: boolean;
  formData: BarangFormData;
  onInputChange: (field: keyof BarangFormData, value: string | File | null | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading?: boolean;
  kategoriOptions: string[];
  onGenerateCode: () => void;
}

const ModalBarang: React.FC<ModalBarangProps> = ({
  visible,
  isEditing,
  formData,
  onInputChange,
  onSubmit,
  onClose,
  loading = false,
  kategoriOptions,
  onGenerateCode
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Debug log untuk kategoriOptions
  useEffect(() => {
    console.log("Kategori options in ModalBarang:", kategoriOptions);
  }, [kategoriOptions]);

  // sync previewUrl dengan formData.gambarUrl
  useEffect(() => {
    if (formData.gambarUrl) {
      setPreviewUrl(formData.gambarUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.gambarUrl]);

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onInputChange("gambar", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    onInputChange("gambar", null);
    onInputChange("gambarUrl", "");
    setPreviewUrl(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Barang" : "Tambah Barang Baru"}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* kode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Barang
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => onInputChange("kode", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                  disabled={loading}
                  placeholder="Masukkan kode barang"
                />
                <button
                  type="button"
                  onClick={onGenerateCode}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  disabled={loading}
                  title="Generate kode acak"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Barang
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => onInputChange("nama", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>

            {/* kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => onInputChange("kategori", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={loading}
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
              {kategoriOptions.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Tidak ada kategori tersedia. Silakan tambah kategori terlebih dahulu.
                </p>
              )}
            </div>

            {/* use discount checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="use-discount"
                type="checkbox"
                checked={!!formData.useDiscount}
                onChange={(e) => onInputChange("useDiscount", e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="use-discount" className="text-sm text-gray-700">
                Gunakan Diskon Global untuk produk ini
              </label>
            </div>

            {/* harga beli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Beli
              </label>
              <input
                type="number"
                min="0"
                value={formData.hargaBeli}
                onChange={(e) => onInputChange("hargaBeli", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>

            {/* harga jual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <input
                type="number"
                min="0"
                value={formData.hargaJual}
                onChange={(e) => onInputChange("hargaJual", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>

            {/* stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok
              </label>
              <input
                type="number"
                min="0"
                value={formData.stok}
                onChange={(e) => onInputChange("stok", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>

            {/* gambar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gambar Barang
              </label>
              {(previewUrl || formData.gambarUrl) && (
                <div className="mb-3">
                  <img
                    src={previewUrl || formData.gambarUrl}
                    alt="Preview"
                    className="h-32 w-32 object-contain border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG, GIF. Maksimal 5MB.
              </p>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || kategoriOptions.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[100px] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditing ? "Updating..." : "Menyimpan..."}
                </>
              ) : (
                isEditing ? "Update" : "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBarang;