// src/admin/process-memasak/index.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../config/api';

interface Production {
  _id: string;
  bahan_baku_id: {
    _id: string;
    nama: string;
    kategori: string;
    stok: number;
    satuan: string;
  };
  jumlah_diproses: number;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  waktu_mulai?: Date;
  waktu_selesai?: Date;
  chef_id: {
    _id: string;
    nama_lengkap: string;
  };
  catatan?: string;
  createdAt: Date;
}

const ProcessMemasak = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch productions - use admin endpoint to see all productions
      const prodResponse = await fetch(`${API_URL}/api/admin/stok-barang/productions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (prodResponse.ok) {
        const prodData = await prodResponse.json();
        setProductions(prodData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      SweetAlert.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Process Memasak</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bahan Baku
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chef
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Diproses
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu Mulai
              </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productions.map((prod) => (
                <tr key={prod._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {prod.bahan_baku_id ? (
                        <div>
                          <div className="font-medium">{prod.bahan_baku_id.nama}</div>
                          <div className="text-gray-500">{prod.bahan_baku_id.kategori}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Bahan baku tidak ditemukan</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.chef_id?.nama_lengkap || 'Unknown'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.jumlah_diproses} {prod.bahan_baku_id?.satuan || ''}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prod.status)}`}>
                      {getStatusIcon(prod.status)}
                      <span className="ml-1 capitalize">{prod.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.waktu_mulai ? new Date(prod.waktu_mulai).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default ProcessMemasak;