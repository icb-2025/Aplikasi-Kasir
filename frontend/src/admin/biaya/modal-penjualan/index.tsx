// src/admin/penjualan/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BahanBaku {
  _id: string;
  nama: string;
  harga: number;
  jumlah: number;
  total: number;
}

interface BiayaOperasional {
  _id: string;
  nama: string;
  jumlah: number;
}

interface Riwayat {
  _id: string;
  keterangan: string;
  tipe: 'pemasukan' | 'pengeluaran';
  jumlah: number;
  saldo_setelah: number;
  tanggal: string;
}

interface ModalUtama {
  _id: string;
  total_modal: number;
  bahan_baku: BahanBaku[];
  biaya_operasional: BiayaOperasional[];
  sisa_modal: number;
  riwayat: Riwayat[];
  createdAt: string;
  updatedAt: string;
}

// Interface untuk response API tambah modal
interface AddModalResponse {
  message: string;
  modal: ModalUtama;
}

const PenjualanPage: React.FC = () => {
  const [modalData, setModalData] = useState<ModalUtama | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jumlah: '',
    keterangan: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch modal data
  useEffect(() => {
    const fetchModalData = async () => {
      try {
        const response = await axios.get<ModalUtama>('http://192.168.110.16:5000/api/admin/modal-utama');
        setModalData(response.data);
      } catch (err) {
        setError('Gagal memuat data modal');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModalData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      const response = await axios.post<AddModalResponse>(
        'http://192.168.110.16:5000/api/admin/modal-utama/tambah-modal',
        {
          jumlah: Number(formData.jumlah),
          keterangan: formData.keterangan,
        }
      );
      
      setSubmitSuccess(true);
      setFormData({ jumlah: '', keterangan: '' });
      
      // Menggunakan data dari response yang sudah ter-typing
      setModalData(response.data.modal);
    } catch (err) {
      setSubmitError('Gagal menambah penjualan');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Halaman Penjualan</h1>
      
      {/* Modal Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Modal Utama</h3>
          <p className="text-2xl font-bold text-blue-600">
            {modalData ? formatCurrency(modalData.total_modal) : '-'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Sisa Modal</h3>
          <p className="text-2xl font-bold text-green-600">
            {modalData ? formatCurrency(modalData.sisa_modal) : '-'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Jumlah Riwayat</h3>
          <p className="text-2xl font-bold text-purple-600">
            {modalData ? modalData.riwayat.length : 0}
          </p>
        </div>
      </div>

      {/* Add Sale Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Tambah Modal</h2>
        
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Penjualan berhasil ditambahkan!
          </div>
        )}
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="jumlah">
                Nominal Modal (Rp)
              </label>
              <input
                type="number"
                id="jumlah"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 1000000"
                required
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="keterangan">
                Keterangan
              </label>
              <input
                type="text"
                id="keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Dana Tambahan"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
          >
            {submitLoading ? 'Menyimpan...' : 'Tambah Modal'}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Riwayat Pemasukan</h2>
        
        {modalData && modalData.riwayat.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Setelah
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modalData.riwayat.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.keterangan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.tipe === 'pemasukan' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={item.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-600'}>
                        {item.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(item.jumlah)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.saldo_setelah)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada riwayat transaksi
          </div>
        )}
      </div>
    </div>
  );
};

export default PenjualanPage;