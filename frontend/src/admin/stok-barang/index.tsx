import React, { useState, useEffect, useCallback, useRef } from "react";
import BarangTable from "./BarangTable";
import ModalBarang from "./ModalBarang";
import type { BarangFormData } from "./ModalBarang";
import LoadingSpinner from "../../components/LoadingSpinner";
import { SweetAlert } from "../../components/SweetAlert";
import io, { Socket } from "socket.io-client";

export interface BarangAPI {
  _id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  stok_minimal?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  hargaFinal?: number;
  gambar_url?: string;
  status?: string;
}

export interface Barang {
  _id: string;
  kode: string;
  nama: string;
  kategori: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMinimal?: number;
  hargaFinal?: number;
  gambarUrl?: string;
  status?: string;
}

interface ListBarangProps {
  dataBarang: Barang[];
  setDataBarang: React.Dispatch<React.SetStateAction<Barang[]>>;
}

const API_URL = "http://192.168.110.16:5000/api/admin/stok-barang";
const KATEGORI = ["Makanan", "Minuman", "Cemilan", "Signature"];

interface ApiError extends Error {
  message: string;
}

const StokBarangAdmin: React.FC<ListBarangProps> = ({ dataBarang, setDataBarang }) => {
  const socketRef = useRef<Socket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [formData, setFormData] = useState<BarangFormData>({
    kode: "",
    nama: "",
    kategori: KATEGORI[0],
    hargaBeli: "",
    hargaJual: "",
    stok: "",
    gambarUrl: "",
    gambar: null,
  });

  // Inisialisasi Socket.IO
  useEffect(() => {
    socketRef.current = io("http://192.168.110.16:5000");
    
    // Dengarkan event stockUpdated dari server
    socketRef.current.on('stockUpdated', (data: { id: string; stok: number }) => {
      setDataBarang(prevData => 
        prevData.map(item => {
          if (item._id === data.id) {
            const newStok = data.stok;
            const status = newStok <= 0 
              ? "habis" 
              : newStok <= (item.stokMinimal || 5) 
                ? "hampir habis" 
                : "aman";
            return { 
              ...item, 
              stok: newStok,
              status
            };
          }
          return item;
        })
      );
    });

    // Cleanup saat komponen unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setDataBarang]);

  const fetchBarang = useCallback(async () => {
    setLoading(true);
    setServerError(false);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: BarangAPI[] = await res.json();
      const mapped: Barang[] = data.map((item) => ({
        _id: item._id,
        kode: item.kode_barang,
        nama: item.nama_barang,
        kategori: item.kategori,
        hargaBeli: item.harga_beli,
        hargaJual: item.harga_jual,
        stok: item.stok,
        stokMinimal: item.stok_minimal || 5,
        hargaFinal: item.hargaFinal,
        gambarUrl: item.gambar_url,
        status: item.status || (item.stok <= 0 ? "habis" : item.stok <= (item.stok_minimal || 5) ? "hampir habis" : "aman"),
      }));
      setDataBarang(mapped);
    } catch (err) {
      console.error("Gagal ambil data:", err);
      setServerError(true);
      SweetAlert.error("Gagal mengambil data barang");
    } finally {
      setLoading(false);
      setInitialLoad(false);
      setIsReloading(false);
    }
  }, [setDataBarang]);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const filteredBarang = dataBarang.filter(
    (item) =>
      (item.nama ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kode ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kategori ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      kode: "",
      nama: "",
      kategori: KATEGORI[0],
      hargaBeli: "",
      hargaJual: "",
      stok: "",
      gambarUrl: "",
      gambar: null,
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleInputChange = (field: keyof BarangFormData, value: string | File | null) => {
    setFormData((prev: BarangFormData) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (id: string) => {
    const barang = dataBarang.find((item) => item._id === id);
    if (barang) {
      setFormData({
        kode: barang.kode || "",
        nama: barang.nama || "",
        kategori: barang.kategori || KATEGORI[0],
        hargaBeli: barang.hargaBeli?.toString() || "",
        hargaJual: barang.hargaJual?.toString() || "",
        stok: barang.stok?.toString() || "",
        gambarUrl: barang.gambarUrl || "",
        gambar: null,
      });
      setIsEditing(true);
      setEditId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await SweetAlert.confirmDelete();
      
      if (result.isConfirmed) {
        await SweetAlert.loading("Menghapus barang...");
        
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE"
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        // Emit event stockUpdated dengan stok 0
        if (socketRef.current) {
          socketRef.current.emit('stockUpdated', { 
            id: id, 
            stok: 0 
          });
        }
        
        SweetAlert.close();
        setDataBarang(prevData => prevData.filter(item => item._id !== id));
        await SweetAlert.success("Barang berhasil dihapus");
      }
    } catch (err) {
      console.error("Gagal hapus:", err);
      SweetAlert.close();
      SweetAlert.error("Gagal menghapus barang");
    }
  };

  const validateForm = () => {
    if (!formData.kode.trim()) {
      SweetAlert.error("Kode barang harus diisi");
      return false;
    }
    if (!formData.nama.trim()) {
      SweetAlert.error("Nama barang harus diisi");
      return false;
    }
    if (!formData.kategori) {
      SweetAlert.error("Kategori harus dipilih");
      return false;
    }
    if (!formData.hargaBeli || isNaN(Number(formData.hargaBeli)) || Number(formData.hargaBeli) <= 0) {
      SweetAlert.error("Harga beli harus berupa angka yang valid");
      return false;
    }
    if (!formData.hargaJual || isNaN(Number(formData.hargaJual)) || Number(formData.hargaJual) <= 0) {
      SweetAlert.error("Harga jual harus berupa angka yang valid");
      return false;
    }
    if (!formData.stok || isNaN(Number(formData.stok)) || Number(formData.stok) < 0) {
      SweetAlert.error("Stok harus berupa angka yang valid");
      return false;
    }
    if (!isEditing && !formData.gambar) {
      SweetAlert.error("Gambar barang harus diunggah untuk barang baru");
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
      const payload = new FormData();
      payload.append("kode_barang", formData.kode.trim());
      payload.append("nama_barang", formData.nama.trim());
      payload.append("kategori", formData.kategori.trim());
      payload.append("harga_beli", formData.hargaBeli);
      payload.append("harga_jual", formData.hargaJual);
      payload.append("stok", formData.stok);
      payload.append("stok_minimal", "5");

      if (formData.gambar) {
        payload.append("gambar", formData.gambar);
      }

      await SweetAlert.loading(isEditing ? "Mengupdate barang..." : "Menambahkan barang...");

      let res: Response;
      if (isEditing && editId) {
        res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          body: payload,
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }

      SweetAlert.close();
      setIsReloading(true);
      await fetchBarang();
      
      // Emit event stockUpdated setelah operasi berhasil
      if (socketRef.current) {
        if (isEditing && editId) {
          socketRef.current.emit('stockUpdated', { 
            id: editId, 
            stok: Number(formData.stok) 
          });
        } else {
          // Untuk barang baru, kita perlu mendapatkan ID dari response
          const newBarang = await res.json();
          socketRef.current.emit('stockUpdated', { 
            id: newBarang._id, 
            stok: Number(formData.stok) 
          });
        }
      }
      
      resetForm();
      setShowModal(false);
      await SweetAlert.success(isEditing ? "Barang berhasil diperbarui" : "Barang berhasil ditambahkan");
    } catch (err: unknown) {
      console.error("Gagal submit:", err);
      const error = err as ApiError;
      SweetAlert.close();
      SweetAlert.error(error.message || "Gagal menyimpan barang");
    } finally {
      setActionLoading(false);
      setIsReloading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {(actionLoading || isReloading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <LoadingSpinner />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daftar Barang</h1>
              <p className="text-gray-500 mt-1">Kelola inventaris barang Anda</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Cari barang..."
                className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={actionLoading || isReloading}
              />
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={actionLoading || isReloading}
              >
                Tambah Barang
              </button>
              <button
                onClick={() => {
                  setIsReloading(true);
                  fetchBarang();
                }}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading || isReloading}
              >
                Refresh Data
              </button>
            </div>
          </div>

          {serverError ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <img 
                  src="../images/nostokbarang.jpg" 
                  alt="Server Error" 
                  className="w-64 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Server Tidak Dapat Dihubungi</h3>
              <p className="text-gray-500 mb-4">Tidak dapat mengambil data barang. Silakan periksa koneksi server atau coba lagi nanti.</p>
              <button
                onClick={() => {
                  setIsReloading(true);
                  fetchBarang();
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : loading && initialLoad ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="mt-4">Memuat data awal...</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="mt-4">Mengupdate data...</p>
            </div>
          ) : (
            <BarangTable
              data={filteredBarang}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <ModalBarang
        visible={showModal}
        isEditing={isEditing}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        loading={actionLoading || isReloading}
        kategoriOptions={KATEGORI}
      />
    </div>
  );
};

export default StokBarangAdmin;