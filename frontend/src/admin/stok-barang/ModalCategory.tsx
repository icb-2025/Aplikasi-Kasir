// ModalCategory.tsx
import React, { useState, useEffect, useCallback } from "react";
import { SweetAlert } from "../../components/SweetAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
const ipbe = import.meta.env.VITE_IPBE;


interface KategoriAPI {
  _id: string;
  nama: string;
  deskripsi: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CategoryFormData {
  nama: string;
  deskripsi: string;
}

interface ModalCategoryProps {
  visible: boolean;
  onClose: () => void;
  onKategoriChange: () => void;
}

const API_URL = `${ipbe}:5000/api/admin/kategori`;

const ModalCategory: React.FC<ModalCategoryProps> = ({ visible, onClose, onKategoriChange }) => {
  const [categories, setCategories] = useState<KategoriAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    nama: "",
    deskripsi: "",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setServerError(false);
    try {
      console.log("Fetching categories...");
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: KategoriAPI[] = await res.json();
      console.log("Categories fetched:", data);
      setCategories(data);
    } catch (err) {
      console.error("Gagal ambil data kategori:", err);
      setServerError(true);
      SweetAlert.error("Gagal mengambil data kategori");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible, fetchCategories]);

  const resetForm = () => {
    setFormData({
      nama: "",
      deskripsi: "",
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const category = categories.find((item) => item._id === id);
    if (category) {
      setFormData({
        nama: category.nama,
        deskripsi: category.deskripsi,
      });
      setIsEditing(true);
      setEditId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await SweetAlert.confirmDelete();
      
      if (result.isConfirmed) {
        await SweetAlert.loading("Menghapus kategori...");
        
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE"
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        SweetAlert.close();
        await fetchCategories();
        onKategoriChange(); // Refresh kategori di parent component
        await SweetAlert.success("Kategori berhasil dihapus");
      }
    } catch (err) {
      console.error("Gagal hapus kategori:", err);
      SweetAlert.close();
      SweetAlert.error("Gagal menghapus kategori");
    }
  };

  const validateForm = () => {
    if (!formData.nama.trim()) {
      SweetAlert.error("Nama kategori harus diisi");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const payload = {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
      };

      await SweetAlert.loading(isEditing ? "Mengupdate kategori..." : "Menambahkan kategori...");

      let res: Response;
      if (isEditing && editId) {
        res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }

      SweetAlert.close();
      await fetchCategories();
      onKategoriChange(); // Refresh kategori di parent component
      resetForm();
      await SweetAlert.success(isEditing ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan");
    } catch (err: unknown) {
      console.error("Gagal submit kategori:", err);
      SweetAlert.close();
      SweetAlert.error("Gagal menyimpan kategori");
    } finally {
      setActionLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Manajemen Kategori
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {showForm ? (
            // Form Tambah/Edit Kategori
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => handleInputChange("nama", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                  disabled={actionLoading}
                  placeholder="Masukkan nama kategori"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange("deskripsi", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  rows={3}
                  disabled={actionLoading}
                  placeholder="Masukkan deskripsi kategori"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[100px] disabled:opacity-50"
                >
                  {actionLoading ? (
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
          ) : (
            // Daftar Kategori
            <>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-800">Daftar Kategori</h4>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Tambah Kategori
                </button>
              </div>

              {serverError ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Server Error</h3>
                  <p className="text-gray-500 mb-4">Tidak dapat mengambil data kategori</p>
                  <button
                    onClick={fetchCategories}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="mt-4">Memuat data kategori...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak Ada Kategori</h3>
                  <p className="text-gray-500 mb-4">Belum ada kategori yang tersedia</p>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tambah Kategori Pertama
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th className="px-6 py-3">Nama</th>
                        <th className="px-6 py-3">Deskripsi</th>
                        <th className="px-6 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr
                          key={category._id}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {category.nama}
                          </td>
                          <td className="px-6 py-4">
                            {category.deskripsi || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(category._id)}
                                className="font-medium text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                title="Edit kategori"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="font-medium text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Hapus kategori"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCategory;