// src/chef/bahan-baku/index.tsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';
import { portbe } from "../../../../backend/ngrokbackend";
import { Package, ShoppingCart } from 'lucide-react';

interface BahanItem {
  nama: string;
  harga: number;
  jumlah: number;
}

interface BahanBaku {
  _id: string;
  nama: string;
  bahan: BahanItem[];
  total_stok: number;
}

const ipbe = import.meta.env.VITE_IPBE;

const BahanBakuTersedia: React.FC = () => {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [loading, setLoading] = useState(true);
  const [ambilLoading, setAmbilLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBahanBakuTersedia();
  }, []);

  const fetchBahanBakuTersedia = async () => {
    try {
      const response = await fetch(`${ipbe}:${portbe}/api/chef/bahan-baku`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBahanBaku(data);
      }
    } catch (error) {
      console.error('Error fetching bahan baku:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memuat data bahan baku',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setLoading(false);
    }
  };

  const ambilBahanBaku = async (bahanBakuId: string, stokTersedia: number, namaBahan: string) => {
    const options: SweetAlertOptions = {
      title: `Ambil Bahan Baku`,
      html: `
        <div class="text-left">
          <div class="bg-gray-100 p-3 rounded mb-3">
            <p class="font-semibold">${namaBahan}</p>
            <p class="text-sm text-gray-600">Stok tersedia: <span class="font-bold text-blue-600">${stokTersedia}</span></p>
          </div>
          <p class="mb-2">Masukkan jumlah yang ingin diambil:</p>
        </div>
      `,
      input: 'number',
      inputPlaceholder: 'Jumlah',
      inputAttributes: {
        min: '1',
        max: String(stokTersedia),
        step: '1',
        class: 'swal2-input'
      },
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ambil',
      cancelButtonText: 'Batal',
      preConfirm: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          Swal.showValidationMessage('Jumlah tidak valid');
          return false;
        }
        if (Number(value) > stokTersedia) {
          Swal.showValidationMessage('Jumlah melebihi stok tersedia');
          return false;
        }
        return value;
      }
    };
    const { value: jumlah } = await Swal.fire(options);

    if (!jumlah) return;

    setAmbilLoading(bahanBakuId);
    try {
      const response = await fetch(`${ipbe}:${portbe}/api/chef/bahan-baku/ambil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bahan_baku_id: bahanBakuId,
          jumlah_diproses: Number(jumlah)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          html: `
            <div class="text-left">
              <p>Bahan baku berhasil diambil!</p>
              <div class="mt-3 bg-green-50 p-3 rounded">
                <p class="text-sm"><strong>${namaBahan}</strong> - Jumlah: <strong>${jumlah}</strong></p>
                ${result.jumlah_produk_dibuat > 0 ? `<p class="text-sm mt-2"><strong>Produk dibuat: ${result.jumlah_produk_dibuat} unit</strong></p>` : ''}
              </div>
              <p class="text-sm text-gray-600 mt-3">Silakan cek halaman Productions untuk memproses.</p>
            </div>
          `,
          confirmButtonColor: '#f97316'
        });
        
        // Refresh data untuk update UI stok
        await fetchBahanBakuTersedia();
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.message || 'Terjadi kesalahan saat mengambil bahan baku',
          confirmButtonColor: '#f97316'
        });
      }
    } catch (error) {
      console.error('Error taking bahan baku:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat mengambil bahan baku',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setAmbilLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bahan Baku Tersedia</h1>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-500">Memuat data bahan baku...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Bahan Baku Tersedia</h1>
            <p className="text-gray-500 mt-1">Kelola dan ambil bahan baku untuk produksi</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Bahan</p>
            <p className="text-2xl font-bold text-orange-500">{bahanBaku.length}</p>
          </div>
        </div>

        {bahanBaku.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="text-center py-8">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada bahan baku tersedia</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Semua bahan baku sudah diambil chef lain atau belum dipublish admin.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bahanBaku.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Bagian Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.nama}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 mr-2">Stok:</span>
                          <span className="font-bold text-lg">
                            {item.total_stok}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">Status Ketersediaan</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.total_stok > 10 
                        ? 'bg-green-100 text-green-800' 
                        : item.total_stok > 5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {item.total_stok > 10 
                        ? 'Tersedia' 
                        : item.total_stok > 5 
                          ? 'Terbatas' 
                          : 'Sedikit'
                      }
                    </span>
                  </div>

                  {/* Detail Bahan - Container dengan flex untuk memastikan tombol tetap di bawah */}
                  <div className="flex flex-col flex-grow">
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xl font-bold text-black rounded-full mr-1">
                          {item.bahan.length}
                        </span>
                        Daftar Bahan
                      </h4>
                      {/* Container scroll untuk daftar bahan */}
                      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {/* Render semua bahan, bukan hanya 2 pertama */}
                        {item.bahan.map((bahan, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-800">{bahan.nama}</span>
                              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                x{bahan.jumlah}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Harga: <span className="font-medium">Rp {bahan.harga.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tombol Ambil Bahan - SELALU DI BAWAH */}
                  <div className="mt-auto pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        ambilBahanBaku(item._id, item.total_stok, item.nama);
                      }}
                      disabled={ambilLoading === item._id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        ambilLoading === item._id
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      {ambilLoading === item._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} className="mr-2" />
                          Ambil Bahan Baku
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BahanBakuTersedia;