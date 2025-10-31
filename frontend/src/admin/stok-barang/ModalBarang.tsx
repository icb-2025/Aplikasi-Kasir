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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[95vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Edit Barang" : "Tambah Barang"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isEditing ? "Perbarui informasi barang" : "Tambahkan barang baru ke inventaris"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-8 py-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Kode Barang */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kode Barang <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => onInputChange("kode", e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 bg-white"
                  required
                  disabled={loading}
                  placeholder="Kode barang unik"
                />
                <button
                  type="button"
                  onClick={onGenerateCode}
                  disabled={loading}
                  className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 border border-gray-300 transition-all duration-200 disabled:opacity-50 font-medium text-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Nama Barang */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => onInputChange("nama", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 bg-white"
                required
                disabled={loading}
                placeholder="Masukkan nama barang"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => onInputChange("kategori", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 bg-white appearance-none"
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
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm">Tidak ada kategori tersedia. Silakan tambah kategori terlebih dahulu.</span>
                </div>
              )}
            </div>

            {/* Discount Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white border border-blue-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-800">Gunakan Diskon Global</span>
                  <span className="block text-xs text-gray-600">Terapkan diskon sistem untuk produk ini</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.useDiscount}
                  onChange={(e) => onInputChange("useDiscount", e.target.checked)}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Harga Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Harga Beli */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Harga Beli <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.hargaBeli}
                    onChange={(e) => onInputChange("hargaBeli", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 bg-white"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Harga Jual */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Harga Jual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.hargaJual}
                    onChange={(e) => onInputChange("hargaJual", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 bg-white"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Stok */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stok}
                onChange={(e) => onInputChange("stok", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 bg-white"
                required
                disabled={loading}
              />
            </div>

            {/* Gambar Barang */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Gambar Barang
              </label>
              
              {/* Preview Image */}
              {(previewUrl || formData.gambarUrl) && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <img
                    src={previewUrl || formData.gambarUrl}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-lg border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Preview Gambar</p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="mt-1 text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Hapus Gambar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* File Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all duration-200 bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label htmlFor="file-upload" className="cursor-pointer disabled:opacity-50">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Format: JPG, PNG, GIF • Maksimal 5MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || kategoriOptions.length === 0}
              className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-500/25 flex items-center space-x-2 min-w-[120px] justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditing ? "Memperbarui..." : "Menyimpan..."}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M5 13l4 4L19 7" : "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"} />
                  </svg>
                  <span>{isEditing ? "Update" : "Simpan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBarang;