// src/admin/biaya/biaya-layanan/components/biaya-operasional.tsx
import React, { useState, useEffect, useCallback } from 'react';
import SweetAlert from '../../../../components/SweetAlert';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { portbe } from '../../../../../../backend/ngrokbackend';

const ipbe = import.meta.env.VITE_IPBE;
const ApiKey = import.meta.env.VITE_API_KEY;

export interface BiayaOperasionalItem {
  nama: string;
  jumlah: number;
  _id?: string;
}

export interface BiayaOperasionalData {
  _id?: string;
  rincian_biaya: BiayaOperasionalItem[];
  total: number;
  createdAt?: string;
  __v?: number;
}

interface BiayaOperasionalProps {
  onTotalChange: (total: number) => void;
  onSaveBiayaOperasional: (data: BiayaOperasionalData) => Promise<void>;
  saving: boolean;
  refreshTrigger: number;
}

const BiayaOperasional: React.FC<BiayaOperasionalProps> = ({ 
  onTotalChange, 
  onSaveBiayaOperasional,
  saving,
  refreshTrigger
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingItem, setDeletingItem] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemAmount, setNewItemAmount] = useState<number>(0);
  const [biayaData, setBiayaData] = useState<BiayaOperasionalData>({
    rincian_biaya: [],
    total: 0,
  });

  const BASE_API_URL = `${ipbe}:${portbe}/api/admin/biaya-operasional`;
  const API_KEY = `${ApiKey}`;

  // Fungsi untuk mendapatkan token dari localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchBiayaOperasional = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-api-key'] = API_KEY;
      }

      const response = await fetch(BASE_API_URL, { headers });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data biaya operasional');
      }
      
      const data = await response.json();
      
      if (data && data.rincian_biaya && Array.isArray(data.rincian_biaya)) {
        setBiayaData(data);
      } else {
        setBiayaData({
          rincian_biaya: [],
          total: 0,
        });
      }
    } catch (error) {
      SweetAlert.error('Gagal memuat data biaya operasional');
      console.error(error);
      setBiayaData({
        rincian_biaya: [],
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_API_URL, API_KEY]);

  useEffect(() => {
    fetchBiayaOperasional();
  }, [fetchBiayaOperasional, refreshTrigger]);

  useEffect(() => {
    if (biayaData.total !== undefined) {
      onTotalChange(biayaData.total);
    }
  }, [biayaData.total, onTotalChange]);

  const handleBiayaChange = (index: number, value: number) => {
    setBiayaData(prev => {
      const rincianBiaya = prev.rincian_biaya || [];
      const updatedRincian = [...rincianBiaya];
      
      if (updatedRincian[index]) {
        updatedRincian[index] = {
          ...updatedRincian[index],
          jumlah: value
        };
      }
      
      const total = updatedRincian.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      
      return {
        ...prev,
        rincian_biaya: updatedRincian,
        total
      };
    });
  };

  const handleItemNameChange = (index: number, value: string) => {
    setBiayaData(prev => {
      const rincianBiaya = prev.rincian_biaya || [];
      const updatedRincian = [...rincianBiaya];
      
      if (updatedRincian[index]) {
        updatedRincian[index] = {
          ...updatedRincian[index],
          nama: value
        };
      }
      
      return {
        ...prev,
        rincian_biaya: updatedRincian
      };
    });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      SweetAlert.error('Nama biaya tidak boleh kosong');
      return;
    }

    if (newItemAmount <= 0) {
      SweetAlert.error('Jumlah biaya harus lebih dari 0');
      return;
    }

    const newItem: BiayaOperasionalItem = {
      nama: newItemName,
      jumlah: newItemAmount
    };

    setBiayaData(prev => {
      const rincianBiaya = prev.rincian_biaya || [];
      const updatedRincian = [...rincianBiaya, newItem];
      const total = updatedRincian.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      
      return {
        ...prev,
        rincian_biaya: updatedRincian,
        total
      };
    });

    setNewItemName('');
    setNewItemAmount(0);
    setShowAddModal(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    const result = await SweetAlert.fire({
      title: 'Apakah Anda yakin?',
      text: 'Biaya akan dihapus',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setDeletingItem(true);
        SweetAlert.loading('Menghapus biaya...');
        
        const token = getToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-api-key'] = API_KEY;
        }

        const response = await fetch(`${BASE_API_URL}/${itemId}`, {
          method: 'DELETE',
          headers
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'Gagal menghapus biaya');
        }
        
        setBiayaData(prev => {
          const rincianBiaya = prev.rincian_biaya || [];
          const updatedRincian = rincianBiaya.filter(item => item._id !== itemId);
          const total = updatedRincian.reduce((sum, item) => sum + (item.jumlah || 0), 0);
          
          return {
            ...prev,
            rincian_biaya: updatedRincian,
            total
          };
        });
        
        SweetAlert.close();
        SweetAlert.success('Biaya berhasil dihapus');
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error(error instanceof Error ? error.message : 'Gagal menghapus biaya');
        console.error(error);
      } finally {
        setDeletingItem(false);
      }
    }
  };

  const handleSubmitBiaya = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rincianBiaya = biayaData.rincian_biaya || [];
    
    const dataToSend: BiayaOperasionalData = {
      ...biayaData,
      rincian_biaya: rincianBiaya.map(item => {
        if (item._id) {
          return {
            nama: item.nama,
            jumlah: item.jumlah,
            _id: item._id
          };
        } else {
          return {
            nama: item.nama,
            jumlah: item.jumlah
          };
        }
      })
    };
    
    await onSaveBiayaOperasional(dataToSend);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const rincianBiaya = biayaData.rincian_biaya || [];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Biaya Operasional</h2>
            <p className="text-gray-600 text-lg">Kelola rincian biaya operasional perusahaan</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              disabled={saving || deletingItem}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Biaya
            </button>
          </div>
        </div>

        {/* Content Section */}
        {rincianBiaya.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-8 rounded-2xl mb-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada data biaya operasional</h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan menambahkan biaya operasional pertama Anda.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Tambah Biaya Pertama
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Items Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {rincianBiaya.map((item, index) => (
                <div 
                  key={item._id || index} 
                  className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200"
                >
                  {/* Delete Button */}
                  {item._id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item._id!)}
                      disabled={deletingItem || saving}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90"
                      title="Hapus biaya"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-xs">
                        Nama Biaya
                      </label>
                      <input
                        type="text"
                        value={item.nama || ''}
                        onChange={(e) => handleItemNameChange(index, e.target.value)}
                        className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-white transition-all duration-200"
                        placeholder="Masukkan nama biaya..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-xs">
                        Jumlah Biaya
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm font-medium">Rp</span>
                        </div>
                        <input
                          type="number"
                          value={item.jumlah || 0}
                          onChange={(e) => handleBiayaChange(index, parseFloat(e.target.value) || 0)}
                          className="pl-12 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-white transition-all duration-200"
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-2xl font-bold mb-2">Total Biaya Operasional</h3>
                  <p className="text-blue-100 opacity-90">Total dari semua biaya operasional</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl lg:text-4xl font-bold">
                    Rp {biayaData.total?.toLocaleString('id-ID') || '0'}
                  </div>
                  <p className="text-blue-100 opacity-90 mt-1">
                    {rincianBiaya.length} item biaya
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {rincianBiaya.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-8 pt-8 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Pastikan semua data sudah benar sebelum menyimpan</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSubmitBiaya}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background Overlay dengan Animasi */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
              onClick={() => {
                setShowAddModal(false);
                setNewItemName('');
                setNewItemAmount(0);
              }}
            ></div>

            {/* Modal Panel */}
            <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              
              {/* Header Modal */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Tambah Biaya Baru</h3>
                  <p className="text-gray-600 mt-1">Tambahkan biaya operasional baru</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewItemName('');
                    setNewItemAmount(0);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Form Modal */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nama Biaya
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Contoh: Biaya Listrik, Internet, dll."
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border bg-gray-50 focus:bg-white transition-all duration-200"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Jumlah Biaya
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm font-medium">Rp</span>
                    </div>
                    <input
                      type="number"
                      value={newItemAmount}
                      onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                      className="pl-12 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border bg-gray-50 focus:bg-white transition-all duration-200"
                      min="0"
                      step="1000"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Masukkan jumlah biaya dalam Rupiah
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewItemName('');
                      setNewItemAmount(0);
                    }}
                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                  >
                    Tambah Biaya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BiayaOperasional;