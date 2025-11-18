import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../../components/LoadingSpinner';
import BahanBakuTable from './components/BahanBakuTable';
import TambahBahanBakuForm from './components/TambahBahanBakuForm';
import EditProdukForm from './components/EditProdukForm';
import EditBahanBakuForm from './components/EditBahanBakuForm';
import { Plus } from 'lucide-react'; // Hanya Plus yang digunakan di sini
import { portbe } from '../../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;

export interface Bahan {
  nama: string;
  harga: number;
  jumlah: number;
  _id?: string;
  id?: string;
  harga_porsi?: number;
}

export interface ProdukBahan {
  nama_produk: string;
  bahan: Bahan[];
  _id?: string;
  margin?: number;
  bahan_dengan_harga_porsi?: Bahan[];
  total_harga_bahan?: number;
  total_porsi?: number;
  modal_per_porsi?: number;
  harga_jual_per_porsi?: number;
}

// Tipe untuk respons API dari endpoint modal-utama
export interface ModalUtamaResponse {
  _id: string;
  total_modal: number;
  bahan_baku: ProdukBahan[];
  biaya_operasional: Record<string, unknown>[];
  sisa_modal: number;
  riwayat: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  total_pengeluaran: number;
  id: string;
}

// Tipe untuk error handling
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const ModalBahanBaku: React.FC = () => {
  const [bahanBaku, setBahanBaku] = useState<ProdukBahan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingProduk, setEditingProduk] = useState<ProdukBahan | null>(null);
  const [editingBahan, setEditingBahan] = useState<{produkIndex: number, bahanIndex: number} | null>(null);
  const [editBahanData, setEditBahanData] = useState<Bahan>({ nama: '', harga: 0, jumlah: 1 });

  // Fetch data bahan baku dari API
  useEffect(() => {
    const fetchBahanBaku = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ipbe}:${portbe}/api/admin/modal-utama`);
        
        if (!response.ok) {
          throw new Error('Gagal memuat data bahan baku');
        }
        
        const data: ModalUtamaResponse = await response.json();
        // Pastikan bahan_baku adalah array
        const bahanBakuData = Array.isArray(data.bahan_baku) ? data.bahan_baku : [];
        setBahanBaku(bahanBakuData);
        setLoading(false);
      } catch (err) {
        const error = err as ApiError;
        setError('Gagal memuat data bahan baku');
        setLoading(false);
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      }
    };

    fetchBahanBaku();
  }, []);

  // Refresh data dari server
  const refreshData = async () => {
    try {
      const response = await fetch(`${ipbe}:${portbe}/api/admin/modal-utama`);
      
      if (!response.ok) {
        throw new Error('Gagal memperbarui data');
      }
      
      const data: ModalUtamaResponse = await response.json();
      // Pastikan bahan_baku adalah array
      const bahanBakuData = Array.isArray(data.bahan_baku) ? data.bahan_baku : [];
      setBahanBaku(bahanBakuData);
    } catch (err) {
      const error = err as ApiError;
      console.error('Error refreshing data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.message || 'Gagal memperbarui data',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Handle hapus produk
  const handleDeleteProduk = async (produkIndex: number) => {
    try {
      const produk = bahanBaku[produkIndex];
      const produkId = produk._id || '';
      
      const response = await fetch(`${ipbe}:${portbe}/api/admin/modal-utama/bahan-baku/${produkId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus produk');
      }
      
      // Update state
      const updatedBahanBaku = [...bahanBaku];
      updatedBahanBaku.splice(produkIndex, 1);
      setBahanBaku(updatedBahanBaku);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Produk berhasil dihapus',
        confirmButtonColor: '#3b82f6'
      });
    } catch (err) {
      const error = err as ApiError;
      console.error('Error deleting produk:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.message || 'Gagal menghapus produk',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Handle hapus bahan
  const handleDeleteBahan = async (produkIndex: number, bahanIndex: number) => {
    try {
      const produk = bahanBaku[produkIndex];
      const bahan = produk.bahan[bahanIndex];
      const produkId = produk._id || '';
      const bahanId = bahan._id || '';
      
      const response = await fetch(`${ipbe}:${portbe}/api/admin/modal-utama/bahan-baku/${produkId}/bahan/${bahanId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus bahan');
      }
      
      // Update state
      const updatedBahanBaku = [...bahanBaku];
      
      // Pastikan bahan adalah array
      if (Array.isArray(updatedBahanBaku[produkIndex].bahan)) {
        updatedBahanBaku[produkIndex].bahan.splice(bahanIndex, 1);
        
        // Jika produk tidak memiliki bahan lagi, hapus produk juga
        if (updatedBahanBaku[produkIndex].bahan.length === 0) {
          updatedBahanBaku.splice(produkIndex, 1);
        }
      }
      
      setBahanBaku(updatedBahanBaku);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Bahan berhasil dihapus',
        confirmButtonColor: '#3b82f6'
      });
    } catch (err) {
      const error = err as ApiError;
      console.error('Error deleting bahan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.message || 'Gagal menghapus bahan',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Buka form edit bahan
  const openEditBahanForm = (produkIndex: number, bahanIndex: number) => {
    const produk = bahanBaku[produkIndex];
    if (Array.isArray(produk.bahan) && produk.bahan[bahanIndex]) {
      const bahan = produk.bahan[bahanIndex];
      setEditBahanData({...bahan});
      setEditingBahan({produkIndex, bahanIndex});
    }
  };

  // Tampilkan konfirmasi hapus
  const showDeleteConfirmation = async (type: 'produk' | 'bahan', produkIndex: number, bahanIndex?: number) => {
    const message = type === 'produk' 
      ? `Apakah Anda yakin ingin menghapus produk "${bahanBaku[produkIndex].nama_produk}" dan semua bahannya?`
      : `Apakah Anda yakin ingin menghapus bahan "${bahanBaku[produkIndex].bahan[bahanIndex!].nama}"?`;
      
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      if (type === 'produk') {
        await handleDeleteProduk(produkIndex);
      } else {
        await handleDeleteBahan(produkIndex, bahanIndex!);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Modal Bahan Baku</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Modal Bahan Baku</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">Gagal memuat data: {error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modal Bahan Baku</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          {showAddForm ? 'Batal' : 'Tambah Bahan Baku'}
        </button>
      </div>

      {/* Form Tambah Bahan Baku */}
      {showAddForm && (
        <TambahBahanBakuForm 
          bahanBaku={bahanBaku}
          setShowAddForm={setShowAddForm}
          refreshData={refreshData}
        />
      )}

      {/* Form Edit Produk */}
      {editingProduk && (
        <EditProdukForm 
          produk={editingProduk}
          setEditingProduk={setEditingProduk}
          refreshData={refreshData}
        />
      )}

      {/* Form Edit Bahan - PERBAIKAN DI SINI */}
      {editingBahan && (
        <EditBahanBakuForm 
          bahan={editBahanData}
          produk={bahanBaku[editingBahan.produkIndex]}
          bahanIndex={editingBahan.bahanIndex}
          setEditingBahan={setEditingBahan}
          refreshData={refreshData}
        />
      )}

      {/* Tabel Bahan Baku */}
      <BahanBakuTable 
        bahanBaku={bahanBaku}
        setEditingProduk={setEditingProduk}
        openEditBahanForm={openEditBahanForm}
        showDeleteConfirmation={showDeleteConfirmation}
      />
    </div>
  );
};

export default ModalBahanBaku;