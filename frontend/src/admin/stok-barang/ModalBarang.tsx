  // src/admin/stok-barang/ModalBarang.tsx
  import React, { useState, useEffect } from "react";
  import { X, Plus, Trash2, Calculator } from "lucide-react";

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
    const [activeTab, setActiveTab] = useState<"basic" | "bahan">("basic");
    const [useBahanBaku, setUseBahanBaku] = useState(false);
    const [selectedBahanBaku, setSelectedBahanBaku] = useState<string>("");
    const [margin, setMargin] = useState(0);
    const [showCalculation, setShowCalculation] = useState(false);

    useEffect(() => {
      // Check if the item has bahan baku data
      if (formData && formData.bahanBaku && formData.bahanBaku.length > 0) {
        setUseBahanBaku(true);
      } else {
        setUseBahanBaku(false);
      }
    }, [formData?.bahanBaku]);

    useEffect(() => {
      // Calculate margin when hargaBeli or hargaJual changes
      if (formData && formData.hargaBeli && formData.hargaJual) {
        const beli = parseFloat(formData.hargaBeli);
        const jual = parseFloat(formData.hargaJual);
        if (!isNaN(beli) && !isNaN(jual) && beli > 0) {
          const marginValue = ((jual - beli) / beli) * 100;
          setMargin(Math.round(marginValue));
        }
      }
    }, [formData?.hargaBeli, formData?.hargaJual]);

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
          
          // Calculate harga beli based on modal per porsi
          if (selected.modal_per_porsi > 0) {
            onInputChange("hargaBeli", selected.modal_per_porsi.toString());
          }
        }
      }
    };

    const addBahanBakuItem = () => {
      const newBahanBaku: BahanBakuFormData = {
        nama_produk: "",
        bahan: []
      };
      
      const currentBahanBaku = formData?.bahanBaku || [];
      onInputChange("bahanBaku", [...currentBahanBaku, newBahanBaku]);
    };

    const removeBahanBakuItem = (index: number) => {
      const currentBahanBaku = formData?.bahanBaku || [];
      const updatedBahanBaku = currentBahanBaku.filter((_, i) => i !== index);
      onInputChange("bahanBaku", updatedBahanBaku);
    };

    const updateBahanBakuItem = (index: number, field: keyof BahanBakuFormData, value: string | Array<{nama: string, harga: number, jumlah: number}>) => {
      const currentBahanBaku = formData?.bahanBaku || [];
      const updatedBahanBaku = [...currentBahanBaku];
      updatedBahanBaku[index] = {
        ...updatedBahanBaku[index],
        [field]: value
      };
      onInputChange("bahanBaku", updatedBahanBaku);
    };

    const addBahanItem = (bahanBakuIndex: number) => {
      const currentBahanBaku = formData?.bahanBaku || [];
      const updatedBahanBaku = [...currentBahanBaku];
      
      if (!updatedBahanBaku[bahanBakuIndex].bahan) {
        updatedBahanBaku[bahanBakuIndex].bahan = [];
      }
      
      updatedBahanBaku[bahanBakuIndex].bahan.push({
        nama: "",
        harga: 0,
        jumlah: 1
      });
      
      onInputChange("bahanBaku", updatedBahanBaku);
    };

    const removeBahanItem = (bahanBakuIndex: number, bahanIndex: number) => {
      const currentBahanBaku = formData?.bahanBaku || [];
      const updatedBahanBaku = [...currentBahanBaku];
      
      updatedBahanBaku[bahanBakuIndex].bahan = updatedBahanBaku[bahanBakuIndex].bahan.filter(
        (_, i) => i !== bahanIndex
      );
      
      onInputChange("bahanBaku", updatedBahanBaku);
    };

    const updateBahanItem = (bahanBakuIndex: number, bahanIndex: number, field: "nama" | "harga" | "jumlah", value: string | number) => {
      const currentBahanBaku = formData?.bahanBaku || [];
      const updatedBahanBaku = [...currentBahanBaku];
      
      updatedBahanBaku[bahanBakuIndex].bahan[bahanIndex] = {
        ...updatedBahanBaku[bahanBakuIndex].bahan[bahanIndex],
        [field]: field === "nama" ? value : Number(value)
      };
      
      onInputChange("bahanBaku", updatedBahanBaku);
    };

    const calculateTotalHargaBahan = () => {
      if (!formData?.bahanBaku || formData.bahanBaku.length === 0) return 0;
      
      return formData.bahanBaku.reduce((total, produk) => {
        return total + produk.bahan.reduce((subtotal, bahan) => {
          return subtotal + (bahan.harga || 0);
        }, 0);
      }, 0);
    };

    const calculateTotalPorsi = () => {
      if (!formData?.bahanBaku || formData.bahanBaku.length === 0) return 0;
      
      return formData.bahanBaku.reduce((total, produk) => {
        return total + produk.bahan.reduce((subtotal, bahan) => {
          return subtotal + (bahan.jumlah || 0);
        }, 0);
      }, 0);
    };

    const calculateModalPerPorsi = () => {
      const totalHarga = calculateTotalHargaBahan();
      const totalPorsi = calculateTotalPorsi();
      return totalPorsi > 0 ? Math.round(totalHarga / totalPorsi) : 0;
    };

    const handleMarginChange = (value: string) => {
      const marginValue = parseFloat(value);
      if (!isNaN(marginValue)) {
        setMargin(marginValue);
        
        if (formData?.hargaBeli && !isNaN(parseFloat(formData.hargaBeli))) {
          const beli = parseFloat(formData.hargaBeli);
          const jual = beli + (beli * (marginValue / 100));
          onInputChange("hargaJual", jual.toString());
        }
      }
    };

    if (!visible) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? "Edit Barang" : "Tambah Barang Baru"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="flex space-x-1 mb-6 border-b">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "basic"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("basic")}
              >
                Informasi Dasar
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "bahan"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("bahan")}
              >
                Bahan Baku
              </button>
            </div>

            <form onSubmit={onSubmit}>
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Barang
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={formData?.kode || ""}
                          onChange={(e) => onInputChange("kode", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Masukkan kode barang"
                          required
                        />
                        <button
                          type="button"
                          onClick={onGenerateCode}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-colors"
                          title="Generate kode acak"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Barang
                      </label>
                      <input
                        type="text"
                        value={formData?.nama || ""}
                        onChange={(e) => onInputChange("nama", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan nama barang"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                      </label>
                      <select
                        value={formData?.kategori || ""}
                        onChange={(e) => onInputChange("kategori", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {kategoriOptions.map((kategori) => (
                          <option key={kategori} value={kategori}>
                            {kategori}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stok
                      </label>
                      <input
                        type="number"
                        value={formData?.stok || ""}
                        onChange={(e) => onInputChange("stok", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan stok"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga Beli
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                        <input
                          type="number"
                          value={formData?.hargaBeli || ""}
                          onChange={(e) => onInputChange("hargaBeli", e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Margin (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={margin}
                          onChange={(e) => handleMarginChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga Jual
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                        <input
                          type="number"
                          value={formData?.hargaJual || ""}
                          onChange={(e) => onInputChange("hargaJual", e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gunakan Diskon
                      </label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          id="useDiscount"
                          checked={!!formData?.useDiscount}
                          onChange={(e) => onInputChange("useDiscount", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="useDiscount" className="ml-2 text-sm text-gray-700">
                          Aktifkan diskon untuk barang ini
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gambar Barang
                    </label>
                    <div className="flex items-center space-x-4">
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
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer text-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {formData?.gambar ? formData.gambar.name : "Pilih gambar"}
                        </label>
                      </div>
                      {formData?.gambar && (
                        <button
                          type="button"
                          onClick={() => onInputChange("gambar", null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    {formData?.gambar && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(formData.gambar)}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="use-bahan-baku"
                      checked={useBahanBaku}
                      onChange={(e) => setUseBahanBaku(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="use-bahan-baku" className="text-sm text-gray-700">
                      Gunakan data bahan baku dari modal utama
                    </label>
                  </div>

                  {useBahanBaku && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Bahan Baku
                      </label>
                      <select
                        value={selectedBahanBaku}
                        onChange={handleBahanBakuChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih bahan baku --</option>
                        {bahanBakuList.map((item) => (
                          <option key={item.nama_produk} value={item.nama_produk}>
                            {item.nama_produk} (Modal per porsi: Rp {item.modal_per_porsi.toLocaleString("id-ID")})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "bahan" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Data Bahan Baku</h3>
                    <button
                      type="button"
                      onClick={addBahanBakuItem}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Produk
                    </button>
                  </div>

                  {formData?.bahanBaku && formData.bahanBaku.length > 0 ? (
                    <div className="space-y-4">
                      {formData.bahanBaku.map((produk, produkIndex) => (
                        <div key={produkIndex} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex-1 mr-2">
                              <input
                                type="text"
                                value={produk.nama_produk}
                                onChange={(e) => updateBahanBakuItem(produkIndex, "nama_produk", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama produk"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeBahanBakuItem(produkIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Daftar Bahan</h4>
                              <button
                                type="button"
                                onClick={() => addBahanItem(produkIndex)}
                                className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-xs"
                              >
                                <Plus className="h-3 h-3 mr-1" />
                                Tambah Bahan
                              </button>
                            </div>

                            {produk.bahan && produk.bahan.length > 0 ? (
                              <div className="space-y-2">
                                {produk.bahan.map((bahan, bahanIndex) => (
                                  <div key={bahanIndex} className="grid grid-cols-12 gap-2">
                                    <div className="col-span-5">
                                      <input
                                        type="text"
                                        value={bahan.nama}
                                        onChange={(e) => updateBahanItem(produkIndex, bahanIndex, "nama", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Nama bahan"
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      <div className="relative">
                                        <span className="absolute left-2 top-2 text-gray-500 text-sm">Rp</span>
                                        <input
                                          type="number"
                                          value={bahan.harga}
                                          onChange={(e) => updateBahanItem(produkIndex, bahanIndex, "harga", e.target.value)}
                                          className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                          placeholder="0"
                                          min="0"
                                        />
                                      </div>
                                    </div>
                                    <div className="col-span-3">
                                      <input
                                        type="number"
                                        value={bahan.jumlah}
                                        onChange={(e) => updateBahanItem(produkIndex, bahanIndex, "jumlah", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Jumlah"
                                        min="1"
                                      />
                                    </div>
                                    <div className="col-span-1">
                                      <button
                                        type="button"
                                        onClick={() => removeBahanItem(produkIndex, bahanIndex)}
                                        className="w-full h-full text-red-500 hover:text-red-700 flex items-center justify-center"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">Belum ada bahan untuk produk ini</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Belum ada data bahan baku. Klik "Tambah Produk" untuk menambahkan.</p>
                  )}

                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Ringkasan Bahan Baku</h4>
                      <button
                        type="button"
                        onClick={() => setShowCalculation(!showCalculation)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        {showCalculation ? "Sembunyikan" : "Tampilkan"} perhitungan
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Harga Bahan:</span>
                        <span className="ml-2 font-medium">Rp {calculateTotalHargaBahan().toLocaleString("id-ID")}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Porsi:</span>
                        <span className="ml-2 font-medium">{calculateTotalPorsi()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Modal per Porsi:</span>
                        <span className="ml-2 font-medium">Rp {calculateModalPerPorsi().toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    {showCalculation && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                        <p>Total Harga Bahan = Σ (harga semua bahan)</p>
                        <p>Total Porsi = Σ (jumlah semua bahan)</p>
                        <p>Modal per Porsi = Total Harga Bahan / Total Porsi</p>
                        <p className="mt-2">
                          <button
                            type="button"
                            onClick={() => onInputChange("hargaBeli", calculateModalPerPorsi().toString())}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                          >
                            Gunakan sebagai Harga Beli
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ModalBarang;
