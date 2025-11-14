// src/admin/stok-barang/ModalBarang.tsx
import React, { useState, useEffect } from "react";

export interface BahanBakuItem {
  nama_produk: string;
  total_porsi: number;
  modal_per_porsi: number;
  bahan: Array<{
    nama: string;
    harga: number;
    jumlah: number;
  }>;
}

export interface BahanBakuFormData {
  nama_produk: string;
  bahan: Array<{
    nama: string;
    harga: number;
    jumlah: number;
  }>;
}

export interface BarangFormData {
  kode: string;
  nama: string;
  kategori: string;
  hargaBeli: string;
  hargaJual: string;
  stok: string;
  gambarUrl: string;
  gambar: File | null;
  useDiscount: boolean;
  bahanBaku?: BahanBakuFormData[];
}

interface ModalBarangProps {
  visible: boolean;
  isEditing: boolean;
  formData: BarangFormData;
  onInputChange: (field: keyof BarangFormData, value: string | File | null | boolean | BahanBakuFormData[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  kategoriOptions: string[];
  bahanBakuList: BahanBakuItem[];
  onGenerateCode: () => void;
}

const ModalBarang: React.FC<ModalBarangProps> = ({
  visible,
  isEditing,
  formData,
  onInputChange,
  onSubmit,
  onClose,
  loading,
  kategoriOptions,
  bahanBakuList,
  onGenerateCode
}) => {
  const [useBahanBaku, setUseBahanBaku] = useState(false);
  const [selectedBahanBaku, setSelectedBahanBaku] = useState<string>("");
  const [margin, setMargin] = useState(0);
  const [isNamaReadOnly, setIsNamaReadOnly] = useState(false);
  const [isStokReadOnly, setIsStokReadOnly] = useState(false);
  const [isHargaBeliReadOnly, setIsHargaBeliReadOnly] = useState(false);

  useEffect(() => {
    // Check if the item has bahan baku data
    if (formData && formData.bahanBaku && formData.bahanBaku.length > 0) {
      setUseBahanBaku(true);
      setIsNamaReadOnly(true);
      setIsStokReadOnly(true);
      setIsHargaBeliReadOnly(true);
    } else {
      setUseBahanBaku(false);
      setIsNamaReadOnly(false);
      setIsStokReadOnly(false);
      setIsHargaBeliReadOnly(false);
    }
  }, [formData?.bahanBaku, formData]);

  useEffect(() => {
    // Calculate margin when hargaBeli or hargaJual changes
    if (formData && formData.hargaBeli && formData.hargaJual) {
      const beli = parseFloat(formData.hargaBeli);
      const jual = parseFloat(formData.hargaJual);
      if (!isNaN(beli) && !isNaN(jual) && beli > 0) {
        const marginValue = ((jual - beli) / beli) * 100;
        setMargin(Math.round(marginValue * 100) / 100); // 2 decimal places
      }
    }
  }, [formData?.hargaBeli, formData?.hargaJual, formData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onInputChange("gambar", e.target.files[0]);
    }
  };

  const handleBahanBakuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedBahanBaku(selectedValue);
    
    if (selectedValue) {
      const selected = bahanBakuList.find(item => item.nama_produk === selectedValue);
      if (selected) {
        // Update form data with selected bahan baku
        onInputChange("bahanBaku", [{
          nama_produk: selected.nama_produk,
          bahan: selected.bahan
        }]);
        
        // Set nama barang dari nama bahan baku yang dipilih
        onInputChange("nama", selected.nama_produk);
        
        // Set stok dari total_porsi
        onInputChange("stok", selected.total_porsi.toString());
        
        // Calculate harga beli based on modal per porsi
        if (selected.modal_per_porsi > 0) {
          onInputChange("hargaBeli", selected.modal_per_porsi.toString());
        }
        
        // Set fields to read-only
        setIsNamaReadOnly(true);
        setIsStokReadOnly(true);
        setIsHargaBeliReadOnly(true);
      }
    } else {
      // Reset fields to editable when no bahan baku is selected
      setIsNamaReadOnly(false);
      setIsStokReadOnly(false);
      setIsHargaBeliReadOnly(false);
    }
  };

  const handleUseBahanBakuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setUseBahanBaku(isChecked);
    
    if (!isChecked) {
      // Reset bahan baku selection
      setSelectedBahanBaku("");
      onInputChange("bahanBaku", []);
      
      // Make fields editable again
      setIsNamaReadOnly(false);
      setIsStokReadOnly(false);
      setIsHargaBeliReadOnly(false);
    }
  };

  const handleMarginChange = (value: string) => {
    const marginValue = parseFloat(value);
    if (!isNaN(marginValue)) {
      setMargin(marginValue);
      
      if (formData?.hargaBeli && !isNaN(parseFloat(formData.hargaBeli))) {
        const beli = parseFloat(formData.hargaBeli);
        const jual = beli + (beli * (marginValue / 100));
        onInputChange("hargaJual", Math.round(jual).toString());
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal dengan ukuran yang lebih proporsional */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            {isEditing ? "Edit Barang" : "Tambah Barang Baru"}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="px-5 py-4 space-y-4">
          {/* Layout 2 kolom untuk menghemat ruang */}
          <div className="grid grid-cols-2 gap-3">
            {/* Kode Barang */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Barang
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData?.kode || ""}
                  onChange={(e) => onInputChange("kode", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kode"
                  required
                />
                <button
                  type="button"
                  onClick={onGenerateCode}
                  className="px-2 py-2 bg-blue-100 text-blue-700 rounded-r-lg hover:bg-blue-200 transition-colors text-xs border border-blue-200"
                  title="Generate kode acak"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Nama Barang */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Barang
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData?.nama || ""}
                  onChange={(e) => onInputChange("nama", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                    isNamaReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                  }`}
                  placeholder="Nama barang"
                  required
                  readOnly={isNamaReadOnly}
                />
                {isNamaReadOnly && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <div className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-xs font-medium">
                      Auto
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData?.kategori || ""}
                onChange={(e) => onInputChange("kategori", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Pilih --</option>
                {kategoriOptions.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </div>

            {/* Stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData?.stok || ""}
                  onChange={(e) => onInputChange("stok", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                    isStokReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                  }`}
                  placeholder="0"
                  min="0"
                  required
                  readOnly={isStokReadOnly}
                />
                {isStokReadOnly && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <div className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-xs font-medium">
                      Auto
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Integrasi Bahan Baku */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-bahan-baku"
                checked={useBahanBaku}
                onChange={handleUseBahanBakuChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="use-bahan-baku" className="text-sm text-gray-700">
                Gunakan data dari modal bahan baku
              </label>
            </div>

            {useBahanBaku && (
              <div className="space-y-2">
                <select
                  value={selectedBahanBaku}
                  onChange={handleBahanBakuChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Pilih produk bahan baku --</option>
                  {bahanBakuList.map((item) => (
                    <option key={item.nama_produk} value={item.nama_produk}>
                      {item.nama_produk} - Rp {item.modal_per_porsi.toLocaleString("id-ID")}/porsi
                    </option>
                  ))}
                </select>
                
                {selectedBahanBaku && (
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-start space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="h-2 w-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-800">Data terintegrasi</p>
                        <p className="text-xs text-green-700">
                          Nama, stok, dan harga beli diisi otomatis
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Harga - Layout 3 kolom */}
          <div className="grid grid-cols-3 gap-3">
            {/* Harga Beli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Beli
              </label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-500 text-xs">Rp</span>
                <input
                  type="number"
                  value={formData?.hargaBeli || ""}
                  onChange={(e) => onInputChange("hargaBeli", e.target.value)}
                  className={`w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                    isHargaBeliReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                  }`}
                  placeholder="0"
                  min="0"
                  required
                  readOnly={isHargaBeliReadOnly}
                />
                {isHargaBeliReadOnly && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <div className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-xs font-medium">
                      Auto
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => handleMarginChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-2 top-2 text-gray-500 text-xs">%</span>
              </div>
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-500 text-xs">Rp</span>
                <input
                  type="number"
                  value={formData?.hargaJual || ""}
                  onChange={(e) => onInputChange("hargaJual", e.target.value)}
                  className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Diskon */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useDiscount"
              checked={!!formData?.useDiscount}
              onChange={(e) => onInputChange("useDiscount", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useDiscount" className="text-sm text-gray-700">
              Aktifkan diskon untuk barang ini
            </label>
          </div>

          {/* Section: Gambar Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Barang
            </label>
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="gambar-upload"
                />
                <label
                  htmlFor="gambar-upload"
                  className="block w-full px-3 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">
                      {formData?.gambar ? formData.gambar.name : "Pilih gambar"}
                    </span>
                  </div>
                </label>
              </div>
              
              {formData?.gambar && (
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(formData.gambar)}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onInputChange("gambar", null)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                    >
                      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBarang;