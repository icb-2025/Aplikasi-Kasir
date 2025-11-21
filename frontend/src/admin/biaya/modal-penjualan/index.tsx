// src/admin/penjualan/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { portbe } from '../../../../../backend/ngrokbackend';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const ipbe = import.meta.env.VITE_IPBE;

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
  
  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('semua');
  const itemsPerPage = 10;

  // Fetch modal data
  useEffect(() => {
    const fetchModalData = async () => {
      try {
        const response = await axios.get<ModalUtama>(`${ipbe}:${portbe}/api/admin/modal-utama`);
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

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

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
        `${ipbe}:${portbe}/api/admin/modal-utama/tambah-modal`,
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

  // Filter riwayat berdasarkan search term dan filter type
 const filteredRiwayat = modalData ? modalData.riwayat.filter(item => {
  const matchesSearch = searchTerm === '' || 
    item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatDate(item.tanggal).toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesType = filterType === 'semua' || item.tipe === filterType;
  
  return matchesSearch && matchesType;
}).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()) : [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
            Modal Berhasil Ditambahkan!
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

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
            <input
              type="text"
              placeholder="Cari berdasarkan tanggal atau keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Tipe</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Tipe</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Riwayat Pemasukan</h2>
        
        {currentItems.length > 0 ? (
          <>
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
                  {currentItems.map((item) => (
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRiwayat.length)}</span> dari{' '}
                  <span className="font-semibold text-gray-900">{filteredRiwayat.length}</span> riwayat
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                    }`}
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {modalData && modalData.riwayat.length > 0 
              ? 'Tidak ada riwayat yang sesuai dengan filter' 
              : 'Belum ada riwayat transaksi'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PenjualanPage;